import { Component, HostListener, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { WeekDayClass } from "@app/shared/enums/WeekDays";
import { Hall } from "@app/shared/models/hall.model";
import { Machine } from "@app/shared/models/machine.model";
import { Shift } from "@app/shared/models/shift.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { CommonService } from "@app/shared/services/common.service";
import { CapacityChangeComponent } from "@app/modules/base-visu/capacity-plan/capacity-change/capacity-change.component";
import moment from "moment";
import { Capacity } from "@app/shared/models/capacity.model";
import React from "react";
import { Text } from "@ui5/webcomponents-react";
import ComboBox from "@ui5/webcomponents/dist/ComboBox";
import { Localization } from "@app/shared/utils/common-localize";
import { AuthService } from "@app/shared/services/auth.service";
import { PlantsService } from "@app/shared/services/plants.service";

@Component({
	selector: "app-capacity-plan",
	templateUrl: "./capacity-plan.component.html",
	styleUrl: "./capacity-plan.component.css",
})
export class CapacityPlanComponent {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("weeklyShiftComponentRef", { static: false }) weeklyShiftComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("capacityChangeComponentRef", { static: false }) capacityChangeComponent:
		| CapacityChangeComponent
		| undefined;

	@ViewChild("errorDialogCapacities", { static: false }) errorDialogCapacities: any;
	obj = Object;
	selectedRow: any;
	heightForCalender = 400;
	heightForMachineTree = 344;
	heightForCalenderEmptyData = 400;
	heightForRows = 30;
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
	isCompactHeight: boolean = false;
	localization = Localization;
	sampleCapacity: Capacity | undefined;
	fullYearCapacityHours: number = 0;
	totalVsAppointedRatio: number = 0;
	allProcessedData: any;
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
	plantId?: number;

	column = [
		{
			Header: $localize`Hall`,
			accessor: "hallName",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["hallName", "hallCustomId"],
			autoResizable: true,
		},
		{
			Header: $localize`Machine`,
			accessor: "machineCustomId",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["machineName", "machineCustomId"],
			autoResizable: true,
		},
	];

	weeklyShiftColumn = [
		{
			Header: $localize`Weekday`,
			accessor: "day",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			maxWidth: 115,
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
		},
		{
			Header: $localize`Shift Names`,
			accessor: "name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
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
		public authService: AuthService,
		plantService: PlantsService
	) {
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {				
				this.plantId = plantId;
			}
		});
		this.loadData();
		this.calculateHeightForCalenders();
	}

	calculateHeightForCalenders() {
		const usableHeight = window.innerHeight - 74;
		this.isCompactHeight = usableHeight < 1000;

		this.heightForMachineTree = this.isCompactHeight
			? (30 / 100) * usableHeight
			: (35 / 100) * usableHeight;

		this.heightForCalender = this.isCompactHeight
			? (70 / 100) * usableHeight + 150
			: (65 / 100) * usableHeight;
		this.heightForCalenderEmptyData = this.heightForCalender - 35;
		this.heightForRows = this.heightForCalenderEmptyData / (this.isCompactHeight ? 18 : 14);
	}

	@HostListener("window:resize", ["$event"])
	onResize() {
		this.calculateHeightForCalenders();
	}

	changeYear(direction: number): void {
		this.year += direction;

		this.capacities = [];
		if (this.selectedRow) this.loadCapacitiesForHallOrMachine(this.selectedRow);
	}

	getDaysInMonth(monthIndex: number): number[] {
		const daysInMonth = new Date(this.year, monthIndex + 1, 0).getDate();
		return Array.from({ length: daysInMonth }, (_, i) => i + 1);
	}

	loadData() {
		if (this.childComponent) {
			this.childComponent.isBusy = true;
			this.childComponent.render();
		}

		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(0, "get", `\/odata\/ShiftModels`),
			new ODataBatchCall(1, "get", `\/odata\/Halls?$filter=is_active eq true&$expand=machines($filter=plant_id eq ${this.plantId})&$top=1000`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value.map((shiftModel: ShiftModel) => {
					this.shiftModels.push(new ShiftModel().deserialize(shiftModel));
				});
				this.isLoading = false;
				this.column[0].Header = $localize`Hall (${response.responses[1]?.body?.value.length})`;
				if (this.childComponent) {
					this.childComponent.isBusy = false;
					this.childComponent.ngOnChanges();
				} 
				this.processData(response.responses[1]?.body?.value);
			},
			error: e => {
				this.isLoading = false;
			},
		});
	}

	processData(data: any) {
		let processedData: any[] = [];

		if (data.length) {
			data.forEach((hall: Hall) => {
				const parentData: any = {
					hallId: hall.id,
					hallCustomId: hall.custom_id,
					hallName: hall.name,
					hallIs_active: hall.is_active,
					machineId: undefined,
					machineCustomId: undefined,
					machineIsActive: false,
					subRows: [],
				};

				hall.machines?.forEach((machine: Machine) => {
					const childData = {
						hallId: undefined, // For make column empty for childs
						hallCustomId: undefined, // For make column empty for childs
						hallName: undefined, // For make column empty for childs
						hallIs_active: hall.is_active,
						machineId: machine.id,
						machineCustomId: machine.custom_id,
						machineName: machine.name,
						machineIsActive: false,
					};

					parentData.subRows.push(childData);
				});

				processedData.push(parentData);
			});
		}

		this.allProcessedData = structuredClone(processedData);
		if (this.childComponent) {
			this.childComponent.data = processedData;
			this.childComponent.selectedRowsId = { 0: true };
			this.selectedRow = processedData[0];
			this.loadCapacitiesForHallOrMachine(processedData[0]);
			this.childComponent.render();
		}
	}

	onGlobalSearch(e: any) {
		// Trim and convert the search value to lowercase
		this.globalSearchValue = e.target.typedInValue;
		const trimmedValue = this.globalSearchValue.trim().toLowerCase();

		// If there is a search term, filter the data
		const filteredValues = trimmedValue
			? (this.allProcessedData
					.map((hall: any) => {
						// Convert the hallName to lowercase and check if it matches the search term
						const isParentMatch = hall.hallName.toLowerCase().includes(trimmedValue) || hall.hallCustomId.toLowerCase().includes(trimmedValue);

						// Filter subRows based on the search term, converting to lowercase for comparison
						const filteredSubRows = hall.subRows.filter(
							(subRow: any) =>
								subRow.machineName.toLowerCase().includes(trimmedValue) ||
								subRow.machineCustomId.toLowerCase().includes(trimmedValue)
						);

						// If the parent matches, include all subRows; otherwise, include only the matching subRows
						if (isParentMatch || filteredSubRows.length > 0) {
							return {
								...hall,
								subRows: isParentMatch ? hall.subRows : filteredSubRows,
							};
						}

						// If nothing matches, return null
						return null;
					})
					.filter((hall: any) => hall !== null) as Hall[])
			: this.allProcessedData; // If no search term, return all data

		if (this.childComponent) {
			this.childComponent.data = filteredValues;
			this.childComponent.selectedRowsId = { 0: true };
			this.selectedRow = filteredValues?.[0] || {};

			if (filteredValues?.[0]) {
				this.loadCapacitiesForHallOrMachine(filteredValues[0]);
			}
			this.childComponent.render();
		}
	}

	onRowSelectionChange(e: any) {
		const data = e.detail.row.original;
		this.selectedRow = data;

		if (data) this.loadCapacitiesForHallOrMachine(data);
	}

	loadCapacitiesForHallOrMachine(data: any) {
		if (data) {
			this.isCapacityLoading = true;
			const isHall = data?.subRows != undefined;
			const id = isHall ? data.hallId : data.machineId;
			const type = isHall ? "hall" : "machine";

			this.commonService.get(`capacity-plan/${type}/${id}/${this.year}`, false).subscribe({
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
		const payload = {
			year: this.year,
			shift_model_id: this.selectedShiftModelForAddShift,
			hall_id: this.selectedRow.hallId,
			holidays: this.selectedDatesForHolidays,
			machine_id: this.selectedRow.machineId,
		};
		this.isLoadingShiftModelProcessing = true;
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `capacity-plan/update-capacity`
			: `capacity-plan/create-capacity`;

		this.commonService[method](urlString, payload, false).subscribe({
			next: (response: any) => {
				if (response.success) {
					this.loadCapacitiesForHallOrMachine(this.selectedRow);
					this.isLoadingShiftModelProcessing = false;
					this.isDialogOpenForAddShift = false;
				}
			},
			error: (error: any) => {
				this.isDialogOpenForAddShift = true;
				this.isLoadingShiftModelProcessing = false;
				this.errorDialogCapacities.elementRef.nativeElement.open = true;
			},
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

		// Calculate the total number of hours in the year
		const totalHours = endOfYear.diff(startOfYear, "hours");

		this.totalVsAppointedRatio =
			parseInt(`${(this.fullYearCapacityHours / totalHours) * 100}`) || 0;
	}

	onDateDelete(e: any) {
		const deletedDate = e.detail.item.id;

		this.selectedDatesForHolidays = this.selectedDatesForHolidays.filter(
			(date: string) => date != deletedDate
		);
	}

	closeErrorDialog() {
		this.errorDialogCapacities.elementRef.nativeElement.open = false;
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
		} else if (percentage > 75 && percentage <= 100) {
			return "var(--full-shift-time-color)";
		}

		return "var(--no-shift-time-color)";
	}

	getTotalHoursWithPercentage(capacitiesOnTheDay: Capacity[]) {
		let totalHours = 0;
		capacitiesOnTheDay?.forEach((capacity: Capacity) => {
			totalHours += capacity?.shift?.hours || 0;
		});

		return (totalHours / 24) * 100;
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
}
