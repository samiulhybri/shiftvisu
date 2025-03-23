import { Deserializable } from "@app/shared/interfaces/deserializable";

export class StorageBin implements Deserializable {
	id?: number;
	custom_id?: string;
	is_active?: boolean = true;

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
