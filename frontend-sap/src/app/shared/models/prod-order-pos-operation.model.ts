import { MachineGroup } from "@app/shared/models/machine-group.model";
import moment from "moment";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { ProdLot } from "@app/shared/models/prod-lot.model";
import { ProdOrderPosOperationDelivery } from "@app/shared/models/prod-order-pos-operation-delivery.model";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperationQuantity } from "@app/shared/models/prod-order-pos-operation-quantity.model";
import { ProdOrderPosOperationTime } from "@app/shared/models/prod-order-pos-operation-time";
import { OperationPlan } from "@app/shared/models/operation-plan";
import { OperationPlanPos } from "@app/shared/models/operation-plan-pos";
import { Tools } from "@app/shared/models/tools.model";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ProdOrderPosOperationAltMachine } from "@app/shared/models/prod-order-pos-operation-alt-machine.model";
import { ProdOrderPosOperationResource } from "@app/shared/models/prod-order-pos-operation-resource.model";
import { Item } from "@app/shared/models/item.model";
import { MachineConstraintType } from "@app/shared/enums/MachineConstraintType";

export class ProdOrderPosOperation implements Deserializable {
	id?: number;
	prod_order_pos_id?: number;
	prod_lot_id?: number;
	machine_id?: number | null = null;
	tool_id?: number;
	plan_machine_id?: number | null = null;
	erp_machine_id?: number;
	machine_group_id?: number;
	pos?: string;
	name?: string;
	start?: string | null;
	end?: string | null;
	te?: number;
	tr?: number;
	cavity?: number;
	registered_quantity?: number;
	status: string = ProdOrderPosOperationStatus.PLANNED;
	status_plan: string = ProdOrderPosOperationStatus.PLANNED;
	comment?: string;
	operation_code?: string;
	operation_code_erp?: string;
	operation_code_plan?: string;
	show_in_planvisu?: boolean;
	erp_start?: string;
	erp_end?: string;
	plan_start?: string | null = null;
	plan_end?: string | null;
	plan_te?: number | null;
	erp_te?: string;
	teardown_time?: number | null;
	is_changed?: boolean;
	prodOrderPos?: ProdOrderPos;
	prodLot?: ProdLot;
	is_urgent_delivery: boolean = false;
	operation_plan_id_origin!: number;
	operation_plan_pos_id_origin!: number;

	currentDelivery?: ProdOrderPosOperationDelivery;
	prodOrderProdOperationDeliveries: ProdOrderPosOperationDelivery[] = [];
	prodOrderPosOperationQuantities: ProdOrderPosOperationQuantity[] = [];
	quantityDelivered? = 0;
	machine?: Machine;
	tool?: Tools;
	prodOrderPosOperationTimes?: ProdOrderPosOperationTime[] = [];
	operationPlan?: OperationPlan;
	operationPlanPos?: OperationPlanPos;

	oldMachineId?: number | null = null; // internal use only
	oldStart?: string | null = null; // internal use only
	formatedDate?: string | null = ""; // internal use only
	isSelected: boolean = true;
	is_repair_completed: boolean = false;
	repair_completed_date!: Date;
	machineGroup?: MachineGroup;
	has_components_prepared = false;
	quantity?: number | null = null;
	tool_reference_nr?: number;
	item_id_tool?: number;
	itemTool?: Item;
	prodOrderPosOperationAltMachines: ProdOrderPosOperationAltMachine[] = [];
	prodOrderPosOperationResources: ProdOrderPosOperationResource[] = [];
	lead_time_days?: number = 0;
	send_ahead_quantity?: number = 0;
	user_id?: any = null;
	constraint_type?: any = MachineConstraintType.MANUAL;
	is_automatic_created_repair: boolean = false;

	constructor() {}

	getHour = () => (((this.te ?? 0) * this.prodOrderPos?.quantity!) / 3600).toFixed(2);
	getMinute = () => (((this.te ?? 0) * this.prodOrderPos?.quantity!) / 60).toFixed(0);

	isPast(date: string) {
		return moment(this.plan_start).toDate().getTime() < moment(date).toDate().getTime();
	}

	setInDateTimeFormat = () => (this.formatedDate = moment(this.start).format("MMM DD, yyyy"));

	getPosition() {
		return parseInt(this.pos!);
	}

	getFormattedTe() {
		if (!this.te) {
			return "00:00";
		}

		const hours = Math.floor(this.te / 3600);
		const minutes = Math.floor((this.te % 3600) / 60);
		const seconds = Math.floor(this.te % 60);

		const paddedHours = hours.toString().padStart(2, "0");
		const paddedMinutes = minutes.toString().padStart(2, "0");
		const paddedSeconds = seconds.toString().padStart(2, "0");
		if (hours === 0 && minutes === 0) {
			return `${paddedSeconds} sec`;
		}
		return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
	}

