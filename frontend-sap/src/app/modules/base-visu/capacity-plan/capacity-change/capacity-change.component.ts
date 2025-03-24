import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Capacity } from "@app/shared/models/capacity.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { Shift } from "@app/shared/models/shift.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ConfigService } from "@app/shared/services/config.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

@Component({
	selector: "app-capacity-change",
	templateUrl: "./capacity-change.component.html",
	styleUrl: "./capacity-change.component.css",
})
export class CapacityChangeComponent {
	@Input() public shiftModels: ShiftModel[] = [];
	@Input() public weekDays: any;
	@Input() public year: any;
	@Input() public selectedRow: any;
	@Input() public model: any = "hall";
	@Input() public editPermission: boolean = false;
	@Output() refreshTable = new EventEmitter<any>();

	isCapacityChangeDialogOpen = false;
	selectedShiftModelForChangeShift: ShiftModel | undefined;
	dialogTitleForShiftChange = $localize`Shift Change`;
	selectedWorkingDay: any;
	isDayChange = true;
	isWeekSelected = true;
	isWorkingDay = true;
	showPopOver = false;
	dateType = "dateId";
	dateRange: string[] | undefined;
	multipleDates: string[] | undefined;
	displayDateFormat: string | undefined;
	localizationConf: any = {};
	selectedCapacities: Capacity[] = [];
	selectedCapacitiesForShift: Capacity[] | undefined;
	selectedShiftsForDelete: number[] = [];
	selectedIndexes: number[] = [];
	hoursLeftTitle = $localize`Total Time:`;
	totalHours: number = 0;
	isAddShiftDialogOpen = false;
	isShiftChangeDialogOpen = false;
	disableButtonDuringRequest = false;
	selectedDate: string = "";
	shiftsFromDatabase: any = [];
	sampleCapacity: Capacity | undefined;
	selectedShift: Shift = new Shift().deserialize({});
	allShifts: Shift[] = [];
	updateIndex = -1;
	clickedDate: string = "";
	isLoading: boolean = false;
	protected shiftClass = new Shift();
	localization = Localization;
	hours = "0.00";
	isPastDate: boolean = false;
	isAnythingChanged: boolean = false;
	protected shift = Shift;

	startTimeTimePickerState: keyof typeof ValueState = "None";
	endTimeTimePickerState: keyof typeof ValueState = "None";

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentForAllShiftsRef", { static: false }) childComponentForAllShiftsRef:
		| CustomReactGridTable
		| undefined;

	@ViewChild("overlappedDialog", { static: false }) overlappedDialog: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;

