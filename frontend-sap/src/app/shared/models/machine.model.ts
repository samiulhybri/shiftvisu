import {
	StatusBoardCardType,
	StatusBoardCardTypeClass,
} from "@app/shared/enums/StatusBoardCardType";
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Capacity } from "@app/shared/models/capacity.model";
import CostCenter from "@app/shared/models/cost.center.model";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "./machine-group.model";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import { ProductionPlanType, ProductionPlanTypeClass } from "@app/shared/enums/ProductionPlanType";
import {
	MachineConfirmationType,
	MachineConfirmationTypeClass,
} from "@app/shared/enums/MachineConfirmationType";
import { MachineStateType, MachineStateTypeClass } from "@app/shared/enums/MachineStateType";

import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import { ProdOrderPosOperationTime } from "@app/shared/models/prod-order-pos-operation-time";
import MachineState from "@app/shared/models/machine-state.model";
import MachineMachineStateTimes from "@app/shared/models/machine-machine-state-time.model";
import moment from "moment";
import { convertMinToSec, convertSecToMin } from "@app/shared/utils/calculate-time";
import { Kpi } from "@app/shared/enums/Kpi";
import { CommonService } from "@app/shared/services/common.service";
import ItemState from "@app/shared/models/item-state.model";
import { StandardValueKey } from "@app/shared/models/standardValueKey.model";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { StandardValueKeyActivityType } from "@app/shared/models/StandardValueKeyActivityType.model";
import { SectionActivatable } from "@app/shared/models/sectionActivatable.model";
import { MachineBoardStateTypeClass, MachineBoardStateType } from "@app/shared/enums/MachineBoardStateType";
import { Plant } from "@app/shared/models/plant.model";
import MachineComponentSerialNumberProfiles from "@app/shared/models/machine-last-serial-number-profile.model";
import MachineLastSerialNumberProfiles from "@app/shared/models/machine-last-serial-number-profile.model";
import MachineMiddleSerialNumberProfiles from "@app/shared/models/machine-middle-serial-number-profile.model";
import { QuantityType, QuantityTypeClass } from "@app/shared/enums/QuantityType";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { MachineConstraintType, MachineConstraintTypeClass } from "../enums/MachineConstraintType";

