import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { UnitOfMeasure } from "@app/shared/models/unit-of-measures.model";
import { Item } from "@app/shared/models/item.model";
import { Classification } from "@app/shared/models/classification.model";
import { Machine } from "./machine.model";

export class ProdOrderPosOperationAltMachine implements Deserializable {
	id?: number;
	prod_order_pos_operation_id?: number;
	pos?: number;
	machine_id?: number;
	te?: number;
	reference_nr?:number;
    machine?: Machine;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
        
        if (input.machine) {
            this.machine = new Machine().deserialize(input.machine);
        }
		return this;
	}

	toOdata(): Object {
		return {
			...this,
            machine:undefined
		};
	}
}
