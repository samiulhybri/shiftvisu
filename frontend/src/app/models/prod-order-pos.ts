import { Deserializable } from "../interfaces/deserializable";

import { Item } from "./item";
import { ProdOrder } from "./prod-order";
import { HweQsSamplesProdOrderPos } from "@app/models/hew-qs-samples-prod-order-pos";

export class ProdOrderPos implements Deserializable {
    id?: number;
    prod_order?: ProdOrder;
    prodOrder?: ProdOrder;
    pos?: string;
    item?: Item;
    start?: Date | null;
    end?: Date | null;
    quantity?: number;
    isSelected?: boolean;
    custom_id?: string;
    calculation_id?:number;
    hweQsSamplesProdOrderPos: HweQsSamplesProdOrderPos[] = [];

    deserialize(input: any) {
        Object.assign(this, input);

        this.start = input.start ? new Date(input.start) : null;
        this.end = input.end ? new Date(input.end) : null;
        this.item = input.Item ? new Item().deserialize(input.item) : new Item();
        this.prod_order = input.prod_order ? new ProdOrder().deserialize(input.prod_order) : new ProdOrder();

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            item_id: this.item?.id ?? null,
            prod_order_id: this.prod_order?.id ?? null,
            prodOrder: undefined,
            hweQsSamplesProdOrderPos: undefined,
            salesOrderPos: undefined,
        };
    }
}