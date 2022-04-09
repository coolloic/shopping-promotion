import {
    ICheckOut,
    IPricingRules,
    IProductOrder,
} from "../models/pojo";
import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "../models/entity";

export class Checkout implements ICheckOut {
    constructor(readonly pricingRules: IPricingRules) {
    }

    scan(productEntity: IProductEntity): void {
    }

    total(): number {
        return 0;
    }
}
