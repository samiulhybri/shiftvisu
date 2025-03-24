import {Deserializable} from "../interfaces/deserializable";

export class PaymentTerm implements Deserializable {
    id?: number;
    custom_id: string = '';
    name: string = '';
    discount: number = 0;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this
        };
    }
}
