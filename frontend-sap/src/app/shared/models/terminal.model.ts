import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Hall } from "@app/shared/models/hall.model";
import { Printer } from "@app/shared/models/printer.model";

export class Terminal implements Deserializable {
	id?: number;
	name?: string = "";
	ip_address?: string = "";
	printer: Printer = new Printer().deserialize({});
	hall: Hall = new Hall().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.printer) 
			this.printer = new Printer().deserialize(input.printer);
		if (input.hall) 
			this.hall = new Hall().deserialize(input.hall);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			printer_id: this.printer?.id,
			hall_id: this.hall?.id,
			printer: undefined,
			hall:undefined,
		};
	}
}
