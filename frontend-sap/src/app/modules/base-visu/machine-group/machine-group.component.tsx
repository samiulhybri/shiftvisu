import { Component, ViewChild } from "@angular/core";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { CommonService } from "@app/shared/services/common.service";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import Toast from "@ui5/webcomponents/dist/Toast";
import { Hall } from "@app/shared/models/hall.model";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-machine-group",
	templateUrl: "./machine-group.component.html",
	styleUrl: "./machine-group.component.css",
})
export class MachineGroupComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	selectedRowValue: any;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	selectedMachineGroup: MachineGroup = new MachineGroup().deserialize({});
	@ViewChild("createOrUpdateForm") form?: NgForm;
	machineGroupConfig?: any = {};
	halls: Hall[] = [];
	@ViewChild("deleteErrorDialogMachineGroup", { static: false })
	deleteErrorDialogMachineGroup: any;
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	@ViewChild("hallComboBox") hallComboBoxMachineGroup!: ComboBoxComponent;
	@ViewChild("errorDialogMachineGroup", { static: false }) errorDialogMachineGroup: any;

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
			Header: $localize`Hall`,
			accessor: "hall.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["hall.name", "hall.custom_id"],
			comboBoxValues: this.halls,
			minWidth: 350,
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.selectedMachineGroup = new MachineGroup().deserialize({});
	}

	ngOnInit(): void {
		this.machineGroupConfig = this.configService.getConfigValue("machine_group");

		this.getCustomId();
		this.loadData();
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdate = false;
		this.selectedRowValue = new MachineGroup().deserialize({});
		this.selectedMachineGroup = new MachineGroup().deserialize({});
		this.selectedMachineGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedMachineGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedMachineGroup.custom_id?.trim();
		this.selectedMachineGroup.custom_id = customId;

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedMachineGroup.custom_id || ""
		);
		const urlString = `MachineGroups?$filter=custom_id eq '${this.selectedMachineGroup.custom_id}'`;
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
		const payload = this.selectedMachineGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `MachineGroups(${this.selectedMachineGroup?.id})`
			: `MachineGroups`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				this.selectedMachineGroup = new MachineGroup().deserialize({});
				if (!this.isUpdate) this.getCustomId();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogMachineGroup.elementRef.nativeElement.open = true;
			},
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("MachineGroup").catch(() => false);
		this.selectedMachineGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedMachineGroup.custom_id = "";
		this.isLoadingCustomId = false;
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
		const url = `MachineGroups?$filter=is_active eq true and id eq ${this.selectedMachineGroup?.id}&$orderby=custom_id asc&$expand=hall&$count=true`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	editClick(value: object): void {
		this.dialogTitle = this.localization.edit;
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedRowValue = this.selectedMachineGroup?.deserialize(value);
		this.cachedCustomId = this.selectedMachineGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogMachineGroup") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/MachineGroups(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();

				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedMachineGroup, null);
				(this.form as any).onReset();

				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogMachineGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogMachineGroup") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogMachineGroup.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogMachineGroup.elementRef.nativeElement.open = false;
	}

	onChangeIsAutoAssignMachine(event: any) {
		if (this.selectedMachineGroup)
			this.selectedMachineGroup.auto_assign_machine = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedMachineGroup) this.selectedMachineGroup.name = (event.target as any).value;
	}

	onChangeHall(event: any) {
		if (this.selectedMachineGroup?.hall)
			this.selectedMachineGroup.hall = new Hall().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchHallData = this.halls.find(hall => hall.name === inputValue);
		if (!matchHallData && this.selectedMachineGroup?.hall) {
			this.selectedMachineGroup.hall = new Hall().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeDefaultTe(event: any) {
		if (this.selectedMachineGroup)
			this.selectedMachineGroup.default_te = (event.target as any).value;
	}

	onChangeIsActive(event: any) {
		if (this.selectedMachineGroup) this.selectedMachineGroup.is_active = event.target.checked;
	}

	loadData() {
		this.commonService
			.get("Halls?$expand=topMachine($select=custom_id)")
			.subscribe((halls: any) => {
				halls.value.map((hall: Hall) => {
					this.halls.push(new Hall().deserialize(hall));
				});
			});
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.machineGroupConfig && this.selectedMachineGroup) {
			return (
				this.machineGroupConfig[fieldName] === 0 &&
				this.selectedMachineGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
