import {Checkout} from "../../src/services/checkout";
import {
    ESku,
    prodPromoRelationsMock,
    productsMock,
    promotionAlgorithmsMock,
} from "../mock";
import {IPricingRules} from "../../src/models/pojo";
import {groupBy} from "../../src/utils/utils";
import {EGroupType} from "../../src/models/enum";

describe("Checkout", () => {
    test.each([
        [[ESku.ATV, ESku.IPD, ESku.IPD, ESku.ATV, ESku.IPD, ESku.IPD, ESku.IPD], 2718.95],
        [[ESku.ATV, ESku.ATV, ESku.ATV, ESku.VGA], 249.0],
        [[ESku.MBP, ESku.VGA, ESku.IPD], 1949.98],
    ])(
        "when given %s should return %s",
        (skuList: ESku[], expectedTotal: number) => {
            const pricingRules: IPricingRules = {
                productPromoRelations: prodPromoRelationsMock,
                promoAlgorithms: promotionAlgorithmsMock,
            };
            const productRecord = groupBy({
                items: productsMock,
                key: "sku",
                type: EGroupType.DICTIONARY,
            });

            const cart: Checkout = new Checkout(pricingRules);

            for (const sku of skuList) {
                cart.scan(productRecord[sku]);
            }

            const actual = cart.total();
            expect(actual).toEqual(expectedTotal);
        }
    );
});
