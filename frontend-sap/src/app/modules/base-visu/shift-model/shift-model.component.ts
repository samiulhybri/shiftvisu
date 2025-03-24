import { Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { WeekDayClass } from "@app/shared/enums/WeekDays";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { Shift } from "@app/shared/models/shift.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-shift-model",
	templateUrl: "./shift-model.component.html",
	styleUrl: "./shift-model.component.css",
})
export class ShiftModelComponent {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentForShiftRef", { static: false }) childComponentForShift:
		| CustomReactGridTable
		| undefined;

	@ViewChild("overlappedDialog", { static: false }) overlappedDialog: any;
	@ViewChild("deleteShiftsDialog", { static: false }) deleteShiftsDialog: any;
	@ViewChild("errorDialogShiftModels", { static: false }) errorDialogShiftModels: any;

	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	addButtonDisable: boolean = true;
	isLoadingCustomId: boolean = false;
	isUpdateDialog: boolean = false;
	isAssociateDialogOpen: boolean = false;
	selectedShiftModel = new ShiftModel().deserialize({});
	weekDays = WeekDayClass.getEnumArray();
	selectedShiftModelId: number | undefined;
	customIdState: keyof typeof ValueState = ValueState.None;
	shiftState: keyof typeof ValueState = ValueState.None;
	weekDaysState: keyof typeof ValueState = ValueState.None;
	customIdValueStateText: string = Localization.invalidEntry;
	dialogTitle: string = "";
	cachedCustomId?: string = "";
	customId?: string = "";
	disableButtonDuringRequest: boolean = false;
	selectedWorkingDays: number[] = [];
	selectedShifts: any = [];
	shiftForTreeTable: any = [];
	allShifts: any = [];
	selectedShiftsForDelete: any = [];
	localization = Localization;
	isFiltering: boolean = false;
	shiftModelShiftsStructure = [
		{ custom_id: WeekDayClass.getStateTranslate(0), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(1), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(2), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(3), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(4), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(5), subRows: [] },
		{ custom_id: WeekDayClass.getStateTranslate(6), subRows: [] },
	] as any;

	@ViewChild("createOrUpdateForm") form?: NgForm;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	ngOnInit() {
		this.getCustomId();
		this.loadShifts();
	}

