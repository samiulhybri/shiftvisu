import { Deserializable } from "../interfaces/deserializable";

export class CustomerGroup implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_active?: boolean = true;
	crm_id?: string = "";
	is_imported_from_erp: boolean = false;
	isUsed: boolean = false;
	sort_order?: number = 0;

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
			isUsed: undefined,
		};
	}
}
