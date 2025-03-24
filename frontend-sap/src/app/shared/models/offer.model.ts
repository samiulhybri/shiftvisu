import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Customer } from "@app/shared/models/customer.model";

export class Offer implements Deserializable {
	id?: number;
	custom_id: string = "";
	customer?:Customer;

	deserialize(input: any) {
		Object.assign(this, input);

    if(input.customer) {
      this.customer = new Customer().deserialize(input.customer)
    }

		return this;
	}
	toOdata(): Object {
		return {
			...this,
		};
	}
}