	shiftModelColumns: any = [
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
		},
	];

	shiftColumns: any = [
		{
			Header: $localize`Weekday with Shift`,
			accessor: "custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "shift.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			dataType: GridTableColumnDataType.NestedArray,
			autoResizable: true,
		},
		{
			Header: $localize`Start Time`,
			accessor: "shift.start_time",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.NestedArray,
			autoResizable: true,
		},
		{
			Header: $localize`End Time`,
			accessor: "shift.end_time",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.NestedArray,
			autoResizable: true,
		},
		{
			Header: $localize`Break Minutes`,
			accessor: "shift.break_minutes",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.NestedArray,
			autoResizable: true,
		},
	];

	loadShifts() {
		this.commonService.get("Shifts?$filter=is_active eq true").subscribe({
			next: (response: any) => {
				this.allShifts = response.value.map((shift: any) => new Shift().deserialize(shift));
			},
		});
	}

	async newButtonClick() {
		this.isUpdateDialog = false;
		this.isDialogOpen = true;
		this.selectedShiftModel = new ShiftModel().deserialize({});
		this.customIdState = "None";
		this.dialogTitle = $localize`Add Shift Model`;
		this.selectedShiftModel.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedShiftModel.custom_id = "";
			this.getCustomId();
		}
	}

	deleteClick(value: any): void {
		this.selectedShiftModel = new ShiftModel().deserialize(value);
		(document.getElementById("deleteDialog") as Dialog).open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/ShiftModels(${this.selectedShiftModel.id})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.selectedShiftModelId = undefined;
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedShiftModel, null);
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.closeDialogDelete();
				this.errorDialogShiftModels.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
		this.isDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogShiftModels.elementRef.nativeElement.open = false;
	}

	editClick(value: object): void {
		this.dialogTitle = $localize`Edit Shift Model`;
		this.selectedShiftModel = new ShiftModel().deserialize(value);
		this.isDialogOpen = true;
		this.isUpdateDialog = true;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedShiftModel.custom_id;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	associateButtonClick() {
		this.isAssociateDialogOpen = true;
		this.selectedShifts = [];
		this.selectedWorkingDays = [];
		this.weekDays = WeekDayClass.getEnumArray();
		this.shiftState = ValueState.None;
		this.weekDaysState = ValueState.None;
	}

	cancelDialog() {
		this.isAssociateDialogOpen = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmitShiftModel() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}

		const customId = this.selectedShiftModel.custom_id?.trim();
		this.selectedShiftModel.custom_id = customId;
		if (this.isUpdateDialog) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedShiftModel?.toOdata();
		const method = this.isUpdateDialog ? "put" : "post";
		const urlString = this.isUpdateDialog
			? `ShiftModels(${this.selectedShiftModel?.id})`
			: `ShiftModels`;
		this.commonService[method](urlString, payload).subscribe({
			next: (res: any) => {
				if (method == "post") {
					this.selectedShiftModelId = res.id;
				}
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				this.addButtonDisable = false;

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
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogShiftModels.elementRef.nativeElement.open = true;
			},
		});
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
		const url = `ShiftModels?$filter=id eq ${this.selectedShiftModel?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("ShiftModel").catch(() => false);
		this.selectedShiftModel.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedShiftModel.custom_id = "";
		this.isLoadingCustomId = false;
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedShiftModel.custom_id || ""
		);
		const urlString = `ShiftModels?$filter=custom_id eq '${this.selectedShiftModel.custom_id}'&$select=custom_id`;
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

	onWeekDaysChange(e: any) {
		this.selectedWorkingDays = e.detail.items?.map((item: any) => parseInt(item.id));
		this.weekDaysState = ValueState.None;

		for (let weekDay of this.weekDays) {
			const index = e.detail.items.findIndex((item: any) => item.id == weekDay.value);
			weekDay.isSelected = index != -1;
		}
	}

	onChangeShifts(e: any) {
		const id = e.detail.item.id;
		const additionalText = e.detail.item._state.additionalText;
		const name = e.detail.item._state.text;

		const isExist = this.selectedShifts?.find((shift: Shift) => shift.id == id);

		if (!isExist) {
			this.shiftState = ValueState.None;
			const shift = this.allShifts?.find((shift: Shift) => shift.id == id);

			this.selectedShifts.push({ ...shift, id, name, additionalText });
		} else {
			this.shiftState = ValueState.Negative;
		}
	}

	onDateDelete(e: any) {
		const deletedShift = e.detail.item.id;

		this.selectedShifts = this.selectedShifts.filter(
			(shift: Shift) => shift.id != deletedShift
		);
	}

	onSaveShiftToShiftModel(e: any) {
		if (this.isDataSaveable()) {
			this.disableButtonDuringRequest = true;
			let requests: ODataBatchCall[] = [];
			let canBeSaved = true;
			this.isLoading = true;

			const isOverLapped = new Shift().deserialize({}).isDateOverlapped(this.selectedShifts);
			canBeSaved = !isOverLapped;

			if (!isOverLapped) {
				this.selectedShifts.forEach((shift: Shift, i: number) => {
					this.selectedWorkingDays.forEach((day: number, j: number) => {
						const isOverLapped =
							this.shiftForTreeTable[day]?.subRows &&
							new Shift()
								.deserialize({})
								.isDateOverlapped([...this.shiftForTreeTable[day].subRows, shift]);

						if (!isOverLapped) {
							const payload = {
								shift_model_id: this.selectedShiftModelId,
								shift_id: shift.id,
								day_of_week: day,
							};
							const batchCall = new ODataBatchCall(
								parseInt(`${i}${j}`),
								"POST",
								`\/odata\/ShiftModelShifts`
							);
							batchCall.body = payload;

							requests.push(batchCall);
						} else canBeSaved = false;
					});
				});
			}

			if (canBeSaved) {
				this.commonService.post("$batch", { requests }).subscribe({
					next: () => {
						this.isLoading = false;
						this.isAssociateDialogOpen = false;
						this.disableButtonDuringRequest = false;
						this.processShiftModelData();
					},
					error: () => {
						this.isLoading = false;
						this.disableButtonDuringRequest = false;
						this.errorDialogShiftModels.elementRef.nativeElement.open = true;
					},
				});
			} else {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				if (this.overlappedDialog?.elementRef.nativeElement)
					this.overlappedDialog.elementRef.nativeElement.open = true;
			}
		} else {
			this.shiftState = this.selectedShifts?.length ? "None" : "Negative";
			this.weekDaysState = this.selectedWorkingDays?.length ? "None" : "Negative";
		}
	}

	isDataSaveable() {
		if (this.selectedWorkingDays?.length && this.selectedShifts?.length) return true;
		else return false;
	}

	closeDialogOverlapped() {
		if (this.overlappedDialog?.elementRef.nativeElement)
			this.overlappedDialog.elementRef.nativeElement.open = false;

		if (this.deleteShiftsDialog?.elementRef.nativeElement)
			this.deleteShiftsDialog.elementRef.nativeElement.open = false;
	}

	processShiftModelData() {
		if (this.selectedShiftModelId) {
			this.selectedShiftModelId && this.checkSelectedDataId(this.selectedShiftModelId);
		} else {
			if (this.childComponent && this.childComponent?.data.length) {
				this.childComponent.selectedRowsId = { 0: true };
				this.addButtonDisable = false;
			}
			if (this.childComponent?.data.length) {
				this.selectedShiftModelId = this.childComponent?.data[0]?.id;
				this.selectedShiftModel = new ShiftModel().deserialize(
					this.childComponent?.data[0]
				);
				this.selectedShiftModelId && this.processDataForShift(this.selectedShiftModelId);
			} else {
				this.shiftForTreeTable = [];
				this.childComponentForShift?.render();
			}
		}
	}

	checkSelectedDataId(id?: number) {
		if (id) {
			let index: number = this.childComponent?.data.findIndex((item: any) => item.id == id);
			if (this.childComponent && this.childComponent?.data.length && index > -1){
				this.childComponent.selectedRowsId = { [index]: true };
				this.processDataForShift(this.childComponent?.data[index]?.id);
				this.selectedShiftModel = new ShiftModel().deserialize(
					this.childComponent?.data[index]
				);
			}
			else {
				this.selectedShiftModelId = undefined;
				this.shiftForTreeTable = [];
				this.childComponentForShift?.render();
			}
		} else {
			this.shiftForTreeTable = [];
			this.childComponentForShift?.render();
		}
	}

	processDataForShift(id: number) {
		this.selectedShiftsForDelete = [];

		if (this.childComponentForShift) {
			this.childComponentForShift.isBusy = true;
			this.childComponentForShift.render();
		}
		this.commonService
			.get(`ShiftModelShifts?$filter=shift_model_id eq ${id}&$expand=shift`)
			.subscribe({
				next: (response: any) => {
					if (response.value?.length && this.selectedShiftModel?.id) {
						this.shiftForTreeTable = structuredClone(this.shiftModelShiftsStructure);

						response.value?.forEach((shift: any, i: number) => {
							const shiftModelShift = {
								...shift,
								custom_id: shift.shift.custom_id,
								start_time: shift.shift.start_time,
								end_time: shift.shift.end_time,
								shift: new Shift().deserialize(shift.shift),
							};
							this.shiftForTreeTable[shift.day_of_week].subRows.push(shiftModelShift);
						});
						this.shiftForTreeTable.forEach((shiftModelShift: any, i: number) => {
							if (!shiftModelShift.subRows?.length) delete this.shiftForTreeTable[i];
						});

						if (this.childComponentForShift) {
							this.childComponentForShift.isBusy = false;
						}
					} else {
						this.shiftForTreeTable = [];
						if (this.childComponentForShift) {
							this.childComponentForShift.isBusy = false;
							this.childComponentForShift.render();
						}
					}
				},
			});
	}

	handleRowClick(event: any) {
		this.selectedShiftsForDelete = [];
		const tempSelectedShiftModelId = this.selectedShiftModelId;
		this.selectedShiftModelId = event.detail.row.original.id;
		this.selectedShiftModel = event.detail.row.original;
		if (tempSelectedShiftModelId !== this.selectedShiftModelId) {
			this.processDataForShift(event.detail.row.original.id);
		}

		if (this.childComponent && this.childComponentForShift) {
			const index = this.childComponent.data?.findIndex(
				(row: any) => row.id === this.selectedShiftModel.id
			);

			this.addButtonDisable = this.selectedShiftModel.id ? false : true;
			this.childComponent.selectedRowsId = index > -1 ? { [index]: true } : {};
			this.childComponent.render();
		}

		if (this.childComponentForShift) {
			this.childComponentForShift.isNoDataSelected = true;
			this.childComponentForShift.render();
		}
	}

	rowSelectionChangeForShift(e: any) {
		this.selectedShiftsForDelete = [];
		e.detail.selectedFlatRows?.forEach((item: any) => {
			if (item?.id?.includes(".")) {
				this.selectedShiftsForDelete.push(item?.original?.id);
			}
		});
	}

	deleteMultipleShift() {
		if (this.deleteShiftsDialog?.elementRef.nativeElement)
			this.deleteShiftsDialog.elementRef.nativeElement.open = true;
	}

	deleteShiftsSubmit() {
		if (this.childComponentForShift) {
			this.childComponentForShift.isNoDataSelected = true;
			this.childComponentForShift.render();
		}

		let requests: ODataBatchCall[] = [];

		this.selectedShiftsForDelete.forEach((id: number, index: number) => {
			const batchCall = new ODataBatchCall(
				index,
				"delete",
				`\/odata\/ShiftModelShifts(${id})`
			);
			requests.push(batchCall);
		});

		if (requests.length) {
			this.isLoading = true;
			this.commonService.post("$batch", { requests }).subscribe({
				next: () => {
					this.processShiftModelData();
					this.isLoading = false;

					if (this.deleteShiftsDialog?.elementRef.nativeElement)
						this.deleteShiftsDialog.elementRef.nativeElement.open = false;
				},
				error: () => {
					this.isLoading = false;
					this.errorDialogShiftModels.elementRef.nativeElement.open = true;
					this.deleteShiftsDialog.elementRef.nativeElement.open = false;
				},
			});
		}
	}

	handleSearchClick($event: any) {
		this.isFiltering = true;
	}
}
