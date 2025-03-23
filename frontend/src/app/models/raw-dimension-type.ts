import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";

export class RawDimensionType implements ODatable, Deserializable {
	id?: number;
	offer_pos_raw_dimensions_id?: number;
	type?: string;
	encore_info?: number;
	lower_tolerance?: number;
	upper_tolerance?: number;
	additional_dimensions?: number;
	sample_allowance?: number;
	warm?: number;

	constructor() {}

	deserialize(input: any) {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return { ...this };
	}
}
