import {Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { DateToConsiderClass } from "@app/shared/enums/DateToConsider";
import { Shift } from "@app/shared/models/shift.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ConfigService } from "@app/shared/services/config.service";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { FlexBox } from "@ui5/webcomponents-react";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import React from "react";

@Component({
	selector: "app-shift",
	templateUrl: "./shift.component.html",
	styleUrl: "./shift.component.css",
})
export class ShiftComponent {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	isLoadingCustomId: boolean = false;
	isUpdateDialog: boolean = false;
	disableButtonDuringRequest: boolean = false;
	cachedCustomId?: string = "";
	customId?: string = "";
	protected shift = Shift;
	customIdState: keyof typeof ValueState = "None";
	startTimeTimePickerState: keyof typeof ValueState = "None";
	endTimeTimePickerState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	dialogTitle: string = "";
	shiftConfig?: any = {};
	hours = "0.00";
	localization = Localization;
	dateToConsider = DateToConsiderClass.getEnumArray();
	@ViewChild("errorDialogShifts", { static: false }) errorDialogShifts: any;
	@ViewChild("deleteErrorDialogShift", { static: false }) deleteErrorDialogShift: any;

	selectedShift = new Shift().deserialize({});
	@ViewChild("createOrUpdateForm") form?: NgForm;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.shiftConfig = this.configService.getConfigValue("shifts");
	}

	ngOnInit() {
		this.getCustomId();
	}

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
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: $localize`Start Time`,
			accessor: "start_time",
			disableFilters: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Time,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`End Time`,
			accessor: "end_time",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Time,
			isSelected: true,
			hAlign: "Right",
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Break Minutes`,
			accessor: "break_minutes",
			disableFilters: false,
			dataType: GridTableColumnDataType.Number,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Date To Consider`,
			accessor: "date_to_consider",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							{DateToConsiderClass.getStateTranslate(rowData.date_to_consider)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	async newButtonClick() {
		this.isUpdateDialog = false;
		this.isDialogOpen = true;
		this.selectedShift = new Shift().deserialize({});
		this.customIdState = "None";
		this.dialogTitle = this.localization.add;
		this.selectedShift.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedShift.custom_id = "";
			this.getCustomId();
		}
	}

	closeDialog() {
		this.selectedShift = new Shift().deserialize({});
		this.isDialogOpen = false;
		setTimeout(() => {
			if (this.form) {
				this.form.onReset();
			} else {
				const formElement = document.querySelector(
					"#createOrUpdateForm"
				) as HTMLFormElement;
				formElement?.["onReset"]();
			}
		}, 0);
	}

	closeErrorDialog() {
		this.errorDialogShifts.elementRef.nativeElement.open = false;
	}

	onSubmitShift() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}

		const customId = this.selectedShift.custom_id?.trim();
		this.selectedShift.custom_id = customId;
		if (this.isUpdateDialog) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async onCreateOrUpdate() {
		if (this.selectedShift.isUsed) {
			this._toasterSrv.showToast($localize`Used shifts cannot be modified!`, "error");
			this.disableButtonDuringRequest = false;
			return;
		}

		if (this.canBeSaved()) {
			this.isLoading = true;
			const payload = this.selectedShift?.toOdata();
			const method = this.isUpdateDialog ? "put" : "post";
			const urlString = this.isUpdateDialog ? `Shifts(${this.selectedShift?.id})` : `Shifts`;
			this.commonService[method](urlString, payload).subscribe({
				next: () => {
					const { recordSavedSuccessfully } = Localization;
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");

					if (!this.isUpdateDialog) {
						this.filterHandler();
					} else {
						this.refreshEditData();
					}
					this.closeDialog();
					this.isLoading = false;
					this.isDialogOpen = false;
					this.disableButtonDuringRequest = false;
					(this.form as any).onReset();
				},
				error: () => {
					this.errorDialogShifts.elementRef.nativeElement.open = true;
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
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
		const url = `Shifts?$expand=hasShiftModels&$filter=is_active eq true and id eq ${this.selectedShift?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
				const index = this.childComponent?.data.findIndex((data: any) => data.id === response?.value[0].id);
				this.childComponent!.data[index] = new Shift().deserialize(
					this.childComponent!.data[index]
				);
			}
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Shift").catch(() => false);
		this.selectedShift.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedShift.custom_id = "";
		this.isLoadingCustomId = false;
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedShift.custom_id || ""
		);
		const urlString = `Shifts?$filter=custom_id eq '${this.selectedShift.custom_id}'&$select=custom_id`;
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

	onChangeCustomId() {
		this.customIdState = "None";
	}

	canBeSaved() {
		const hours = this.selectedShift?.hours;
		if (this.selectedShift.start_time && this.selectedShift?.end_time && hours && hours > 0) {
			return true;
		} else {
			this.startTimeTimePickerState = ValueState.Negative;
			this.endTimeTimePickerState = ValueState.Negative;
			return false;
		}
	}

	startTimeChange() {
		this.startTimeTimePickerState = ValueState.None;
		this.hours = this.selectedShift.calculateHours();
	}

	endTimeChange() {
		this.endTimeTimePickerState = ValueState.None;
	}

	deleteClick(value: any): void {
		this.selectedShift = structuredClone(value);
		(document.getElementById("deleteDialog") as Dialog).open = true;
	}

	editClick(value: object): void {
		this.dialogTitle = this.localization.edit;
		this.selectedShift = new Shift().deserialize(value);

		// Rollback extra added times
		this.selectedShift.start_time = this.selectedShift.convertTime(
			this.selectedShift?.start_time || "",
			true
		);
		this.selectedShift.end_time = this.selectedShift.convertTime(
			this.selectedShift?.end_time || "",
			true
		);

		this.isDialogOpen = true;
		this.isUpdateDialog = true;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedShift.custom_id;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
		this.isDialogOpen = false;
	}

	deleteSubmit() {
		if (this.selectedShift.isUsed) {
			this._toasterSrv.showToast($localize`Used shifts cannot be modified!`, "error");
			this.disableButtonDuringRequest = false;
			return;
		}

		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Shifts(${this.selectedShift.id})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedShift, null);
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				console.error(err);
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.deleteErrorDialogShift.elementRef.nativeElement.open = true;
			},
		});
	}

	changeBreakMinutes(e: any) {
		this.selectedShift.break_minutes = e.detail?.value || 0;
	}

	onChangeDateToConsider(e: any) {
		const selectedText = e.detail.item?.text;
		this.selectedShift.date_to_consider = DateToConsiderClass.getStateValue(selectedText);
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		if (inputValue !== this.selectedShift.date_to_consider) {
			this.selectedShift.date_to_consider = DateToConsiderClass.getStateValue(inputValue);
		}
	}

	getTranslatedDateToConsider(value: string | undefined): string {
		return DateToConsiderClass.getStateTranslate(value);
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogShift.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}
}
