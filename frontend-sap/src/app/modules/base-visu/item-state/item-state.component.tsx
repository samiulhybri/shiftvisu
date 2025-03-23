import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import ItemState from "@app/shared/models/item-state.model";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import React from "react";
import { Button } from "@ui5/webcomponents-react";
import { ItemStateType, ItemStateTypeClass } from "@app/shared/enums/ItemStateType";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import ItemStateGroup from "@app/shared/models/item-state-group.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { PlantsService } from "@app/shared/services/plants.service";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-item-state",
	templateUrl: "./item-state.component.html",
	styleUrl: "./item-state.component.css",
})
export class ItemStateComponent {
	deletItemId = "";
	isUpdate?: boolean;
	customId?: string;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	isLoadingCustomId: boolean = false;
	isLoadingMachines: boolean = false;
	dialogTitle: string = "";
	customIdValueStateText: string = Localization.invalidEntry;
	customIdState: keyof typeof ValueState = "None";
	localization = Localization;
	nameState: string = "None";
	cachedCustomId?: string = "";
	machines: Machine[] = [];
	filteredMachines: Machine[] = [];
	selectedMachines: (number | undefined)[] = [];
	itemState: ItemState = new ItemState().deserialize({});
	itemStateConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	isAssociateDialogOpen: boolean = false;
	searchedValue: string = "";
	public selectedTab: string = "generalTab";
	addButtonText: string = $localize`Associate`;
	associateDialogTitle: string = $localize`Associate Machines`;
	@ViewChild("generalTab") generalTab!: ElementRef;
	@ViewChild("associateMachineTab") associateMachineTab!: ElementRef;
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("searchInput", { static: false }) searchInput: any;
	@ViewChild("deleteErrorDialogItemStates", { static: false })
	deleteErrorDialogItemStates: any;
	tempMachines: any[] = [];
	isPreviewDialogOpen: boolean = false;
	itemStateTypeItems = ItemStateTypeClass.getEnumArray();
	@ViewChild("item_state_type") itemStateType!: ComboBoxComponent;
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	itemStateGroups: ItemStateGroup[] = [];
	plantId?: number;
	copyMachinesData: Machine[] = [];
	data: Machine[] = [];
	originalFilteredMachines: Machine[] = [];

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
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
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Item State Group`,
			accessor: "itemStateGroup.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			comboBoxValues: this.itemStateGroups,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["itemStateGroup.name", "itemStateGroup.custom_id"],
			autoResizable: true,
		},
		{
			Header: $localize`Machines`,
			accessor: "machines.id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalMachines: any[] = [];

				rowData.machines.map((machine: any) => {
					totalMachines.push(machine.id);
				});
				let machines = this.getMachinesByPlantId([...rowData.machines], this.plantId);

				if (machines.length > 0) {
					return (
						<React.StrictMode>
							<Button onClick={() => this.showPreview(machines)}>
								{machines.length +
									(machines.length > 1
										? $localize` Machines`
										: $localize` Machine`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
	];

	showPreview(data: any) {
		this.machines = [...data];
		this.isPreviewDialogOpen = true;
	}

	closeAssociateDialog() {
		this.isPreviewDialogOpen = false;
	}

	machineColumns: any = [
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			width: 200,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];

	associate: any = [
		{
			accessor: "id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			autoResizable: true,
		},
	];

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
		
	@ViewChild("childComponentAssociateMachine", { static: false }) gridTableAssociateMachine:
		| CustomReactGridTable
		| undefined;

	@ViewChild("deleteDialogItemState", { static: false }) deleteDialogItemState: any;
	@ViewChild("errorDialogItemState", { static: false }) errorDialogItemState: any;
	@ViewChild("bprform") form?: NgForm;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		plantService: PlantsService		
	) {
		this.itemStateConfig = this.configService.getConfigValue("item_state");
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}

	ngOnInit() {
		this.getCustomId();
		this.loadData();
	}

	loadData() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(0, "get", `Machines?$orderby=custom_id asc&$top=${this.topValue}`)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`ItemStateGroups?$orderby=custom_id asc&$expand=topItemState($select=custom_id)&$top=${this.topValue}`
			)
		);
		this.isLoadingMachines = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.machines = response.responses[0]?.body?.value?.map((machine: Machine) =>
					new Machine().deserialize({ ...machine, isSelected: false })
				);
				this.itemStateGroups = response.responses[1]?.body?.value?.map(
					(itemStateGroup: ItemStateGroup) =>
						new ItemStateGroup().deserialize(itemStateGroup)
				);

				this.isLoadingMachines = false;
				this.data = [...this.machines];
				this.filteredMachines = this.data;

				if (this.childComponent) {
					this.columns[3].comboBoxValues = this.itemStateGroups;
				}
			},
			error: e => {},
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ItemStates").catch(() => false);
		this.itemState.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.itemState.custom_id = "";
		this.isLoadingCustomId = false;
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		if (this.gridTableAssociateMachine) {
			this.gridTableAssociateMachine.filteredDataCount = this.copyMachinesData.length;
			this.gridTableAssociateMachine.render();
		}
	}

	async newButtonClick() {
		this.setTabInitialState();
		this.isUpdate = false;
		this.itemState = new ItemState().deserialize({});
		this.customIdState = "None";
		this.dialogTitle = this.localization.add;
		this.selectedMachines = [];
		this.copyMachinesData = [];
		this.preselectedMachines();
		this.itemState.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (this.gridTableAssociateMachine) {
			this.gridTableAssociateMachine.filteredDataCount = this.copyMachinesData.length;
			this.gridTableAssociateMachine.render();
		}
		if (!this.customId) {
			this.itemState.custom_id = "";
			this.getCustomId();
		}
	}

	deleteClick(value: any) {
		this.deletItemId = value.id;
		this.deleteDialogItemState.elementRef.nativeElement.open = true;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogItemStates.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	getMachinesByPlantId(machines: any[], plantId: number | undefined): any[] {
		return machines.filter((machine: any) => machine.plant_id === plantId);
	}

	associateButtonClick() {
		this.isAssociateDialogOpen = true;
		this.searchedValue = "";
		this.preselectedMachines();
		this.originalFilteredMachines = this.getMachinesByPlantId(this.data, this.plantId);
		this.filteredMachines = [...this.originalFilteredMachines];
		this.tempMachines = [];
		const isAllItemStateSelect = this.filteredMachines.some(itemState => itemState.isSelected);
		this.isDeselectEnable = isAllItemStateSelect ? true : false;
	}

	editClick(value: any) {
		this.dialogTitle = this.localization.edit;
		this.itemState = new ItemState().deserialize(value);
		this.selectedMachines = this.itemState.machines.map(machine => machine.id) || [];
		this.copyMachinesData = this.getMachinesByPlantId(
			[...this.itemState.machines],
			this.plantId
		);
		this.preselectedMachines();
		this.isUpdate = true;
		this.cachedCustomId = this.itemState.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;

		if (this.gridTableAssociateMachine) {
			this.gridTableAssociateMachine.filteredDataCount = this.copyMachinesData.length;
			this.gridTableAssociateMachine.render();
		}
		this.setTabInitialState();
	}

	cancelDialog() {
		this.isAssociateDialogOpen = false;
	}

	onMachineSave() {
		const selectedMachines = this.machines.filter(machine => machine.isSelected);
		this.itemState.machines = selectedMachines;
		this.copyMachinesData = this.getMachinesByPlantId(
			[...this.itemState.machines],
			this.plantId
		);
		if (this.gridTableAssociateMachine) {
			this.gridTableAssociateMachine.filteredDataCount = this.copyMachinesData.length;
			this.gridTableAssociateMachine.render();
		}
		this.isAssociateDialogOpen = false;
	}

	onSubmit(form: NgForm) {
		const customId = this.itemState.custom_id?.trim();
		this.itemState.custom_id = customId;
		this.checkAllRequiredComboboxes();
		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "generalTab";
			return;
		}

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.itemState.custom_id || ""
		);
		const urlString = `ItemStates?$filter=custom_id eq '${this.itemState.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) this.onCreateOrUpdate();
					else {
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

	onSearchInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue.toLowerCase() : "";
		this.filteredMachines = this.originalFilteredMachines.filter(
			item =>
				(item.custom_id && item.custom_id.includes(this.searchedValue)) ||
				item.name?.toLowerCase().includes(this.searchedValue)
		);
	}

	onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.itemState?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `ItemStates(${this.itemState?.id})` : `ItemStates`;
		this.commonService[method](urlString, payload).subscribe({
			next: res => {
				const { recordSavedSuccessfully } = Localization;
				this.itemState = new ItemState().deserialize(res);
				this.syncMachineMachineStates().then(() => {
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");
					if (!this.isUpdate) {
						this.filterHandler();
					} else {
						this.refreshEditData();
					}
					this.isLoading = false;
					this.isDialogOpen = false;
					this.disableButtonDuringRequest = false;
					(this.form as any).onReset();
				});
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogItemState.elementRef.nativeElement.open = true;
			},
		});
	}

	syncMachineMachineStates() {
		const selectedMachine = this.machines.filter(machine => machine.isSelected);
		const machineIds = selectedMachine.map((machine: any) => machine.id);
		const payload = this.itemState.toJSONData(machineIds);

		return new Promise((resolve, reject) => {
			try {
				this.commonService
					.post("base-visu/bad-part-reasons-machines", payload, false)
					.subscribe(res => {
						resolve(res);
					});
			} catch (error) {
				reject(error);
			}
		});
	}

	preselectedMachines() {
		this.machines.forEach((machine: Machine) => (machine.isSelected = false));
		this.itemState.machines.forEach((machine: any) => {
			this.machines.forEach((value: any) => {
				if (value?.id == machine?.id) value.isSelected = true;
			});
		});
		this.filteredMachines = this.machines;
		this.isDialogOpen = true;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/ItemStates(${this.deletItemId})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.childComponent?.onFilterAndSortingForEdit(this.itemState, null);
				this.isLoading = false;
				this.closeDialogDelete();

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.deleteErrorDialogItemStates.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	async setTabInitialState(): Promise<void> {
		this.selectedTab = "generalTab";
		const detailsTab = (this.generalTab as any).elementRef.nativeElement;
		const fileTab = (this.associateMachineTab as any).elementRef.nativeElement;
		detailsTab.selected = true;
		fileTab.selected = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.itemStateType.element.valueState = "None";
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogItemState.elementRef.nativeElement.open = false;
	}

	closeDialogDelete() {
		this.deleteDialogItemState.elementRef.nativeElement.open = false;
	}

	filterHandler(fieldName: string = "", value: string = "", filterOperator: string = "Contain") {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `ItemStates?$filter=is_active eq true and id eq ${this.itemState?.id}&$orderby=custom_id asc&$expand=itemStateGroup,machines`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	machineChange(event: any) {
		const selectedMachine = event.detail.targetItem.id;
		const machineIndex = this.machines.findIndex(mach => mach.id == selectedMachine);
		this.machines[machineIndex].isSelected = !this.machines[machineIndex].isSelected;
		this.tempMachines.push(parseInt(selectedMachine));
		const selectedItems = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedItems.length > 0 ? true : false;
	}

	selectAllAssociate(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			this.filteredMachines.forEach(machine => (machine.isSelected = true));
		} else {
			this.isDeselectEnable = false;
			this.filteredMachines.forEach(machine => (machine.isSelected = false));
		}
	}

	shouldBeDisabled(fieldName: string) {
		if (this.itemStateConfig && this.itemState) {
			return this.itemStateConfig[fieldName] === 0 && this.itemState.is_imported_from_erp;
		} else {
			return false;
		}
	}

	onChangeItemType(event: any) {
		this.itemState.item_state_type = event.detail.item.text || ItemStateType.GOOD;
	}

	inputValueRestrict(event: any, value: any) {
		if (event.target.value != value) {
			event.target.value = value;
		}
	}
	checkAllRequiredComboboxes(): boolean {
		if (!this.itemStateType.element.value) {
			this.itemStateType.element.valueState = "Negative";
			return false;
		} else {
			this.itemStateType.element.valueState = "None";
		}
		return true;
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchHallData = this.itemStateGroups.find(
			itemStateGroup => itemStateGroup.name === inputValue
		);
		if (!matchHallData && this.itemState?.itemStateGroup) {
			this.itemState.itemStateGroup = new ItemStateGroup().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeItemStateChange(event: any) {
		if (this.itemState?.itemStateGroup)
			this.itemState.itemStateGroup = new ItemStateGroup().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onSearchOnChangeInput(value: any) {
		const searchString = value.toLowerCase();
		const foundArray = this.copyMachinesData.filter((data: any) =>
			data.custom_id?.toLowerCase().includes(searchString) ||
			data.name?.toLowerCase().includes(searchString)
     	);
		this.gridTableAssociateMachine!.filteredDataCount = foundArray.length;
	}
}
