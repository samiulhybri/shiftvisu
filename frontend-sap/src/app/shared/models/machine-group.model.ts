import moment from "moment";
import { Deserializable } from "../interfaces/deserializable";
import { Hall } from "./hall.model";
import { Machine } from "./machine.model";
import { ProdOrderPosOperation } from "./prod-order-pos-operation.model";

export class MachineGroup implements Deserializable {
	id?: number;
	name?: string = "";
	custom_id?: string;
	just_plan_it_guid?: string;
	lead_time_days?: number = 0;
	hall?: Hall;
	auto_assign_machine?: boolean = false;
	default_te?: number = 0;
	is_active?: boolean = true;
	is_imported_from_erp: boolean = false;
	isUsed: boolean = false;
	//hwe_cost_factor_type?: string; //todo : to be defined later
	machines: Machine[] = [];
	prodOrderPosOperations: ProdOrderPosOperation[] = [];

	isSelected?: boolean = true; // internal use only

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.machines) {
			this.machines = input.machines.map((data: any) => new Machine().deserialize(data));
		}
		this.hall = new Hall().deserialize(input.hall ?? {});
		if (input.prodOrderPosOperations) {
			this.prodOrderPosOperations = input.prodOrderPosOperations.map((data: any) =>
				new ProdOrderPosOperation().deserialize(data)
			);
		}

		if (input.topMachine) {
			this.isUsed = true;
		}

		return this;
	}

	totalUsedMinutesByMachineId(id: number, date?: string, isPast = false): string {
		let total = 0;

		this.prodOrderPosOperations.forEach((prodOrderPosOperation: ProdOrderPosOperation) => {
			if (prodOrderPosOperation.plan_machine_id != id) return;
			if (
				moment(prodOrderPosOperation.plan_start).format("MMM DD, yyyy") !=
					moment(date).format("MMM DD, yyyy") &&
				!isPast
			)
				return;
			if (
				moment(prodOrderPosOperation.plan_start).toDate() >= moment(date).toDate() &&
				isPast
			)
				return;
			total += parseFloat(prodOrderPosOperation.getMinute());
		});

		return total.toFixed(0);
	}

	isMachineGroupVisible(halls: Hall[]) {
		const hall = halls.find(hall => hall.id == this.hall?.id);

		if (!hall || !hall.isSelected) {
			return false;
		}

		return true;
	}

	toOdata(): Object {
		return {
			...this,
			isSelected: undefined,
			hall_id: this.hall?.id,
			hall: undefined,
			isUsed: undefined,
		};
	}
}
