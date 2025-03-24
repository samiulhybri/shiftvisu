import { Deserializable } from "../interfaces/deserializable";

export class UnitOfMeasure implements Deserializable {
    id: number = 0;
    custom_id: string = '';
    name: string = '';
    is_active: boolean = true;

	constructor() { }

	deserialize(input: any) {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return { ...this };
	}
}