export class Machine implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	host_iot_gateway?: string = "";
	host_node_red?: string = "";
	printer_name?: string = "";
	usage_factor?: number | string = "100.00%";
	hall?: Hall;
	standardValueKey?: StandardValueKey;
	machineGroup?: MachineGroup;
	cost_center?: CostCenter;
	status_board_card_type: string = StatusBoardCardTypeClass.getStateTranslate(
		StatusBoardCardType.VIEW_1
	);
	machine_board_type: string = MachineBoardTypeClass.getStateTranslate(MachineBoardType.VIEW_1);
	constraint_type?: string = MachineConstraintTypeClass.getStateTranslate(MachineConstraintType.MANUAL);
	production_plan_type: string = ProductionPlanTypeClass.getStateTranslate(
		ProductionPlanType.MANUAL
	);
	confirmation_type: string = MachineConfirmationTypeClass.getStateTranslate(
		MachineConfirmationType.MANUAL
	);
	machine_state_type: string = MachineStateTypeClass.getStateTranslate(MachineStateType.MANUAL);
	machine_board_state_type: string = MachineBoardStateTypeClass.getStateTranslate(
		MachineBoardStateType.MACHINE_STATE
	);
	quantity_type: string = QuantityTypeClass.getStateTranslate(QuantityType.TYPE_1);
	tr?: number = 0;
	price?: number | string = 0;
	is_furnace?: boolean = false;
	auto_packaging?: boolean = false;
	is_casting_machine?: boolean = false;
	auto_print_middle_operation?: boolean = false;
	needs_operator_for_production?: boolean = false;
	just_plan_it_guid?: string;
	is_active?: boolean = true;
	has_operation_pool?: boolean = false;
	capacities: Capacity[] = [];
	isSelected?: boolean = true; //internal use only
	is_imported_from_erp: boolean = false;
	supports_parallel_operations: boolean = true;
	requires_batch_management_middle?: boolean = true;
	requires_batch_management_last?: boolean = true;
	auto_post_goods_receipt: boolean = false;
	isUsed: boolean = false;
	savedCapacityHour = {};
	current_operation?: ProdOrderPosOperation; //only for custom API
	lead_time_days?: number = 0;
	status?: MachineStateStateType | ProdOrderPosOperationStatus;
	prodOrderPosOperationTimes?: ProdOrderPosOperationTime[];
	machineStates: MachineState[] = [];
	machine_board_hours: number = 12;
	machine_machine_state_time?: MachineMachineStateTimes;
	total_operations?: number = 0;
	itemStates?: ItemState[] = [];
	production_supply_area_id?: number | null;
	clockInActivityTypes: StandardValueKeyActivityType[] = []; //internal use only
	sectionActivatables: SectionActivatable[] = [];
	machineComponentSerialNumberProfiles: MachineComponentSerialNumberProfiles[] = [];
	machineLastSerialNumberProfiles: MachineLastSerialNumberProfiles[] = [];
	machineMiddleSerialNumberProfiles: MachineMiddleSerialNumberProfiles[] = [];
	shiftModel?: ShiftModel;
	machineStateProduction?: MachineState;
	machineStateOff?: MachineState;
	private _oee?: number;
	private _machineUsage?: number;
	private _machinePerformance?: number;
	private _machineScrap?: number;
	private _kpiTimePeriod?: number;
	plant?: Plant;
	operationDetails?: OrderDetails;
	limit_quantity_to_packaging_target: boolean = false;
	auto_close_operation: boolean = false;

	scap_quantity = 0;
	total_quantity = 0;
	good_quantity = 0;
	sort_order?: number;

	constructor(private commonService?: CommonService) {}

	deserialize(input: any): this {
		Object.assign(this, input);
		// if (input.hall) this.hall = new Hall().deserialize(input.hall);
		this.host_iot_gateway = input.host_iot_gateway ?? "";
		this.printer_name = input.printer_name ?? "";
		this.host_node_red = input.host_node_red ?? "";
		this.machineGroup = new MachineGroup().deserialize(
			input.machineGroup ?? input.machine_group ?? {}
		);
		this.hall = new Hall().deserialize(input.hall ?? {});
		if (input.capacities) {
			this.capacities = input.capacities.map((data: any) => new Capacity().deserialize(data));
		}

		if (input.status_board_card_type) {
			this.status_board_card_type = StatusBoardCardTypeClass.getStateTranslate(
				input.status_board_card_type
			);
		}
		if (input.machine_board_type) {
			this.machine_board_type = MachineBoardTypeClass.getStateTranslate(
				input.machine_board_type
			);
		}
		if (input.constraint_type) {
			this.constraint_type = MachineConstraintTypeClass.getStateTranslate(input.constraint_type);
		}
		if (input.production_plan_type) {
			this.production_plan_type = ProductionPlanTypeClass.getStateTranslate(
				input.production_plan_type
			);
		}
		if (input.confirmation_type) {
			this.confirmation_type = MachineConfirmationTypeClass.getStateTranslate(
				input.confirmation_type
			);
		}
		if (input.machine_board_state_type) {
			this.machine_board_state_type = MachineBoardStateTypeClass.getStateTranslate(
				input.machine_board_state_type
			);
		}
		if (input.machine_state_type) {
			this.machine_state_type = MachineStateTypeClass.getStateTranslate(
				input.machine_state_type
			);
		}

		if (input.current_operation_times) {
			this.current_operation = new ProdOrderPosOperation().deserialize(
				input.current_operation_times.prod_order_pos_operation
			);
		}

		this.quantity_type = QuantityTypeClass.getStateTranslate(
			input.quantity_type ?? QuantityType.TYPE_1
		);

		if (input.topQualification) {
			this.isUsed = true;
		}

		if (input.usage_factor)
			this.usage_factor = this.validateUsageFactorInput(input.usage_factor);
		if (input.price) this.price = this.validatePriceInput(input.price);

		if (input.prodOrderPosOperationTimes)
			this.prodOrderPosOperationTimes = input.prodOrderPosOperationTimes.map(
				(prodOrderPosOperationTime: ProdOrderPosOperationTime) =>
					new ProdOrderPosOperationTime().deserialize(prodOrderPosOperationTime)
			);

		if (input.machineState) {
			this.machineStates = input.machineState.map((value: any) =>
				new MachineState().deserialize(value)
			);
		}

		if (input.machine_machine_state_time) {
			this.machine_machine_state_time = new MachineMachineStateTimes().deserialize(
				input.machine_machine_state_time
			);
		}

		if (input.shift_model) {
			this.shiftModel = new ShiftModel().deserialize(input.shift_model);
		}

		this.machineStateProduction = new MachineState().deserialize(
			input.machineStateProduction ?? {}
		);

		this.machineStateOff = new MachineState().deserialize(input.machineStateOff ?? {});

		this.standardValueKey = new StandardValueKey().deserialize(input.standardValueKey ?? {});
		this.plant = new Plant().deserialize(input.plant ?? {});

		this.setClockInActivityTypes();

		return this;
	}

	private setClockInActivityTypes() {
		if (
			this.standardValueKey &&
			Object.keys(this.standardValueKey).length &&
			this.standardValueKey.hasOwnProperty("standardValueKeyActivityTypes")
		) {
			this.clockInActivityTypes = this.standardValueKey.standardValueKeyActivityTypes.filter(
				el => el.is_clockin_enabled
			);
		}
	}

	updateKpis(kpis: Kpi[]): Promise<void> {
		if (kpis.includes(Kpi.SCRAP)) this._machineScrap = 0;
		if (kpis.includes(Kpi.OEE)) this._oee = 0;
		if (kpis.includes(Kpi.MACHINE_USAGE)) this._machineUsage = 0;
		if (kpis.includes(Kpi.MACHINE_PERFORMANCE)) this._machinePerformance = 0;

		this._kpiTimePeriod = 0;

		const api = `kpis/machines/${this.id}/kpi`;
		const requestData = { kpis };

		return new Promise((resolve, reject) => {
			this.commonService?.post(api, requestData, false).subscribe((kpiResponse: any) => {
				if (kpis.includes(Kpi.SCRAP)) this._machineScrap = kpiResponse.SCRAP;
				if (kpis.includes(Kpi.OEE)) this._oee = kpiResponse.OEE;
				if (kpis.includes(Kpi.MACHINE_USAGE))
					this._machineUsage = kpiResponse.MACHINE_USAGE;
				if (kpis.includes(Kpi.MACHINE_PERFORMANCE))
					this._machinePerformance = kpiResponse.MACHINE_PERFORMANCE;

				this._kpiTimePeriod = kpiResponse.TIME_PERIOD;
				resolve();
			});
		});
	}

	get machineScrap(): number {
		if (this._machineScrap == undefined) {
			this._machineScrap = 0;
			this.updateKpis([Kpi.SCRAP]);
		}

		return this._machineScrap;
	}

	get machinePerformance(): number {
		if (this._machinePerformance == undefined) {
			this._machinePerformance = 0;
			this.updateKpis([Kpi.MACHINE_PERFORMANCE]);
		}

		return this._machinePerformance;
	}

	get machineQuality(): number {
		return 1 - this.machineScrap;
	}

	get machineUsage(): number {
		if (this._machineUsage == undefined) {
			this._machineUsage = 0;
			this.updateKpis([Kpi.MACHINE_USAGE]);
		}

		return this._machineUsage;
	}

	get oee(): number {
		if (this._oee == undefined) {
			this._oee = 0;
			this.updateKpis([Kpi.OEE]);
		}

		return this._oee;
	}

	get kpiTimePeriod(): number {
		if (this._kpiTimePeriod == undefined) {
			this._kpiTimePeriod = 0;
			this.updateKpis([]);
		}

		return this._kpiTimePeriod;
	}

	getTotalQuantityPercentage(): number {
		return this.good_quantity && this.total_quantity
			? parseInt(
					(
						(parseFloat(this.good_quantity as any)! * 100) /
							parseFloat(this.total_quantity as any) ?? 0
					).toString()
				)
			: 0;
	}

	getMinutes(date: string): number {
		const capacities = this.capacities.filter(capacity => {
			return capacity.date == date;
		});

		let minutes: any = 0;
		capacities.forEach(capacity => {
			minutes += (capacity.shift!.hours ?? 0) * 60 - (capacity.shift!.break_minutes ?? 0);
		});

		minutes = minutes.toFixed(0);

		return minutes;
	}

	validateUsageFactorInput(value: string): string {
		const extracted = String(value).match(/^\d+(\.\d{0,2})?/);
		if (!extracted) return "00.00%";

		let formattedValue = extracted[0];
		const numberValue = parseFloat(formattedValue);
		if (numberValue > 100) return "00.00%";
		formattedValue = numberValue.toFixed(2);

		return `${formattedValue}%`;
	}

	validateDefaultSetupTimeInput(value: string): number {
		const extracted = String(value).match(/^\d+/);
		if (!extracted) return 0;
		const intValue = parseInt(extracted[0], 10);
		return intValue;
	}

	validatePriceInput(value: string): number {
		const extracted = String(value).match(/^\d+(\.\d{0,2})?/);
		if (!extracted) return 0;

		let formattedValue = extracted[0];
		const numberValue = parseFloat(formattedValue);
		formattedValue = numberValue.toFixed(2);

		return parseFloat(formattedValue);
	}

	getMinutesInForgeMode(date: string, hall: Hall): number {
		let operationCount = 0;
		let productType: string | null = null;
		hall.machineGroup.forEach(machineGroup =>
			machineGroup.prodOrderPosOperations.forEach(prodOrderPosOperation => {
				const prodType =
					prodOrderPosOperation.prodOrderPos?.calculation?.offerPos?.product_type ?? "";
				if (
					prodOrderPosOperation.machine_id === this.id &&
					prodType != productType &&
					moment(prodOrderPosOperation.plan_start).format("DD-HH-YYYY") ==
						moment(date).format("DD-HH-YYYY")
				) {
					operationCount += (this.tr as number | undefined) ?? 0;
					productType = prodType;
				}
			})
		);

		const removedMinutes = operationCount / 60;
		const capacity = this.capacities.find(capacities => capacities.date == date);
		const capacities = this.capacities.filter(capacity => capacity.date == date);

		let capacityMinute = 0;
		capacities.forEach(capacity => {
			capacityMinute +=
				(capacity.shift!.hours ?? 0) * 60 - (capacity.shift!.break_minutes ?? 0);
		});
		if (removedMinutes > capacityMinute) {
			return 0;
		} else {
			return capacityMinute - removedMinutes;
		}
	}

	isMachineVisible(
		machineGroups: MachineGroup[],
		halls: Hall[],
		selectedHalls: number[],
		selectedMachineGroups: number[]
	) {
		if (selectedHalls.length > 0) {
			const hall = halls.find(hall => hall.id == this.hall?.id);

			if (!hall || !hall.isSelected) {
				return false;
			}
		}

		if (selectedMachineGroups.length > 0) {
			const machineGroup = machineGroups.find(
				machineGroup => machineGroup.id == this.machineGroup?.id
			);

			if (!machineGroup || !machineGroup.isSelected) {
				return false;
			}
		}

		return true;
	}

	toOdata(): Object {
		return {
			...this,
			machine_group_id: this.machineGroup?.id,
			machineGroup: undefined,
			hall_id: this.hall?.id,
			hall: undefined,
			standard_value_key_id: this.standardValueKey?.id || null,
			standardValueKey: undefined,
			isSelected: undefined,
			capacities: undefined,
			savedCapacityHour: undefined,
			current_operation: undefined,
			status_board_card_type: StatusBoardCardTypeClass.getStateValue(
				this.status_board_card_type
			),
			machine_board_type: MachineBoardTypeClass.getStateValue(this.machine_board_type),
			constraint_type: MachineConstraintTypeClass.getStateValue(this.constraint_type),
			production_plan_type: ProductionPlanTypeClass.getStateValue(this.production_plan_type),
			confirmation_type: MachineConfirmationTypeClass.getStateValue(this.confirmation_type),
			machine_board_state_type: MachineBoardStateTypeClass.getStateValue(
				this.machine_board_state_type
			),
			machine_state_type: MachineStateTypeClass.getStateValue(this.machine_state_type),
			quantity_type: QuantityTypeClass.getStateValue(this.quantity_type),
			isUsed: undefined,
			prodOrderPosOperationTimes: undefined,
			machine_state_id_default_production: this.machineStateProduction?.id ?? null,
			machineStateProduction: undefined,
			machine_state_id_default_off: this.machineStateOff?.id ?? null,
			machineStateOff: undefined,
			/**
			 * due to some issues with backend there is machineStates and machineState
			 */
			machineStates: undefined,
			machineState: undefined,
			total_operations: undefined,
			tr: convertMinToSec(this.tr),
			_oee: undefined,
			_machine_usage: undefined,
			_machine_performance: undefined,
			_machine_quality: undefined,
			_kpiTimePeriod: undefined,
			scap_quantity: undefined,
			total_quantity: undefined,
			good_quantity: undefined,
			itemStates: undefined,
			operationDetails: undefined,
			clockInActivityTypes: undefined,
			sectionActivatables: undefined,
			shiftModel: undefined,
			plant: undefined,
			construction_year: undefined,
			machineComponentSerialNumberProfiles: undefined,
			machineLastSerialNumberProfiles: undefined,
			machineMiddleSerialNumberProfiles: undefined,
			shift_model_id: this.shiftModel?.id ?? null,
			sort_order: this.sort_order ?? 1000,
			usage_factor: parseFloat((this.usage_factor as string) ?? "0") / 100,
		};
	}

	// Pivot table's values for Machines
	toJSONData(selectedMachines: (number | undefined)[]): Object {
		return {
			id: this.id,
			machinesIds: selectedMachines,
		};
	}
}
