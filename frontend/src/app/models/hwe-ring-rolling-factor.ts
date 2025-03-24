import { Deserializable } from "../interfaces/deserializable";

export class HweRingRollingFactor implements Deserializable {
	id?: number;
	weight_from?: number;
	weight_to?: number;
	factor?: number;
	
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
