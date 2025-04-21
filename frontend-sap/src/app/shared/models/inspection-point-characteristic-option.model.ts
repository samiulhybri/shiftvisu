import {Deserializable} from "../interfaces/deserializable";

export class InspectionPointCharacteristicOption implements Deserializable {
    id?: number;

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
