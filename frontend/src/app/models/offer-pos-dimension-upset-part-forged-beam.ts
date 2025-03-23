
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";

export class OfferPosDimensionUpsetPartForgedBeam implements ODatable, Deserializable {
    id?: number;
    type?: string;
    section?: number;
    length?: number;
    outer_diameter?: number;
    cold_outer_diameter ? : number;
    warm_length ? : number;
    oversize?: number
    
    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    getWeight(density?: number): number {
        if( this.outer_diameter && this.length && density ){
            return   this.outer_diameter *  (this.length + (this.oversize ?? 0)) / 1000000 * density
        }
        const weight =  this.outer_diameter && this.length && density ?
            (this.outer_diameter / 2) ** 2 * Math.PI * (this.length + (this.oversize ?? 0)) / 1000000 * density : 0;
        return weight ? Number(weight.toFixed(4)) : 0;
    }

    getBeam(upsetParts?: OfferPosDimensionUpsetPartForgedBeam[]): number {
        const maxOuterDiameterStart = upsetParts?.reduce((max, part) => {
            return Math.max(max, part.outer_diameter || 0);
        }, 0);

        const beam = this.outer_diameter && this.length && maxOuterDiameterStart ?
            ((this.outer_diameter / 2) ** 2 * (this.length + (this.oversize ?? 0))) / ((maxOuterDiameterStart / 2) ** 2) : 0;
        return beam ? Number(beam.toFixed(4)) : 0;
    }

    toOdata(): object {
        return {
            ...this,
        };
    }
}
