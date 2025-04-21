import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Component, Output, ViewChild } from "@angular/core";
import { Machine } from "@app/shared/models/machine.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Toast.js";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import {
	StatusBoardCardType,
	StatusBoardCardTypeClass,
} from "@app/shared/enums/StatusBoardCardType";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import { ProductionPlanType, ProductionPlanTypeClass } from "@app/shared/enums/ProductionPlanType";
import { BackendModelType } from "@app/shared/enums/BackendModelType";

import {
	MachineConfirmationType,
	MachineConfirmationTypeClass,
} from "@app/shared/enums/MachineConfirmationType";
import { MachineStateType, MachineStateTypeClass } from "@app/shared/enums/MachineStateType";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ConfigService } from "@app/shared/services/config.service";
import ItemState from "@app/shared/models/item-state.model";
import MachineState from "@app/shared/models/machine-state.model";
import ItemStateMachine from "@app/shared/models/item-state-machine.model";
import { convertSecToMin } from "@app/shared/utils/calculate-time";
import React from "react";
import { Button, Text } from "@ui5/webcomponents-react";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { StandardValueKey } from "@app/shared/models/standardValueKey.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { PlantsService } from "@app/shared/services/plants.service";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { SectionActivatableTypes } from "@app/shared/enums/SectionActivatableTypes";
import { Localization } from "@app/shared/utils/common-localize";
import { MachineBoardStateType, MachineBoardStateTypeClass } from "@app/shared/enums/MachineBoardStateType";
import { QuantityTypeClass } from "@app/shared/enums/QuantityType";
import { SerialNumberProfile } from "@app/shared/models/SerialNumberProfile.model";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import { MachineConstraintType, MachineConstraintTypeClass } from "@app/shared/enums/MachineConstraintType";
import { MachineQualificationImportTypeClass } from "@app/shared/enums/MachineQualificationImportType";

@Component({
	selector: "app-machine",
	templateUrl: "./machine.component.html",
	styleUrl: "./machine.component.css",
})
export class MachineComponent {
	protected machine = Machine;
	expandedQuery?: string;
	isDialogOpen: boolean = false;
	isAssociateDialogOpen: boolean = false;
	associateDialogTitle: string = "";
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	isLoadingBatchCall: boolean = false;
	dialogTitle: string = "";
	@Output() selectedMachine: Machine = new Machine().deserialize({});
	selectedTab: string = "core_data";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	halls: Hall[] = [];
	standardValueKeys: StandardValueKey[] = [];
	shiftModels: ShiftModel[] = [];
	machineGroups: MachineGroup[] = [];
	machineQualificationImportTypeClass = MachineQualificationImportTypeClass.getEnumArray();
	statusBoardCardTypeItems = StatusBoardCardTypeClass.getEnumArray();
	machineBoardTypeItems = MachineBoardTypeClass.getEnumArray();
	productionPlanTypeItems = ProductionPlanTypeClass.getEnumArray();
	machineConfirmationTypeItems = MachineConfirmationTypeClass.getEnumArray();
	machineStateTypeItems = MachineStateTypeClass.getEnumArray();
	machineBoardStateTypeItems = MachineBoardStateTypeClass.getEnumArray();
	machineConstraints = MachineConstraintTypeClass.getEnumArray();
	quantityTypeItems = QuantityTypeClass.getEnumArray();
	cachedCustomId?: string = "";
	machineConfig?: any = {};
	disableButtonDuringRequest = false;
	machineStates: MachineState[] = [];
	selectedMachines: (number | undefined)[] = [];
	itemStates: ItemState[] = [];
	itemStateMachine: ItemStateMachine[] = [];
	itemStateTableTitle: string = $localize`Item States`;
	machineStateTableTitle: string = $localize`Machine States`;
	associateButtonText: string = $localize`Associate`;
	selectedItemStates?: ItemState[] = [];
	selectedMachineState?: MachineState[] = [];
	machineStateassociate: MachineState[] = [];
	associateData: any = [];
	filteredMachineState: MachineState[] = [];
	filteredItemState: ItemState[] = [];
	searchedValue: string = "";
	isPreviewDialogOpen: boolean = false;
	associateColumns: any = [];
	topValue: number = 1000;
	isLoadingModules: boolean = false;
	sectionActivatables?: any = {};
	localization = Localization;
	@ViewChild("errorDialogMachines", { static: false }) errorDialogMachines: any;
	@ViewChild("machine_board_type") machineBoardType!: ComboBoxComponent;
	@ViewChild("machine_board_state_type") machineBoardStateType!: ComboBoxComponent;
	@ViewChild("qualification_import_type") qualificationImportType!: ComboBoxComponent;
	@ViewChild("quantity_type") quantityType!: ComboBoxComponent;
	@ViewChild("confirmation_type") machineConfirmationType!: ComboBoxComponent;
	@ViewChild("machine_state_type") machineStateType!: ComboBoxComponent;
	@ViewChild("status_board_card_type") statusBoardCardType!: ComboBoxComponent;
	@ViewChild("production_plan_type") productionPlanType!: ComboBoxComponent;
	@ViewChild("busyIndicator") busyIndicator: any;
	@ViewChild("typeRef") typeRef: any;
	@ViewChild("machineLastSerialNumberProfileref") machineLastSerialNumberProfileref: any;
	@ViewChild("machineMiddleSerialNumberProfileref") machineMiddleSerialNumberProfileref: any;
	@ViewChild("deleteErrorDialogMachine", { static: false })
	deleteErrorDialogMachine: any;
	isDeselectEnable: boolean = false;
	showStatusBoard: boolean = false;
	showPlanVisu: boolean = false;
	selectedSerialNumberProfile: number[] = [];
	selectedLastSerialNumberProfile: number[] = [];
	selectedMiddleSerialNumberProfile: number[] = [];
	serialNumberProfiles: any[] = [];
	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Group`,
			accessor: "machineGroup.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["machineGroup.name", "machineGroup.custom_id"],
			isSelected: true,
			comboBoxValues: this.machineGroups,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Hall`,
			accessor: "hall.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["hall.name", "hall.custom_id"],
			isSelected: true,
			comboBoxValues: this.halls,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Standard Value Key`,
			accessor: "standardValueKey.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			comboBoxValues: this.standardValueKeys,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Usage Factor`,
			accessor: "usage_factor",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			hAlign: "End",
			minWidth: 50,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = (parseFloat(row.original?.usage_factor) || 0) * 100;

