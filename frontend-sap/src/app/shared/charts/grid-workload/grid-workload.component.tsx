import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
	ViewChild,
} from "@angular/core";
import { PlanVisuService } from "@app/modules/planvisu/services/plan-visu.service";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ReportValueEnum } from "@app/shared/enums/ReportFormatter";
import { ReportType } from "@app/shared/enums/ReportType";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { WeekGeneratorService } from "@app/shared/utils/week-generator";
import { Button, FlexBox, FlexBoxDirection, Link, Text } from "@ui5/webcomponents-react";
import React from "react";

@Component({
	selector: "app-grid-workload",
	templateUrl: "./grid-workload.component.html",
	styleUrl: "./grid-workload.component.css",
})
export class GridWorkloadComponent implements OnInit {
	@Input() demandsData?: any[] = [];
	@Input() capacityData?: any[] = [];
	@Input() capacitySettings?: any[] = [];
	@Input() startDate: Date = new Date();
	@Input() endDate: Date = new Date("2025-02-17");
	@Input() gridTitle: String = "Machine group";
	@Input() dataField: String = "machine";
	@Input() reportType: String = "";
	@Input() valueFormatType: String = ReportValueEnum.PERCENT_VALUE;
	@Input() utilizationPercentage: Number = 100;
	@Input() employeeWorkloadDivider: Number = 40;
	@Input() accessorKey: string = "hall_name";
	shouldBeSelected = false;
	weekListWidth: number = 104;

	@Output() totalMachineEvent: EventEmitter<number> = new EventEmitter();

	@ViewChild("gridTable", { static: false }) gridTable: CustomReactGridTable | undefined;

	showPopOver = false;
	opener = "";
	selectedDetails: {
		name?: string;
		demand_without_calculation?: number;
		demand_after_calculation?: number;
		capacity_without_calculation?: number;
		capacity_after_calculation?: number;
		machine_usage?: number;
		employee_usage?: number;
		overtime_factor?: number;
		distribution_factor?: number;
		additional_hours?: number;
	} | null = null;

	Columns: any = [];
	gridData: any = [];
	weeksList: { Year: number; Week: number; YearWeek: string }[] = [];
	title: String;
	selectedMachine: string = "";
	rangeList: ChartRangeList[] = [];

	constructor(
		public weekService: WeekGeneratorService,
		private cdr: ChangeDetectorRef,
		private planVisuService: PlanVisuService
	) {
		this.title = this.gridTitle;
	}

	initializeColumns() {
		this.Columns = [
			{
				Header: () => (
					<FlexBox
						direction={FlexBoxDirection.Column}
						className="cursor-pointer h-full w-full"
						onClick={() => this.handleHeaderClick()}>
						<Text className="font-bold">{this.gridTitle}</Text>
					</FlexBox>
				),
				accessor: "name",
				isSelected: true,
				hAlign: "Left",
				disableFilters: false,
				disableGroupBy: true,
				width: 332,
				Cell: (instance: any) => {
					const rowData = instance.row.original;
					const index = instance.row.index;
					return (
						<React.StrictMode>
							<FlexBox
								id={instance.row.original.name}
								className="h-full w-full cursor-pointer"
								justifyContent="Center"
								alignItems="Center"
								onClick={() => {
									this.showPopOver = false;
									this.opener = instance.row.original.name;
									setTimeout(() => {
										if (this.selectedMachine == rowData?.name) {
											this.shouldBeSelected = !this.shouldBeSelected;
										} else {
											this.shouldBeSelected = true;
										}

										this.selectedMachine =
											this.selectedMachine === rowData?.name
												? null
												: rowData?.name;

										if (!this.shouldBeSelected) {
											const elements =
												document.querySelectorAll("[tabindex]");

											elements.forEach(element => {
												element.removeAttribute("tabindex");
											});
										}

										this.handleFirstColumnClick(rowData?.name, index);
									}, 50);
								}}>
								<Text
									className="block max-w-[300px] truncate w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
									title={instance.row.original.name} // Show full text on hover
								>
									{instance.row.original.name}
								</Text>
							</FlexBox>
						</React.StrictMode>
					);
				},
			},
		];
		this.weeksList.forEach((yearWeek: any, index: number) => {
			this.Columns.push({
				Header: yearWeek.YearWeek,
				accessor: `${yearWeek.YearWeek}`,
				isSelected: true,
				hAlign: "Center",
				disableFilters: true,
				disableGroupBy: true,
				width: this.weekListWidth,
				Cell: (instance: any) => {
					const yearwk = yearWeek.YearWeek;
					const rowData = instance.row.original;
					const cellData = rowData?.[yearwk];
					let clickTimeout: NodeJS.Timeout;
					return (
						<React.StrictMode>
							<FlexBox
								id={instance.row.original.name + yearwk + this.gridTitle}
								className="w-full justify-center cursor-pointer"
								onClick={() => {
									clickTimeout = setTimeout(() => {
										this.handleCellClick(
											rowData?.name,
											yearwk,
											instance.row.original.name + yearwk + this.gridTitle
										);
									}, 250); // Delay to detect double-click
								}}
								onDoubleClick={() => {
									clearTimeout(clickTimeout); // Prevent single-click execution
									/* if (this.reportType === ReportType.MACHINE_WORKLOAD) {
										this.selectedMachine =
											this.selectedMachine === rowData?.name
												? null
												: rowData?.name;
										this.handleCellDoubleClick(rowData?.name);
									} */
								}}>
								<Text className="w-full text-center cursor-pointer">
									{cellData}
								</Text>
							</FlexBox>
						</React.StrictMode>
					);
				},
			});
		});
	}

