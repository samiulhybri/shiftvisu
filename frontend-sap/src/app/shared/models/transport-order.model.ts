import { Deserializable } from "@app/shared/interfaces/deserializable";

export class TransportOrder implements Deserializable {
	id?: number;
    name?: string;
	custom_id?: string;

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
