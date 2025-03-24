import { Deserializable } from "../interfaces/deserializable";

export default class CostCenter implements Deserializable {
	id?: number;

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
