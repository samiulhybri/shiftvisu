import { Deserializable } from "../interfaces/deserializable";

export class HweHeatTreatmentFactor implements Deserializable {
	id?: number;
	weight_from?: number;
	weight_to?: number;
	factor?: number;
	material_group_type?: string;

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}

	toOdata(): any {
		return {
			...this,
		};
	}
}
