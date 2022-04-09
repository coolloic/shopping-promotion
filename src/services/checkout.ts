import {
    ICheckOut,
    IPricingRules,
} from "../models/pojo";
import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "../models/entity";
import {groupBy} from "../utils/utils";
import {EGroupType} from "../models/enum";

export class Checkout implements ICheckOut {
    readonly productPromoDictionary: Record<string,
        Array<IProductPromotionRelation>>;
    readonly promoAlgorithmDictionary: Record<string, IPromotionAlgorithmEntity>;

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
    }

    total(): number {
        return 0;
    }
}
