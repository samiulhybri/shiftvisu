import { Deserializable } from "@app/shared/interfaces/deserializable";
import { User } from "@app/shared/models/user.model";

export class TransportOrderPosDeliveries implements Deserializable {
	id?: number;
	user?: User;
	delivered_quantity: number = 0;
	is_completed: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

        if(input.user){
            this.user = new User().deserialize(input.user);
        }

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			user: undefined,
		};
	}
}
