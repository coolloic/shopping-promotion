import {IProductEntity, IProductPromotionRelation, IPromotionAlgorithmEntity} from "../src/models/entity";
import {BundleSaleConfig, BuyXGetYFreeConfig, BuyXWithLowerPriceConfig} from "../src/models/pojo";
import {EPromotionType} from "../src/models/enum";

export enum ESku {
    IPD = "ipd",
    MBP = "mbp",
    ATV = "atv",
    VGA = "vga",
}


export const productsRawDataResultSet: Array<[ESku, string, number]> = [
    [ESku.IPD, "Super iPad", 549.99],
    [ESku.MBP, "MacBook Pro", 1399.99],
    [ESku.ATV, "Apple TV", 109.5],
    [ESku.VGA, "VGA adapter", 30.0],
];

export type ProductionTableSchema = [ESku, string, number];

export const products = (
    productsRawData: Array<ProductionTableSchema>
): Array<IProductEntity> =>
    productsRawData.map(
        ([sku, name, price]: ProductionTableSchema): IProductEntity => ({
            sku,
            name,
            price,
        })
    );
export const productsMock = products(productsRawDataResultSet);

export const promotionAlgorithmResultSet: Array<[
    number,
    EPromotionType,
        BuyXGetYFreeConfig | BuyXWithLowerPriceConfig | BundleSaleConfig
]> = [
    [1, EPromotionType.BUY_X_GET_Y_FREE, {buyX: 3, getYFree: 1}],
    [
        2,
        EPromotionType.BUY_X_WITH_LOWER_PRICE,
        {
            buyMoreThanX: 4,
            yDollarsDeductionPerItem: Number(50.0),
        },
    ],
    [3, EPromotionType.BUNDLE_SALE, {getSku2Free: [ESku.VGA]}],
];

export type PromotionAlgorithmSchema = [
    number,
    EPromotionType,
        BuyXGetYFreeConfig | BuyXWithLowerPriceConfig | BundleSaleConfig
];

export const promotionAlgorithms = (
    promotionAlgorithmRawData: Array<PromotionAlgorithmSchema>
): Array<IPromotionAlgorithmEntity> =>
    promotionAlgorithmRawData.map(
        ([
             id,
             type,
             option,
         ]: PromotionAlgorithmSchema): IPromotionAlgorithmEntity => ({
            id: String(id),
            type,
            algorithm: option,
        })
    );
export const promotionAlgorithmsMock = promotionAlgorithms(promotionAlgorithmResultSet);

export type ProdPromoSchema = [number, ESku, string, number];

export const prodPromoResultSet: Array<ProdPromoSchema> = [
    [1, ESku.ATV, "1", 1],
    [2, ESku.IPD, "2", 2],
    [3, ESku.MBP, "3", 3],
];

export const prodPromoRelations = (
    prodPromoResultSet: Array<ProdPromoSchema>
): Array<IProductPromotionRelation> => (
    prodPromoResultSet.map(
        ([
             id,
             sku,
             pid,
             strategy,
         ]: ProdPromoSchema): IProductPromotionRelation => ({
            id: String(id),
            sku,
            pid,
            strategy,
        })
    )
)

export const prodPromoRelationsMock = prodPromoRelations(prodPromoResultSet);