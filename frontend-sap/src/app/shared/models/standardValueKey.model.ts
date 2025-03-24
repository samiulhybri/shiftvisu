import { Deserializable } from "@app/shared/interfaces/deserializable";
import { StandardValueKeyActivityType } from "@app/shared/models/StandardValueKeyActivityType.model";

export class StandardValueKey implements Deserializable {
	id?: number;
	custom_id?: string = "";
	is_active?: boolean = true;
	standardValueKeyActivityTypes: StandardValueKeyActivityType[] = [];

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.StandardValueKeyActivityType)
			this.standardValueKeyActivityTypes = input.StandardValueKeyActivityType?.map(
				(type: StandardValueKeyActivityType) =>
					new StandardValueKeyActivityType().deserialize(type)
			);

		return this;
	}

	toOdata(): this {
		return {
			...this,
			standardValueKeyActivityTypes: undefined,
		};
	}
}
