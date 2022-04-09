import {
    BundleSaleConfig,
    BuyXGetYFreeConfig,
    BuyXWithLowerPriceConfig,
    IProductOrder,
    IPromotionStrategy,
} from "../../src/models/pojo";
import {ESku} from "../mock";
import {groupBy} from "../../src/utils/utils";
import {IPromotionAlgorithmEntity} from "../../src/models/entity";
import {EGroupType, EPromotionType} from "../../src/models/enum";
import {PromotionStrategyFactory} from "../../src/services/strategy";

/**
 sku: string;
 name: string;
 price: number;
 amount: number;
 total: number;
 promotionAlgorithms?: IPromotionAlgorithmEntity[];
 discount?: number;
 */
export type ProductOrderSchema = [
    string, string, number, number, number, IPromotionAlgorithmEntity[] | undefined, number | undefined];

const mockProductOrder = (arr: Array<ProductOrderSchema>): Array<IProductOrder> =>
    arr.map(([sku, name, price, amount, total, promotionAlgorithms, discount]: ProductOrderSchema) => ({
        sku, price, name, amount, total, promotionAlgorithms, discount
    }));

const atv = (amount: number, invalid: boolean = false): any => [
    ESku.ATV,
    "Apple TV",
    109.5,
    amount,
    0,
    [{
        id: 1,
        type: EPromotionType.BUY_X_GET_Y_FREE,
        algorithm: {
            buyX: 3,
            getYFree: invalid ? 4 : 1,
        } as BuyXGetYFreeConfig
    }]
]

const mbp = (amount: number, getSku2Free = [ESku.VGA]): any => [
    ESku.MBP,
    "MacBook Pro",
    1399.99,
    amount,
    0,
    [{
        id: 3,
        type: EPromotionType.BUNDLE_SALE,
        algorithm: {getSku2Free} as BundleSaleConfig
    }]
]

const ipd = (amount: number, invalid: boolean = false): any => [
    ESku.IPD,
    "Super iPad",
    549.99,
    amount,
    0,
    [{
        id: 2,
        type: EPromotionType.BUY_X_WITH_LOWER_PRICE,
        algorithm: {
            buyMoreThanX: 4,
            yDollarsDeductionPerItem: invalid ? 600 : 50,
        } as BuyXWithLowerPriceConfig
    }]
];

const vga = (amount: number): any => [
    ESku.VGA,
    "AGA adapter",
    30,
    amount,
    0,
    undefined,
    undefined,
];

describe("promotionStrategy", function () {
    describe("BuyXWithLowerPriceStrategy", () => {
        test.each([
            ["should return 2718.95", [ipd(4)], 2199.96],
            ["should return 2499.95", [ipd(5)], 2499.95],
            [
                "should throw price has to be greater than deduction price error",
                [ipd(5, true)],
                "price has to be greater than deduction price",
            ],
        ])("%s", (testcase: string, itemArray: any, expected: any) => {
            const promoStrategy: IPromotionStrategy =
                PromotionStrategyFactory[EPromotionType.BUY_X_WITH_LOWER_PRICE]();
            const items = mockProductOrder(itemArray);
            const item = items[0];
            const cart = groupBy({items, key: "sku", type: EGroupType.DICTIONARY})
            try {
                const {discount} = promoStrategy.apply(item, cart);
                expect(discount).toEqual(expected);
            } catch (err: any) {
                expect(err?.message).toEqual(expected);
            }
        });
    });

    describe("BuyXGetYFreeStrategy", () => {
        test.each([
            ["should return 328.5", [atv(4)], 328.5],
            ["should return 219", [atv(3)], 219],
            ["should return 219", [atv(2)], 219],
            ["should return 109.5", [atv(1)], 109.5],
            [
                "should throw buyX has to be greater than getYFree error",
                [atv(5, true)],
                "buyX has to be greater than getYFree",
            ],
        ])("%s", (testcase: string, itemArray: any, expected: any) => {
            const promoStrategy: IPromotionStrategy =
                PromotionStrategyFactory[EPromotionType.BUY_X_GET_Y_FREE]();
            const [item] = mockProductOrder(itemArray);
            try {
                const {discount} = promoStrategy.apply(item, {});
                expect(discount).toEqual(expected);
            } catch (err: any) {
                expect(err?.message).toEqual(expected);
            }
        });
    });

    describe("BundleSaleStrategy", () => {
        test.each([
            ["should return 1399.99", [mbp(1)], [vga(1)], 'vga', 0],
            ["should return 1399.99", [mbp(1, [ESku.IPD])], [vga(1)], 'vga', 1]
        ])(
            "%s",
            (
                testcase: string,
                itemArray: any,
                bundleItemArray: any,
                bundleSku: string,
                expected: any
            ) => {
                const promoStrategy: IPromotionStrategy =
                    PromotionStrategyFactory[EPromotionType.BUNDLE_SALE]();
                const [item] = mockProductOrder(itemArray);
                const bundleItemsRaw = [item, ...mockProductOrder(bundleItemArray)];
                const cart = groupBy({
                    items: bundleItemsRaw,
                    type: EGroupType.DICTIONARY,
                    key: "sku",
                });

                promoStrategy.apply(item, cart);
                const {amount} = cart[bundleSku];
                expect(amount).toEqual(expected);
            }
        );
    });
});
