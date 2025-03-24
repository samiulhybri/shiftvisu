import { Deserializable } from "../interfaces/deserializable";
import {
    CalculationAdditionalHeatTreatmentType
} from "@app/modules/hwe-kalk/enums/CalculationAdditionalHeatTreatmentType";

export class CalculationAdditionalHeatTreatment implements Deserializable {
    id?: number;
    calculation_id?: number;
    pos?: number;
    type?: CalculationAdditionalHeatTreatmentType;
    isDeleted: boolean = false;

    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            id: this.id ?? undefined,
            isDeleted: undefined
        };
    }
}

