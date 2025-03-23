import { Deserializable } from "../interfaces/deserializable";

export class Tools implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_active?: boolean = true;
	is_imported_from_erp: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
		};
	}
}
