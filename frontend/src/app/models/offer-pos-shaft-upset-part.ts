
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";

export class OfferPosShaftUpsetPart implements ODatable, Deserializable {
    id?: number;
    type?: string;
    section?: number;
    height?: number;
    outer_diameter?: number;
    
    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): object {
        return {
            ...this,
        };
    }
}
