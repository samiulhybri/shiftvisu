import { Deserializable } from "@app/shared/interfaces/deserializable";

export default class HeatTreatment implements Deserializable {
	id?: number;
	type?:string;

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
