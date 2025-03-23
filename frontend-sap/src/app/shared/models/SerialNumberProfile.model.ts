import { Deserializable } from "@app/shared/interfaces/deserializable";

export class SerialNumberProfile implements Deserializable {
	id?: number;
	check_stock: boolean = false;
	custom_id?: string;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return {
			...this
		};
	}
}
