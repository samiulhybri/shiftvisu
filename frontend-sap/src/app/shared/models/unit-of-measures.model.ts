import { Deserializable } from "@app/shared/interfaces/deserializable";

export class UnitOfMeasure implements Deserializable {
	id?: number;
    name?: string;
    is_active?: boolean;

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
