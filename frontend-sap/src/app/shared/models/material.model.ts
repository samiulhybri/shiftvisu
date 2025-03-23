import { Deserializable } from "@app/shared/interfaces/deserializable";

export class Material implements Deserializable {
	id?: number;
	custom_id: string = "";
	name?: string = "";
	material_group_type?: string = "";
	forging_temperature_min?: string = "";
	forging_temperature_max?: string = "";

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}
	toOdata(): Object {
		return {
			...this,
		};
	}
}
