import { Deserializable } from "@app/shared/interfaces/deserializable";
import { User } from "@app/shared/models/user.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Machine } from "@app/shared/models/machine.model";


export class UserRegisteredTimes implements Deserializable {
	id?: number;
	date?: Date;
	hours_split?: number;
	is_generated?: boolean = false;
    user: User = new User().deserialize({});
	prodOrderPosOperation?: ProdOrderPosOperation;
    machine?: Machine;
	is_exported?: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		this.user = new User().deserialize(input.user ?? {});
		if (input.prodOrderPosOperation) {
			this.prodOrderPosOperation = new ProdOrderPosOperation().deserialize(
				input.prodOrderPosOperation
			);
		}
		if (input.machine) {
			this.machine = new Machine().deserialize(input.machine);
		}
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			user_id: this.user.id,
			user: undefined,
			machine_id: this.machine?.id,
			machine: undefined,
			prod_order_pos_operation_id: this.prodOrderPosOperation?.id,
			prodOrderPosOperation: undefined,
		};
	}
}
