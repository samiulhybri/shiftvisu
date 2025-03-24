import { Component, Input, ViewChild, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { OperationPlanPos } from "@app/shared/models/operation-plan-pos";
import BomPos from "@app/shared/models/bom-pos.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { Machine } from "@app/shared/models/machine.model";
import { Item } from "@app/shared/models/item.model";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import { ToastService } from "@app/shared/services/toaster.service";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { ProdOrderPosBomPos } from "@app/shared/models/prod-order-pos-bom-pos.model";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { PlantsService } from "@app/shared/services/plants.service";
import { CommonService } from "@app/shared/services/common.service";
import { ValueHelperType } from "@app/modules/maintenance/manage-maintenance/enums/ValueHelperType";
import DateTimePicker from "@ui5/webcomponents/dist/DateTimePicker";
import moment from "moment";
import { ProdOrder } from "@app/shared/models/prod-order.model";

@Component({
	selector: "app-maintenance-managing-dialog",
	templateUrl: "./maintenance-managing-dialog.component.html",
	styleUrl: "./maintenance-managing-dialog.component.css",
})
export class MaintenanceManagingDialogComponent {
	isLoading: boolean = false;
	disableButtonDuringRequest = false;
	isValueHelpDialog: boolean = false;
	isWarningDialog: boolean = false;
	isMaintenanceDialog: boolean = false;
	isBomDialog: boolean = false;
	maintenances: OperationPlanPos[] = [];
	isFromBom = false;
	currentBomPos: BomPos = new BomPos();
	isBomEditMode: boolean = false;
	valueHelperType = ValueHelperType;
	selectedValueHelperType = ValueHelperType.MaintenenceType;
	newMaintenanceText: string = "";
	editedMaintenance?: ProdOrderPosOperation;
	expandQuery: string = `$expand=prodOrder($expand=machine)&$filter=prodOrder/any(p:p/order_type eq '${ProdOrderType.MAINTENANCE}')`;
	deleteMaintenanceId?: string;
	currentBomPosValueStateText?: string = "";
	endDateValueStateText?: string = "";
	localization = Localization;
	selectedItem?: Item;
	bomDialogTitle: string = $localize`Add BOM`;
	public valueState: keyof typeof ValueState = "None";
	selectedMaintenanceType?: OperationPlan;
	selectedMachine?: Machine;
	maintenanceDialogTitle: string = $localize`Add Maintenance`;
	selectedBomItem?: Item;
	topValue: number = 1000;
	valueStateMaintenanceText?: string = "";
	valueStateBOMQuantityText?: string = "";
	valueStateMaintenance: keyof typeof  ValueState = "None";
	valueStateBOMQuantity: keyof typeof  ValueState = "None";
	isLoadingCustomId: boolean = false;
	customId?: string;
	@Input() selectedProdOrder: ProdOrder = new ProdOrder().deserialize({});
	@Input() customIdState: keyof typeof ValueState = "None";
	@Input() public isDialogOpen!: boolean;
	@Input() dialogTitle: string = "";
	@Input() bomPos: BomPos[] = [];
	@Input() maintenancesFromApi: OperationPlanPos[] = [];
	@Input() bomPosFromApi: BomPos[] = [];
	@Input() selectedProdOrderPos: ProdOrderPos = new ProdOrderPos();
	@Input() isUpdateMaintenance: boolean = false;
	@Input() selectedItemAfterSaving: Item = new Item().deserialize({});
	@Input() selectedStart: string = "";
	@Input() selectedEnd: string = "";
	@Input() selectedMachineAfterSaving: Machine = new Machine().deserialize({});
	@Input() selectedMaintenanceAfterSaving: OperationPlan = new OperationPlan().deserialize({});
	@Input() public set prodOrderPos(prodOrderPosId: number) {
		if (prodOrderPosId) {
			this.getProdOrderPosData(prodOrderPosId);
		} else {
			this.clearDialogData();
		}
	}
	@Input() public set clearDatePicker(value: any) {
		const startDatePicker = (document.getElementById("startDatePicker") as DateTimePicker);
		startDatePicker.value = "";
		const endDatePicker = (document.getElementById("endDatePicker") as DateTimePicker);
		endDatePicker.value = "";
		endDatePicker.valueState = "None"
		this.endDateValueStateText = "";
	}
	@ViewChild("createOrUpdateForm") createOrUpdateForm?: NgForm;
	@ViewChild("childComponentRef") childComponentRef?: CustomReactGridTable;
	@ViewChild("bomTable") bomTable?: CustomReactGridTable;
	@ViewChild("valuehelpTable") valuehelpDialog?: CustomReactGridTable;
	@ViewChild("maintenanceTable") maintenanceTable?: CustomReactGridTable;
	@ViewChild("errorDialogMaintenance", { static: false }) errorDialogMaintenance: any;
	@Output() public changeIsDialogOpen = new EventEmitter<any>();
	@Output() public refreshTable = new EventEmitter<any>();

	maintenanceTypeColumns: any = [
		{
			Header: $localize`Maintenance Type`,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
	];
	maintenanceColumns: any = [
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
            hAlign: "Left",
			dataType: GridTableColumnDataType.NestedString,
		},
	];
	machineColumns: any = [
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["name", "custom_id"],
		},
	];
	itemColumns: any = [
		{
			Header: $localize`Name`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			isSelected: true,
			dataType: GridTableColumnDataType.MultipleString,
			accessorArray: ["name", "custom_id"],
		},
	];
	bomColumns: any = [
		{
			Header: $localize`Item`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Quantity`,
			accessor: "qty_for_one_parent",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
	];

	constructor(
		private plantService: PlantsService,
		private commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.closeMainDialog = this.closeMainDialog.bind(this);
		this.refreshGridTable = this.refreshGridTable.bind(this);
		this.selectedProdOrder = new ProdOrder().deserialize({});
	}

	ngOnInit(): void {
		this.getCustomId();
	}
	
	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ProdOrder").catch(() => false);
		this.selectedProdOrder.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedProdOrder.custom_id = "";
		this.isLoadingCustomId = false;
	}

	onChangeCustomId() {
		this.customIdState = "Negative";
	}

	closeDialog() {
		this.closeMainDialog();
		this.createOrUpdateForm?.onReset();
		this.clearDialogData();
		this.filterHandler();
		this.customIdState = "None";
	}
	
	onSubmit(form: NgForm) {
		const endDatePicker = (document.getElementById("endDatePicker") as DateTimePicker);

		if (!form.valid || (endDatePicker.valueState === "Negative")) {
			this.disableButtonDuringRequest = false;
			return;
		}		

		let bomPosModel = this.bomPos.map((item: any) =>
			new ProdOrderPosBomPos().deserialize(item)
		);
		const bomPosData = bomPosModel.map((item: any) => item.toOdata());
		let maintenances = this.maintenances.map((item: any) =>
			new ProdOrderPosOperation().deserialize(item)
		);
		const maintenancesData = maintenances.map((item: any) => item.toOdata());
		const { recordSavedSuccessfully } = Localization;

		if (!this.findEmptyNameField(maintenances)) {
			this.errorDialogMaintenance.elementRef.nativeElement.open = true;
			this.disableButtonDuringRequest = false;
			return;
		}

		if (this.isUpdateMaintenance) {
			const newMaintenances = this.trackChanges(
				this.maintenancesFromApi,
				this.maintenances
			).added;
			const newBomPos = this.trackChanges(this.bomPosFromApi, this.bomPos).added;
			const deletedMaintenances = this.trackChanges(
				this.maintenancesFromApi,
				this.maintenances
			).deleted;
			const deletedBomPos = this.trackChanges(this.bomPosFromApi, this.bomPos).deleted;
			const deletedMaintenanceIds = deletedMaintenances.map((item: any) => item.id);
			const deletedBomPosIds = deletedBomPos.map((item: any) => item.id);
			const newBomPosModel = newBomPos.map((item: any) =>
				new ProdOrderPosBomPos().deserialize(item)
			);

			const payload = {
				item_id: this.selectedItemAfterSaving?.id,
				machine_id: this.selectedMachineAfterSaving?.id,
				operation_plan_id_origin: this.selectedMaintenanceAfterSaving?.id,
				start: this.parsetUTCdateTime(this.selectedStart),
				end: this.parsetUTCdateTime(this.selectedEnd),
				quantity: 0,
				pos: this.selectedProdOrderPos.pos,
				maintenances: maintenancesData,
				bomPos: bomPosData,
				deletedMaintenances: deletedMaintenanceIds,
				deletedBomPos: deletedBomPosIds,
				newBomPos: newBomPosModel.map((item: any) => item.toOdata()),
				newMaintenances: newMaintenances,
			};
			this.commonService
				.patch(`maintenance/update/${this.selectedProdOrderPos.id}`, payload, false)
				.subscribe({
					next: () => {
						this.maintenances = [];
						this.bomPos = [];
						this.selectedStart = "";
						this.selectedEnd = "";
						this.refreshGridTable();
						this.closeMainDialog();
						this.createOrUpdateForm?.onReset();
						this.disableButtonDuringRequest = false;
						this._toasterSrv.showToast(
							recordSavedSuccessfully,
							"success"
						);
					},
					error: () => {
						this.disableButtonDuringRequest = false;
						this.isLoading = false;
					},
				});
		} else {
			const payload: any = {
				item_id: this.selectedItem?.id,
				machine_id: this.selectedMachineAfterSaving?.id,
				operation_plan_id_origin: this.selectedMaintenanceAfterSaving?.id,
				start: this.parsetUTCdateTime(this.selectedStart),
				end: this.parsetUTCdateTime(this.selectedEnd),
				quantity: 0,
				pos: "10",
				maintenances: maintenancesData,
				bomPos: bomPosData,
			};
			this.commonService.post(`maintenance/create`, payload, false).subscribe({
				next: () => {
					this.maintenances = [];
					this.bomPos = [];
					this.selectedStart = "";
					this.selectedEnd = "";
					this.refreshGridTable();
					this.closeMainDialog();
					this.createOrUpdateForm?.onReset();
					this.disableButtonDuringRequest = false;
					this._toasterSrv.showToast(
						recordSavedSuccessfully,
						"success"
					);
				},
				error: () => {
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
				},
			});
		}
	}

	trackChanges(original: any, current: any) {
		const added = current.filter(
			(item: any) => !original.some((orig: any) => orig.id === item.id)
		);
		const deleted = original.filter(
			(item: any) => !current.some((curr: any) => curr.id === item.id)
		);
		return { added, deleted };
	}

	onSaveManageMaintenance() {
		if (!this.selectedProdOrder.custom_id || this.selectedProdOrder.custom_id.trim() === '') {
			this.customIdState="Negative"
			this.disableButtonDuringRequest = false;
			return;
		}

		this.disableButtonDuringRequest = true;
		(this.createOrUpdateForm as any).onSubmit(undefined);
	}

	deleteBom(event: any) {
		const index = this.bomPos.findIndex(v => v.id == event.id);
		if (index != -1) {
			this.bomPos.splice(index, 1);
		}
		this.updateTableRowCount();
		this.bomTable?.render();
	}

	valueHelperButtonClick(valueHelperType: ValueHelperType, isFromBom = false) {
		this.isFromBom = isFromBom;
		this.valuehelpDialog!.data = [];
		this.valuehelpDialog!.filteredDataCount = 0;
		this.valuehelpDialog?.render();
		this.valueState = "None";
		this.isValueHelpDialog = true;
		this.selectedValueHelperType = valueHelperType;
		setTimeout(() => {
			this.valuehelpDialog?.onColumnFiltering();
		});
	}

	defaultRowSelection() {
		if (!this.valuehelpDialog || !this.valuehelpDialog.data) {
			console.warn("Value help dialog is not initialized or has no data.");
			return;
		}

		let matchingRowIndex = -1;

		switch (this.selectedValueHelperType) {
			case this.valueHelperType.MaintenenceType:
				if (this.selectedMaintenanceAfterSaving?.custom_id) {
					matchingRowIndex = this.valuehelpDialog.data.findIndex(
						(row: any) => row.custom_id === this.selectedMaintenanceAfterSaving.custom_id
					);
				}
				break;
			case this.valueHelperType.Machine:
				if (this.selectedMachineAfterSaving?.id) {
					matchingRowIndex = this.valuehelpDialog.data.findIndex(
						(row: any) => row.id === this.selectedMachineAfterSaving.id
					);
				}
				break;
			case this.valueHelperType.Item:
				if (this.selectedItemAfterSaving?.id) {
					matchingRowIndex = this.valuehelpDialog.data.findIndex(
						(row: any) => Number(row.id) === Number(this.selectedItemAfterSaving.id)
					);
				}
				break;
			default:
				console.warn("Unhandled value helper type.");
				break;
		}

		if (matchingRowIndex !== -1) {
			this.valuehelpDialog.selectedRowsId = { [matchingRowIndex]: true };
		} else {
			console.warn("No matching row found for the saved values.");
			this.valuehelpDialog.selectedRowsId = {};
		}
	}
	
	onCloseValueHelp() {
		this.isValueHelpDialog = false;
		this.filterHandler();
		this.selectedMaintenanceType = undefined;
		this.selectedMachine = undefined;
		if (this.valuehelpDialog) {
			this.valuehelpDialog.globalSearchFieldValue = ""; 
			this.valuehelpDialog.filterQuery = ""; 
			this.valuehelpDialog.render(); 
		}
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		 this.valuehelpDialog?.onFilterAndSorting(fieldName, value, filterOperator);
		 this.getCustomId();
		 const gridTables=[this.maintenanceTable,this.bomTable];
		 gridTables.forEach((table) => {
			if (table){
				table.globalSearchFieldValue = "";
				table.render();
			}
		 })
		
	}

	onClickMaintenance() {
		this.isMaintenanceDialog = true;
		this.editedMaintenance = undefined;
		this.valueStateMaintenance = "None";
	}

	onEditMaintenance(event: any) {
		this.isMaintenanceDialog = true;
		this.maintenanceDialogTitle = $localize`Edit Maintenance`;
		this.editedMaintenance = event;
		this.newMaintenanceText = event.name;
		this.valueStateMaintenance = "None";
	    this.valueStateMaintenanceText = "";
	}

	onClose() {
		this.isMaintenanceDialog = false;
		this.isBomDialog = false;
		this.newMaintenanceText = "";
		this.currentBomPos = new OperationPlanPos().deserialize({});
		this.valueStateMaintenance = "None";
		this.valueStateBOMQuantity = "None";
	    this.valueStateMaintenanceText = "";
		this.valueStateBOMQuantityText = "";
	}

	onClickNewBom() {
		this.isBomDialog = true;
		this.isBomEditMode = false;
		this.valueState = "None";
		this.valueStateBOMQuantity = "None";
		this.currentBomPos = new BomPos().deserialize({});
	}

	onClickEditBom(event: any) {
		this.isBomDialog = true;
		this.isBomEditMode = true;
		this.bomDialogTitle = $localize`Edit BOM`;
		this.currentBomPos = event;
		this.valueStateBOMQuantity = "None";
	    this.valueStateBOMQuantityText = "";
	}

	clickOnMaintenanceType(event: any) {
		this.selectedMaintenanceType = event.detail.row.original;
	}

	clickOnMachine(event: any) {
		this.selectedMachine = event.detail.row.original;
	}

	clickOnItem(event: any) {
		this.selectedItem = event.detail.row.original;
	}

	clickOnBom(event: any) {
		this.selectedBomItem = event.detail.row.original;
	}

	clickOnValueHelpDialog(event: any) {
		switch (this.selectedValueHelperType) {
			case ValueHelperType.MaintenenceType:
				this.clickOnMaintenanceType(event);
				break;
			case ValueHelperType.Machine:
				this.clickOnMachine(event);
				break;
			case ValueHelperType.Item:
				if (this.isFromBom) {
					this.clickOnBom(event);
				} else {
					this.clickOnItem(event);
				}
				break;
		}
		if (this.valuehelpDialog) {
			this.valuehelpDialog.globalSearchFieldValue = ""; 
		}
	}

	onSaveMaintenanceType() {
		if (this.selectedMaintenanceType) this.selectedMaintenanceAfterSaving = this.selectedMaintenanceType;
		this.maintenanceTable!.isBusy = true;
		this.maintenanceTable!.render();
		this.commonService
			.get(
				`OperationPlanPos?$filter= operation_plan_id eq ${this.selectedMaintenanceAfterSaving.id}`
			)
			.subscribe({
				next: (data: any) => {
					this.maintenances = data.value.map((maintenance: any) =>
						new OperationPlanPos().deserialize(maintenance)
					);
					this.maintenanceTable!.isBusy = false;
					this.maintenanceTable?.render();
				},
				error: () => {
					this._toasterSrv.showToast(this.localization.someThingWentWrong, "error");
					this.selectedMaintenanceAfterSaving.id = undefined;
					this.isLoading = false;
				},
			});
	}

	onSaveMachine() {
		if (this.selectedMachine) {
			this.selectedMachineAfterSaving = this.selectedMachine;
		}
	}

	onSaveItem() {
		this.selectedItemAfterSaving = new Item().deserialize(this.selectedItem);
		this.bomTable!.isBusy = true;
		this.bomTable?.render();
		this.commonService
			.get(`BomPos?$filter=bom_id eq ${this.selectedItemAfterSaving?.bom_id} & $expand=item`)
			.subscribe({
				next: (data: any) => {
					this.bomPos = data.value.map((v: any) => new BomPos().deserialize(v));
					this.bomTable!.isBusy = false;
					this.bomTable?.render();
				},
			});
	}

	onSaveBom() {
		const item = this.selectedBomItem;
		this.currentBomPos.item = item;
		this.valueState = "None";
		this.updateTableRowCount();
	}

	getFilterQuery() {
		return this.selectedValueHelperType === this.valueHelperType.Machine ||
			this.selectedValueHelperType === this.valueHelperType.Item
			? "is_active eq true"
			: "";
	}
	
	getValueHelperUrl() {
		return this.selectedValueHelperType == this.valueHelperType.MaintenenceType
			? "/OperationPlans"
			: this.selectedValueHelperType == this.valueHelperType.Machine
				? "/Machines"
				: `/Plants(${this.plantService.plantId.value})/items`;
	}

	getExpandedQuery() {
		return this.selectedValueHelperType == this.valueHelperType.MaintenenceType
			? ""
			: this.selectedValueHelperType == this.valueHelperType.Machine
				? `&$filter=plant_id eq ${this.plantService.plantId.value}`
				: ``;
	}

	deleteMaintenance(event: any) {
		const index = this.maintenances.findIndex(v => v.id == event.id);
		if (index != -1) {
			this.maintenances.splice(index, 1);
		}
		this.updateTableRowCount();
		this.maintenanceTable?.render();
	}

	saveMaintenance() {
		if (this.newMaintenanceText) {
			if (this.editedMaintenance) {
				this.editMaintenance();
			} else {
				this.addMaintenance();
			}
			this.updateTableRowCount();
			this.maintenanceTable?.render();
			this.newMaintenanceText = "";
			this.isMaintenanceDialog = false;
		} else {
			this.valueStateMaintenance = "Negative";
			this.valueStateMaintenanceText = Localization.nameIsRequired;
		}
	}

	addMaintenance() {
		const maxPos = Math.max(...this.maintenances.map(v => parseInt(v.pos))) ?? 0;
		const newMaintenance = new OperationPlanPos();
		newMaintenance.pos = (maxPos + 10).toString();
		newMaintenance.name = this.newMaintenanceText;
		this.maintenances.push(newMaintenance);
	}

	editMaintenance() {
		const maintenence = this.maintenances.find((m: any) => m.id == this.editedMaintenance?.id);
		maintenence!.name = this.newMaintenanceText;
	}

	saveBom() {
		if (!this.currentBomPos.qty_for_one_parent) {
			this.valueStateBOMQuantity = "Negative";
			this.valueStateBOMQuantityText = $localize`Quantity is required.`;
			return;
		} else if (!this.currentBomPos.item?.id) {
			this.valueState = "Negative";
			this.currentBomPosValueStateText = $localize`Item is required.`;
			return;
		} else {
			this.disableButtonDuringRequest = true;
			if (this.isBomEditMode) {
				this.updateBom();
			} else {
				const bomposIndex = this.bomPos.findIndex(
					v => v.item?.id == this.currentBomPos.item?.id
				);
				if (bomposIndex === -1) this.createBom();
				else {
					this.valueState = "Negative";
					this.currentBomPosValueStateText = $localize`This item is already exist.`;
					this.disableButtonDuringRequest = false;
					return;
				}
			}
			this.updateTableRowCount();
			this.bomTable?.render();
			this.isBomDialog = false;
			this.currentBomPos = new OperationPlanPos().deserialize({});
		}
	}

	updateBom() {
		const bomposIndex = this.bomPos.findIndex(v => v.item?.id == this.currentBomPos.item?.id);
		this.bomPos[bomposIndex] = this.currentBomPos;
		this.disableButtonDuringRequest = false;
	}

	createBom() {
		const hasNaNValue = this.bomPos.some((item: any) => {
			return item.pos === '-Infinity' || item.pos === 'NaN';
		  });

		if (hasNaNValue) {
			this.bomPos.map((item: any, index: number) => {
				item.pos = JSON.stringify((index + 1) * 10); 
			})
		}
		const maxPos = Math.max(...this.bomPos.map(v => parseInt(v.pos!))) ?? 0;
		this.currentBomPos.pos = (maxPos + 10).toString();
		this.bomPos.push(this.currentBomPos);
		this.disableButtonDuringRequest = false;
	}

	onSave() {		
		this.isValueHelpDialog = false;
		switch (this.selectedValueHelperType) {
			case ValueHelperType.MaintenenceType:
				this.onSaveMaintenanceType();
				break;
			case ValueHelperType.Machine:
				this.onSaveMachine();
				break;
			case ValueHelperType.Item:
				if (this.isFromBom) {
					this.onSaveBom();
				} else {
					this.onSaveItem();
				}
				break;
		}
		if (this.valuehelpDialog) {
			this.valuehelpDialog.globalSearchFieldValue = ""; 
		}
	}

	getProdOrderPosData(prodOrderPosId: number) {
		this.isLoading = true;
		this.commonService
			.get(
				`ProdOrderPos/${prodOrderPosId}?$expand=prodOrder,bomPos($expand=item($select=name,id)),item($select=name,id),prodOrderPosOperations($expand=machine($select=name,id),operationPlan($select=custom_id))`
			)
			.subscribe({
				next: (prodOrderPos: any) => {
					this.selectedProdOrderPos = new ProdOrderPos().deserialize(prodOrderPos);
					this.selectedMaintenanceAfterSaving.custom_id =
						prodOrderPos?.prodOrderPosOperations[0]?.operationPlan?.custom_id ?? "";
					this.selectedProdOrder.custom_id = prodOrderPos?.prodOrder?.custom_id;
					this.selectedStart = prodOrderPos?.start
						? formatDate(prodOrderPos?.start, true, true, false, false)
						: "";
					this.selectedEnd = prodOrderPos?.end
						? formatDate(prodOrderPos?.end, true, true, false, false)
						: "";
					if (prodOrderPos?.prodOrderPosOperations?.length) {
						prodOrderPos?.prodOrderPosOperations[0]?.machine ? this.selectedMachineAfterSaving = new Machine().deserialize(
							prodOrderPos?.prodOrderPosOperations[0]?.machine
						) : this.selectedMachineAfterSaving = new Machine().deserialize({});
					} else this.selectedMachineAfterSaving = new Machine().deserialize({});

					prodOrderPos?.item
						? (this.selectedItemAfterSaving = new Item().deserialize(
								prodOrderPos?.item
							))
						: (this.selectedItemAfterSaving = new Item().deserialize({}));
						
					if (prodOrderPos?.prodOrderPosOperations.length)
						this.maintenances = prodOrderPos?.prodOrderPosOperations;
					if (prodOrderPos?.bomPos.length) this.bomPos = prodOrderPos?.bomPos;
					this.maintenancesFromApi = [...prodOrderPos?.prodOrderPosOperations];
					this.bomPosFromApi = [...prodOrderPos?.bomPos];
					this.compareTimes();
					this.isLoading = false;
					this.updateTableRowCount();
					this.maintenanceTable!.render();
					this.bomTable!.render();
				},
				error: () => {},
			});
	}

	updateTableRowCount() {
		this.maintenanceTable!.filteredDataCount = this.maintenances.length ?? 0;
		this.bomTable!.filteredDataCount = this.bomPos.length ?? 0;
	}

	public closeMainDialog() {
		if (this.changeIsDialogOpen) {
			this.changeIsDialogOpen.emit(false);
		}
		this.clearDialogData();
	};

	public refreshGridTable() {
		if (this.refreshTable) {
			this.refreshTable.emit();
		}
	};

	clearDialogData() {
		this.maintenances = [];
		this.bomPos = [];
		this.selectedStart = "";
		this.selectedEnd = "";
		this.customId = "";
	}

	changeMaintenanceName() {
		this.valueStateMaintenance = "None";
	}

	changeBOMQuantity() {
		this.valueStateBOMQuantity = "None";
	}

	compareTimes() {
		const endDatePicker = (document.getElementById("endDatePicker") as DateTimePicker);
		const start = moment(this.selectedStart || "", "DD.MM.YYYY, hh:mm A");
		const end = moment(this.selectedEnd || "", "DD.MM.YYYY, hh:mm A");
	
		if (start.isAfter(end)) {
			endDatePicker.valueState = "Negative";
			this.endDateValueStateText = $localize`End Date cannot be less than Start Date.`;
		} else if (start.isSame(end)) {
			endDatePicker.valueState = "Negative";
			this.endDateValueStateText = $localize`End Date and Start Date cannot be same.`;
		} else {
			endDatePicker.valueState = "None";
			this.endDateValueStateText = "";
		}
	}

	parsetUTCdateTime(date: string) {
		const momentDate = moment(date, "DD.MM.YYYY, HH:mm");
		return momentDate.utc().format("YYYY-MM-DDTHH:mm:ss[+06:00]");
	}

	closeErrorDialog() {
		this.errorDialogMaintenance.elementRef.nativeElement.open = false;
	}

	findEmptyNameField(data: any) {
		for (let item of data) {
			if (!item.name || item.name.trim() === "") {
				return false;
			}
		}
		return true;
	}

	onSearchOnChangeInput(value: string, tableName: string) {
		const lowerCaseValue = value.toLowerCase();
		let filteredDataCount = 0;
		
		switch (tableName) {
			case "maintenance":
				filteredDataCount = this.maintenances.filter((data: any) =>
					data.name?.toLowerCase().includes(lowerCaseValue)
				).length ?? 0;
				this.maintenanceTable!.filteredDataCount = filteredDataCount;
				break;
			case "bom":
				filteredDataCount = this.bomPos.filter((data: any) =>
					data.item.name?.toLowerCase().includes(lowerCaseValue) ||
					data.qty_for_one_parent?.toString().includes(lowerCaseValue)
				).length ?? 0;
				this.bomTable!.filteredDataCount = filteredDataCount;
				break;
		}
	}
}
