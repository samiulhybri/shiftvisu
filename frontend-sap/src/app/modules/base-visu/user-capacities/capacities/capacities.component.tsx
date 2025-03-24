import { Component, Input, ViewChild } from "@angular/core";
import { CapacityChangeComponent } from "@app/modules/base-visu/capacity-plan/capacity-change/capacity-change.component";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { WeekDayClass } from "@app/shared/enums/WeekDays";
import { Capacity } from "@app/shared/models/capacity.model";
import { Shift } from "@app/shared/models/shift.model";
import React from "react";
import { Text } from "@ui5/webcomponents-react";
import { CommonService } from "@app/shared/services/common.service";
import ComboBox from "@ui5/webcomponents/dist/ComboBox";
import moment from "moment";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ShiftChangeDateRangeComponent } from "@app/modules/base-visu/user-capacities/shift-change-date-range/shift-change-date-range.component";

@Component({
	selector: "app-capacities",
	templateUrl: "./capacities.component.html",
	styleUrl: "./capacities.component.css",
})
export class CapacitiesComponent {
	@Input() public heightForCalenderEmptyData: any;
	@Input() public heightForRows: any;

	@Input() public set selectedRow(user: any) {
		if (user) this.loadCapacitiesForUser(user);
		else {
			this.capacities = [];
		}
		this.showCapacitiesForUser = user;

		this.selectedUser = this.showCapacitiesForUser?.subRows?.length ? this.showCapacitiesForUser?.subRows?.[0] : this.showCapacitiesForUser;
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("weeklyShiftComponentRef", { static: false }) weeklyShiftComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("capacityChangeComponentRef", { static: false }) capacityChangeComponent:
		| CapacityChangeComponent
		| undefined;

	@ViewChild("capacityChangeDateRangeComponentRef", { static: false })
	capacityChangeDateRangeComponent: ShiftChangeDateRangeComponent | undefined;

	obj = Object;
	showCapacitiesForUser: any | undefined;
	selectedUser: any | undefined;
	isDialogOpenForAddShift = false;
	isInfoDialogOpen = false;
	isCapacityChangeDialogOpen = false;
	year: number = new Date().getFullYear();
	dialogTitleForAddShift = $localize`Add Shift`;
	dialogTitleInfo = $localize`Info`;
	isLoading = false;
	isUpdate = false;
	shiftModels: ShiftModel[] = [];
	weekDays = WeekDayClass.getEnumArray();
	selectedShiftModelForAddShift: ShiftModel | undefined;
	selectedDatesForHolidays: string[] = [];
	selectedWorkingDays: number[] = [];
	capacities: any[] = [];
	isCapacityLoading: boolean = false;
	showPopOver = false;
	opener = "";
	popoverDay = "";
	popoverDate = "";
	possibleHoliday = "";
	possibleWeekDays = "";
	globalSearchValue = "";
	selectedTab: string = "shiftDetailsTab";
	weekdaysInputValue: string = "";
	totalWorkingHourInputValue: string = "";
	showShiftModelDetails: boolean = false;
	isLoadingShiftModelDetails: boolean = false;
	isLoadingShiftModelProcessing: boolean = false;
	sampleCapacity: Capacity | undefined;
	fullYearCapacityHours: number = 0;
	totalVsAppointedRatio: number = 0;
	allProcessedData: any;
	localization = Localization;
	openMenu: boolean = false;

	shiftModelShiftsStructure = [
		{ day: WeekDayClass.getStateTranslate(0), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(1), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(2), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(3), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(4), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(5), rowCount: 0, name: [], breakTime: 0 },
		{ day: WeekDayClass.getStateTranslate(6), rowCount: 0, name: [], breakTime: 0 },
	] as any;
	protected shift = Shift;

	weeklyShiftColumn = [
		{
			Header: $localize`Weekday`,
			accessor: "day",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			maxWidth: 115,
			autoResizable: true,
		},
		{
			Header: $localize`No. of Layers`,
			accessor: "rowCount",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			maxWidth: 115,
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`Shift Names`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original.name;
				let name: any[] = [];
				let text = "";
				rowData.forEach((value: any) => name.push(value));
				let uniqueArray = [...new Set(name)];
				uniqueArray.length
					? (text = `[ ${uniqueArray.join(" , ")} ]`)
					: $localize`No Shift Assigned`;
				return (
					<React.StrictMode>
						<Text>{text}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	months: string[] = [
		$localize`January`,
		$localize`February`,
		$localize`March`,
		$localize`April`,
		$localize`May`,
		$localize`June`,
		$localize`July`,
		$localize`August`,
		$localize`September`,
		$localize`October`,
		$localize`November`,
		$localize`December`,
	];
	maxDays: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

	constructor(
		public commonService: CommonService,
		public authService: AuthService
	) {
		this.loadData();
	}

	loadData() {
		if (this.childComponent) {
			this.childComponent.isBusy = true;
			this.childComponent.render();
		}

		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(0, "get", `\/odata\/ShiftModels`));

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value.map((shiftModel: ShiftModel) => {
					this.shiftModels.push(new ShiftModel().deserialize(shiftModel));
				});
				this.isLoading = false;

				if (this.childComponent) this.childComponent.isBusy = false;
			},
			error: e => {
				this.isLoading = false;
			},
		});
	}

