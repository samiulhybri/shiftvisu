import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef, OnInit } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";

/* AmCharts Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { CommonService } from "@app/shared/services/common.service";
import { MonthGeneratorService } from "@app/shared/services/month-generator.service";
import { WorkloadReportType } from "../enums/WorkloadReportType.enum";
import { WeekGeneratorService } from "@app/shared/utils/week-generator";
import { Demand } from "@app/shared/interfaces/demand";
import { ReportValueEnum } from "@app/shared/enums/ReportFormatter";
import { forkJoin } from "rxjs";
import { getTodayAnd12WeeksLater } from "@app/shared/utils/ate-range-util";
import { ActivatedRoute } from "@angular/router";
import { ReportType } from "@app/shared/enums/ReportType";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { Hall } from "@app/shared/models/hall.model";
import { MachineGroup } from "@app/shared/models/machine-group.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { PlanVisuService } from "@app/modules/planvisu/services/plan-visu.service";
import { Machine } from "@app/shared/models/machine.model";
import { ToastComponent } from "@ui5/webcomponents-ngx";

interface MachineWorkloadData {
	machine_id: number;
	machine_custom_id: string;
	machine_name: string;
	year: number;
	month: number;
	week: number;
	hours_capacity: number;
}

@Component({
	selector: "app-machine-workload",
	templateUrl: "./machine-workload.component.html",
	styleUrl: "./machine-workload.component.css",
})
export class MachineWorkloadComponent implements OnInit {
	valueFormatType = ReportValueEnum.EMP;
	ReportValueEnum = ReportValueEnum;
	thresholdValue: number = 60;
	barValueUnit: string = "%";
	columns: any = [];
	isDialogOpen = false;
	isLoading = false;
	next12Weeks: string[] = [];
	next12Months: string[] = [];
	masterData = [];
	machineList: { name: string; id: number; custom_id: string }[] = [];
	rangeList: ChartRangeList[] = [];
	machineloadData: any = [];
	totalMachines: number = 0;

	startDate: Date = new Date();
	endDate: Date = new Date();

	demandsData: Demand[] = [];
	capacityData: any[] = [];
	capacitySettings: any[] = [];
	ReportType = ReportType;
	reportType = ReportType.MACHINE_WORKLOAD;
	isBusy: boolean = false;
	isEverythingLoaded = false;
	halls: Hall[] = [];
	selectedHalls: number[] = [];
	machineGroups: MachineGroup[] = [];
	selectMachineGroups: number[] = [];
	selectedMachines: number[] = [];
	selectedMachineWorkloadDetails: any;

	dateFilterType = WorkloadReportType.WEEK;
	apiUrl1 = "";
	apiUrl2 = "";
	hall = 1;

	isWorkloadCalculationBusy = false;
	toastMessage = "";

	// TODO: This value will come from settings configurations
	public distributionTime: number;
	public utilizationPercentage: number;

	@ViewChild("gridTable") gridTable?: CustomReactGridTable;
	@ViewChild("chartdiv") chartDiv!: ElementRef;
	@ViewChild("hallRef") hallRef: any;
	@ViewChild("machineGroupRef") machineGroupRef: any;
	@ViewChild("machineRef") machineRef: any;
	@ViewChild("toast") toast?: ToastComponent;
	accessorKey: string = "machine_name";

	private root!: am5.Root;

	constructor(
		public commonService: CommonService,
		private weekService: WeekGeneratorService,
		private monthService: MonthGeneratorService,
		private planVisuService: PlanVisuService,
		private route: ActivatedRoute
	) {
		this.distributionTime = 10;
		this.utilizationPercentage = 90;
		route.params.subscribe({
			next: (d: any) => {
				this.hall = d.id;
				this.next12Weeks = this.weekService.getNextWeeks();
				this.next12Months = this.monthService.getNextmonths();
				// this.loadMasterData();
			},
		});
		this.getMachineWorkloadDetails();
	}

	get machineWorkloadHeaderTitle(): string {
		return $localize`Machine Workload(${this.totalMachines ?? 0})`;
	}

	updateMachineWorkloadTitle(totalMachines: number) {
		this.totalMachines = totalMachines;
	}

	ngOnInit(): void {
		this.selectedMachineWorkloadDetails = [];
	}

	getMachineWorkloadDetails() {
		this.planVisuService.machineWorkloadDetails$.subscribe(res => {
			this.selectedMachineWorkloadDetails = res;
		});
	}

	onReset() {
		this.selectMachineGroups = [];
		this.selectedMachineWorkloadDetails = [];
		this.selectedMachines = [];

		setTimeout(() => {
			const machineGroupComboBox = this.machineGroupRef.elementRef.nativeElement;
			if (machineGroupComboBox) {
				machineGroupComboBox.items.forEach((item: any) => {
					item.selected = false; // Deselect all items
				});
			}
			const machineComboBox = this.machineRef.elementRef.nativeElement;
			if (machineComboBox) {
				machineComboBox.items.forEach((item: any) => {
					item.selected = false; // Deselect all items
				});
			}
		});

		const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
		if (cachedHall.length) {
			this.halls.forEach(hall => {
				hall.isSelected = cachedHall.includes(hall.id);
			});
			this.selectedHalls = cachedHall;
		} else {
			this.selectedHalls = [this.halls[0].id!];
			localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
			setTimeout(() => {
				if (this.hallRef.elementRef.nativeElement.children.length > 0) {
					this.hallRef.elementRef.nativeElement.children[0].selected = true;
				}
			});
		}

		this.onGo();
	}

	recalculateWorkload() {
		this.isWorkloadCalculationBusy = true;
		const config = {
			responseType: "text",
			observe: "response",
		};
		const apiUrl = "commands/run/calculate-workload";
		this.commonService.post(apiUrl, {}, false, config).subscribe({
			next: (res: any) => {
				this.isWorkloadCalculationBusy = false;
				if (res.status == 200) {
					this.toastMessage = $localize`Workload recalculation was successful`;
					this.toast!.open = true;
				} else {
					this.toastMessage = $localize`Workload recalculation was failed`;
					this.toast!.open = true;
				}
			},
			error: err => {
				this.isWorkloadCalculationBusy = false;
				this.toastMessage = $localize`Workload re-calculation was not Successfully`;
				this.toast!.open = true;
			},
		});
	}

	ngAfterViewInit(): void {
		this.setAllData().then(() => {
			this.cacheHalls();
			this.selectedHalls = JSON.parse(localStorage.getItem("Hall") || "[]");
			this.loadMasterData();
		});
	}

	getAllComboBoxData() {
		return new Promise((resolve, reject) => {
			let requests: ODataBatchCall[] = [];
			requests.push(
				new ODataBatchCall(
					0,
					"get",
					`\/odata\/Halls?$filter=is_active eq true and is_enabled_plan_visu eq true`
				)
			);

			requests.push(
				new ODataBatchCall(1, "get", `\/odata\/MachineGroups?$filter=is_active eq true`)
			);
			requests.push(
				new ODataBatchCall(
					2,
					"get",
					`\/odata\/Machines?$select=id,custom_id,name&$filter=sectionActivatables/any(sa:sa/activatable_type eq 'App\\Models\\Machine' and sa/section eq 'PLANVISU' and sa/is_active eq true)`
				)
			);
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.halls = response.responses[0].body.value.map((data: Hall) => {
						const hall = new Hall().deserialize(data);
						hall.isSelected = false;
						return hall;
					});

					this.machineGroups = response.responses[1].body.value.map(
						(data: MachineGroup) => new MachineGroup().deserialize(data)
					);
					this.machineList = response.responses[2].body.value;

					if (this.halls.length > 0) {
						const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
						if (cachedHall.length) {
							this.halls.forEach(hall => {
								hall.isSelected = cachedHall.includes(hall.id);
							});
							this.selectedHalls = cachedHall;
						} else {
							this.selectedHalls = [this.halls[0].id!];
							localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
							setTimeout(() => {
								this.hallRef.elementRef.nativeElement.items[0].selected = true;
							});
						}
					}
					resolve(true);
				},
				error: e => {},
			});
		});
	}

	async setAllData() {
		await this.getAllComboBoxData();
		this.isEverythingLoaded = true;
	}

	async onGo() {
		this.isBusy = true;
		this.isBusy = false;
		this.selectedMachineWorkloadDetails = {};
		this.planVisuService.thresholdValue = 60;
		this.loadMasterData();
	}

	cacheHalls() {
		const cachedHalls = JSON.parse(localStorage.getItem("Hall") || "[]");
		if (!cachedHalls.length) {
			localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
		}
	}

	clearHallSelection() {
		this.selectedHalls = [];
		this.hallRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => (el.selected = false)
		) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
	}

	selectHall(event: any) {
		this.selectedHalls = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
	}
	selectMachineGroup(event: any) {
		this.selectMachineGroups = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}
	selectMachine(event: any) {
		this.selectedMachines = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	loadMasterData() {
		this.isLoading = true;
		const dates = getTodayAnd12WeeksLater();
		this.startDate = new Date(dates.today);
		this.endDate = new Date(dates.lastDate);

		const isWeekFilter = this.dateFilterType === WorkloadReportType.WEEK;
		const startDate = isWeekFilter ? dates.today : this.next12Months[0];
		const endDate = isWeekFilter ? dates.lastDate : this.next12Months[11];
		const demandStartDate = isWeekFilter ? dates.today : this.next12Weeks[0];
		const demandEndDate = isWeekFilter ? dates.lastDate : this.next12Weeks[11];
		const type = this.dateFilterType.toLocaleLowerCase();
		const hallFilter = this.selectedHalls;

		const machineGroupFilter = this.selectMachineGroups;
		const machineFilter = this.selectedMachines;

		this.apiUrl1 = `plan_visu/get_machine_capacity?type=${type}&start_date=${startDate}&end_date=${endDate}&hall_filter=${hallFilter}&machine_group_filter=${machineGroupFilter}&machine_filter=${machineFilter}`;
		this.apiUrl2 = `plan_visu/get-demand-prod-order?type=${type}&start_date=${demandStartDate}&end_date=${demandEndDate}&report_type=Machine&hall_filter=${hallFilter}&machine_group_filter=${machineGroupFilter}&machine_filter=${machineFilter}`;

		forkJoin({
			capacity: this.commonService.get(this.apiUrl1, false),
			demand: this.commonService.get(this.apiUrl2, false),
		}).subscribe({
			next: (res: any) => {
				this.capacityData = res.capacity.mainData;
				this.demandsData = res.demand.mainData;
				this.capacitySettings = res.capacity.capacitySettings;
				this.formatDataForChart(this.capacityData, this.demandsData, this.next12Weeks);
			},
		});
	}

	formatDataForChart(capacity: MachineWorkloadData[], demand: any[], next12Weeks: string[]) {
		const capacityMap: { [key: string]: number } = {};
		const demandMap: { [key: string]: number } = {};

		// Initialize maps for the weeks
		for (const yearWeek of next12Weeks) {
			capacityMap[yearWeek] = 0;
			demandMap[yearWeek] = 0;
		}

		// Populate capacityMap with hours_capacity
		for (const item of capacity) {
			const yearWeekKey = `${item.year}-${String(item.week).padStart(2, "0")}`;
			if (capacityMap.hasOwnProperty(yearWeekKey)) {
				capacityMap[yearWeekKey] += item.hours_capacity;
			}
		}

		// Populate demandMap with hours_demand
		for (const item of demand) {
			const yearWeekKey = `${item.year}-${String(item.week).padStart(2, "0")}`;
			if (demandMap.hasOwnProperty(yearWeekKey)) {
				demandMap[yearWeekKey] += item.hours_demand;
			}
		}

		// Calculate the ratio of demand / capacity and build rangeList
		this.rangeList = next12Weeks.map(yearWeek => {
			const capacityValue = capacityMap[yearWeek] || 0;
			const demandValue = demandMap[yearWeek] || 0;

			// Avoid division by zero
			const ratio = capacityValue > 0 ? (demandValue / capacityValue) * 100 : 0;

			return {
				numberOfWeek: yearWeek,
				value: Number(ratio.toFixed(2)), // Round to 2 decimals
			};
		});
	}

	ngOnDestroy(): void {
		// Cleanup chart instance
		if (this.root) {
			this.root.dispose();
		}
	}

	closeDialog() {
		this.isDialogOpen = false;
	}
}
