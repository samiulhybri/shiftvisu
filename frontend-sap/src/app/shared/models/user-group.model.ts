import { Deserializable } from "../interfaces/deserializable";

export class UserGroup implements Deserializable {
	id?: number;
	custom_id?: string;
	is_active?: boolean = true;
	is_enabled_for_clockin?: boolean = true;
	name?: string = "";

	isSelected?: boolean = false; //internal use only
	is_imported_from_erp: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isSelected: undefined,
		};
	}
}
