import { Deserializable } from "@app/shared/interfaces/deserializable";

export class MarketSegment implements Deserializable {
	id?: number;
	is_active: boolean = true;
	custom_id?: string;
	name?: string = "";
	sort_order?: number = 0;

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
