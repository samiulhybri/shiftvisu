import {Deserializable} from "../interfaces/deserializable";
import {HweCostFactorType} from "@app/modules/hwe-kalk/enums/HweCostFactorType";
import {CostCenter} from "@app/models/cost-center";

export class Machine implements Deserializable {
    id?: number;
    custom_id?: string;
    name?: string;
    price?: number;
    is_furnace?: boolean;
    isSelected?: boolean;
    hwe_cost_factor_type?: HweCostFactorType;
    costCenter?: CostCenter;
    lead_time_days?: number;

    public isFurnace(): boolean {
        return this.is_furnace === true;
    }

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }
}