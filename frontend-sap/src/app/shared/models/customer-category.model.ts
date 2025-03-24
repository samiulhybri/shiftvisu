import { Deserializable } from "@app/shared/interfaces/deserializable";

export class CustomerCategory implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_active?: boolean = true;
	sort_order?: number = 0;

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