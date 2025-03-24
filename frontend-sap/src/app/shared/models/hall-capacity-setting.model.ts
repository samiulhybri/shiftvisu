import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Hall } from "@app/shared/models/hall.model";

export class HallCapacitySetting implements Deserializable {
	id?: number;
	date?: string = "";
	machine_usage?: number = 0;
	employee_usage?: number = 0;
	overtime_factor?: number = 0;
	distribution_factor?: number = 0;
	additional_hours?: number = 0;

	hall: Hall = new Hall().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.hall) {
			this.hall = new Hall().deserialize(input.hall);
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			hall_id: this.hall.id,
			hall: undefined,
		};
	}
}
