import { HweQuenchingMedium } from "@app/modules/hwe-kalk/enums/HweQuenchingMedium";
import { Deserializable } from "../interfaces/deserializable";
import { CalculationHeatTreatmentType } from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";

export class HweWorkPlanHeatTreatment implements Deserializable {
    id?: number;
    hwe_work_plan_id?: number;
    pos?: number;
    type?: CalculationHeatTreatmentType;
   
    internal_note: string = '';
    isDeleted?: boolean = false;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): HweWorkPlanHeatTreatment {
        return {
            ...this,
            id: this.id ?? undefined,
            isDeleted: undefined
        };
    }
}

