import moment from "moment";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Shift } from "@app/shared/models/shift.model";
import { DateToConsider } from "@app/shared/enums/DateToConsider";

export class Capacity implements Deserializable {
	id?: number;
	date?: string;
	created_at?: string;
	updated_at?: string;
	capacitable_type?: string;
	capacitable_id?: number;
	start_time?: string;
	end_time?: string;
	date_to_consider?: string = DateToConsider.SHIFT_START;
	break_minutes?: number = 0;
	shift?: Shift | null;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input) {
			this.shift = new Shift().deserialize(
				input.shift ?? {
					start_time: input.start_time,
					end_time: input.end_time,
					break_minutes: input.break_minutes,
				}
			);
		}

		if (input.date) {
			this.date = moment(input.date).format("MMM DD, yyyy");
		}

		if (input?.start_time) this.start_time = this.getTimeInHHMMFormat(input.start_time);
		if (input?.end_time) this.end_time = this.getTimeInHHMMFormat(input.end_time);

		return this;
	}

	getTimeInHHMMFormat(time: string) {
		return time?.split(":").slice(0, 2)?.join(":");
	}

	toOdata(): Object {
		return {
			...this,
			date: moment(this.date).format("YYYY-MM-DD"),
			start_time: this.shift?.start_time,
			end_time: this.shift?.end_time,
			break_minutes: this.shift?.break_minutes,
			date_to_consider: this.shift?.date_to_consider,
			shift_id: this.shift?.id,
			shift: undefined,
		};
	}
}
