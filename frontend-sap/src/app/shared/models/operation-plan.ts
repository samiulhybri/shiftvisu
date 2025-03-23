import { Deserializable } from "@app/shared/interfaces/deserializable";
import { OperationPlanPos } from "@app/shared/models/operation-plan-pos";

export class OperationPlan implements Deserializable {
    id?: number;
    custom_id: string = '';
    operationPlanPos: OperationPlanPos[] = [];

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.operationPlanPos) {
            this.operationPlanPos = [];
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
