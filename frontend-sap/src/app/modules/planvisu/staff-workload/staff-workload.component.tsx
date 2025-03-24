import { Component, ViewChild, AfterViewInit, OnDestroy, ElementRef } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import moment from "moment";

/* AmCharts Imports */
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { CommonService } from "@app/shared/services/common.service";
import { WeekGeneratorService } from "@app/shared/utils/week-generator";
import { MonthGeneratorService } from "@app/shared/services/month-generator.service";
import { Demand } from "@app/shared/interfaces/demand";
import { WorkloadReportType } from "../enums/WorkloadReportType.enum";
import { ReportValueEnum } from "@app/shared/enums/ReportFormatter";
import { getTodayAnd12WeeksLater } from "@app/shared/utils/ate-range-util";
import { forkJoin } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { ReportType } from "@app/shared/enums/ReportType";
import { ChartInterval } from "@app/shared/enums/chartInterval";

interface UserworkloadData {
	hall_id: number;
	user_custom_id: string;
	hall_name: string;
	year: number;
	month: number;
	week: number;
	hours_capacity: number;
}

@Component({
	selector: "app-staff-workload",
	templateUrl: "./staff-workload.component.html",
	styleUrl: "./staff-workload.component.css",
})
export class StaffWorkloadComponent {
	valueFormatType = ReportValueEnum.PERCENT_VALUE;
	thresholdValue: number = 60;
	barValueUnit: string = "%";
	columns: any = [];
	isDialogOpen = false;
	isLoading = false;
	next12Weeks: string[] = [];
	next12Months: string[] = [];
	masterData = [];
	usersList = [];
	rangeList: { numberOfWeek: string; value: number }[] = [];
	workloadData: any = [];
	reportType = WorkloadReportType.WEEK;
	staffWorkloadAPI = "";
	staffHourDemandAPI = "";
	hall = 1;
	accessorKey: string = 'hall_name';
	ReportType = ReportType;
	ReportValueEnum = ReportValueEnum;
	ChartInterval = ChartInterval;

	// TODO: This value will come from settings configurations
	public distributionTime: number;
	public userUtilizationPercentage: number;
	public overtimeFactor: number;
	public addedHours: number;

	startDate: Date = new Date();
	endDate: Date = new Date();

	demandsData: Demand[] = [];
	capacityData: any[] = [];
	capacitySettings: any[] = [];

	@ViewChild("gridTable") gridTable?: CustomReactGridTable;
	@ViewChild("chartdiv") chartDiv!: ElementRef;

	constructor(
		public commonService: CommonService,
		private weekService: WeekGeneratorService,
		private monthService: MonthGeneratorService,
		private route: ActivatedRoute
	) {
		this.distributionTime = 10;
		this.userUtilizationPercentage = 80;
		this.overtimeFactor = 10;
		this.addedHours = 0;
		this.next12Weeks = this.weekService.getNextWeeks();
		this.next12Months = this.monthService.getNextmonths();
		route.params.subscribe({
			next: (d: any) => {
				this.hall = d.id;
				this.loadMasterData();
			},
		});
	}

	loadMasterData() {
		this.isLoading = true;
		const dates = getTodayAnd12WeeksLater();
		this.startDate = new Date(dates.today);
		this.endDate = new Date(dates.lastDate);

		const reportType = this.reportType.toLocaleLowerCase();
		const isWeekly = this.reportType === WorkloadReportType.WEEK;

		// Helper function to generate API URLs
		const generateAPI = (baseUrl: string, start: string, end: string, reportTypeParam = "") =>
			`${baseUrl}?type=${reportType}&start_date=${start}&end_date=${end}${reportTypeParam}`;

		const startDate = isWeekly ? dates.today : this.next12Months[0];
		const endDate = isWeekly ? dates.lastDate : this.next12Months[11];

		this.staffWorkloadAPI = generateAPI("plan_visu/get_user_capacity", startDate, endDate);
		this.staffHourDemandAPI = generateAPI(
			"plan_visu/get-demand-prod-order",
			startDate,
			endDate,
			"&report_type=Staff"
		);

		forkJoin({
			capacity: this.commonService.get(this.staffWorkloadAPI, false),
			demand: this.commonService.get(this.staffHourDemandAPI, false),
		}).subscribe({
			next: (res: any) => {
				this.masterData = res.capacity.mainData;
				this.demandsData = res.demand.mainData;
				this.capacityData = res.capacity.mainData;
				this.capacitySettings = res.capacity.capacitySettings;
			},
		});
	}

	ngAfterViewInit(): void {}

	ngOnDestroy(): void {
	}

	closeDialog() {
		this.isDialogOpen = false;
	}
}
