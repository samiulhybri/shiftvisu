
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import {OfferPosShaftUpsetPart} from "@app/models/offer-pos-shaft-upset-part";

export class OfferPosDimensionShaftUpsetPart implements ODatable, Deserializable {
    id?: number;
    type?: string;
    section?: number;
    length?: number;
    outer_diameter_start?: number;
    outer_diameter_end?: number;
    side?: number;
    is_sample?: boolean = false;
    oversize?: number;
    cold_outer_diameter ? : number;
    warm_length ? : number;

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

    getWeight(density?: number): number {
        if( this.outer_diameter_start && this.length && density && this.side){
            return   this.outer_diameter_start * this.side * (this.length + (this.oversize ?? 0)) / 1000000 * density
        }
        const weight =  this.outer_diameter_start && this.length && density ?
            (this.outer_diameter_start / 2) ** 2 * Math.PI * (this.length + (this.oversize ?? 0)) / 1000000 * density : 0;
        return weight ? Number(weight.toFixed(4)) : 0;
    }

    getBeam(upsetParts?: OfferPosDimensionShaftUpsetPart[]): number {
        const maxOuterDiameterStart = upsetParts?.reduce((max, part) => {
            return Math.max(max, part.outer_diameter_start || 0);
        }, 0);

        const beam = this.outer_diameter_start && this.length && maxOuterDiameterStart ?
            ((this.outer_diameter_start / 2) ** 2 * (this.length + (this.oversize ?? 0))) / ((maxOuterDiameterStart / 2) ** 2) : 0;
        return beam ? Number(beam.toFixed(4)) : 0;
    }
}
