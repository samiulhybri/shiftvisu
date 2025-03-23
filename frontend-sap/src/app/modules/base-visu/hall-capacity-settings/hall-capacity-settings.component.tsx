import { Component, ViewChild } from "@angular/core";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import React, { useEffect, useState } from "react";
import { Input as UI5Input, TextArea as UI5TextArea } from "@ui5/webcomponents-react";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Hall } from "@app/shared/models/hall.model";
import { HallCapacitySetting } from "@app/shared/models/hall-capacity-setting.model";

@Component({
	selector: "app-hall-capacity-settings",
	templateUrl: "./hall-capacity-settings.component.html",
	styleUrl: "./hall-capacity-settings.component.css",
})
export class HallCapacitySettingsComponent {
	localization = Localization;
	halls: Hall[] = [];
	errorMessage = "";
	isLoading = false;

	@ViewChild("errorDialog", { static: false }) errorDialog: any;

	allHallCapacityValues: any = [];

	constructor(
		public authService: AuthService,
		public commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.loadAllData();
	}

	columns = [
		{
			Header: $localize`Hall`,
			accessor: "hall.name",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Usage`,
			accessor: "machine_usage",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const weekNumber = this.getCurrentWeekInfo(row.original.date).weekNumber;
				const weekIndex = this.allHallCapacityValues.findIndex(
					(value: any) => value.week == weekNumber
				);

				const [valueState, setValueState] = useState(
					this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.machine_usage >= 0 &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.machine_usage !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.machine_usage !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.machine_usage !== ""
						? ValueState.None
						: ValueState.Negative
				);

				useEffect(() => {
					
					setValueState(
						 (this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.machine_usage ?? -1) >=
							0  &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.machine_usage !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.machine_usage !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.machine_usage !== ""
							? ValueState.None
							: ValueState.Negative
					);
				}, [this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.machine_usage]);

				return (
					<React.StrictMode>
						<UI5TextArea
							rows={1}
							growing={false}
							className="w-full"
							onKeyDown={(e: any) => this.preventEnterKey(e)}
							value={
								this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
									?.machine_usage
							}
							onInput={(e: any) => this.handleInputChange(
								e,
								weekIndex,
								row.index,
								"machine_usage",
								setValueState,
								this.allHallCapacityValues
							)}
							valueState={valueState}
							placeholder={$localize`Enter Machine Usage`}
						/>
						<span className="ml-2">%</span>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Employee Usage`,
			accessor: "employee_usage",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const weekNumber = this.getCurrentWeekInfo(row.original.date).weekNumber;
				const weekIndex = this.allHallCapacityValues.findIndex(
					(value: any) => value.week == weekNumber
				);

				const [valueState, setValueState] = useState(
					this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.employee_usage >= 0
						? ValueState.None
						: ValueState.Negative
				);

				useEffect(() => {
					setValueState(
						(this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.employee_usage ?? -1) >= 0 &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.employee_usage !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.employee_usage !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.employee_usage !== ""
							? ValueState.None
							: ValueState.Negative
					);
				}, [this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.employee_usage]);

				return (
					<React.StrictMode>
						<UI5TextArea
							rows={1}
							growing={false}
							className="w-full"
							onKeyDown={(e: any) => this.preventEnterKey(e)}
							value={
								this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
									?.employee_usage
							}
							onInput={(e: any) => this.handleInputChange(
								e,
								weekIndex,
								row.index,
								"employee_usage",
								setValueState,
								this.allHallCapacityValues
							)}
							valueState={valueState}
							placeholder={$localize`Enter Employee Usage`}
						/>
						<span className="ml-2">%</span>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Overtime Factor`,
			accessor: "overtime_factor",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const weekNumber = this.getCurrentWeekInfo(row.original.date).weekNumber;
				const weekIndex = this.allHallCapacityValues.findIndex(
					(value: any) => value.week == weekNumber
				);

				const [valueState, setValueState] = useState(
					(this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.overtime_factor) >= 0
						? ValueState.None
						: ValueState.Negative
				);

				useEffect(() => {
					setValueState(
						(this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.overtime_factor ?? -1) >= 0 &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.overtime_factor !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.overtime_factor !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.overtime_factor !== ""
							? ValueState.None
							: ValueState.Negative
					);
				}, [this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.overtime_factor]);

				return (
					<React.StrictMode>
						<UI5TextArea
							rows={1}
							growing={false}
							className="w-full"
							onKeyDown={(e: any) => this.preventEnterKey(e)}
							value={
								this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
									?.overtime_factor
							}
							onInput={(e: any) => this.handleInputChange(
								e,
								weekIndex,
								row.index,
								"overtime_factor",
								setValueState,
								this.allHallCapacityValues
							)}
							valueState={valueState}
							placeholder={$localize`Enter Overtime Factor`}
						/>
						<span className="ml-2">%</span>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Distribution Factor`,
			accessor: "distribution_factor",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const weekNumber = this.getCurrentWeekInfo(row.original.date).weekNumber;
				const weekIndex = this.allHallCapacityValues.findIndex(
					(value: any) => value.week == weekNumber
				);

				const [valueState, setValueState] = useState(
					this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
						?.distribution_factor >= 0
						? ValueState.None
						: ValueState.Negative
				);

				useEffect(() => {
					setValueState(
						(this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.distribution_factor ?? -1) >= 0 &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.distribution_factor !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.distribution_factor !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.distribution_factor !== ""
							? ValueState.None
							: ValueState.Negative
					);
				}, [
					this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.distribution_factor,
				]);

				return (
					<React.StrictMode>
						<UI5TextArea
							rows={1}
							growing={false}
							className="w-full"
							onKeyDown={(e: any) => this.preventEnterKey(e)}
							value={
								this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
									?.distribution_factor
							}
							onInput={(e: any) => this.handleInputChange(
								e,
								weekIndex,
								row.index,
								"distribution_factor",
								setValueState,
								this.allHallCapacityValues
							)}
							valueState={valueState}
							placeholder={$localize`Enter Distribution Factor`}
						/>
						<span className="ml-2">%</span>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Additional Hours`,
			accessor: "additional_hours",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;

				const weekNumber = this.getCurrentWeekInfo(row.original.date).weekNumber;
				const weekIndex = this.allHallCapacityValues.findIndex(
					(value: any) => value.week == weekNumber
				);

				const [valueState, setValueState] = useState(
					this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.additional_hours !==
						null &&
						this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.additional_hours !== undefined &&
						this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.additional_hours !== ""
						? ValueState.None
						: ValueState.Negative
				);				

				useEffect(() => {
					setValueState(
						this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.additional_hours !== null &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.additional_hours !== undefined &&
							this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
								?.additional_hours !== "" &&
							(this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
							?.additional_hours ?? -1) >= 0
							? ValueState.None
							: ValueState.Negative
					);
				}, [this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]?.additional_hours]);

				return (
					<React.StrictMode>
						<UI5TextArea
							rows={1}
							growing={false}
							className="w-full"
							onKeyDown={(e: any) => this.preventEnterKey(e)}
							value={
								this.allHallCapacityValues?.[weekIndex]?.data?.[row.index]
									?.additional_hours
							}
							onInput={(e: any) => this.handleInputChange(
								e,
								weekIndex,
								row.index,
								"additional_hours",
								setValueState,
								this.allHallCapacityValues
							)}
							valueState={valueState}
							placeholder={$localize`Enter Additional Hours`}
						/>
					</React.StrictMode>
				);
			},
		},
	];
	
	preventEnterKey (e: KeyboardEvent){
		e.stopPropagation();
		if (e.key === "Enter") {
			e.preventDefault();
		}
	};

	
	handleInputChange = (
		e: any,
		weekIndex: number,
		rowIndex: number,
		field: any,
		setValueState: React.Dispatch<React.SetStateAction<ValueState>>,
		allHallCapacityValues: any
	) => {
		const newValue = e.target.value.trim();
		const isValidNumber = /^[-+]?\d*(\.\d+)?$/.test(newValue) && /^[0-9.+-]+$/.test(newValue);

		if (isValidNumber) {
			setValueState(ValueState.None);
			allHallCapacityValues[weekIndex].data[rowIndex][field] = parseFloat(newValue);
		} else {
			setValueState(ValueState.Negative);
			allHallCapacityValues[weekIndex].data[rowIndex][field] = newValue;
		}
	};

	onAddClick() {
		const hallEntries: any = [];
		let year = new Date().getFullYear();
		let weekNumber =
			this.allHallCapacityValues[this.allHallCapacityValues.length - 1]?.week + 1;

		if (this.allHallCapacityValues[this.allHallCapacityValues.length - 1]?.data?.length) {
			const lastHallCapacityDate =
				this.allHallCapacityValues[this.allHallCapacityValues.length - 1].data[0]?.date;

			year = new Date(lastHallCapacityDate).getFullYear();

			if (weekNumber > 52) {
				weekNumber = 1;
				year++;
			}
		}

		this.halls.forEach((hall: Hall) => {
			let hallCapacitySetting = undefined;

			if(this.allHallCapacityValues?.[this.allHallCapacityValues?.length - 1]){
				let isExisteddata = this.allHallCapacityValues[this.allHallCapacityValues.length - 1].data.find((data:any)=> data?.hall?.id == hall?.id);
				
				if(isExisteddata) {
					hallCapacitySetting = structuredClone(isExisteddata)
					hallCapacitySetting.id = undefined;
				}
			}

			if(!hallCapacitySetting) hallCapacitySetting = new HallCapacitySetting().deserialize({ hall: hall });

			hallEntries.push({
				...hallCapacitySetting,
				date: this.getDateFromWeekNumber(year, weekNumber),
			} as any);
		});

		this.allHallCapacityValues.push({
			week: weekNumber,
			data: hallEntries,
		});
	}

	onSave() {
		if (this.canBeSaved()) {
			this.isLoading = true;

			let requests: ODataBatchCall[] = [];
			this.allHallCapacityValues.forEach((weeklyData: any) => {
				weeklyData.data.forEach(
					(hallCapacitySetting: HallCapacitySetting, index: number) => {
						const request = hallCapacitySetting?.id
							? new ODataBatchCall(
									index,
									"patch",
									`\/odata\/HallCapacitySettings(${hallCapacitySetting?.id})`
								)
							: new ODataBatchCall(index, "post", `\/odata\/HallCapacitySettings`);

						const deserializedData = new HallCapacitySetting().deserialize(
							hallCapacitySetting
						);
						const payload = deserializedData.toOdata();

						request.body = payload;

						requests.push(request);
					}
				);
			});

			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					const { recordSavedSuccessfully } = Localization;
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");

					this.isLoading = false;
					this.loadAllData();
				},
				error: err => {
					console.log(err);
					this.isLoading = false;
				},
			});
		} else {
			this.errorMessage = $localize`Values are not valid!`;
			this.isLoading = false;
			this.errorDialog.elementRef.nativeElement.open = true;
		}
	}

	closeErrorDialog() {
		this.errorDialog.elementRef.nativeElement.open = false;
	}

	canBeSaved(): boolean {
		return this.allHallCapacityValues.every((weeklyData: any) =>
			weeklyData.data.every(
				(hallCapacitySetting: HallCapacitySetting) =>
					hallCapacitySetting &&
					typeof hallCapacitySetting.distribution_factor === "number" &&
					hallCapacitySetting.distribution_factor >= 0 &&
					typeof hallCapacitySetting.employee_usage === "number" &&
					hallCapacitySetting.employee_usage >= 0 &&
					typeof hallCapacitySetting.machine_usage === "number" &&
					hallCapacitySetting.machine_usage >= 0 &&
					typeof hallCapacitySetting.overtime_factor === "number" &&
					hallCapacitySetting.overtime_factor >= 0 &&
					typeof hallCapacitySetting.additional_hours === "number"
			)
		);
	}

	loadAllData() {
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];
		const weekInfo = this.getCurrentWeekInfo();
		const dataTime = weekInfo.firstDateOfWeek?.toISOString()?.split("T")?.[0] + " 00:00:00";

		requests.push(
			new ODataBatchCall(0, "get", `\/odata\/Halls?$filter=is_enabled_plan_visu eq true`),
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/HallCapacitySettings?$expand=hall&$filter=date ge '${dataTime}'`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				this.halls = res?.responses?.[0]?.body?.value;

				this.processHallCapacity(res?.responses?.[1]?.body?.value || []);
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	getCurrentWeekInfo(date?: string): { weekNumber: number; firstDateOfWeek: Date } {
		const now = date ? new Date(date || "") : new Date();

		const dayOfWeek = (now.getDay() + 6) % 7; // Get the day of the week (adjusted to Monday = 0, Sunday = 6)
		const diffToMonday = -dayOfWeek; // Calculate how many days to subtract to get back to Monday

		// Calculate the first date of the week
		const firstDateOfWeek = new Date(now);
		firstDateOfWeek.setDate(now.getDate() + diffToMonday);

		// Calculate the week number
		const jan1 = new Date(now.getFullYear(), 0, 1);
		const jan1DayOfWeek = (jan1.getDay() + 6) % 7; // Adjust Jan 1 to Monday-start week
		const dayOfYear = Math.floor((now.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)) + 1;
		const weekNumber = Math.ceil((dayOfYear + jan1DayOfWeek) / 7);

		return { weekNumber, firstDateOfWeek };
	}

	processHallCapacity(hallCapacitySettings: HallCapacitySetting[]) {
		const grouped: { [weekNumber: number]: HallCapacitySetting[] } = {};
		let year = new Date().getFullYear();

		if (hallCapacitySettings.length) {
			hallCapacitySettings.forEach(item => {
				const date = new Date(item?.date || "");

				const dayOfWeek = (date.getDay() + 6) % 7; // Adjust the week to start on Monday (Monday = 0)
				const mondayOfWeek = new Date(date);
				mondayOfWeek.setDate(date.getDate() - dayOfWeek);

				year = date.getFullYear();

				// Calculate the ISO week number
				const jan1 = new Date(date.getFullYear(), 0, 1);
				const jan1DayOfWeek = (jan1.getDay() + 6) % 7;
				const dayOfYear =
					Math.floor((date.getTime() - jan1.getTime()) / (24 * 60 * 60 * 1000)) + 1;
				const weekNumber = Math.ceil((dayOfYear + jan1DayOfWeek) / 7);

				if (!grouped[weekNumber]) {
					grouped[weekNumber] = [];
				}

				grouped[weekNumber].push(item);
			});
		} else {
			const weekInfo = this.getCurrentWeekInfo();

			grouped[weekInfo.weekNumber] = [];
		}

		const weekWiseData = Object.entries(grouped).map(([week, weekData]) => ({
			week: parseInt(week, 10),
			data: weekData || [],
		}));

		//Add missing halls
		weekWiseData.forEach((weekData: any, index: number) => {
			this.halls.forEach((hall: Hall) => {
				const isExist = weekData?.data?.find((data: any) => data?.hall?.id == hall?.id);

				const hallCapacitySetting = new HallCapacitySetting().deserialize({ hall: hall });
				if (!isExist) {
					if (weekWiseData[index]?.data?.[0]) {
						const date = new Date(weekWiseData[index].data?.[0]?.date || "");
						year = date?.getFullYear() ?? year;
					}

					weekWiseData[index].data.push({
						...hallCapacitySetting,
						date: this.getDateFromWeekNumber(year, weekData.week),
					} as any);
				}
			});
		});

		this.allHallCapacityValues = weekWiseData;
	}

	getDateFromWeekNumber(year: number, weekNumber: number): Date {
		const jan1 = new Date(year, 0, 1, 12, 0, 0);

		// Find the first Monday of the year
		const dayOfWeek = jan1.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		const firstMondayOffset = dayOfWeek === 1 ? 0 : dayOfWeek === 0 ? 1 : 8 - dayOfWeek;

		const firstMonday = new Date(year, 0, 1 + firstMondayOffset, 12, 0, 0); // Move to the first Monday

		// Calculate the Monday of the given week number
		const startDate = new Date(firstMonday);
		startDate.setDate(firstMonday.getDate() + (weekNumber - 2) * 7);

		return startDate;
	}
}
