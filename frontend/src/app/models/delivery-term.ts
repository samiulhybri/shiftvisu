import { Deserializable } from "../interfaces/deserializable";

export class DeliveryTerm implements Deserializable {
	id?: number;
	custom_id: string = "";
	name: string = "";
	has_delivery_cost: boolean = false;

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
