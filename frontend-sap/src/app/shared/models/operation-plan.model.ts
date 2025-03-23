import { Deserializable } from "@app/shared/interfaces/deserializable";
import {OperationPlanPos} from "@app/shared/models/operation-plan-pos";

export default class OperationPlan implements Deserializable {
	id?: number;
	custom_id?: string = "";

	operationPlanPos?: OperationPlanPos[];

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input?.operationPlanPos) {
			this.operationPlanPos = input.operationPlanPos.map((operationPlanPos:any) => new OperationPlanPos().deserialize(operationPlanPos));
		}

		if (input?.operation_plan_pos) {
			this.operationPlanPos = input.operation_plan_pos.map((operationPlanPos: any) =>
				new OperationPlanPos().deserialize(operationPlanPos)
			);
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			prodOrderPosOperations:undefined
		};
	}
}
