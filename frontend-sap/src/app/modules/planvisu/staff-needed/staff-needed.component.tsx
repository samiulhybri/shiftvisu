import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import moment from "moment";
/* AmCharts Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { CommonService } from "@app/shared/services/common.service";
import { Demand } from "@app/shared/interfaces/demand";
import { WorkloadReportType } from "@app/modules/planvisu/enums/WorkloadReportType.enum";
import { ReportValueEnum } from "@app/shared/enums/ReportFormatter";
import { getTodayAnd12WeeksLater } from "@app/shared/utils/ate-range-util";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Hall } from "@app/shared/models/hall.model";

interface MachineData {
	machine_id: number;
	machine_custom_id: string;
	machine_name: string;
	machine_group_id: number;
	machine_group_custom_id: string;
	machine_group_name: string;
	item_id: number;
	item_custom_id: string;
	item_name: string;
	year: number;
	week: number;
	hours_demand: number;
}

interface MachineGroupSummary {
	machine_group_name: string;
	total: string;
	[yearWeek: string]: string;
}
interface MachineSummary {
	machine_name: string;
	total: string;
	[yearWeek: string]: string;
}
interface ItemSummary {
	item_name: string;
	total: string;
	[yearWeek: string]: string;
}

@Component({
	selector: "app-staff-need",
	templateUrl: "./staff-needed.component.html",
	styleUrls: ["./staff-needed.component.css"],
})
export class StaffNeededComponent implements  OnDestroy {
	valueFormatType = ReportValueEnum.EMP;
	employeeWorkloadDivider: number = 40;
	barValueUnit: string = "EMP";
	thresholdValue: number = 0;
	columns: any = [];
	machineGroupColumns: any = [];
	machineColumns: any = [];
	itemColumns: any = [];
	selectedRow: any;
	isDialogOpen = false;
	rangeList: { numberOfWeek: string; value: number }[] = [];
	isLoading = false;
	next12Weeks: string[] = [];
	next12Months: string[] = [];
	machineList: string[] = [];
	machineGroupList: string[] = [];
	machineGroupData: MachineGroupSummary[] = [];
	machineData: MachineSummary[] = [];
	itemData: ItemSummary[] = [];
	itemList = [];
	startDate: Date = new Date();
	endDate: Date = new Date();

	demandsData: Demand[] = [];
	capacityData: any[] = [];

	reportType = WorkloadReportType.WEEK;
	hall = 1; // Will take this from URL parameter
	apiUrl = "";
	halls: Hall[] = [];
	selectedHallId?: number;
	showHallCombobox: boolean = true;
	selectedHallValue = "";

	@ViewChild("gridTable") gridTable?: CustomReactGridTable;
	@ViewChild("chartdiv") chartDiv!: ElementRef;

	private root!: am5.Root;

	constructor(
		public commonService: CommonService,
		private route: ActivatedRoute,
		private router: Router
	) {
		this.next12Weeks = this.getNext12Weeks();
		this.next12Months = this.getNext12Months();
		route.params.subscribe({
			next: (d: any) => {
				this.hall = d.id;
				this.loadDemandData();
			},
		});
	}

    ngOnInit(): void {
            //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
            //Add 'implements OnInit' to the class.
            this.commonService
                .get("Halls?$filter=is_active eq true and is_enabled_plan_visu eq true")
                .subscribe((data: any) => {
                    this.halls = data.value.map((value: any) => new Hall().deserialize(value));
                    this.setNavigation();
                });
        }

	globalDivider(value: any): Number {
		return Number(Number(value / this.employeeWorkloadDivider).toFixed(2));
	}

	loadDemandData() {
		const dates = getTodayAnd12WeeksLater();
		this.startDate = new Date(dates.today);
		this.endDate = new Date(dates.lastDate);

		this.isLoading = true;
		if (this.reportType == WorkloadReportType.WEEK) {
			this.apiUrl = `plan_visu/get-demand-prod-order/${this.hall}?type=${this.reportType.toLocaleLowerCase()}&start_date=${dates.today}&end_date=${dates.lastDate}`;
		} else {
			this.apiUrl = `plan_visu/get-demand-prod-order/${this.hall}?type=${this.reportType.toLocaleLowerCase()}&start_date=${this.next12Months[0]}&end_date=${this.next12Months[11]}`;
		}

		this.commonService.get(this.apiUrl, false).subscribe({
			next: (res: any) => {
				this.demandsData = res;
				this.formatDataForChart(this.demandsData, this.next12Weeks);
			},
			error: error => {
				this.isLoading = false;
				console.log(error);
			},
		});
	}

	setNavigation() {
		const hallId = this.route.snapshot.params["id"];
        console.log(hallId);
		const hall = this.halls.find(hall => hall.id == hallId);

		if (hall) {
			this.selectedHallValue = hall.name!;
		}

		if (!this.route.snapshot.url.toString()) return;

		if (hallId) {
			this.router.navigate([hallId]);
		} else {
			this.router.navigate(["planvisu", "staff-needed", this.halls[0].id]);

			this.selectedHallValue = this.halls[0].name!;
		}
	}

	selectHall(event: any) {
		this.selectedHallId = event.detail?.item?.id;

        console.log(this.selectedHallId);

		this.router.navigate(["planvisu", "staff-needed", this.selectedHallId]).then(() => {
			// window.location.reload();
		});
	}

	getUniqueMachineGroupIds(data: MachineData[]): string[] {
		const uniqueIds = new Set<string>();
		data.forEach(item => uniqueIds.add(item.machine_group_custom_id));
		return Array.from(uniqueIds);
	}

	formatDataForChart(data: MachineData[], next12Weeks: string[]) {
		const resultMap: { [key: string]: number } = {};

		// Initialize resultMap with year-weeks set to 0
		for (const yearWeek of next12Weeks) {
			resultMap[yearWeek] = 0;
		}

		// Sum up hours_demand based on year-week
		for (const item of data) {
			const yearWeekKey = `${item.year}-${String(item.week).padStart(2, "0")}`;
			if (resultMap.hasOwnProperty(yearWeekKey)) {
				resultMap[yearWeekKey] += item.hours_demand;
			}
		}

		// Convert the resultMap to the desired format
		this.rangeList = Object.keys(resultMap).map(yearWeek => ({
			numberOfWeek: yearWeek,
			value: Number(this.globalDivider(resultMap[yearWeek])),
		}));
	}

	getNext12Weeks(): string[] {
		const weeks: string[] = [];
		let currentDate = moment();

		for (let i = 0; i < 12; i++) {
			const year = currentDate.isoWeekYear();
			const week = currentDate.isoWeek();
			weeks.push(`${year}-${String(week).padStart(2, "0")}`);
			currentDate.add(1, "week");
		}
		return weeks;
	}

	getNext12Months(): string[] {
		const months: string[] = [];
		let currentDate = moment();

		for (let i = 0; i < 12; i++) {
			const year = currentDate.year();
			const month = currentDate.month() + 1;
			months.push(`${year}-${String(month).padStart(2, "0")}`);
			currentDate.add(1, "month");
		}
		return months;
	}

	rowClick(event: any) {
		this.selectedRow = event.detail.row.original;
		this.isDialogOpen = true;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}
	ngOnDestroy(): void {
		// Cleanup chart instance
		if (this.root) {
			this.root.dispose();
		}
	}
}
