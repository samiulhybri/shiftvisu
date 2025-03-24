import moment from "moment";
import { Deserializable } from "../interfaces/deserializable";
import { Machine } from "./machine.model";

export class ProdLot implements Deserializable {
	id?: number;
	custom_id?: string;
	machine_id?: number;
	start?: string;
	end?: string;
	created_at?: string;
	updated_at?: string;
	machine?: Machine;
	note?: string;
	temperature?: number;
	is_cooldown_needed?:boolean;
	formatedStartDate?: string;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.machine) {
			this.machine = new Machine().deserialize(input.machine);
		}

		if (input.start) {
			this.formatedStartDate = moment.utc(this.start).format("MMM DD, yyyy  hh:mm a");
		}
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			formatedStartDate: undefined,
		};
	}
}