	changeYear(direction: number): void {
		this.year += direction;

		this.capacities = [];
		if (this.showCapacitiesForUser) this.loadCapacitiesForUser(this.showCapacitiesForUser);
	}

	getDaysInMonth(monthIndex: number): number[] {
		const daysInMonth = new Date(this.year, monthIndex + 1, 0).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => i + 1);
	}

	loadCapacitiesForUser(user: any) {
		if (user) {
			this.isCapacityLoading = true;

			this.commonService
				.get(
					`capacity-plan/user/${user?.subRows ? user.subRows?.[0]?.userId : user?.userId}/${this.year}`,
					false
				)
				.subscribe({
					next: (response: any) => {
						if (response?.capacities?.length) {
							this.monthWiseFormat(response?.capacities);
						} else this.capacities = [];
						this.isCapacityLoading = false;
					},
					error: err => {
						this.isCapacityLoading = false;
						console.log(err);
					},
				});
		} else {
			this.capacities = [];
		}
	}

	monthWiseFormat(response: any) {
		this.fullYearCapacityHours = 0;
		this.capacities = response.reduce((acc: any, current: any) => {
			const prevDateFormat = structuredClone(current?.date);
			let capacity = new Capacity().deserialize(current);
			capacity.date = prevDateFormat;

			if (!acc[`${prevDateFormat}`]) {
				acc[`${prevDateFormat}`] = {
					name: prevDateFormat,
					days: [],
					percentage: 0,
					bg: "var(--no-shift-time-color)",
				};
			}

			this.fullYearCapacityHours += capacity.shift?.hours || 0; // calculate full years total shift hours

			acc[`${prevDateFormat}`].days.push(capacity);
			acc[`${prevDateFormat}`].percentage = this.getTotalHoursWithPercentage(
				acc[`${prevDateFormat}`].days
			);
			acc[`${prevDateFormat}`].bg = this.getBackgroundColor(
				acc[`${prevDateFormat}`].percentage
			);

			if (capacity) this.sampleCapacity = capacity;
			return acc;
		}, []);
	}

	onDateClick(day: number, monthIndex: number, year: number) {
		const clickedDate = (`${year}-` +
			`${monthIndex + 1}`.padStart(2, "0") +
			"-" +
			`${day}`.padStart(2, "0")) as any;

		const shiftsOnTheDay = this.capacities[clickedDate]?.days || [];

		if (this.capacityChangeComponent)
			this.capacityChangeComponent.onOpenShiftChangeDialog(
				shiftsOnTheDay,
				true,
				clickedDate,
				this.sampleCapacity
			);
	}

	onMenuOpen() {
		this.openMenu = true;
	}

	onMenuClose() {
		this.openMenu = false;
	}

	onAddShiftModel(isUpdate: boolean) {
		this.isUpdate = isUpdate;

		this.dialogTitleForAddShift =
			(isUpdate ? $localize`Shift Change ` : $localize`Add Shift `) + ` (${this.year})`;
		this.selectedTab = "shiftDetailsTab";
		this.selectedShiftModelForAddShift = undefined;
		this.selectedWorkingDays = [];
		this.possibleHoliday = "";
		this.shiftModels = this.shiftModels.map((model: any) => {
			model.isSelected = false;
			return model;
		});
		const comboBox = document.getElementById("shiftCombobox") as ComboBox;
		comboBox.value = "";
		this.weekDays = this.weekDays.map((weekDay: any) => {
			weekDay.isSelected = false;

			return weekDay;
		});
		this.possibleWeekDays = "";
		this.showShiftModelDetails = false;
		this.selectedDatesForHolidays = [];
		this.isDialogOpenForAddShift = true;
	}

	onAddShiftSave() {
		const usersIds = this.showCapacitiesForUser?.subRows
			? this.showCapacitiesForUser?.subRows.map((row: any) => row.userId)
			: [this.showCapacitiesForUser.userId];

		this.isLoadingShiftModelProcessing = true;
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `capacity-plan/update-capacity`
			: `capacity-plan/create-capacity`;

		const requests = usersIds.map((userId: number) => {
			const payload = {
				year: this.year,
				shift_model_id: this.selectedShiftModelForAddShift,
				holidays: this.selectedDatesForHolidays,
				user_id: userId,
			};

			return this.commonService[method](urlString, payload, false).toPromise();
		});

		Promise.all(requests)
			.then(responses => {
				if (responses.every(response => response.success)) {
					this.loadCapacitiesForUser(this.showCapacitiesForUser);
				}
			})
			.catch(error => {
				console.error("Error in API calls:", error);
			})
			.finally(() => {
				this.isLoadingShiftModelProcessing = false;
				this.isDialogOpenForAddShift = false;
			});
	}

	handleAddShiftClose() {
		this.isDialogOpenForAddShift = false;
	}

	onChangeShiftModel(e: any) {
		const selectedId = e.detail.item.id;
		this.selectedShiftModelForAddShift = this.shiftModels.find(
			(shiftModel: ShiftModel) => shiftModel.id == selectedId
		);
	}

	onPossibleHolidaysAdded(e: any) {
		const regex = /^\d{2}\.\d{2}\.\d{4}$/; // For checking date format
		const selectedDate = e.detail.value;
		const date = new Date(this.parseDate(selectedDate));
		this.possibleHoliday = selectedDate;

		if (
			!isNaN(date.getTime()) &&
			regex.test(selectedDate) &&
			date.getFullYear() === this.year
		) {
			const isExist = this.selectedDatesForHolidays.find(
				(date: string) => date === selectedDate
			);
			if (!isExist) this.selectedDatesForHolidays.unshift(selectedDate);
		}
	}

	getFormattedDate(dateString: string) {
		if (dateString) {
			const [year, month, day] = dateString.split("-");

			return `${day.padStart(2, "0")}.${month.padStart(2, "0")}.${year}`;
		} else {
			return "";
		}
	}

	totalVsAppointedRatioCalculation() {
		const startOfYear = moment(`${this.year}-01-01`).startOf("year");
		const endOfYear = moment(`${this.year}-12-31`).endOf("year");

		// Total days in the year
		const totalDays = endOfYear.diff(startOfYear, "days") + 1;

		// Total hours accounting only for 8 hours per day
		const totalHours = totalDays * 8;

		this.totalVsAppointedRatio =
			parseInt(`${(this.fullYearCapacityHours / totalHours) * 100}`) || 0;
	}

	onDateDelete(e: any) {
		const deletedDate = e.detail.item.id;

		this.selectedDatesForHolidays = this.selectedDatesForHolidays.filter(
			(date: string) => date != deletedDate
		);
	}

	onWeekDaysChange(e: any) {
		this.selectedWorkingDays = e.detail.items?.map((item: any) => parseInt(item.id));

		for (let weekDay of this.weekDays) {
			const index = e.detail.items.findIndex((item: any) => item.id == weekDay.value);
			weekDay.isSelected = index != -1;
		}
	}

	getBackgroundColor(percentage: number): string {
		if (percentage > 0 && percentage <= 25) {
			return "var(--twenty-five-percent-shift-time-color)";
		} else if (percentage > 25 && percentage <= 50) {
			return "var(--fifty-percent-shift-time-color)";
		} else if (percentage > 50 && percentage <= 75) {
			return "var(--seventy-five-percent-shift-time-color)";
		} else if (percentage > 75) {
			return "var(--full-shift-time-color)";
		}

		return "var(--no-shift-time-color)";
	}

	getTotalHoursWithPercentage(capacitiesOnTheDay: Capacity[]) {
		let totalHours = 0;
		capacitiesOnTheDay?.forEach((capacity: Capacity) => {
			totalHours += capacity?.shift?.hours || 0;
		});

		return (totalHours / 8) * 100;
	}

	popOverClose() {
		this.showPopOver = false;
		this.popoverDay = "";
		this.popoverDate = "";
	}

	onMouseEnter(event: any, day: number, monthIndex: number, year: number) {
		this.showPopOver = false;
		this.opener = `${day}-${monthIndex}-${year}`;
		const date = new Date(year, monthIndex, day);
		// Format the date as date.month.year
		const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

		const weekObject = this.weekDays[date.getDay()];
		setTimeout(() => {
			this.showPopOver = true;
			this.popoverDay = weekObject.text;
			this.popoverDate = formattedDate;
		}, 5);
	}

	onMouseLeave() {
		this.showPopOver = false;
		this.popoverDay = "";
		this.popoverDate = "";
	}

	onInfoOpen() {
		this.isInfoDialogOpen = true;
		this.totalVsAppointedRatioCalculation();
	}

	onInfoClose() {
		this.isInfoDialogOpen = false;
	}

	getColor(day: number, monthIndex: number, year: number) {
		const clickedDate = (`${year}-` +
			`${monthIndex + 1}`.padStart(2, "0") +
			"-" +
			`${day}`.padStart(2, "0")) as any;

		return this.capacities[clickedDate]?.bg || "var(--no-shift-time-color)";
	}
	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	onSelectShiftModel(event: any) {
		const selectedShiftModelId = event.detail.item.id;
		this.isLoadingShiftModelDetails = true;
		const url = `ShiftModelShifts?$filter=shift_model_id eq ${selectedShiftModelId}&$expand=shift`;

		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.processDataForWeeklyShift(response.value);
				this.weekdaysInputValue = this.setWeekdaysInputValue(response.value);
				this.calculateTotalDuration(response.value);
				this.isLoadingShiftModelDetails = false;
				this.showShiftModelDetails = true;
				this.selectedShiftModelForAddShift = selectedShiftModelId;
			},
			error: err => {
				console.log(err);
				this.isLoadingShiftModelDetails = false;
				this.showShiftModelDetails = true;
			},
		});
	}

	private setWeekdaysInputValue(shifts: any) {
		let assignedDays: any[] = [];
		for (let shift of shifts) {
			const name = this.weekDays.find(
				(day: any) => day.value === JSON.stringify(shift.day_of_week)
			);
			assignedDays.push(name.text);
		}
		assignedDays = [...new Set(assignedDays)];
		return assignedDays.join(", ");
	}

	processDataForWeeklyShift(data: any) {
		this.shiftModelShiftsStructure.forEach((value: any) => {
			value.rowCount = 0;
			value.name = [];
			value.breakTime = 0;
		});
		data.forEach((day: any) => {
			this.shiftModelShiftsStructure[day.day_of_week].rowCount =
				this.shiftModelShiftsStructure[day.day_of_week].rowCount + 1;
			this.shiftModelShiftsStructure[day.day_of_week].name.push(day.shift.name);
			this.shiftModelShiftsStructure[day.day_of_week].breakTime +=
				day.shift.break_minutes ?? 0;
		});
		setTimeout(() => {
			if (this.weeklyShiftComponent) {
				this.weeklyShiftComponent.data = this.shiftModelShiftsStructure;
				this.weeklyShiftComponent?.render();
			}
		});
	}

	parseDate(dateString: string) {
		const parts = dateString.split(".");
		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10) - 1;
		const year = parseInt(parts[2], 10);
		return new Date(year, month, day);
	}

	calculateDuration(startTime: string, endTime: string): { hours: number; minutes: number } {
		const [startHours, startMinutes, startSeconds] = startTime.split(":").map(Number);
		const [endHours, endMinutes, endSeconds] = endTime.split(":").map(Number);

		const start = new Date();
		const end = new Date();
		start.setHours(startHours, startMinutes, startSeconds, 0);
		end.setHours(endHours, endMinutes, endSeconds, 0);

		if (end < start) {
			end.setDate(end.getDate() + 1);
		}

		const durationMs = end.getTime() - start.getTime();
		const durationMinutes = durationMs / (1000 * 60);
		const hours = Math.floor(durationMinutes / 60);
		const minutes = Math.round(durationMinutes % 60);

		return { hours, minutes };
	}

	calculateTotalDuration(shifts: any) {
		let totalMinutes = 0;
		let totalBreakTime = 0;
		shifts.forEach((shiftData: any) => {
			const { start_time, end_time } = shiftData.shift;
			const { hours, minutes } = this.calculateDuration(start_time, end_time);
			totalMinutes += hours * 60 + minutes;
		});

		this.shiftModelShiftsStructure.forEach((shift: any) => {
			totalBreakTime += shift.breakTime;
		});
		totalMinutes = totalMinutes - totalBreakTime;
		const totalHours = Math.floor(totalMinutes / 60);
		const remainingMinutes = totalMinutes % 60;
		this.totalWorkingHourInputValue = `${totalHours} h ${remainingMinutes} min`;
	}

	onAddShiftChangeDateRange() {
		if (this.capacityChangeDateRangeComponent)
			this.capacityChangeDateRangeComponent.onOpenShiftChangeDialog(this.sampleCapacity);
	}
}
