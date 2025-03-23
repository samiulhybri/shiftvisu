import { Deserializable } from "@app/shared/interfaces/deserializable";
import { StandardValueKey } from "@app/shared/models/standardValueKey.model";

export class StandardValueKeyActivityType implements Deserializable {
	id?: number;
	standardValueKey: StandardValueKey = new StandardValueKey().deserialize({});
	is_active?: boolean = true;
	is_clockin_enabled?: boolean = false;
	pos?: string = "";

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.standardValueKey = new StandardValueKey().deserialize(input.standardValueKey || {});
		return this;
	}

	toOdata(): this {
		return {
			...this,
			standard_value_key_id: this.standardValueKey?.id || null,
			standardValueKey: undefined,
		};
	}
}
