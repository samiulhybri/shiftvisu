import { HweCostFactorType } from "@app/modules/hwe-kalk/enums/HweCostFactorType";
import { Deserializable } from "../interfaces/deserializable";
import { CostCenter } from "./cost-center";

export class MachineGroup implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;
    just_plan_it_guid?: string;
    lead_time_days?: number;
    costCenter?: CostCenter;

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.costCenter) this.costCenter = new CostCenter().deserialize(input.costCenter);

        return this;
    }

    toOdata(){
        return {
            ...this
        }
    }
}