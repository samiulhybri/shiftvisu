import { Deserializable } from "../interfaces/deserializable";

export default class Bom implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	isUsed: boolean = false;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input?.topItem) {
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
