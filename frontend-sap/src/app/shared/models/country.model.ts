import { Deserializable } from "@app/shared/interfaces/deserializable";

export class Country implements Deserializable {
	id?: number;
	is_active: boolean = true;
	custom_id?: string;
	name?: string = "";
	crm_id?: string = "";
	hwe_freight_surplus?: number = 0;
	hwe_overhead_surplus?: number = 0;
	isUsed: Boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topCustomer) {
			this.isUsed = true;
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isUsed: undefined
		};
	}
}
