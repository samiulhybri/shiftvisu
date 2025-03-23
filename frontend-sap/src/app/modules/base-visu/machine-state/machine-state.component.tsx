import { Component, ElementRef, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { MachineStateGroup } from "@app/shared/models/machine-state-group.model";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import MachineState from "app/shared/models/machine-state.model";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { ConfigService } from "@app/shared/services/config.service";
import { MachineStateStateTypeClass } from "@app/shared/enums/MachineStateStateType";
import { ColorPalette } from "@app/shared/enums/ColorPalette";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import React from "react";
import { Button } from "@ui5/webcomponents-react";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { PlantsService } from "@app/shared/services/plants.service";

@Component({
	selector: "app-machine-state",
	templateUrl: "./machine-state.component.html",
	styleUrl: "./machine-state.component.css",
})
export class MachineStateComponent {
	protected machineState = MachineState;
	isUpdateDialog = false;
	isDialogOpen: boolean = false;
	isAssociateDialogOpen: boolean = false;
	selectedRowValue = new MachineState().deserialize({});
	isLoading: boolean = false;
	dialogTitle: string = "";
	machineStateGroups: MachineStateGroup[] = [];
	popOpen: boolean = false;
	selectedColor = "";
	warningForGroup = "";
	machines: Machine[] = [];
	selectedMachines: (number | undefined)[] = [];
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	localization = Localization;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("machineStateGroupCombobox") machineStateGroupCombobox!: ComboBoxComponent;
	machineStateStateTypes = MachineStateStateTypeClass.getEnumArray();
	machineStateConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogMachineState", { static: false })
	deleteErrorDialogMachineState: any;
	public selectedTab: string = "generalTab";
	addButtonText: string = $localize`Associate`;
	associateDialogTitle: string = $localize`Associate Machine`;
	@ViewChild("generalTab") generalTab!: ElementRef;
	@ViewChild("associateMachineTab") associateMachineTab!: ElementRef;
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("machineStateStateTypesComponent")
	machineStateStateTypesComponent!: ComboBoxComponent;
	@ViewChild("searchInput", { static: false }) searchInput: any;
	@ViewChild("errorDialogMachineState", { static: false }) errorDialogMachineState: any;
	savedMachines: Machine[] = [];
	filteredMachines: Machine[] = [];
	searchedValue: string = "";
	searchValueLowerCase: string = "";
	selectedStateColor?: string = ColorPalette.BLACK;
	colorPaletteKeys = Object.values(ColorPalette);
	tempMachines: any[] = [];
	isPreviewDialogOpen: boolean = false;
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	plantId?: number;
	copyMachinesData: Machine[] = [];
	data: Machine[] = [];
	originalFilteredMachines: Machine[] = [];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		plantService: PlantsService		
	) {
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}

	@ViewChild("deleteDialogMachineStates", { static: false }) deleteDialogMachineState: any;
	@ViewChild("deleteToastMachineState", { static: false }) deleteToastMachineState: any;

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("childComponentForAssociateMachine", { static: false }) associateMachineGridTable:
			| CustomReactGridTable
			| undefined;
	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			maxWidth: 72,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
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
		{
			Header: $localize`Machine State Group`,
			accessor: "machineStateGroup.custom_id",
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			disableFilters: false,
			disableGroupBy: true,
			accessorArray: ["machineStateGroup.name", "machineStateGroup.custom_id"],
			comboBoxValues: this.machineStateGroups,
			autoResizable: true,
		},
		{
			Header: $localize`Color`,
			accessor: "color",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Color,
			autoResizable: true,
		},
		{
			Header: $localize`Machine State Type`,
			accessor: "state_type",
			isSelected: true,
			dataType: GridTableColumnDataType.String,
			disableFilters: false,
			disableGroupBy: true,
			comboBoxValues: MachineStateStateTypeClass.getEnumArray(),
			autoResizable: true,
		},
		{
			Header: $localize`Quality Relevant`,
			accessor: "is_quality_relevant",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: true,
		},
		{
			Header: $localize`Microstop Duration`,
			accessor: "microstop_duration",
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
			hAlign: "Right",
		},
		{
			Header: $localize`Machine `,
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
				rowData.machines.map((item: any) => {
					totalMachines.push(item.id);
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

	showPreview(data: any) {
		this.savedMachines = [...data];
		this.isPreviewDialogOpen = true;
	}

	closeAssociateDialog() {
		this.isPreviewDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogMachineState.elementRef.nativeElement.open = false;
	}

	ngOnInit(): void {
		this.machineStateConfig = this.configService.getConfigValue("machine_state");
		this.getCustomId();
		this.loadData();
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/MachineStateGroups?$expand=topMachineState($select=custom_id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(1, "get", `Machines?$orderby=custom_id asc&$top=${this.topValue}`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.machineStateGroups = response.responses[0]?.body?.value?.map(
					(machineStateGroup: MachineStateGroup) =>
						new MachineStateGroup().deserialize(machineStateGroup)
				);
				this.machines = response.responses[1]?.body?.value?.map((machine: Machine) =>
					new Machine().deserialize({ ...machine, isSelected: false })
				);
				this.columns[3].comboBoxValues = this.machineStateGroups;
				this.data = [...this.machines];
				this.filteredMachines = this.data;
			},
			error: e => {},
		});
	}

	deleteClick(value: any): void {
		this.selectedRowValue = new MachineState().deserialize(value);
		this.deleteDialogMachineState.elementRef.nativeElement.open = true;
	}

	editClick(value: any): void {
		const data = structuredClone(value);
		this.dialogTitle = this.localization.edit;
		this.setTabInitialState();
		this.selectedRowValue = this.selectedRowValue?.deserialize(data);
		this.selectedRowValue.state_type = data.state_type;
		this.selectedMachines = this.selectedRowValue.machines.map(machine => machine.id) || [];
		this.copyMachinesData = this.getMachinesByPlantId(
			[...this.selectedRowValue.machines],
			this.plantId
		);
		this.preselectedMachines();
		this.isUpdateDialog = true;
		this.cachedCustomId = this.selectedRowValue.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.setTabInitialState();
		this.isUpdateDialog = false;
		this.selectedRowValue = new MachineState().deserialize({});
		this.selectedMachines = [];
		this.copyMachinesData = [];
		if (this.associateMachineGridTable) {
			this.associateMachineGridTable.filteredDataCount = 0;
			this.associateMachineGridTable.render();
		}
		this.preselectedMachines();
		this.selectedRowValue.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedRowValue.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
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
		const isAllMachineSelect = this.filteredMachines.some(machine => machine.isSelected);
		this.isDeselectEnable = isAllMachineSelect ? true : false;
	}

	onSearchInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue : "";
		this.searchValueLowerCase = this.searchedValue.toLowerCase();
		this.filteredMachines = this.originalFilteredMachines.filter(
			item =>
				(item.custom_id && item.custom_id.includes(this.searchedValue)) ||
				item.name?.toLowerCase().includes(this.searchValueLowerCase)
		);
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("MachineState").catch(() => false);
		this.selectedRowValue.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedRowValue.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async setTabInitialState(): Promise<void> {
		this.selectedTab = "generalTab";
		const detailsTab = (this.generalTab as any).elementRef.nativeElement;
		const fileTab = (this.associateMachineTab as any).elementRef.nativeElement;
		detailsTab.selected = true;
		fileTab.selected = false;
	}

	itemclicked(color: string): void {
		this.selectedStateColor = color;
		this.selectedRowValue.color = this.selectedStateColor;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.selectedColor = "";
		this.selectedRowValue = this.selectedRowValue?.deserialize({});
		(this.form as any).onReset();
		this.machineStateGroupCombobox.element.valueState = "None";
		this.machineStateStateTypesComponent.element.valueState = "None";
	}

	cancelDialog() {
		this.isAssociateDialogOpen = false;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		this.checkAllRequiredComboboxes(); // this one is for showing error messages
		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "generalTab";
			return;
		}
		const customId = this.selectedRowValue.custom_id?.trim();
		this.selectedRowValue.custom_id = customId;

		if (this.isUpdateDialog) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkAllRequiredComboboxes(): boolean {
		if (!this.machineStateGroupCombobox.element.value) {
			this.machineStateGroupCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.machineStateGroupCombobox.element.valueState = "None";
		}
		if (!this.machineStateStateTypesComponent.element.value) {
			this.machineStateStateTypesComponent.element.valueState = "Negative";
			return false;
		} else {
			this.machineStateStateTypesComponent.element.valueState = "None";
		}

		return true;
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedRowValue.custom_id || ""
		);
		const urlString = `MachineStates?$filter=custom_id eq '${this.selectedRowValue.custom_id}'&$select=custom_id`;
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

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `MachineStates?$filter=is_active eq true and id eq ${this.selectedRowValue?.id}&$orderby=custom_id asc&$expand=machineStateGroup,machines`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
				const index = this.childComponent?.data.findIndex((data: any) => data.id === response?.value[0].id);
				this.childComponent!.data[index] = new MachineState().deserialize(
					this.childComponent!.data[index]
				);
			}
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/MachineStates(${this.selectedRowValue.id})`).subscribe({
			next: () => {
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue, null);
				this.disableButtonDuringRequest = false;

				this.closeDialogDelete();
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogMachineState.elementRef.nativeElement.open = true;
				console.error(error);
				this.isLoading = false;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		this.deleteDialogMachineState.elementRef.nativeElement.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogMachineState.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onChangeMachineStateGroup(event: any) {
		this.machineStateGroupCombobox.element.valueState = "None";
		if (this.selectedRowValue?.machineStateGroup)
			this.selectedRowValue.machineStateGroup = new MachineStateGroup().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});

		this.checkProparData();
	}

	onChangeMachineStateStateTypes(event: any) {
		this.selectedRowValue.state_type = event.detail.item.text;

		this.checkProparData();
	}

	onChangeName(event: any) {
		if (this.selectedRowValue) this.selectedRowValue.name = (event.target as any).value;
	}

	openColorPicker() {
		this.popover.elementRef.nativeElement.open = true;
	}

	closeResponsiveDialog() {
		this.popover.elementRef.nativeElement.open = false;
	}

	colorChange(event: any) {
		setTimeout(() => {
			// Color picker gives the previously selected color if not setTimeout
			this.selectedColor = event.srcElement._state.hex;
		});
	}

	checkProparData() {
		this.warningForGroup = this.selectedRowValue.machineStateGroup?.id ? "None" : "Error";
		return !!this.selectedRowValue.machineStateGroup?.id;
	}

	onSaveColor() {
		this.selectedRowValue.color = this.selectedColor;

		this.closeResponsiveDialog();
	}

	onMachineSave() {
		this.selectedRowValue.machines = this.machines.filter(machine => machine.isSelected);
		this.copyMachinesData = this.getMachinesByPlantId(
			[...this.selectedRowValue.machines],
			this.plantId
		);
		if (this.associateMachineGridTable) {
			this.associateMachineGridTable.filteredDataCount = this.copyMachinesData.length;
			this.associateMachineGridTable.render();
		}
		this.isAssociateDialogOpen = false;
	}

	machineChange(event: any) {
		const selectedMachine = event.detail.targetItem.id;
		const index = this.machines.findIndex(item => item.id == selectedMachine);
		this.machines[index].isSelected = !this.machines[index].isSelected;
		this.tempMachines.push(parseInt(selectedMachine));
		const selectedItems = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedItems.length > 0 ? true : false;
	}

	selectionChange(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			this.filteredMachines.forEach(machine => (machine.isSelected = true));
		} else {
			this.isDeselectEnable = false;
			this.filteredMachines.forEach(machine => (machine.isSelected = false));
		}
	}

	preselectedMachines() {
		this.machines.forEach((machine: Machine) => (machine.isSelected = false));
		this.selectedRowValue.machines.forEach((machine: any) => {
			this.machines.forEach((value: any) => {
				if (value?.id == machine?.id) value.isSelected = true;
			});
		});
		this.filteredMachines = this.machines;
		this.isDialogOpen = true;
	}

	syncMachineMachineStates() {
		const selectedMachine = this.machines.filter(machine => machine.isSelected);
		const machineIds = selectedMachine.map((machine: any) => machine.id);
		const payload = this.selectedRowValue.toJSONData(machineIds);

		return new Promise((resolve, reject) => {
			try {
				this.commonService
					.post("base-visu/machine-machine-states", payload, false)
					.subscribe(res => {
						resolve(res);
					});
			} catch (error) {
				reject(error);
			}
		});
	}

	async onCreateOrUpdate() {
		if (this.checkProparData()) {
			this.isLoading = true;
			const payload = this.selectedRowValue?.toOdata();
			const method = this.isUpdateDialog ? "put" : "post";
			const urlString = this.isUpdateDialog
				? `MachineStates(${this.selectedRowValue?.id})`
				: `MachineStates`;
			this.commonService[method](urlString, payload).subscribe({
				next: res => {
					this.selectedRowValue = new MachineState().deserialize(res);
					this.syncMachineMachineStates().then(() => {
						const { recordSavedSuccessfully } = Localization;
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");
						if (!this.isUpdateDialog) {
							this.filterHandler();
						} else {
							this.refreshEditData();
						}
						this.isLoading = false;
						this.isDialogOpen = false;
						this.disableButtonDuringRequest = false;
					});
				},
				error: () => {
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
					this.errorDialogMachineState.elementRef.nativeElement.open = true;
				},
			});
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.machineStateConfig && this.selectedRowValue) {
			return (
				this.machineStateConfig[fieldName] === 0 &&
				this.selectedRowValue.is_imported_from_erp
			);
		} else {
			return false;
		}
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		if (this.selectedTab === 'associateMachineTab' && this.associateMachineGridTable) {
			this.associateMachineGridTable.filteredDataCount = this.copyMachinesData.length;
			this.associateMachineGridTable.render();
		}
	}

	onSearchOnChangeInput(value: any) {
		const searchString = value.toLowerCase();
		const foundArray = this.copyMachinesData.filter((data: any) =>
			data.custom_id?.toLowerCase().includes(searchString) ||
			data.name?.toLowerCase().includes(searchString)
     	);
		this.associateMachineGridTable!.filteredDataCount = foundArray.length;
	}
}
