import { Deserializable } from "../interfaces/deserializable";
import { MachineGroup } from "./machine-group";
import { OperationPlanPosHeatTreatmeant } from "./operation_plan_pos_heat_treatments";
import {Machine} from "@app/models/machine";
import {OfferPosWorkPlanName} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";

export class OperationPlanPos implements Deserializable {
    id?: number;
    operation_plan_id?: number;
    machineGroup?: MachineGroup;
    unit?: string = '';
    machine?: Machine;
    pos: string = '';
    name?: OfferPosWorkPlanName;
    te?: number;
    tr?: number;
    is_warm_in_warm?: boolean = false;
    operationPlanPosHeatTreatments: OperationPlanPosHeatTreatmeant[] = [];
    deserialize(input: any) {
        Object.assign(this, input);
        this.machineGroup = input.machineGroup ? new MachineGroup().deserialize(input.machineGroup) : new MachineGroup();
        this.machine = input.machine ? new Machine().deserialize(input.machine) : new Machine();
        if (input.operationPlanPosHeatTreatments) {
            if (input.operationPlanPosHeatTreatments) {
                this.operationPlanPosHeatTreatments = [];
                input.operationPlanPosHeatTreatments.forEach((operationPlanPosHeatTreatment: OperationPlanPosHeatTreatmeant) => {
                    this.operationPlanPosHeatTreatments?.push(new OperationPlanPosHeatTreatmeant().deserialize(operationPlanPosHeatTreatment))
                });
            }
        }
        return this;
    }

    toOdata(isNew: boolean = false): Object {
        return {
            ...this,
            id: undefined,
            machine_group_id: this.machineGroup?.id ?? null,
            machine_id: this.machine?.id ?? null,
            machineGroup: undefined,
            machine: undefined,
            operationPlanPosHeatTreatments: isNew ? this.getOpPlanPosHeatTeData() : undefined,
        };
    }
    getOpPlanPosHeatTeData() {
        let data: OperationPlanPosHeatTreatmeant[] = [];
        this.operationPlanPosHeatTreatments.forEach((operationPlanPosHeatTreatment: OperationPlanPosHeatTreatmeant) => {
            data.push(operationPlanPosHeatTreatment.toOdata())
        });

        return data.length ? data : undefined
    }

}
