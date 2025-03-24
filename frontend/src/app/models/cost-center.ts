import { Deserializable } from "../interfaces/deserializable";
import { CostCenterCost } from "./cost-center-cost";

export class CostCenter implements Deserializable {
    id?: number;
    custom_id?: string;
    is_active: boolean = false;
    costCenterCostToday?: CostCenterCost;

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.costCenterCostToday) this.costCenterCostToday = new CostCenterCost().deserialize(input.costCenterCostToday);

        return this;
    }

    toOdata() {
        return {
            ...this,
        };
    }
}