	ngOnInit() {
		this.selectedMachine = "";
		this.weekListWidth = this.getValueBasedOnWidth(window.innerWidth);
	}

	getValueBasedOnWidth(width: number): number {
		if (width >= 2560) {
			return 158;
		} else if (width >= 1920) {
			return 104;
		} else if (width >= 1536) {
			return 71;
		}
		return 50; // Default value if the width is smaller than 1536
	}

	handleHeaderClick() {
		this.planVisuService.thresholdValue = 60;
		this.shouldBeSelected = false;
		this.selectedMachine = "";
		if (this.gridTable) {
			this.gridTable.selectedRowsId = { [-1]: false };
		}

		this.planVisuService.machineWorkloadDetails = {};
		this.prepareGridData();
		this.initializeColumns();
		this.cdr.detectChanges();
	}

	handleFirstColumnClick(filterKey: string, index: number) {
		let data = this.prepareGridData();
		this.gridData = data;

		let value = 60;

		const foundElement = this.capacityData?.find(
			(element: any) => element.machine_name === filterKey
		);

		if (foundElement) {
			if (this.shouldBeSelected) {
				value = foundElement.usage_factor;
			}
		}

		this.planVisuService.thresholdValue = value;

		this.initializeColumns();
		this.cdr.detectChanges();

		// Reset selectedDetails to ensure clean data on each click
		this.selectedDetails = {
			name: filterKey,
			demand_without_calculation: undefined,
			demand_after_calculation: undefined,
			capacity_without_calculation: undefined,
			capacity_after_calculation: undefined,
			machine_usage: undefined,
			employee_usage: undefined,
			overtime_factor: undefined,
			distribution_factor: undefined,
			additional_hours: undefined,
		};

		// Extract data from demandsData

		// Extract matching demands
		const matchingDemands =
			this.demandsData?.filter(element => element[this.accessorKey] === filterKey) || [];

		if (matchingDemands.length > 0) {
			this.selectedDetails.demand_without_calculation = Number(
				matchingDemands
					.reduce((sum, item) => sum + Number(item.actual_hours_demand), 0)
					.toFixed(2)
			);
			this.selectedDetails.demand_after_calculation = Number(
				matchingDemands.reduce((sum, item) => sum + Number(item.hours_demand), 0).toFixed(2)
			);
		}

		// Extract matching capacities
		const matchingCapacities =
			this.capacityData?.filter(element => element[this.accessorKey] === filterKey) || [];

		if (matchingCapacities.length > 0) {
			this.selectedDetails.capacity_without_calculation = Number(
				matchingCapacities
					.reduce((sum, item) => sum + Number(item.actual_hours_capacity), 0)
					.toFixed(2)
			);
			this.selectedDetails.capacity_after_calculation = Number(
				matchingCapacities
					.reduce((sum, item) => sum + Number(item.hours_capacity), 0)
					.toFixed(2)
			);
		}

		// Extract matching capacity settings
		const matchingSettings = this.capacitySettings?.find(
			element => element[this.accessorKey] === filterKey
		);

		if (matchingSettings) {
			this.selectedDetails.additional_hours = matchingSettings.additional_hours;
			this.selectedDetails.distribution_factor = matchingSettings.distribution_factor;
			this.selectedDetails.employee_usage = matchingSettings.employee_usage;
			this.selectedDetails.machine_usage = matchingSettings.machine_usage;
			this.selectedDetails.overtime_factor = matchingSettings.overtime_factor;
		}

		// Show the popover after a brief delay
		this.showPopOver = false;

		// Check if there's any valid data in selectedDetails
		let details = Object.values(this.selectedDetails).some(value => value !== undefined)
			? this.selectedDetails
			: null;

		if (this.selectedMachine) {
			this.planVisuService.machineWorkloadDetails = details;
		} else {
			this.planVisuService.machineWorkloadDetails = {};
		}

		if (this.gridTable) {
			if (this.shouldBeSelected) {
				this.gridTable.selectedRowsId = { [index]: true };
			}
		}
		return details;
	}

