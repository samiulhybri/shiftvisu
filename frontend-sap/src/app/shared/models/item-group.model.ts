import { Deserializable } from "@app/shared/interfaces/deserializable";

export default class ItemGroup implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_active?: boolean = true;
	is_imported_from_erp: boolean = false;
	isUsed: boolean = false;
	sort_order: number = 0;

	constructor() {}

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
