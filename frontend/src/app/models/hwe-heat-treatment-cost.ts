
import { CalculationHeatTreatmentType } from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import { Deserializable } from "../interfaces/deserializable";
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";


export class HweHeatTreatmentCost  implements Deserializable {
    id?: number;
    type?:OfferPosWorkPlanNameClass;
    cost: number = 0;
    min_cost: number = 0;

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }
    toOdata(): Object {
        return {
            ...this,
        };
    }
}
