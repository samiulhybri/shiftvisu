import {Deserializable} from "../interfaces/deserializable";
import {PaymentTerm} from "@app/models/payment-term";

export class Customer implements Deserializable {
    id?: number;
    custom_id: string  = '';
    name: string  = '';
    paymentTerm?: PaymentTerm;

    deserialize(input: any) {
        Object.assign(this, input);

        if(input.paymentTerm)
            this.paymentTerm = new PaymentTerm().deserialize(input.paymentTerm);

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            payment_term_id: this.paymentTerm?.id,
            paymentTerm: undefined,
        };
    }
}
