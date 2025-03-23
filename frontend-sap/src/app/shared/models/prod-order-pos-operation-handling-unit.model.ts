import { Deserializable } from "@app/shared/interfaces/deserializable";
import { User } from "@app/shared/models/user.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Machine } from "@app/shared/models/machine.model";

export class ProdOrderPosOperationHandlingUnit implements Deserializable {
	id?: number;
	prodOrderPosOperation?: ProdOrderPosOperation;
	handlingUnit?: HandlingUnit;
	machine?: Machine;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.prodOrderPosOperation) {
			this.prodOrderPosOperation = new ProdOrderPosOperation().deserialize(
				input.prodOrderPosOperation
			);
		}

		if (input.handlingUnit) {
			this.handlingUnit = new HandlingUnit().deserialize(input.handlingUnit);
		}

		if (input.machine) {
			this.machine = new Machine().deserialize(input.machine);
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			prod_order_pos_operation_id: this.prodOrderPosOperation?.id,
			handling_unit_id: this.handlingUnit?.id,
			machine_id: this.machine?.id,
			prodOrderPosOperation: undefined,
			handlingUnit: undefined,
			machine: undefined,
		};
	}
}
