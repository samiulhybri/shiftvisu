import { Deserializable } from "../interfaces/deserializable";
import { Item } from "./item.model";
import { Machine } from "./machine.model";
import { ProdOrderPos } from "./prod-order-pos.model";

export class ProductionPlan implements Deserializable {
	id?: number;
	custom_id?: string;
	prod_order_pos?: ProdOrderPos = new ProdOrderPos().deserialize({});
	machine?: Machine = new Machine().deserialize({});
	item?: Item = new Item().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}

}
