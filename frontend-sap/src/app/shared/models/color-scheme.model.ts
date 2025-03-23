import { Deserializable } from "@app/shared/interfaces/deserializable";

export class ColorScheme implements Deserializable {
	id?: number;
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
