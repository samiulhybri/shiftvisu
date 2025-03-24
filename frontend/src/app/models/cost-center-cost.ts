import { Deserializable } from "../interfaces/deserializable";

export class CostCenterCost implements Deserializable {
    id?: number;
    cost_center_id?: number;
    cost?: number;
    cost_type?: string;
    valid_from?: Date;
    valid_to?: Date;

    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata() {
        return {
            ...this,
        };
    }
}