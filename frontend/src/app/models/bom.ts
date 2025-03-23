import { Deserializable } from "../interfaces/deserializable";

export class Bom implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;
    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}
