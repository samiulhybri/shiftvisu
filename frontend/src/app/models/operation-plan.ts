import { Deserializable } from "../interfaces/deserializable";
import { OperationPlanPos } from "./operation-plan-pos";

export class OperationPlan implements Deserializable {
    id?: number;
    custom_id: string = '';
    operationPlanPos: OperationPlanPos[] = [];

    deserialize(input: any) {
        Object.assign(this, input);
        this.operationPlanPos = [];
        if (input.operationPlanPos) {
            input.operationPlanPos.forEach((data: any) => {
                this.operationPlanPos?.push(new OperationPlanPos().deserialize(data))
            });
        }
        return this;
    }
    toOdata(): Object {
        return {
            ...this,
            operationPlanPos: undefined
        };
    }
}
