import {Deserializable} from "../interfaces/deserializable";

export class MPMaterial implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;
    density?: number;
    price?: number;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}