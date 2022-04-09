import {
    IProductOrder,
    IPromotionStrategy,
} from "../models/pojo";
import {add, min, multiply, subtract} from "mathjs";
import {IPromotionAlgorithmEntity} from "../models/entity";
import {EPromotionType} from "../models/enum";

export class BuyXGetYFreeStrategy implements IPromotionStrategy {
    type = EPromotionType.BUY_X_GET_Y_FREE;
    private static instance = new BuyXGetYFreeStrategy();

    private constructor() {
    }

    static singleton() {
        return BuyXGetYFreeStrategy.instance;
    }

    apply(
        item: IProductOrder,
        cart: Record<string, IProductOrder>
    ): IProductOrder {
        const {sku, price, amount, promotionAlgorithms} = item;
        const promoAlgorithms = promotionAlgorithms as IPromotionAlgorithmEntity[];  // shouldn't be undefined as only eligible data can reach here
        const {buyX, getYFree} = promoAlgorithms[0].algorithm;
        if (buyX <= getYFree) {
            throw new Error("buyX has to be greater than getYFree");
        }
        const mod = amount % buyX;
        const times = Math.floor(amount / buyX);
        const discount = add(
            multiply(mod, price),
            multiply(multiply(subtract(buyX, getYFree), times), price)
        );
        const discountAppliedProductOrder = {...item, discount};
        cart[sku] = discountAppliedProductOrder;
        return discountAppliedProductOrder;
    }
}

export class BundleSaleStrategy implements IPromotionStrategy {
    type = EPromotionType.BUNDLE_SALE;
    public static instance = new BundleSaleStrategy();

    static singleton() {
        return BundleSaleStrategy.instance;
    }

    apply(
        item: IProductOrder,
        cart: Record<string, IProductOrder>
    ): IProductOrder {
        const {sku, promotionAlgorithms} = item;
        const promoAlgorithms = promotionAlgorithms as IPromotionAlgorithmEntity[];  // shouldn't be undefined as only eligible data can reach here
        const {getSku2Free} = promoAlgorithms[0].algorithm;

        const isPromotionAvailable = [sku, ...getSku2Free].every((id: string) => cart[id]);
        if (!isPromotionAvailable) return item;

        const bundleCounter = min([sku, ...getSku2Free].map((id: string) => cart[id].amount));
        const newAmount = (id: string) => subtract(cart[id].amount, bundleCounter);
        const newDiscount = (id: string) =>
            subtract(cart[id].total, multiply(bundleCounter, cart[id].price));
        for (const id of getSku2Free) {
            cart[id].amount = newAmount(id);
            cart[id].discount = newDiscount(id);
        }

        return item;
    }
}

export class BuyXWithLowerPriceStrategy implements IPromotionStrategy {
    type = EPromotionType.BUY_X_WITH_LOWER_PRICE;
    public static instance = new BuyXWithLowerPriceStrategy();

    static singleton() {
        return BuyXWithLowerPriceStrategy.instance;
    }

    apply(
        item: IProductOrder,
        cart: Record<string, IProductOrder>
    ): IProductOrder {
        const {price, sku, promotionAlgorithms, amount} = item;
        const promoAlgorithms = promotionAlgorithms as IPromotionAlgorithmEntity[]; // shouldn't be undefined as only eligible data can reach here
        const {buyMoreThanX, yDollarsDeductionPerItem} = promoAlgorithms[0].algorithm;
        if (price <= yDollarsDeductionPerItem) {
            throw new Error("price has to be greater than deduction price");
        }
        const priceDeduction = amount > buyMoreThanX ? yDollarsDeductionPerItem : 0;
        const discount = multiply(subtract(price, priceDeduction), amount);
        const discountAppliedProductOrder = {...cart[sku], discount};
        cart[sku] = discountAppliedProductOrder;
        return discountAppliedProductOrder;
    }
}

export const PromotionStrategyFactory: Record<EPromotionType,
    () => IPromotionStrategy> = {
    [EPromotionType.BUY_X_WITH_LOWER_PRICE]: () =>
        BuyXWithLowerPriceStrategy.singleton(),
    [EPromotionType.BUY_X_GET_Y_FREE]: () => BuyXGetYFreeStrategy.singleton(),
    [EPromotionType.BUNDLE_SALE]: () => BundleSaleStrategy.singleton(),
};