				return (
					<React.StrictMode>
						<Text>{rowData}%</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Default Setup Time(m)`,
			accessor: "tr",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			minWidth: 50,
			hAlign: "End",
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = convertSecToMin(row.original.tr);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Price`,
			accessor: "price",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			minWidth: 50,
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`Machineboard Hours`,
			accessor: "machine_board_hours",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			minWidth: 50,
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`Furnace`,
			accessor: "is_furnace",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Supports Parallel Operations`,
			accessor: "supports_parallel_operations",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Auto Print Middle Operation`,
			accessor: "auto_print_middle_operation",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Auto Post Goods Receipt`,
			accessor: "auto_post_goods_receipt",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Requires Batch Management Middle`,
			accessor: "requires_batch_management_middle",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Requires Batch Management Last`,
			accessor: "requires_batch_management_last",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Needs Operator For Production`,
			accessor: "needs_operator_for_production",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Casting Machine`,
			accessor: "is_casting_machine",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Statusboard Card Type`,
			accessor: "status_board_card_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.statusBoardCardTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Qualification Import Type`,
			accessor: "qualification_import_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.machineQualificationImportTypeClass,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Default Qualification Hours`,
			accessor: "default_qualification_hours",
			dataType: GridTableColumnDataType.Number,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "End",
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Default Qualification Operations`,
			accessor: "default_qualification_operations",
			dataType: GridTableColumnDataType.Number,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "End",
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machineboard Type`,
			accessor: "machine_board_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.machineBoardTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Production Plan Type`,
			accessor: "production_plan_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.productionPlanTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Confirmation Type`,
			accessor: "confirmation_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.machineConfirmationTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Board State Type`,
			accessor: "machine_board_state_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.machineBoardStateTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Quantity Type`,
			accessor: "quantity_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.quantityTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machine State Type`,
			accessor: "machine_state_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.machineStateTypeItems,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Operation Pool`,
			accessor: "has_operation_pool",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Item State`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalItemStates: any[] = [];
				rowData.itemStates.map((item: any) => {
					totalItemStates.push(item.id);
				});
				if (totalItemStates.length > 0) {
					return (
						<React.StrictMode>
							<Button
								onClick={() =>
									this.showPreview(
										rowData.itemStates,
										this.itemStateTableTitle,
										this.itemStateColumns
									)
								}>
								{totalItemStates.length +
									(totalItemStates.length > 1
										? $localize` Reasons`
										: $localize` Reason`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Machine States`,
			accessor: "machineState.id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalMachineStates: any[] = [];
				rowData.machineState.map((item: any) => {
					totalMachineStates.push(item.id);
				});
				if (totalMachineStates.length > 0) {
					return (
						<React.StrictMode>
							<Button
								onClick={() =>
									this.showPreview(
										rowData.machineState,
										this.machineStateTableTitle,
										this.machineStatesColumns
									)
								}>
								{totalMachineStates.length +
									(totalMachineStates.length > 1
										? $localize` States`
										: $localize` State`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Machines State Id Default Production`,
			accessor: "machineStateProduction.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			accessorArray: ["machineStateProduction.name", "machineStateProduction.custom_id"],
			comboBoxValues: this.machineStates,
			minWidth: 120,
			autoResizable: true,
		},
		{
			Header: $localize`Machines State Id Default Off`,
			accessor: "machineStateOff.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			accessorArray: ["machineStateOff.name", "machineStateOff.custom_id"],
			comboBoxValues: this.machineStates,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Auto Packaging`,
			accessor: "auto_packaging",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Host Iot Gateway`,
			accessor: "host_iot_gateway",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Host Node Red`,
			accessor: "host_node_red",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Printer Name`,
			accessor: "printer_name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Limit Quantity to Packaging Target`,
			accessor: "limit_quantity_to_packaging_target",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Auto Close Operation`,
			accessor: "auto_close_operation",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Sort Order`,
			accessor: "sort_order",
			dataType: GridTableColumnDataType.Number,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "End",
			minWidth: 50,
			autoResizable: true,
		},
	];
	plantId?: number;

	itemStateColumns: any = [
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			width: 200,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
	];
	machineStatesColumns: any = [
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			width: 200,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
	];
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		plantService: PlantsService
	) {
		this.selectedMachine = new Machine().deserialize({});
		this.getCustomId();
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
				this.expandedQuery = `$expand=hall,machineGroup,itemStates,machineState,standardValueKey,sectionActivatables,machineStateProduction,machineStateOff,machineStateSetup,machineStateAvailable,machineComponentSerialNumberProfiles,machineLastSerialNumberProfiles,machineMiddleSerialNumberProfiles`;
			}
		});
	}
	ngOnInit(): void {
		this.getCustomId();
		this.loadData();
		this.machineConfig = this.configService.getConfigValue("machine");
	}

	getTabContainerMargin(): string {
		const isTwoColumnLayout = window.innerWidth < 768;
		return isTwoColumnLayout ? "-28px" : "-46px";
	}

	showPreview(data: any, title: string, column: any) {
		this.filterHandler();
		this.associateDialogTitle = title;
		this.associateColumns = column;
		this.associateData = [...data];
		this.isPreviewDialogOpen = true;
	}
	closeAssociateDialog() {
		this.isPreviewDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogMachines.elementRef.nativeElement.open = false;
	}

	newButtonClick() {
		this.selectedTab = "core_data";
		this.selectedSerialNumberProfile = [];
		this.selectedLastSerialNumberProfile = [];
		this.selectedMiddleSerialNumberProfile = [];
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedMachine = new Machine().deserialize({});
		this.selectedMachine.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedMachine.custom_id = "";
			this.getCustomId();
		}
		this.itemStateMachine = [];
		this.machineStateassociate = [];
		this.itemStates.forEach((bpr: ItemState) => (bpr.isSelected = false));
		this.machineStates.forEach(
			(machineState: MachineState) => (machineState.isSelected = false)
		);
		this.isDialogOpen = true;
		this.showStatusBoard = false;
		this.showPlanVisu = false;
	}
	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}
	checkCustomId() {
		const urlString = `Machines?$filter=custom_id eq '${this.selectedMachine.custom_id}'&$select=custom_id`;
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedMachine.custom_id || ""
		);
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) {
						this.onCreateOrUpdate();
					} else {
						const { idIsAlreadyTaken } = Localization;
						this.disableButtonDuringRequest = false;
						this.customIdState = "Negative";
						this.customIdValueStateText = idIsAlreadyTaken;
					}
				},
				error: () => {
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}
	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedMachine?.toOdata() as any;
		payload.plant_id = this.plantId;
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Machines(${this.selectedMachine?.id})` : `Machines`;
		this.commonService[method](urlString, payload).subscribe({
			next: (res: any) => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				const itemStateIds = this.itemStateMachine.map(obj => obj.id);
				const machineStateIds = this.machineStateassociate.map(obj => obj.id);
				const bprPayload = {
					itemStateIds: itemStateIds,
					id: res.id,
				};
				const machineStatePayload = {
					statesIds: machineStateIds,
					id: res.id,
				};
				const promises = [
					this.syncAssociateData("machines/item-states-machine", bprPayload, "post"),
					this.syncAssociateData(
						"machines/machine-machine-states",
						machineStatePayload,
						"post"
					),
				];
				const statusBoardPayload = {
					activatable_type: BackendModelType.MACHINE,
					activatable_id: res.id,
					section: SectionActivatableTypes.STATUSBOARD,
					is_active: this.showStatusBoard,
				};
				const planVisuPayload = {
					activatable_type: BackendModelType.MACHINE,
					activatable_id: res.id,
					section: SectionActivatableTypes.PLANVISU,
					is_active: this.showPlanVisu,
				};

				const statusBoard = this.selectedMachine.sectionActivatables.find(
					(item: any) => item.section === SectionActivatableTypes.STATUSBOARD
				);
				const planVisu = this.selectedMachine.sectionActivatables.find(
					(item: any) => item.section === SectionActivatableTypes.PLANVISU
				);

				if (this.isUpdate && statusBoard) {
					if (this.showStatusBoard != statusBoard.is_active) {
						this.commonService
							.put(`SectionActivatables/${statusBoard.id}`, {
								is_active: this.showStatusBoard,
							})
							.subscribe();
					}
				} else if (this.showStatusBoard) {
					promises.push(
						this.syncAssociateData(
							"machines/section-activatable",
							statusBoardPayload,
							"post"
						)
					);
				}

				if (this.isUpdate && planVisu) {
					if (this.showPlanVisu != planVisu.is_active) {
						this.commonService
							.put(`SectionActivatables/${planVisu.id}`, {
								is_active: this.showPlanVisu,
							})
							.subscribe();
					}
				} else if (this.showPlanVisu) {
					promises.push(
						this.syncAssociateData(
							"machines/section-activatable",
							planVisuPayload,
							"post"
						)
					);
				}

				const payloadForSerialProfile = {
					id: res.id,
					serialProfileIds: this.selectedSerialNumberProfile,
				};

				promises.push(
					this.syncAssociateData(
						"machines/machine-component-serial-number-profile",
						payloadForSerialProfile,
						"post"
					)
				);

				const payloadForLastSerialProfile = {
					id: res.id,
					serialProfileIds: this.selectedLastSerialNumberProfile,
				};

				promises.push(
					this.syncAssociateData(
						"machines/machine-last-serial-number-profile",
						payloadForLastSerialProfile,
						"post"
					)
				);

				const payloadForMiddleSerialProfile = {
					id: res.id,
					serialProfileIds: this.selectedMiddleSerialNumberProfile,
				};

				promises.push(
					this.syncAssociateData(
						"machines/machine-middle-serial-number-profile",
						payloadForMiddleSerialProfile,
						"post"
					)
				);

				Promise.all(promises)
					.then(() => {
						if (!this.isUpdate) {
							this.filterHandler();
						} else {
							this.refreshEditData();
						}
						this.isLoading = false;
						this.isDialogOpen = false;
						(this.form as any).onReset();
						this.disableButtonDuringRequest = false;
					})
					.catch(error => {
						this.disableButtonDuringRequest = false;
						this.isLoading = false;
						this.errorDialogMachines.elementRef.nativeElement.open = true;
					});
			},
			error: (err: Error) => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogMachines.elementRef.nativeElement.open = true;
			},
		});
	}

	onStatusBoardSwitchChange(event: any): void {
		this.showStatusBoard = event.target.checked;
	}

	onPlanVisuSwitchChange(event: any): void {
		this.showPlanVisu = event.target.checked;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Machine").catch(() => false);
		this.selectedMachine.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedMachine.custom_id = "";
		this.isLoadingCustomId = false;
	}

	editClick(value: any) {
		this.selectedTab = "core_data";
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedMachine = this.selectedMachine?.deserialize(value);
		if (this.selectedMachine.machine_board_state_type == null) {
			this.selectedMachine.machine_board_state_type =
				MachineBoardStateTypeClass.getStateTranslate(MachineBoardStateType.MACHINE_STATE);
		}
		this.selectedMachine.usage_factor =
			parseFloat((this.selectedMachine.usage_factor as string) || "0") * 100 + "%";

		this.sectionActivatables = this.selectedMachine.sectionActivatables;
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedMachine.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		this.selectedMachine.tr = convertSecToMin(value.tr);
		const statusBoard = this.selectedMachine.sectionActivatables.find(
			(item: any) => item.section === SectionActivatableTypes.STATUSBOARD
		);
		this.showStatusBoard = statusBoard?.is_active ?? false;
		const planVisu = this.selectedMachine.sectionActivatables.find(
			(item: any) => item.section === SectionActivatableTypes.PLANVISU
		);
		this.showPlanVisu = planVisu?.is_active ?? false;

		if (this.selectedMachine.machineComponentSerialNumberProfiles) {
			this.selectedSerialNumberProfile =
				this.selectedMachine.machineComponentSerialNumberProfiles.map(
					(el: any) => el.serial_number_profile_id || ""
				);
		}

		if (this.selectedMachine.machineLastSerialNumberProfiles) {
			this.selectedLastSerialNumberProfile =
				this.selectedMachine.machineLastSerialNumberProfiles.map(
					(el: any) => el.serial_number_profile_id || ""
				);
		}

		if (this.selectedMachine.machineMiddleSerialNumberProfiles) {
			this.selectedMiddleSerialNumberProfile =
				this.selectedMachine.machineMiddleSerialNumberProfiles.map(
					(el: any) => el.serial_number_profile_id || ""
				);
		}

		this.loadAssociateData();
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `Machines?$filter=plant_id eq ${this.plantId} and id eq ${this.selectedMachine?.id}&$orderby=custom_id asc&$expand=hall,machineGroup,itemStates,machineState,standardValueKey,sectionActivatables,machineStateProduction,machineStateOff,machineStateSetup,machineStateAvailable,machineComponentSerialNumberProfiles,machineLastSerialNumberProfiles,machineMiddleSerialNumberProfiles&$count=true`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			},
		});
	}

	closeDialog() {
		(this.form as any).onReset();
		this.machineBoardType.element.valueState = "None";
		this.machineBoardStateType.element.valueState = "None";
		this.qualificationImportType.element.valueState = "None";
		this.quantityType.element.valueState = "None";
		this.machineConfirmationType.element.valueState = "None";
		this.machineStateType.element.valueState = "None";
		this.statusBoardCardType.element.valueState = "None";
		this.productionPlanType.element.valueState = "None";

		this.typeRef.elementRef.nativeElement.selectedValues = undefined;

		this.selectedSerialNumberProfile = [];
		this.selectedLastSerialNumberProfile = [];
		this.selectedMiddleSerialNumberProfile = [];
		this.isDialogOpen = false;
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	handleClose() {
		this.selectedMachine = new Machine().deserialize({});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/Machines(${this.deletItemId})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.closeDialogDelete();
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.isLoading = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogMachine.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogMachine.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	loadData() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Halls?$expand=topMachine($select=custom_id)&$top=${this.topValue}`
			),
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/MachineGroups?$expand=topMachine($select=custom_id)&$top=${this.topValue}`
			),
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/ItemStates?$orderby=custom_id asc&$top=${this.topValue}`
			),
			new ODataBatchCall(
				3,
				"get",
				`\/odata\/MachineStates?$orderby=custom_id asc&$top=${this.topValue}`
			),
			new ODataBatchCall(
				4,
				"get",
				`\/odata\/StandardValueKeys?$orderby=custom_id asc&$top=${this.topValue}`
			),
			new ODataBatchCall(5, "get", `\/odata\/ShiftModels?$orderby=custom_id asc`),
			new ODataBatchCall(6, "get", `\/odata\/SerialNumberProfiles?$orderby=custom_id asc`)
		);
		this.isLoadingBatchCall = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((hall: Hall) => {
					const deserializedHall = new Hall().deserialize(hall);
					this.halls.push(deserializedHall);
				});
				response.responses[1]?.body?.value?.map((machineGroup: MachineGroup) => {
					this.machineGroups.push(new MachineGroup().deserialize(machineGroup));
				});
				response.responses[2]?.body?.value?.map((itemState: ItemState) => {
					this.itemStates.push(new ItemState().deserialize(itemState));
				});
				response.responses[3]?.body?.value?.map((machineState: MachineState) => {
					this.machineStates.push(new MachineState().deserialize(machineState));
				});
				response.responses[4]?.body?.value?.map((standardValueKey: StandardValueKey) => {
					this.standardValueKeys.push(
						new StandardValueKey().deserialize(standardValueKey)
					);
				});
				response.responses[5]?.body?.value?.map((shiftModel: ShiftModel) => {
					this.shiftModels.push(new ShiftModel().deserialize(shiftModel));
				});

				response.responses[6]?.body?.value?.map((profile: SerialNumberProfile) => {
					this.serialNumberProfiles.push(new SerialNumberProfile().deserialize(profile));
				});
				this.isLoadingBatchCall = false;
			},
			error: e => {},
		});
	}

	onChangeMachineGroup(event: any) {
		if (this.selectedMachine)
			this.selectedMachine.machineGroup = new MachineGroup().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onChangeMachineState(event: any) {
		this.selectedMachine.machine_state_type = event.detail.item.text || MachineStateType.MANUAL;
	}

	onChangeMachineBoardState(event: any) {
		this.selectedMachine.machine_board_state_type = event.detail.item.text;
	}
	
	onChangeQualificationImportType(event: any) {
		this.selectedMachine.qualification_import_type = event.detail.item.text;
	}

	onChangeMachineConstraint(event: any) {
		this.selectedMachine.constraint_type = event.detail.item.text;
	}

	onChangeQuantityType(event: any) {
		this.selectedMachine.quantity_type = event.detail.item.text;
	}

	onChangeMachineStateDefaultProduction(event: any) {
		if (this.selectedMachine && this.selectedMachine.machineStateProduction)
			this.selectedMachine.machineStateProduction = new MachineState().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onChangeMachineStateDefaultOff(event: any) {
		if (this.selectedMachine && this.selectedMachine.machineStateOff)
			this.selectedMachine.machineStateOff = new MachineState().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onChangeMachineStateDefaultSetup(event: any) {
		if (this.selectedMachine && this.selectedMachine.machineStateSetup)
			this.selectedMachine.machineStateSetup = new MachineState().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onChangeMachineStateDefaultAvailable(event: any) {
		if (this.selectedMachine && this.selectedMachine.machineStateAvailable)
			this.selectedMachine.machineStateAvailable = new MachineState().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onChangeMachineConfirmation(event: any) {
		this.selectedMachine.confirmation_type =
			event.detail.item.text || MachineConfirmationType.MANUAL;
	}

	onChangeStatusBoardCardType(event: any) {
		this.selectedMachine.status_board_card_type =
			event.detail.item.text || StatusBoardCardType.VIEW_1;
	}

	onChangeMachineBoardType(event: any) {
		this.selectedMachine.machine_board_type = event.detail.item.text || MachineBoardType.VIEW_1;
	}

	inputValueRestrict(event: any, value: any) {
		if (event.target.value != value) {
			event.target.value = value;
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
			const id = event.target.id;
			//Todo: Other logics will be added later
			switch (id) {
				case "standardValueKeyComboBox":
					this.selectedMachine.standardValueKey = new StandardValueKey().deserialize({
						id: null,
					});
					break;
				default:
					break;
			}
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeProductionPlan(event: any) {
		this.selectedMachine.production_plan_type =
			event.detail.item.text || ProductionPlanType.SETUP_1;
	}

	onChangeHall(event: any) {
		if (this.selectedMachine?.hall)
			this.selectedMachine.hall = new Hall().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onHallInputChange(event: any) {
		const inputValue = event.target.value;
		const matchHallData = this.halls.find(hall => hall.name === inputValue);
		if (!matchHallData && this.selectedMachine?.hall) {
			this.selectedMachine.hall = new Hall().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onMachineGroupInputChange(event: any) {
		const inputValue = event.target.value;
		const matchMachineGroupData = this.machineGroups.find(
			machGroup => machGroup.name === inputValue
		);
		if (!matchMachineGroupData && this.selectedMachine?.machineGroup) {
			this.selectedMachine.machineGroup = new MachineGroup().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onMachineStateDefaultOffInputChange(event: any) {
		const inputValue = event.target.value;
		const matchMachineStateData = this.machineStates.find(
			machineState => machineState.name === inputValue
		);
		if (!matchMachineStateData && this.selectedMachine?.machineStateOff) {
			this.selectedMachine.machineStateOff = new MachineState().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onMachineStateDefaultSetupInputChange(event: any) {
		const inputValue = event.target.value;
		const matchMachineStateData = this.machineStates.find(
			machineState => machineState.name === inputValue
		);
		if (!matchMachineStateData && this.selectedMachine?.machineStateSetup) {
			this.selectedMachine.machineStateSetup = new MachineState().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onMachineStateDefaultAvailableInputChange(event: any) {
		const inputValue = event.target.value;
		const matchMachineStateData = this.machineStates.find(
			machineState => machineState.name === inputValue
		);
		if (!matchMachineStateData && this.selectedMachine?.machineStateAvailable) {
			this.selectedMachine.machineStateAvailable = new MachineState().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onStandardValueKeyInputChange(event: any) {
		const inputValue = event.target.value;
		if (!inputValue && this.selectedMachine?.standardValueKey) {
			this.selectedMachine.standardValueKey = new StandardValueKey().deserialize({
				id: null,
			});
		}
	}

	onMachineStateDefaultProductionInputChange(event: any) {
		const inputValue = event.target.value;
		const matchMachineStateData = this.machineStates.find(
			machineState => machineState.name === inputValue
		);
		if (!matchMachineStateData && this.selectedMachine?.machineStateProduction) {
			this.selectedMachine.machineStateProduction = new MachineState().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeStandardValueKey(event: any) {
		if (this.selectedMachine?.standardValueKey)
			this.selectedMachine.standardValueKey = new StandardValueKey().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				custom_id: event.detail.item.text || "",
			});
	}

	onChangeShiftModel(event: any) {
		const customId = event.detail.item.text;

		this.selectedMachine.shiftModel = this.shiftModels.find(
			(shiftModel: ShiftModel) => shiftModel.custom_id === customId
		);
	}

	onChangeName(event: any) {
		if (this.selectedMachine) this.selectedMachine.name = (event.target as any).value;
	}

	onChangeHostNodeRed(event: any) {
		if (this.selectedMachine) this.selectedMachine.host_node_red = (event.target as any).value;
	}

	onChangeUsageFactor(event: any) {
		const value = (event.target as any).value;

		if (this.selectedMachine) {
			this.selectedMachine.usage_factor =
				parseFloat(value) > 100 ? "00%" : parseFloat(value) + "%";
		}
	}

	onChangeDefaultSetupTime(event: any) {
		if (this.selectedMachine)
			this.selectedMachine.tr = new Machine().validateDefaultSetupTimeInput(
				(event.target as any).value
			);
	}

	onChangePrice(event: any) {
		if (this.selectedMachine)
			this.selectedMachine.price = new Machine().validatePriceInput(
				(event.target as any).value
			);
	}

	onChangeMachineHours(event: any) {
		if (this.selectedMachine)
			this.selectedMachine.machine_board_hours = new Machine().validateDefaultSetupTimeInput(
				(event.target as any).value
			);
	}

	onChangeTr(event: any) {
		if (this.selectedMachine) this.selectedMachine.tr = (event.target as any).value;
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		switch (this.selectedTab) {
			case "item_states":
				this.associateData = [...this.itemStateMachine];
				break;
			case "machine_states":
				this.associateData = [...this.machineStateassociate];
				break;
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		this.checkAllRequiredComboboxes(); // this one is for showing error messages
		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "core_data";
			return;
		}
		const customId = this.selectedMachine.custom_id?.trim();
		this.selectedMachine.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkAllRequiredComboboxes(): boolean {
		if (!this.qualificationImportType.element.value) {
			this.qualificationImportType.element.valueState = "Negative";
			return false;
		} else {
			this.qualificationImportType.element.valueState = "None";
		}
		
		if (!this.machineBoardStateType.element.value) {
			this.machineBoardStateType.element.valueState = "Negative";
			return false;
		} else {
			this.machineBoardStateType.element.valueState = "None";
		}

		if (!this.quantityType.element.value) {
			this.quantityType.element.valueState = "Negative";
			return false;
		} else {
			this.quantityType.element.valueState = "None";
		}

		if (!this.machineBoardType.element.value) {
			this.machineBoardType.element.valueState = "Negative";
			return false;
		} else {
			this.machineBoardType.element.valueState = "None";
		}
		if (!this.machineConfirmationType.element.value) {
			this.machineConfirmationType.element.valueState = "Negative";
			return false;
		} else {
			this.machineConfirmationType.element.valueState = "None";
		}
		if (!this.machineStateType.element.value) {
			this.machineStateType.element.valueState = "Negative";
			return false;
		} else {
			this.machineStateType.element.valueState = "None";
		}
		if (!this.statusBoardCardType.element.value) {
			this.statusBoardCardType.element.valueState = "Negative";
			return false;
		} else {
			this.statusBoardCardType.element.valueState = "None";
		}
		if (!this.productionPlanType.element.value) {
			this.productionPlanType.element.valueState = "Negative";
			return false;
		} else {
			this.productionPlanType.element.valueState = "None";
		}
		return true;
	}

	shouldBeDisabled(fieldName: string) {
		if (this.machineConfig && this.selectedMachine) {
			return this.machineConfig[fieldName] === 0 && this.selectedMachine.is_imported_from_erp;
		} else {
			return false;
		}
	}

	selectAllAssociate(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			this.filteredItemState.forEach(itemState => (itemState.isSelected = true));
			this.filteredMachineState.forEach(machineState => (machineState.isSelected = true));
		} else {
			this.isDeselectEnable = false;
			this.filteredItemState.forEach(itemState => (itemState.isSelected = false));
			this.filteredMachineState.forEach(machineState => (machineState.isSelected = false));
		}
	}

	selectionChangeForItemState(event: any) {
		const selectedBadPart = event.detail.targetItem.id;
		const index = this.itemStates.findIndex(item => item.id == selectedBadPart);
		this.itemStates[index].isSelected = !this.itemStates[index].isSelected;
		this.itemStateMachine.push(selectedBadPart);
		this.updateSelectionText(event);
	}

	selectionChangeForMachineState(event: any) {
		const selectedMachineState = event.detail.targetItem.id;
		const index = this.machineStates.findIndex(item => item.id == selectedMachineState);
		this.machineStates[index].isSelected = !this.machineStates[index].isSelected;
		this.machineStateassociate.push(selectedMachineState);
		this.updateSelectionText(event);
	}

	updateSelectionText(event: any) {
		const selectedItems = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedItems.length > 0 ? true : false;
	}

	onSaveItemStateAssociate() {
		const selectedBPR = this.itemStates.filter(bpr => bpr.isSelected);
		this.itemStateMachine = selectedBPR;
		this.associateData = selectedBPR;
		this.isAssociateDialogOpen = false;
	}
	onSaveMachineStateAssociate() {
		const selectedMS = this.machineStates.filter(bpr => bpr.isSelected);
		this.machineStateassociate = selectedMS;
		this.associateData = selectedMS;
		this.isAssociateDialogOpen = false;
	}
	cancelDialog() {
		this.isAssociateDialogOpen = false;
	}
	onClickAssociateButton(dialogId: string) {
		if (dialogId === "item_states") {
			this.associateDialogTitle = $localize`Associate`;
			this.preSelectItemState();
			this.filteredItemState = [...this.itemStates];
			this.checkEnableSelection(this.filteredItemState);
		} else {
			this.associateDialogTitle = $localize`Associate`;
			this.preSelectMachineState();
			this.filteredMachineState = [...this.machineStates];
			this.checkEnableSelection(this.filteredMachineState);
		}
		this.isAssociateDialogOpen = true;
		this.searchedValue = "";
	}
	checkEnableSelection(data: any[]): void {
		this.isDeselectEnable = data.some(item => item.isSelected);
	}
	preSelectItemState() {
		this.itemStates.forEach((bpr: ItemState) => (bpr.isSelected = false));
		this.itemStateMachine.forEach((bpr: any) => {
			this.itemStates.forEach((value: any) => {
				if (value?.id == bpr?.id) value.isSelected = true;
			});
		});
	}
	preSelectMachineState() {
		this.machineStates.forEach(
			(machineState: MachineState) => (machineState.isSelected = false)
		);
		this.machineStateassociate.forEach((selectedState: MachineState) => {
			this.machineStates.forEach((machineState: any) => {
				if (machineState?.id == selectedState?.id) machineState.isSelected = true;
			});
		});
	}
	syncAssociateData(urlString: string, payload: any, method: "post" | "put") {
		return new Promise((resolve, reject) => {
			this.commonService[method](urlString, payload, false).subscribe({
				next: res => {
					resolve(res);
				},
				error: err => {
					reject(err);
				},
			});
		});
	}
	loadAssociateData() {
		const machineId = this.selectedMachine.id;
		this.itemStateMachine = [];
		this.machineStateassociate = [];
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/ItemStateMachines?$expand=itemState&filter=machine_id eq ${machineId}`
			),
			new ODataBatchCall(1, "get", `\/odata\/Machines/${machineId}?$expand=machineState`)
		);
		this.isLoadingBatchCall = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((itemStateMachine: ItemStateMachine) => {
					this.itemStates.forEach((value: any) => {
						if (value.id == itemStateMachine.itemState?.id) {
							value.isSelected = true;
						}
					});
					this.itemStateMachine.push(
						new ItemState().deserialize(itemStateMachine.itemState)
					);
				});
				response.responses[1]?.body?.machineState.map((machineState: any) => {
					this.machineStates.forEach((value: any) => {
						if (value.id == machineState.id) {
							value.isSelected = true;
						}
					});
					this.machineStateassociate?.push(new MachineState().deserialize(machineState));
				});
				switch (this.selectedTab) {
					case "item_states":
						this.associateData = [...this.itemStateMachine];
						break;
					case "machine_states":
						this.associateData = [...this.machineStateassociate];
						break;
				}
				this.isLoadingBatchCall = false;
			},
			error: e => {},
		});
	}
	machineStateSearch(value: string) {
		this.associateData = this.findItemsByMatch(this.machineStateassociate, value);
	}
	itemStateSearch(value: string) {
		this.associateData = this.findItemsByMatch(this.itemStateMachine, value);
	}
	onSearchAssocitesInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue : "";
		switch (this.selectedTab) {
			case "item_states":
				this.filteredItemState = this.findItemsByMatch(this.itemStates, this.searchedValue);
				break;
			case "machine_states":
				this.filteredMachineState = this.findItemsByMatch(
					this.machineStates,
					this.searchedValue
				);
				break;
		}
	}
	findItemsByMatch(data: any, searchTerm: string) {
		searchTerm = searchTerm.toLowerCase();
		return data.filter((item: any) => {
			return (
				item.name.toLowerCase().includes(searchTerm) ||
				item.custom_id.toLowerCase().includes(searchTerm)
			);
		});
	}

	onSerialNumberProfileChange() {
		this.selectedSerialNumberProfile = this.typeRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => parseInt(el.id)
		) as number[];
	}

	onMachineLastSerialNumberProfileChange() {
		this.selectedLastSerialNumberProfile =
			this.machineLastSerialNumberProfileref.elementRef.nativeElement.selectedValues.map(
				(el: any) => parseInt(el.id)
			) as number[];
	}

	onMachineMiddleSerialNumberProfileChange() {
		this.selectedMiddleSerialNumberProfile =
			this.machineMiddleSerialNumberProfileref.elementRef.nativeElement.selectedValues.map(
				(el: any) => parseInt(el.id)
			) as number[];
	}
}
