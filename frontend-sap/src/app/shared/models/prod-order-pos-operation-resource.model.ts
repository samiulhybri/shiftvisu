import { Deserializable } from "../interfaces/deserializable";
import { Item } from "./item.model";

export class ProdOrderPosOperationResource implements Deserializable {
	id?: number;
	is_active?: number | boolean;
	prod_order_pos_operation_id?: number;
	item_id_tool?: number;
	reference_nr?: number;
    item?: Item;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
        if(input.item) {
            this.item = new Item().deserialize(input.item);
        }

		return this;
	}

	toOdata(): Object {
		return {
            ...this,
            item:undefined
        };
	}
}
