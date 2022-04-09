import {
    ICheckOut,
    IPricingRules, IProductOrder,
} from "../models/pojo";
import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "../models/entity";
import {groupBy} from "../utils/utils";
import {EGroupType} from "../models/enum";
import {PromotionStrategyFactory} from "./strategy";
import {add} from "mathjs";

export class Checkout implements ICheckOut {
    readonly productPromoDictionary: Record<string,
        Array<IProductPromotionRelation>>;
    readonly promoAlgorithmDictionary: Record<string, IPromotionAlgorithmEntity>;
    private cart: Record<string, IProductOrder> = {};

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

    scan(productEntity: IProductEntity): void {

        const {sku, price} = productEntity;
        const productOrder = this.cart[sku];

        if (!productOrder) {
            const promoAlgorithmDictionary = this.promoAlgorithmDictionary;
            const productPromoRelationArray = this.productPromoDictionary[sku];

            const isPromotionAvailable = () => productPromoRelationArray?.length > 0;
            const getPromotionAlgorithm = (pid: string) =>
                promoAlgorithmDictionary[pid];
            const getPromotionAlgorithms = (pidList: string[]) =>
                pidList.map((pid: string) => getPromotionAlgorithm(pid));
            const getPromotionAlgorithmIds = () =>
                productPromoRelationArray.map(
                    (x: IProductPromotionRelation) => x.pid
                );

            const promotionAlgorithms = isPromotionAvailable()
                ? getPromotionAlgorithms(getPromotionAlgorithmIds())
                : undefined;
            this.cart[sku] = {
                ...productEntity,
                amount: 1,
                total: price,
                promotionAlgorithms,
            };
            return;
        }

        const {amount, total}: IProductOrder = productOrder;
        this.cart[sku] = {
            ...productOrder,
            amount: amount + 1,
            total: total + price,
        };
    }

    total(): number {
        // works out the discount for product order
        for (const productOrder of Object.values(this.cart)) {
            if (!Array.isArray(productOrder.promotionAlgorithms)) continue;
            const {type} = productOrder.promotionAlgorithms[0];
            const promoStrategy = PromotionStrategyFactory[type].call(this);
            promoStrategy.apply(productOrder, this.cart);
        }

        // get total
        return Object.values(this.cart)
            .map(({total, discount}: IProductOrder) => discount ?? total)
            .reduce((total: number, skuTotal: number) => add(total, skuTotal));
    }
}
