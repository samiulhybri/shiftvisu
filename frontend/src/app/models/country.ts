import {Deserializable} from "../interfaces/deserializable";

export class Country implements Deserializable {
    id?: number;
    custom_id: string  = '';
    name: string  = '';
    hwe_overhead_surplus: number = 0;
    hwe_freight_surplus: number = 0;
    lead_time_days: number = 0;

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
