import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Shift } from "@app/shared/models/shift.model";
import moment from "moment";

export class ShiftModelShift implements Deserializable {
	id?: number;
	shift_model_id?: number;
	shift_id?: number;
	day_of_week?: number;
	shift?: Shift;
	isSelected?: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		console.log(input.shift);
		if (input.shift) {
			this.shift = new Shift().deserialize(input.shift);
		} else {
			this.shift = undefined;
		}

		return this;
	}

	toOdata(): this {
		return {
			...this,
			isSelected: undefined,
		};
	}
}
