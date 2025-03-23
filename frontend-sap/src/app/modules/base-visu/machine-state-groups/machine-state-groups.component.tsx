import { Component, Input, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { MachineStateGroup } from "@app/shared/models/machine-state-group.model";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { FlexBox, Text } from "@ui5/webcomponents-react";
import React from "react";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import { ColorPalette } from "@app/shared/enums/ColorPalette";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-machine-state-groups",
	templateUrl: "./machine-state-groups.component.html",
	styleUrl: "./machine-state-groups.component.css",
})
export class MachineStateGroupsComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deleteItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	popOpen: boolean = false;
	isCustomIDAvailable: boolean = false;
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	selectedMachineStateGroup: MachineStateGroup = new MachineStateGroup().deserialize({});
	localization = Localization;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	machineStateGroupConfig?: any = {};
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("colorItem", { static: false }) colorItems: any;

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("deleteToastMachineStateGroup", { static: false }) deleteToastMachineStateGroup: any;
	@ViewChild("deleteDialogMachineStateGroup", { static: false })
	deleteDialogMachineStateGroup: any;
	@ViewChild("errorDialogMachineStateGroups", { static: false })
	errorDialogMachineStateGroups: any;
	@ViewChild("shiftGroupModelColorPicker", { static: false }) shiftGroupModelColorPicker: any;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogMachineStateGroup", { static: false })
	deleteErrorDialogMachineStateGroup: any;
	selectedStateColor?: string = ColorPalette.BLACK;
	colorPaletteKeys = Object.values(ColorPalette);

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.selectedMachineStateGroup = new MachineStateGroup().deserialize({});
	}

	ngOnInit(): void {
		this.machineStateGroupConfig = this.configService.getConfigValue("machine_state_group");
		this.getCustomId();
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
		const url = `MachineStateGroups?$filter=is_active eq true and id eq ${this.selectedMachineStateGroup?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
				const index = this.childComponent?.data.findIndex((data: any) => data.id === response?.value[0].id);
				this.childComponent!.data[index] = new MachineStateGroup().deserialize(
					this.childComponent!.data[index]
				);
			}
		});
	}

	itemclicked(color: string): void {
		this.selectedStateColor = color;
		this.selectedMachineStateGroup.color = this.selectedStateColor;
	}

	openColorPicker() {
		this.popOpen = true;
	}

	closeResponsiveDialog() {
		this.popover.elementRef.nativeElement.open = false;
	}

	closeErrorDialog() {
		this.errorDialogMachineStateGroups.elementRef.nativeElement.open = false;
	}

	color() {
		this.popover.elementRef.nativeElement.open = true;
	}

	newButtonClick() {
		this.isUpdate = false;
		this.isDialogOpen = true;
		this.selectedMachineStateGroup = new MachineStateGroup().deserialize({});
		this.selectedMachineStateGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedMachineStateGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.isCustomIDAvailable = false;
		(this.form as any).onReset();
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
		const customId = this.selectedMachineStateGroup.custom_id?.trim();
		this.selectedMachineStateGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedMachineStateGroup.custom_id || ""
		);
		const urlString = `MachineStateGroups?$filter=custom_id eq '${this.selectedMachineStateGroup.custom_id}'&$select=custom_id`;
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

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedMachineStateGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `MachineStateGroups(${this.selectedMachineStateGroup?.id})`
			: `MachineStateGroups`;
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
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogMachineStateGroups.elementRef.nativeElement.open = true;
			},
		});
		this.isLoading = true;
	}

	deleteClick(value: any): void {
		this.deleteItemId = value.id;
		this.deleteDialogMachineStateGroup.elementRef.nativeElement.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/MachineStateGroups(${this.deleteItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.childComponent?.onFilterAndSortingForEdit(this.selectedMachineStateGroup, null);
				this.isLoading = false;
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogMachineStateGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		this.deleteDialogMachineStateGroup.elementRef.nativeElement.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogMachineStateGroup.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onChangeIsActive(event: any) {
		if (this.selectedMachineStateGroup)
			this.selectedMachineStateGroup.is_active = event.target.checked;
	}

	onChangeIsProductive(event: any) {
		if (this.selectedMachineStateGroup)
			this.selectedMachineStateGroup.is_productive = event.target.checked;
	}

	onChangeIsCapacity(event: any) {
		if (this.selectedMachineStateGroup)
			this.selectedMachineStateGroup.has_capacity = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedMachineStateGroup)
			this.selectedMachineStateGroup.name = (event.target as any).value;
	}

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
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
			Header: $localize`Production Relevant`,
			accessor: "is_productive",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{`${rowData.is_productive ? "Productive" : "Standstill"}`}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Capacity Relevant`,
			accessor: "has_capacity",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
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
	];

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("MachineStateGroup").catch(() => false);
		this.selectedMachineStateGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedMachineStateGroup.custom_id = "";
		this.isLoadingCustomId = false;
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedMachineStateGroup = this.selectedMachineStateGroup?.deserialize(value);
		this.cachedCustomId = this.selectedMachineStateGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.machineStateGroupConfig && this.selectedMachineStateGroup) {
			return (
				this.machineStateGroupConfig[fieldName] === 0 &&
				this.selectedMachineStateGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
