import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";

export class Tool implements ODatable, Deserializable {
	id?: number;
	custom_id: string = '';
	name: string = '';
	is_active: boolean = false;

	constructor() { }

	deserialize(input: any) {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return { ...this };
	}
}