import { Deserializable } from "@app/shared/interfaces/deserializable";
import ItemState from "@app/shared/models/item-state.model";
import { Machine } from "@app/shared/models/machine.model";

export default class ItemStateMachine implements Deserializable {
	id?: number;
	machine?: Machine;
	itemState?: ItemState;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.itemState) this.itemState = new ItemState().deserialize(input.itemState);
		if (input.machine) this.machine = new Machine().deserialize(input.machine);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_state_id: this.itemState?.id,
			machine_id: this.machine?.id,
			itemState: undefined,
		};
	}
}