	constructor(
		public commonService: CommonService,
		private configService: ConfigService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {
		this.localizationConf = this.configService.getConfigValue("localizationConf");
		this.getLocalizedDateFormat();
		this.loadShifts();
	}

	columns: any = [
		{
			Header: $localize`Start Time`,
			accessor: "start_time",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
		{
			Header: $localize`End Time`,
			accessor: "end_time",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
		{
			Header: $localize`Break Minutes`,
			accessor: "break_minutes",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
	];

	shiftsColumns: any = [
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
			minWidth : 50,
			autoResizable: true,
		},
		{
			Header: $localize`Start Time`,
			accessor: "start_time",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
		{
			Header: $localize`End Time`,
			accessor: "end_time",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
		{
			Header: $localize`Break Minutes`,
			accessor: "break_minutes",
			disableFilters: false,
			disableGroupBy: false,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			minWidth : 50,
			autoResizable: true,
		},
	];

	loadShifts() {
		this.commonService.get("Shifts?$filter=is_active eq true").subscribe({
			next: (res: any) => {
				this.allShifts = res?.value?.map((shift: Shift) => new Shift().deserialize(shift));
			},
			error: error => {
				this.isLoading = false;
				console.log(error);
			},
		});
	}

	onRowSectionChange(e: any) {
		this.selectedShiftsForDelete = [];
		this.selectedIndexes = [];

		e.detail.selectedFlatRows?.forEach((item: any) => {
			const index = this.selectedCapacities.findIndex(
				(capacity: Capacity) =>
					capacity.start_time == item.original.start_time &&
					capacity.end_time == item.original.end_time
			);

			if (index >= 0) {
				this.selectedIndexes.push(index);
			}
		});
	}

	handleChangeShiftClose() {
		this.isCapacityChangeDialogOpen = false;
	}

	onChangeShiftModel(event: any) {
		const selectedId = event.detail.item.id;
		this.selectedShiftModelForChangeShift = this.shiftModels.find(
			(shiftModel: ShiftModel) => shiftModel.id == selectedId
		);
	}

	onOpenShiftChangeDialog(
		capacity: any,
		isDayChange: boolean,
		date: string,
		sampleCapacity: Capacity | undefined
	) {
		this.selectedShiftsForDelete = [];
		this.selectedIndexes = [];

		this.sampleCapacity = sampleCapacity;
		this.clickedDate = structuredClone(date);

		this.selectedCapacities = capacity?.map((capacity: Capacity) => {
			return {
				...capacity,
				start_time: this.shiftClass.convertTime(capacity.start_time || '', false),
				end_time: this.shiftClass.convertTime(capacity.end_time || '', false),
				shift: capacity?.shift,
			};
		});

		this.shiftsFromDatabase = JSON.parse(JSON.stringify(this.selectedCapacities)); // remove value by ref

		this.getHeaderDateFormat(date);

		this.getTotalHours();

		this.isPastDate = this.checkIsPastDate();

		this.isDayChange = isDayChange;
		this.dialogTitleForShiftChange = isDayChange
			? $localize`Edit Day`
			: $localize`Shift Change`;
		this.weekDays = this.weekDays.map((weekDay: any) => {
			weekDay.isSelected = false;

			return weekDay;
		});

		this.selectedWorkingDay = {};
		this.isCapacityChangeDialogOpen = true;
	}

	checkIsPastDate() {
		const givenDate = new Date(this.clickedDate);
		const today = new Date();

		// Remove time part from today's date for accurate comparison
		today.setHours(0, 0, 0, 0);

		return givenDate <= today;
	}

	getTotalHours() {
		this.totalHours = 0;
		this.selectedCapacities?.forEach((capacity: Capacity) => {
			this.totalHours += capacity.shift?.hours || 0;
		});

		return new ShiftModel().decimalToHHMM(this.totalHours);
	}

	/**
	 * Use with pipe to show localized date format
	 */
	getLocalizedDateFormat() {
		const userLang = navigator.language?.split("-")[0];

		switch (userLang) {
			case "en":
				this.displayDateFormat = this.localizationConf?.englishDateFormat;
				break;
			case "it":
				this.displayDateFormat = this.localizationConf?.italianDateFormat; // Just a configuration for future use.
				break;

			default:
				this.displayDateFormat = this.localizationConf?.englishDateFormat; // Default en
				break;
		}
	}

	handleAddShiftClose() {
		this.isAddShiftDialogOpen = false;
		this.isCapacityChangeDialogOpen = true;

		if (this.childComponent) {
			this.childComponent.isNoDataSelected = true;
			this.childComponent.render();
		}
	}

	newButtonClick() {
		this.isAddShiftDialogOpen = true;
		this.isCapacityChangeDialogOpen = false;
		this.isAnythingChanged = false;

		// Break the table without that
		setTimeout(() => {
			let selectedRowsId: any = {};

			if (this.childComponentForAllShiftsRef) {
				this.childComponentForAllShiftsRef.selectedRowsId = {};

				this.selectedCapacities?.forEach((capacity: Capacity) => {
					const indexOfShift = this.childComponentForAllShiftsRef?.data.findIndex(
						(shift: Shift) => shift.id == capacity.shift?.id
					);

					selectedRowsId[indexOfShift] = true;
				});

				this.childComponentForAllShiftsRef.selectedRowsId = selectedRowsId;
			}
			this.childComponentForAllShiftsRef?.render();
		}, 200);
	}

	onRowSectionChangeForAddShift(e: any) {
		this.isAnythingChanged = true;
		this.selectedCapacitiesForShift = [] as any;
		e.detail.selectedFlatRows?.forEach((item: any) => {
			const existedValue = this.shiftsFromDatabase?.find(
				(itemFromDB: Capacity) => itemFromDB.shift?.id === item?.original?.id
			) as Capacity;
			const capacity = {
				shift: item?.original,
				start_time: item?.original.start_time,
				end_time: item?.original.end_time,
				break_minutes: item?.original.break_minutes,
			};

			if(existedValue){
				existedValue.shift = new Shift().deserialize(existedValue.shift);
			}
			
			this.selectedCapacitiesForShift?.push(existedValue || capacity);

			if (existedValue) {
				this.selectedShiftsForDelete = this.selectedShiftsForDelete?.filter(
					(id: number) => id != existedValue.id
				);
			}
		});
	}

	onSaveShifts() {
		if (!this.isAnythingChanged) {
			this.isAddShiftDialogOpen = false;
			return;
		}

		const isOverlapping = new Shift().isDateOverlapped(this.selectedCapacitiesForShift || []);

		if (!isOverlapping) {
			this.isAddShiftDialogOpen = false;

			// Update selectedCapacities to only include items in selectedCapacitiesForShift
			this.selectedCapacities = this.selectedCapacities?.filter(capacity =>
				this.selectedCapacitiesForShift?.some(
					(item: Capacity) => item.shift?.id === capacity.shift?.id
				)
			);

			// Add new items from selectedCapacitiesForShift to selectedCapacities
			this.selectedCapacitiesForShift?.forEach(item => {
				if (
					!this.selectedCapacities?.some(
						capacity => capacity.shift?.id === item.shift?.id
					)
				) {
					this.selectedCapacities?.push(item);
				}
			});

			this.shiftsFromDatabase?.forEach((capacity: Capacity) => {
				if (capacity?.id) {
					const isExist = this.selectedCapacities?.find(
						(item: Capacity) => item.id === capacity.id
					);

					if (
						!isExist &&
						!this.selectedShiftsForDelete.includes(capacity?.id) &&
						capacity?.shift?.id
					) {
						this.selectedShiftsForDelete.push(capacity?.id);
					}
				}
			});

			this.getTotalHours();
		} else {
			if (this.overlappedDialog?.elementRef.nativeElement)
				this.overlappedDialog.elementRef.nativeElement.open = true;
		}
	}

	saveShiftsToCapacity() {
		if (this.isPastDate) {
			this._toasterSrv.showToast($localize`Past capacities cannot be modified!`, "success");
			return;
		}

		this.isLoading = true;
		let requests: ODataBatchCall[] = [];

		this.selectedShiftsForDelete?.forEach((shiftId: number, i: number) => {
			const capacity = this.shiftsFromDatabase?.find(
				(capacity: Capacity) => capacity?.id == shiftId
			);

			if (capacity) {
				const batchCall = new ODataBatchCall(
					i,
					"delete",
					`\/odata\/Capacities(${capacity?.id})`
				);

				requests.push(batchCall);
			}
		});

		this.selectedCapacities?.forEach((capacity, i) => {
			const isShiftUpdated =
				capacity.start_time !== capacity.shift?.start_time ||
				capacity.end_time !== capacity.shift?.end_time ||
				capacity.break_minutes !== capacity.shift?.break_minutes;

			const payload = {
				capacitable_type: this.sampleCapacity?.capacitable_type,
				capacitable_id: this.sampleCapacity?.capacitable_id,
				date: this.clickedDate,
				shift_id: isShiftUpdated ? null : capacity.shift?.id,
				start_time: this.shiftClass.convertTime(capacity.start_time || '', true),
				end_time: this.shiftClass.convertTime(capacity.end_time || '', true),
				break_minutes: capacity.break_minutes || 0,
				date_to_consider: capacity.shift?.date_to_consider,
			} as any;

			if (capacity.id) {
				payload.id = capacity.id;
			}

			const batchCall = capacity.id
				? new ODataBatchCall(i, "PUT", `\/odata\/Capacities(${capacity.id})`)
				: new ODataBatchCall(i, "POST", `\/odata\/Capacities`);
			batchCall.body = payload;

			requests.push(batchCall);
		});

		this.commonService.post("$batch", { requests }).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this.isLoading = false;
				this.isCapacityChangeDialogOpen = false;

				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				this.refreshTable.emit(this.selectedRow);
			},
			error: error => {
				this.isLoading = false;
				console.log(error);
			},
		});
	}

	getHeaderDateFormat(headerDate: string | null) {
		if (headerDate) {
			const date = new Date(headerDate);
			const options = { year: "numeric", month: "long", day: "2-digit" } as object;
			const formattedDate = date.toLocaleDateString("en-US", options);

			this.selectedDate = formattedDate;
		}
	}

	deleteMultipleShift() {
		this.selectedCapacities = this.selectedCapacities?.filter(
			(capacity: Capacity, index: number) => {
			  if (!this.selectedIndexes?.includes(index)) {
				return true;
			  }
			  
			  if(capacity?.id)this.selectedShiftsForDelete?.push(capacity.id); // Collect the ID of the filtered-out item
			  return false;
			}
		  );

		if (this.childComponent) {
			this.childComponent.isNoDataSelected = true;
			this.getTotalHours();
			this.childComponent?.render();
		}
	}

	closeDialogOverlapped() {
		if (this.overlappedDialog?.elementRef.nativeElement)
			this.overlappedDialog.elementRef.nativeElement.open = false;
	}

	editClick(value: any) {
		this.updateIndex = this.selectedCapacities.findIndex(
			(capacity: Capacity) =>
				capacity.start_time == value.start_time && capacity.end_time == value.end_time
		);

		this.isShiftChangeDialogOpen = true;
		this.selectedShift = new Shift().deserialize(value);

		this.selectedShift.start_time = this.shiftClass.convertTime(this.selectedShift.start_time || '', true)
		this.selectedShift.end_time = this.shiftClass.convertTime(this.selectedShift.end_time || '', true)
	}

	deleteClick(value: any) {
		this.selectedCapacities = this.selectedCapacities?.filter((capacity: Capacity) => {
			const isMatch =
				capacity.start_time === value?.start_time && capacity.end_time === value?.end_time;

			if (isMatch && capacity.id) {
				this.selectedShiftsForDelete?.push(capacity.id);
			}
			return !isMatch;
		});

		if (this.childComponent) {
			this.childComponent.isNoDataSelected = true;
			this.getTotalHours();
			this.childComponent?.render();
		}
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}

		this.onCreateOrUpdate();
	}

	onSubmitShift() {
		(this.form as any).onSubmit(undefined);
	}

	startTimeChange() {
		this.startTimeTimePickerState = ValueState.None;
		this.hours = this.selectedShift.calculateHours();
	}

	endTimeChange() {
		this.endTimeTimePickerState = ValueState.None;
	}

	changeBreakMinutes(e: any) {
		this.selectedShift.break_minutes = e.detail?.value || 0;
	}

	closeSubmitDialog() {
		this.isShiftChangeDialogOpen = false;
	}

	async onCreateOrUpdate() {
		const tempCapacityForCheckOverlapped = this.selectedCapacities.map(
			(capacity: Capacity, index: number) => {
				if (index === this.updateIndex) {
					return this.selectedShift;
				} else return capacity;
			}
		);

		const isOverlapping = new Shift().isDateOverlapped(tempCapacityForCheckOverlapped);

		if (this.canBeSaved() && !isOverlapping) {
			this.selectedCapacities =
				(this.selectedCapacities?.map((capacity: Capacity) => {
					if ((this.selectedShift as Capacity).shift?.id === capacity.shift?.id)
						return this.selectedShift;
					else return capacity;
				}) as Capacity[]) || [];

			this.closeSubmitDialog();
		} else {
			if (this.overlappedDialog?.elementRef.nativeElement)
				this.overlappedDialog.elementRef.nativeElement.open = true;
		}
	}

	canBeSaved() {
		const hours = this.selectedShift?.hours;
		if (hours && hours > 0) {
			return true;
		} else {
			this.startTimeTimePickerState = ValueState.Negative;
			this.endTimeTimePickerState = ValueState.Negative;
			return false;
		}
	}
}
