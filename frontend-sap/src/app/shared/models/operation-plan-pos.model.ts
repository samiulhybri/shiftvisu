import { Deserializable } from "../interfaces/deserializable";
export default class OperationPlanPos implements Deserializable {
	id?: number;
	operation_plan_id?: number;
    name?: string= '';
	pos?: number;
	is_warm_in_warm: boolean = false;
	deserialize(input: any): this {
		Object.assign(this, input);
		return this;
	}
	toOdata(): Object {
		return {
			...this,
			prodOrderPosOperation : undefined
		};
	}
}