	handleCellDoubleClick(machine: string) {
		let data = this.prepareGridData();
		this.gridData = data;
		this.initializeColumns();
		this.cdr.detectChanges(); // Force Angular to detect changes
	}

	handleCellClick(filterKey: string, week: string, id: string) {
		// Reset selectedDetails to ensure clean data on each click
		this.selectedDetails = {
			demand_without_calculation: undefined,
			demand_after_calculation: undefined,
			capacity_without_calculation: undefined,
			capacity_after_calculation: undefined,
			machine_usage: undefined,
			employee_usage: undefined,
			overtime_factor: undefined,
			distribution_factor: undefined,
			additional_hours: undefined,
		};

		// Hide the machine details on Week-Columns
		this.planVisuService.machineWorkloadDetails = {};

		// Extract data from demandsData

		const demand = this.demandsData?.find(
			element => element.year_week_combo === week && element[this.accessorKey] === filterKey
		);

		if (demand) {
			this.selectedDetails.demand_without_calculation = Number(
				Number(demand.actual_hours_demand).toFixed(2)
			);
			this.selectedDetails.demand_after_calculation = Number(
				Number(demand.hours_demand).toFixed(2)
			);
		}

		// Extract data from capacityData
		const capacity = this.capacityData?.find(
			element => element.year_week_combo === week && element[this.accessorKey] === filterKey
		);
		if (capacity) {
			this.selectedDetails.capacity_without_calculation = capacity.actual_hours_capacity;
			this.selectedDetails.capacity_after_calculation = Number(
				Number(capacity.hours_capacity).toFixed(2)
			);
		}

		// Extract data from capacitySettings
		const settings = this.capacitySettings?.find(
			element => element.year_week_combo === week && element[this.accessorKey] === filterKey
		);
		if (settings) {
			this.selectedDetails.additional_hours = settings.additional_hours;
			this.selectedDetails.distribution_factor = settings.distribution_factor;
			this.selectedDetails.employee_usage = settings.employee_usage;
			this.selectedDetails.machine_usage = settings.machine_usage;
			this.selectedDetails.overtime_factor = settings.overtime_factor;
		}

		// Show the popover after a brief delay
		this.showPopOver = false;
		this.opener = id;
		setTimeout(() => {
			this.showPopOver = true;
		}, 50);

		// If no data is found, return null
		return Object.values(this.selectedDetails).some(value => value !== undefined)
			? this.selectedDetails
			: null;
	}

	ngOnChanges(event: any) {
		this.weeksList = this.weekService.getWeeksAndYearsBetweenDates(
			this.startDate,
			this.endDate
		);
		this.selectedMachine = "";
		let data = this.prepareGridData();
		this.gridData = data;
		this.totalMachineEvent.emit(this.gridData?.length);
		this.initializeColumns();
	}

	private formatDemandData(demands: any[]) {
		return demands.map((group: any) => {
			const formattedGroup: any = {
				name: group.name,
				total: `${group.total}`,
			};

			Object.keys(group).forEach(key => {
				if (key !== "name" && key !== "total_demand") {
					formattedGroup[key] =
						`${this.valueFormatter(group[key] / Number(this.employeeWorkloadDivider))}`;
				}
			});

			return formattedGroup;
		});
	}

	private formatCapacityData(capacity: any[], demands: any[], isStaffWorkload: boolean) {
		return capacity.map((group: any) => {
			const formattedGroup: any = { name: group.name };

			Object.keys(group).forEach(key => {
				if (key !== "name" && key !== "total_demand") {
					const value = group[key];
					const keyValue = this.getKeyValue(group.id, key, demands);
					const result = isStaffWorkload
						? (keyValue - value) / Number(this.employeeWorkloadDivider)
						: keyValue / value;
					formattedGroup[key] = `${this.valueFormatter(result)}`;
				}
			});

			return formattedGroup;
		});
	}

