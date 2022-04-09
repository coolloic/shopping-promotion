import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "./entity";
import {EGroupType} from "./enum";

export interface IProductOrder extends IProductEntity {
    amount: number;
    total: number;
    promotionAlgorithms?: IPromotionAlgorithmEntity[];
    discount?: number;
}

export interface IPricingRules {
    promoAlgorithms: Array<IPromotionAlgorithmEntity>;
    productPromoRelations: Array<IProductPromotionRelation>;
    options?: any;
}

export interface ICheckOut {
    scan: (item: IProductEntity) => void;
    total: () => number;
}

export interface IPromotionStrategy {
    type: string;
    apply: (
        item: IProductOrder,
        cart: Record<string, IProductOrder>
    ) => IProductOrder;
}

export interface BuyXGetYFreeConfig {
    buyX: number;
    getYFree: number;
}

export interface BuyXWithLowerPriceConfig {
    buyMoreThanX: number;
    yDollarsDeductionPerItem: number;
}

export interface BundleSaleConfig {
    getSku2Free: Array<string>;
}

export interface GroupByOptions {
    key?: string;
    items: any[];
    type: EGroupType;
    options?: {};
}
