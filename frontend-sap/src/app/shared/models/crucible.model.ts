import { Deserializable } from "../interfaces/deserializable";

export default class Crucibles implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	capacity?: number = 0;
	is_imported_from_erp: boolean = false;

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
