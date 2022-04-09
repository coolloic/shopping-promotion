/**
 * 1. generate {[key]: item} dictionary
 * 2. generate {[key]: [...items]}
 * @param key - hash key
 * @param items - raw items
 * @param type - group type
 */
import {GroupByOptions} from "../models/pojo";
import {EGroupType} from "../models/enum";

export const groupBy: (groupOpts: GroupByOptions) => Record<string, any> = ({
                                                                                key = "",
                                                                                items,
                                                                                type,
                                                                            }: GroupByOptions): Record<string, any> => {
    const recordFactory: Record<EGroupType, Record<string, any>> = {
        [EGroupType.DICTIONARY]: () => {
            if (!key) throw new Error("key is required");
            if (typeof items[0] !== "object") throw new Error("invalid items");
            if (!(key in items[0])) throw new Error("key is invalid");
            const record: any = {};
            for (const item of items) {
                record[item[key]] = item;
            }
            return record;
        },
        [EGroupType.MUL_DICTIONARY]: () => {
            if (!key) throw new Error("key is required");
            if (typeof items[0] !== "object") throw new Error("invalid items");
            if (!(key in items[0])) throw new Error("key is invalid");
            const record: any = {};
            for (const item of items) {
                if (!record[item[key]]) {
                    record[item[key]] = [item];
                } else {
                    record[item[key]].push(item);
                }
            }
            return record;
        },
    };
    return recordFactory[type].call();
};
