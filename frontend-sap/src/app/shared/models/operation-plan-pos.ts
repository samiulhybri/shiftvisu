import { Deserializable } from "@app/shared/interfaces/deserializable";
import { OperationPlanPosHeatTreatmeant } from "@app/shared/models/operation_plan_pos_heat_treatments";

export class OperationPlanPos implements Deserializable {
    id?: number;
    operation_plan_id?: number;
    pos: string = '';
    te?: number;
    tr?: number;
    name?: string;
    operationPlanPosHeatTreatments: OperationPlanPosHeatTreatmeant[] = [];

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.operationPlanPosHeatTreatments){
            this.operationPlanPosHeatTreatments = input.operationPlanPosHeatTreatments.map(
				(operationPlanPosHeatTreatment: any) =>
					new OperationPlanPosHeatTreatmeant().deserialize(operationPlanPosHeatTreatment)
			);
        }
        if (input.operation_plan_pos_heat_treatments) {
			this.operationPlanPosHeatTreatments = input.operation_plan_pos_heat_treatments.map(
				(operationPlanPosHeatTreatment: any) =>
					new OperationPlanPosHeatTreatmeant().deserialize(operationPlanPosHeatTreatment)
			);
		}

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            id: undefined,
            machineGroup: undefined,
            machine: undefined,
            operationPlanPosHeatTreatments:  undefined,
        };
    }

}
