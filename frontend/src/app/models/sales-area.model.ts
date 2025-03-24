import { Deserializable } from "../interfaces/deserializable";

export class SalesArea implements Deserializable {
	id?: number;
	custom_id?: string | number;
	name?: string;
	constructor() { }

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