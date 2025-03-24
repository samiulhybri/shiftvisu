import { Deserializable } from "../interfaces/deserializable";

export default class OfferPosRawDimention implements Deserializable {
	id?: number;
	gross_weight?: string;
	operating_weight?: string;
	rolling_pin_value?: number|null;

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
