import { HweQuenchingMedium } from "@app/modules/hwe-kalk/enums/HweQuenchingMedium";
import { Deserializable } from "../interfaces/deserializable";
import { CalculationHeatTreatmentType } from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";

export class CalculationHeatTreatment implements Deserializable {
    id?: number;
    calculation_id?: number;
    pos?: number;
    type?: CalculationHeatTreatmentType;
    temperature_min?: number;
   
    internal_note: string = '';
    isDeleted?: boolean = false;

    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): CalculationHeatTreatment {
        return {
            ...this,
            id: this.id ?? undefined,
            isDeleted: undefined
        };
    }
}

