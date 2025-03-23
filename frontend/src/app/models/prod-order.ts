import { Deserializable } from "../interfaces/deserializable";

export class ProdOrder implements Deserializable {
    id?: number;
    custom_id?: string;

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
