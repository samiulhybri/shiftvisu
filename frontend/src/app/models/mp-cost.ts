import { Deserializable } from "../interfaces/deserializable";
import { MPCostMachines } from "./mp-cost-machines";

export class MPCost implements Deserializable {
    id?: number;
    cost_group?: string;
    name?: string;
    cost_sub_group?: string;
    cost_type?: string;
    mpCostMachines?: MPCostMachines[];

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.mpCostMachines) {
            this.mpCostMachines = [];

            input.mpCostMachines.forEach((mpCostMachines: any) => {
                this.mpCostMachines?.push(
                    new MPCostMachines().deserialize(mpCostMachines)
                );
            });
        }

        return this;
    }
}
