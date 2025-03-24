
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { OfferPos } from "./offer-pos";

export class OfferPosMechanicalProcess implements ODatable, Deserializable {
    id?: number;
    section?: number;
    offer_pos_id?: number;
    offerPos?: OfferPos;
    outer_diameter?: number;
    inner_diameter?: number;
    length?: number;
    radius?: number;
    side?: number;
    inner_length?: number;
    inner_radius?: number;

    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        this.offerPos = input.offerPos ? new OfferPos().deserialize(input.offerPos) : new OfferPos();
        return this;
    }

    toOdata(): object {
        return {
            ...this,
            offer_pos_id: this.offerPos?.id,
            offerPos: undefined,
        };
    }
}
