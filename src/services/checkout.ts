import {
    ICheckOut,
    IPricingRules, IProductOrder,
} from "../models/pojo";
import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "../models/entity";
import {groupBy} from "../utils/utils";
import {EGroupType} from "../models/enum";
import {PromotionStrategyFactory} from "./strategy";
import {add} from "mathjs";

/**
 * Checkout based on realtime product strategy and sku data from database
 */
export class Checkout implements ICheckOut {
    readonly productPromoDictionary: Record<string,
        Array<IProductPromotionRelation>>;
    readonly promoAlgorithmDictionary: Record<string, IPromotionAlgorithmEntity>;
    private cart: Record<string, IProductOrder> = {};

    /**
     * Covert entities to hash
     * @param productPromoRelations - product promotion relation entity
     * @param promoAlgorithms - promotion entity
     * @param options - keys for  [productPromotionKey,promoAlgorithmsKey]
     */
    constructor({
                    productPromoRelations,
                    promoAlgorithms,
                    options = ["sku", "id"],
                }: IPricingRules) {
        const [sku, id] = options;
        this.productPromoDictionary = groupBy({
            items: productPromoRelations,
            key: sku,
            type: EGroupType.MUL_DICTIONARY,
        });
        this.promoAlgorithmDictionary = groupBy({
            items: promoAlgorithms,
            key: id,
            type: EGroupType.DICTIONARY,
        });
    }

    /**
     * lookup promotion algorithms from product promotion relation and product promotion entities
     * @param sku - sku uuid
     * @private
     */
    private lookupPromotionAlgorithmsBySku(sku: string) {
        const promoAlgorithmDictionary = this.promoAlgorithmDictionary;
        const productPromoRelationArray = this.productPromoDictionary[sku];

        const isPromotionAvailable = () => productPromoRelationArray?.length > 0;
        const getPromotionAlgorithm = (pid: string) =>
            promoAlgorithmDictionary[pid];
        const getPromotionAlgorithms = (pidList: string[]) =>
            pidList.map((pid: string) => getPromotionAlgorithm(pid));
        const getPromotionAlgorithmIds = (productPromoArr: Array<IProductPromotionRelation>) =>
            productPromoArr.map(
                (x: IProductPromotionRelation) => x.pid
            );

        return isPromotionAvailable()
            ? getPromotionAlgorithms(getPromotionAlgorithmIds(productPromoRelationArray))
            : undefined;
    }

    /**
     * map product entity to product order and stored in cart hashmap, and update the product order's amount and total instantly
     * @param productEntity - product entity
     */
    scan(productEntity: IProductEntity): void {

        const {sku, price} = productEntity;
        const productOrder = this.cart[sku];

        // if sku hash key isn't existing, create a sku/ProductOrder entry with lookup promotion strategy and initial amount attached to it
        if (!productOrder) {
            const promotionAlgorithms = this.lookupPromotionAlgorithmsBySku(sku);
            this.cart[sku] = {
                ...productEntity,
                amount: 1,
                total: price,
                promotionAlgorithms,
            };
            return;
        }

        // realtime update the total and amount for the sku with its original price
        const {amount, total}: IProductOrder = productOrder;
        this.cart[sku] = {
            ...productOrder,
            amount: amount + 1,
            total: total + price,
        };
    }

    /**
     * workout the discount for eligible ProductOrder and sum the total based on discount and total in product order
     * discount is over total while it's doing the sum
     */
    total(): number {
        // works out the discount for product order
        for (const productOrder of Object.values(this.cart)) {
            if (!Array.isArray(productOrder.promotionAlgorithms)) continue;
            const {type} = productOrder.promotionAlgorithms[0];
            const promoStrategy = PromotionStrategyFactory[type].call(PromotionStrategyFactory);
            promoStrategy.apply(productOrder, this.cart);
        }

        // get total
        return Object.values(this.cart)
            .map(({total, discount}: IProductOrder) => discount ?? total)
            .reduce((total: number, skuTotal: number) => add(total, skuTotal));
    }
}
