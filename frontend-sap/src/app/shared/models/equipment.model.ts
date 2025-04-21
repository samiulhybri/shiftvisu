import {Deserializable} from "../interfaces/deserializable";

export class Equipment implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;

    constructor() {
    }

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
