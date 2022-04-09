import {BundleSaleConfig, BuyXGetYFreeConfig, BuyXWithLowerPriceConfig} from "./pojo";
import {EPromotionType} from "./enum";

/**
 * map to product rds table
 */
export interface IProductEntity {
    sku: string;
    name: string;
    price: number;
}

/**
 * map to product and promotion strategy rds table
 */
export interface IProductPromotionRelation {
    id: string; // uuid
    sku: string; // sku unique id
    pid: string; // promotion strategy unique id
    strategy: any; // high priority promotion strategy would be picked up when a sku bind with multiple promotion strategy
}

/**
 * map to promotion algorithm rds table
 */
export interface IPromotionAlgorithmEntity {
    id: string; //uuid
    type: EPromotionType; // promotion type which can be used to get the promotion strategy from the abstract factory
    algorithm:
        | BuyXGetYFreeConfig
        | BundleSaleConfig
        | BuyXWithLowerPriceConfig
        | any; // options for algorithm population purpose
}