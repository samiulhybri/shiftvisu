import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { User } from "@app/shared/models/user.model";
import ItemState from "@app/shared/models/item-state.model";

export class ProdOrderPosOperationQuantity implements Deserializable {
	id?: number;
	machine?: Machine;
	prodOrderPosOperation?: ProdOrderPosOperation;
	user?: User;
	itemState?: ItemState;
	quantity?: number;
	is_final_quantity?: boolean;
	confirmed_datetime?: string;
	canceledBy?: ProdOrderPosOperationQuantity;
	cancellationFor?: ProdOrderPosOperationQuantity;
	batch?: string;
	serial?: string;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.machine) this.machine = new Machine().deserialize(input.machine);
		if (input.prodOrderPosOperation ?? input.prod_order_pos_operation)
			this.prodOrderPosOperation = new ProdOrderPosOperation().deserialize(
				input.prodOrderPosOperation ?? input.prod_order_pos_operation
			);
		if (input.user) this.user = new User().deserialize(input.user);
		if (input.canceledBy || input.canceled_by) {
			this.canceledBy = new ProdOrderPosOperationQuantity().deserialize(
				input.canceledBy ?? input.canceled_by
			);
		}
		if (input.cancellationFor || input.cancellation_for) {
			this.cancellationFor = new ProdOrderPosOperationQuantity().deserialize(
				input.cancellationFor ?? input.cancellation_for
			);
		}

		if (input.itemState || input.item_state) {
			this.itemState = new ItemState().deserialize(input.item_state ?? input.itemState);
		}

		return this;
	}

	processData(data: any) {
		const now = new Date();
		const startTime = new Date(
			now.getTime() - parseInt(data.machineBoardHours || 12, 10) * 60 * 60 * 1000
		);
		const endTime = now;
		const completeData = [];

		// Helper function to format date to "HH:00"
		const formatTime = (date: Date): string => date.toISOString().substring(11, 13) + ":00";

		// Loop through the time range and fill in missing time slots
		for (let date = new Date(startTime); date <= endTime; date.setHours(date.getHours() + 1)) {
			const currentTime = formatTime(date);

			const existingEntry = data?.values?.find((entry: any) => entry.name === currentTime);

			if (existingEntry) {
				completeData.push(existingEntry);
			} else {
				completeData.push({ name: currentTime, Scrap: 0, Good: 0 });
			}
		}

		return completeData;
	}

	toOdata(): Object {
		return {
			...this,
			user_id: this.user?.id,
			machine_id: this.machine?.id,
			prod_order_pos_operation_id: this.prodOrderPosOperation?.id,
			item_state_id: this.itemState?.id,
			user: undefined,
			machine: undefined,
			prodOrderPosOperation: undefined,
			itemState: undefined,
		};
	}
}
