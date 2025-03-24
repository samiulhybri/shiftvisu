import { Deserializable } from "@app/shared/interfaces/deserializable";

export class TpmGroup implements Deserializable {
	id?: number;
	custom_id?: string;
	is_active?: boolean = true;
	name?: string = "";
	is_imported_from_erp: boolean = false;
	isUsed: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topTpmSubGroup) this.isUsed = true;
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isUsed: undefined,
		};
	}
}
