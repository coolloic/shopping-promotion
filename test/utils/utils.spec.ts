import {
    prodPromoRelationsMock,
    productsMock,
    promotionAlgorithmsMock,
} from "../mock";
import {groupBy} from "../../src/utils/utils";
import {EGroupType} from "../../src/models/enum";

const testGroupBy = (
    key: string,
    items: any[],
    type: EGroupType,
    expected: any
) => {
    if (key && typeof items[0] === "object" && key in items[0]) {
        const actual = groupBy({key, items, type});
        expect(actual).toEqual(expected);
    } else {
        try {
            groupBy({key, items, type});
        } catch (err: any) {
            expect(err?.message).toEqual(expected);
        }
    }
};

describe("utils", () => {
    test.each([
        [
            "should group by sku",
            "sku",
            productsMock,
            {
                atv: {name: "Apple TV", price: 109.5, sku: "atv"},
                ipd: {name: "Super iPad", price: 549.99, sku: "ipd"},
                mbp: {name: "MacBook Pro", price: 1399.99, sku: "mbp"},
                vga: {name: "VGA adapter", price: 30, sku: "vga"},
            },
        ],
        [
            "should group by name",
            "name",
            productsMock,
            {
                "Apple TV": {name: "Apple TV", price: 109.5, sku: "atv"},
                "Super iPad": {name: "Super iPad", price: 549.99, sku: "ipd"},
                "MacBook Pro": {name: "MacBook Pro", price: 1399.99, sku: "mbp"},
                "VGA adapter": {name: "VGA adapter", price: 30, sku: "vga"},
            },
        ],
        [
            "should throw key is required error for EGroupType.DICTIONARY",
            "",
            productsMock,
            "key is required",
        ],
        [
            "should throw invalid items for EGroupType.DICTIONARY",
            "sku",
            [],
            "invalid items",
        ],
        [
            "should throw key is invalid for EGroupType.DICTIONARY",
            "id",
            productsMock,
            "key is invalid",
        ],
        [
            "should group by id",
            "id",
            promotionAlgorithmsMock,
            {
                "1": {
                    id: "1",
                    algorithm: {
                        buyX: 3,
                        getYFree: 1,
                    },
                    type: "BuyXGetYFree",
                },
                "2": {
                    id: "2",
                    algorithm: {
                        buyMoreThanX: 4,
                        yDollarsDeductionPerItem: 50,
                    },
                    type: "BuyXWithLowerPriceConfig",
                },
                "3": {
                    id: "3",
                    algorithm: {
                        getSku2Free: ["vga"],
                    },
                    type: "BundleSaleStrategy",
                },
            },
        ],
    ])("%s", (testcase: string, key: string, items: any[], expected: any) => {
        const type = EGroupType.DICTIONARY;
        testGroupBy(key, items, type, expected);
    });
    test.each([
        [
            "should group by sku for product promotion relation",
            "sku",
            [
                ...prodPromoRelationsMock,
                {
                    id: "4",
                    pid: "2",
                    strategy: 3,
                    sku: "atv",
                },
            ],
            {
                atv: [
                    {
                        id: "1",
                        pid: "1",
                        strategy: 1,
                        sku: "atv",
                    },
                    {
                        id: "4",
                        pid: "2",
                        strategy: 3,
                        sku: "atv",
                    },
                ],
                ipd: [
                    {
                        id: "2",
                        pid: "2",
                        strategy: 2,
                        sku: "ipd",
                    },
                ],
                mbp: [
                    {
                        id: "3",
                        pid: "3",
                        strategy: 3,
                        sku: "mbp",
                    },
                ],
            },
        ],
        [
            "should group by sku for product promotion relation",
            "sku",
            prodPromoRelationsMock,
            {
                atv: [
                    {
                        id: "1",
                        pid: "1",
                        strategy: 1,
                        sku: "atv",
                    },
                ],
                ipd: [
                    {
                        id: "2",
                        pid: "2",
                        strategy: 2,
                        sku: "ipd",
                    },
                ],
                mbp: [
                    {
                        id: "3",
                        pid: "3",
                        strategy: 3,
                        sku: "mbp",
                    },
                ],
            },
        ],
        [
            "should group by pid for product promotion relation",
            "pid",
            prodPromoRelationsMock,
            {
                "1": [
                    {
                        "id": "1",
                        "pid": "1",
                        "strategy": 1,
                        "sku": "atv"
                    }
                ],
                "2": [
                    {
                        "id": "2",
                        "pid": "2",
                        "strategy": 2,
                        "sku": "ipd"
                    }
                ],
                "3": [
                    {
                        "id": "3",
                        "pid": "3",
                        "strategy": 3,
                        "sku": "mbp"
                    }
                ]
            },
        ],
        [
            "should throw key is required error for EGroupType.MUL_DICTIONARY",
            "",
            productsMock,
            "key is required",
        ],
        [
            "should throw key is invalid error for EGroupType.MUL_DICTIONARY",
            "a",
            productsMock,
            "key is invalid",
        ],
        [
            "should throw invalid items for EGroupType.MUL_DICTIONARY",
            "sku",
            [],
            "invalid items",
        ],
    ])("%s", (testcase: string, key: string, items: any[], expected: any) => {
        const type = EGroupType.MUL_DICTIONARY;
        testGroupBy(key, items, type, expected);
    });
});