	getStartDate = () => (this.start ? moment(this.start).format("MMM DD, yyyy") : "");

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.prodOrderPos ?? input.prod_order_pos) {
			this.prodOrderPos = new ProdOrderPos().deserialize(
				input.prodOrderPos ?? input.prod_order_pos
			);
		}

		/**
		 * from odata coming prodLot and API coming prod_lot
		 */
		if (input.prodLot ?? input.prod_lot) {
			this.prodLot = new ProdLot().deserialize(input.prodLot ?? input.prod_lot);
		}

		if (input.plan_machine_id) {
			this.oldMachineId = input.plan_machine_id;
		}
		if (input.start) {
			this.setInDateTimeFormat();
		}

		if (input.plan_start) {
			this.oldMachineId = input.plan_start;
			this.plan_start = moment(this.plan_start).format("YYYY-MM-DD HH:mm:ss");
		}

		if (input.prodOrderProdOperationDeliveries) {
			this.quantityDelivered = 0;
			this.prodOrderProdOperationDeliveries = input.prodOrderProdOperationDeliveries.map(
				(prodOrderProdOperationDelivery: any) => {
					this.quantityDelivered! += parseInt(prodOrderProdOperationDelivery.quantity);
					return new ProdOrderPosOperationDelivery().deserialize(
						prodOrderProdOperationDelivery
					);
				}
			);

			this.currentDelivery = this.prodOrderProdOperationDeliveries.find(
				(prodOrderProdOperationDelivery: ProdOrderPosOperationDelivery) =>
					!prodOrderProdOperationDelivery.is_completed
			);
		}

		if (input.machine) {
			this.machine = new Machine().deserialize(input.machine);
		}

		if (input.tool) {
			this.tool = new Tools().deserialize(input.tool);
		}

		if (input.itemTool) {
			this.itemTool = new Item().deserialize(input.itemTool);
		}

		if (input.prodOrderPosOperationTimes) {
			this.prodOrderPosOperationTimes = input.prodOrderPosOperationTimes.map(
				(prodOrderPosOperationTime: ProdOrderPosOperationTime) =>
					new ProdOrderPosOperationTime().deserialize(prodOrderPosOperationTime)
			);
		}

		if (input.prodOrderPosOperationQuantities) {
			this.prodOrderPosOperationQuantities = input.prodOrderPosOperationQuantities.map(
				(prodOrderPosOperationQuantity: ProdOrderPosOperationQuantity) =>
					new ProdOrderPosOperationQuantity().deserialize(prodOrderPosOperationQuantity)
			);
		}

		if (input.operationPlan) {
			this.operationPlan = new OperationPlan().deserialize(input.operationPlan);
		}

		if (input.operationPlanPos) {
			this.operationPlanPos = new OperationPlanPos().deserialize(input.operationPlanPos);
		}

		if (input.machine_group) {
			this.machineGroup = new MachineGroup().deserialize(input.machine_group);
		}

		if (input.prodOrderPosOperationAltMachines) {
			this.prodOrderPosOperationAltMachines = input.prodOrderPosOperationAltMachines.map(
				(prodOrderPosOperationAltMachine: any) =>
					new ProdOrderPosOperationAltMachine().deserialize(
						prodOrderPosOperationAltMachine
					)
			);
		}

		if (input.prodOrderPosOperationResources) {
			this.prodOrderPosOperationResources = input.prodOrderPosOperationResources.map(
				(prodOrderPosOperationResources: any) =>
					new ProdOrderPosOperationResource().deserialize(prodOrderPosOperationResources)
			);
		}
		return this;
	}

	getExpectedEndDate(
		expectedDateErrorCode: string | undefined,
		expectedDate: string | undefined
	) {
		switch (expectedDateErrorCode) {
			// Error code 1001 for not enough capacity
			case "NOT_ENOUGH_CAPACITY":
				return $localize`Not enough capacity`;

			// Error code 1002 for order completion
			case "OPERATION_COMPLETED":
				return $localize`Order is completed`;

			default:
				return expectedDate || "";
		}
	}

	calculateDuration() {
		const usageValue = this.machine!.usage_factor
			? parseFloat(this.machine!.usage_factor.toString().split("%")[0])
			: 0;
		const timePerQuantity =
			parseFloat(this.te ? this.te?.toString() : "0") /
			parseFloat(this.cavity ? this.cavity?.toString() : "1");
		let duration =
			timePerQuantity *
				parseFloat(
					this.prodOrderPos!.quantity ? this.prodOrderPos!.quantity?.toString() : "0"
				) +
			parseFloat(this.tr ? this.tr!.toString() : "0") +
			parseFloat(this.teardown_time ? this.teardown_time.toString() : "0");

		if (usageValue > 0) {
			duration = duration / usageValue;
		}
		return duration;
	}

	toOdata(priotizePlanStart = true): Object {
		return {
			...this,
			parent: undefined,
			oldMachineId: undefined,
			oldStart: undefined,
			plan_start: this.plan_start
				? moment(this.plan_start!).format("YYYY-MM-DD HH:mm:ss")
				: null,
			start: priotizePlanStart
				? this.plan_start
					? moment(this.plan_start!).format("YYYY-MM-DD HH:mm:ss")
					: null
				: this.start,
			prodOrderPos: undefined,
			formatedDate: undefined,
			prodLot: undefined,
			setInDateTimeFormat: undefined,
			getStartDate: undefined,
			getHour: undefined,
			machineGroup: undefined,
			prodOrderProdOperationDeliveries: undefined,
			currentDelivery: undefined,
			machine_id: this.machine?.id ?? this.machine_id,
			machine: undefined,
			quantityDelivered: undefined,
			isSelected: undefined,
			prodOrderPosOperationQuantities: undefined,
			prodOrderPosOperationTimes: undefined,
			datePipe: undefined,
			operationPlan: undefined,
			operationPlanPos: undefined,
			status_plan: this.status,
			tool_id: this.tool?.id,
			tool: undefined,
			item_id_tool: this.itemTool?.id,
			itemTool: undefined,
			is_batch_managed: undefined,
			serial_managed_mode: undefined,
			prodOrderPosOperationAltMachines: undefined,
			prodOrderPosOperationResources: undefined,
		};
	}
}
