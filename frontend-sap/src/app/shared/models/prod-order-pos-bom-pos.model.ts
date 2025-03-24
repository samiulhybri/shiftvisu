import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { UnitOfMeasure } from "@app/shared/models/unit-of-measures.model";
import { Item } from "@app/shared/models/item.model";
import { Classification } from "@app/shared/models/classification.model";

export class ProdOrderPosBomPos implements Deserializable {
	id?: number;
	name?: string;
	is_active?: boolean;
	is_bulk?: boolean;
	prod_order_pos_id?: number;
	item_id?: number;
	unit_of_measure_id?: number;
	prod_order_pos_operation_id?: number;
	warehouse_id?: number;
	pos?: string;
	qty_for_one_parent?: number;
	batch?: string;
	prodOrderPos?: ProdOrderPos;
	unitOfMeasure?: UnitOfMeasure;
	item?: Item;
 	classifications: Classification[] = [];

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.prodOrderPos)
			this.prodOrderPos = new ProdOrderPos().deserialize(input.prodOrderPos);
		if (input.unitOfMeasure)
			this.unitOfMeasure = new UnitOfMeasure().deserialize(input.unitOfMeasure);
		if (input.item) this.item = new Item().deserialize(input.item);
    
    if(input.classifications) {
      this.classifications = input.classifications.map((classification:any)=>new Classification().deserialize(classification));
    }
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			prod_order_pos_id: this.prodOrderPos?.id,
			prodOrderPos: undefined,
			unit_of_measure_id: this.unitOfMeasure?.id,
			unitOfMeasure: undefined,
			item_id: this.item?.id,
			item: undefined,
			classifications:undefined
		};
	}
}
