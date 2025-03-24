import { Deserializable } from "../interfaces/deserializable";

export class DeliveryTerm implements Deserializable {
	id?: number;
	custom_id?: string | number;
	name?: string;
	isUsed: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topCustomer) {
			this.isUsed = true;
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isUsed: undefined,
		};
	}
}