	prepareGridData() {
		let demands = this.prepareDemandsData();
		let capacities = this.prepareCapacityData();

		let filteredDemandData = [];
		let filteredCapacityData = [];

		// Filter by selected machine if applicable
		if (this.reportType === ReportType.MACHINE_WORKLOAD && this.selectedMachine) {
			filteredDemandData = this.filterByMachine(demands, this.selectedMachine);
			filteredCapacityData = this.filterByMachine(capacities, this.selectedMachine);
		}

		if (this.reportType === ReportType.MACHINE_WORKLOAD) {
			if (this.selectedMachine) {
				this.rangeList = this.calculateRatioForWeeks(
					filteredDemandData,
					filteredCapacityData
				);
				this.planVisuService.updatebarChartData(this.rangeList);
			} else {
				this.rangeList = this.calculateRatioForWeeks(demands, capacities);
				this.planVisuService.updatebarChartData(this.rangeList);
			}
		}

		if (Object.keys(capacities).length > 0) {
			const isStaffWorkload = this.reportType === ReportType.STAFF_WORKLOAD;
			return this.formatCapacityData(capacities, demands, isStaffWorkload);
		}

		if (this.reportType === ReportType.STAFF_NEEDED) {
			return this.formatDemandData(demands);
		}
		return;
	}

	private calculateRatioForWeeks(
		demands: any[], // Always an array
		capacities: any[] // Always an array
	): { numberOfWeek: string; value: number }[] {
		return this.weeksList.map(item => {
			const yearWeek = item.YearWeek;
			let totalCapacity = 0;
			let totalDemand = 0;

			// Loop through the arrays and sum up the values for each yearWeek
			demands.forEach(demand => {
				totalDemand += demand[yearWeek] || 0;
			});

			capacities.forEach(capacity => {
				totalCapacity += capacity[yearWeek] || 0;
			});

			const ratio = totalCapacity > 0 ? (totalDemand / totalCapacity) * 100 : 0;

			return {
				numberOfWeek: yearWeek,
				value: parseFloat(ratio.toFixed(2)), // Round to 2 decimals
			};
		});
	}

	private filterByMachine(data: any[], machineName: string): any[] {
		return data.filter(item => item.name === machineName);
	}

	getKeyValue(id: Number, key: String, dataArr: any[]) {
		var res = 0;
		Object.values(dataArr).map((group: any) => {
			if (group.id == id) {
				Object.keys(group).forEach(column => {
					if (column == key) {
						res = group[column];
					}
				});
			}
		});
		return res;
	}

	prepareDemandsData(): any[] {
		if (!this.demandsData) return [];

		const resultMap = this.aggregateDemands(this.demandsData);
		return Object.values(resultMap);
	}

	prepareCapacityData(): any[] {
		if (!this.capacityData) return [];

		const resultMap = this.aggregateCapacity(this.capacityData);
		return Object.values(resultMap);
	}

	private aggregateDemands(demands: any[]): Record<string, any> {
		return demands.reduce(
			(acc, item) => {
				const groupID = item[`${this.dataField}_id`];
				const groupName = item[`${this.dataField}_name`];
				const yearWeek = this.formatYearWeek(item.year, item.week);
				const hours = item.hours_demand;

				if (!acc[groupID]) {
					acc[groupID] = { id: groupID, name: groupName, total_demand: 0 };
				}

				acc[groupID][yearWeek] = (acc[groupID][yearWeek] || 0) + hours;
				acc[groupID].total_demand += hours;

				return acc;
			},
			{} as Record<string, any>
		);
	}

	private aggregateCapacity(capacityData: any[]): Record<string, any> {
		return capacityData.reduce(
			(acc, item) => {
				const groupID = item[`${this.dataField}_id`];
				const groupName = item[`${this.dataField}_name`];
				const yearWeek = this.formatYearWeek(item.year, item.week);
				const hours = item.hours_capacity;

				if (!acc[groupID]) {
					acc[groupID] = { id: groupID, name: groupName, hours_capacity: 0 };
				}

				acc[groupID][yearWeek] = (acc[groupID][yearWeek] || 0) + hours;
				acc[groupID].hours_capacity += hours;

				return acc;
			},
			{} as Record<string, any>
		);
	}

	private formatYearWeek(year: number, week: number): string {
		return `${year}-${String(week).padStart(2, "0")}`;
	}

	valueFormatter(value: any) {
		if (isNaN(parseFloat(value)) || !Number.isFinite(value)) {
			return "-";
		}

		if (value != 0) {
			switch (this.valueFormatType) {
				case ReportValueEnum.PERCENT_VALUE: {
					return (value * 100).toFixed(1) + "%";
				}
				case ReportValueEnum.RAW_VALUE: {
					return value.toFixed(1) + " EMP";
				}
				default:
					return value.toFixed(1);
			}
		} else {
			return "-";
		}
	}

	close() {
		this.showPopOver = false;
	}
}
