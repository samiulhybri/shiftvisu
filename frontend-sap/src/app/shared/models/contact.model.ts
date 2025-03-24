import { Deserializable } from "@app/shared/interfaces/deserializable";

export class Contact implements Deserializable {
	id?: number;
	title?: string = "";
	first_name?: string = "";
	last_name?: string = "";
	email?: string = "";
	telephone?: string = "";
	mobile?: string = "";
	role_description?: string = "";
	xing?: string = "";
	linkedin?: string = "";
	note?: string = "";
	is_main_addressee?: boolean = false;

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
