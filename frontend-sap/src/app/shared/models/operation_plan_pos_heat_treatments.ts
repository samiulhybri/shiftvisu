
import { Deserializable } from "@app/shared/interfaces/deserializable";

export class OperationPlanPosHeatTreatmeant implements Deserializable {
    id?: number;
    quenching_medium?: string;
    hardness?: number;
    temperature_min?: number;
    temperature_max?: number;
    annealing_temperature?: number;
    heating_time?: number;
    holding_time?: number;
    cooldown_rate?: number;
    cross_section?: number;
    internal_note: string = '';
    isDeleted?: boolean = false;

    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): OperationPlanPosHeatTreatmeant {
        return {
            ...this,
            quenching_medium: this.quenching_medium ?? '',
            id: this.id ?? undefined,
            isDeleted: undefined
        };
    }
}

