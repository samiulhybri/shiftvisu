import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Item } from "./item.model";

export default class BomPos implements Deserializable {
	id?: number;
	bom_id?: number;
	pos?: string;
	qty_for_one_parent?: number;
	item?: Item;
	item_id?: number;
	prod_order_pos_id?: number;
	unit_of_measure_id?: number;
	warehouse_id?: number;
	prod_order_pos_operation_id?: number;
	storage_location_id?: number;
	batch?: string;
	name?: string;
	is_active?: boolean = false;
	is_backflush?: boolean = true;
	is_quantity_fixed?: number;

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.item) this.item = new Item().deserialize(input.item);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_id: this.item?.id,
			item: undefined,
		};
	}
}
