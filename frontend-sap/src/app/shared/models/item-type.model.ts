import { Deserializable } from "@app/shared/interfaces/deserializable";

export default class ItemType implements Deserializable {
	id?: number;
	is_active: boolean = true;
	custom_id?: string = "";
	name?: string = "";
	is_stocked_in_hu: boolean = false;
	is_packaging: boolean = false;

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
