import { Deserializable } from "../interfaces/deserializable";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Machine } from "@app/shared/models/machine.model";

export class ProdOrderPosOperationTime implements Deserializable {
	id?: number;
	start?: string;
	end?: string;
	cavity?: number;
	status?: string;
	prodOrderPosOperation?: ProdOrderPosOperation;
	machine?: Machine;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.prodOrderPosOperation)
			this.prodOrderPosOperation = new ProdOrderPosOperation().deserialize(
				input.prodOrderPosOperation
			);

		if (input.machine) this.machine = new Machine().deserialize(input.machine);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			prodOrderPosOperation: undefined,
			machine: undefined,
		};
	}
}
