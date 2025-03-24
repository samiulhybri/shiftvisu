import {
	Component,
	OnDestroy,
	OnInit,
	ViewChild,
	ElementRef,
	OnChanges,
	SimpleChanges,
	ChangeDetectorRef,
	AfterViewInit,
	Renderer2,
} from "@angular/core";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { CommonService } from "@app/shared/services/common.service";
import { ActionReportService } from "../services/action-report.service";
import {
	CrmActionLog,
	ResposibleGrid,
	ActionGrid,
	CountryGrid,
	MarketSegments,
} from "@app/modules/crm/interfaces/action-report";
import { ChartInterval } from "@app/shared/enums/chartInterval";
import {
	combineLatest,
	debounceTime,
	distinctUntilChanged,
	filter,
	startWith,
	Subscription,
} from "rxjs";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ActionReportGridName } from "../enums/actionReportGrid";
import { ToastComponent } from "@ui5/webcomponents-ngx";

@Component({
	selector: "app-action-report",
	templateUrl: "./action-report.component.html",
	styleUrl: "./action-report.component.css",
})
export class ActionReportComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
	// Initialization
	isLoading = true;
	startDate: Date = new Date();
	endDate: Date = new Date();
	chartRangeType: string = ChartInterval.DAY;
	ChartInterval = ChartInterval;
	apiEndPoint = `crm/action-data`;
	crmReport: boolean = true;

	masterData: CrmActionLog[] = [];
	responsibles: any[] = [];
	crmActions: any[] = [];
	countries: any[] = [];
	marketSegments: MarketSegments[] = [];
	selectedMarketSegments: any = [];
	selectedActions: any = [];
	selectedUsers: any = [];
	selectedCountries: any = [];

	responsibleGridData: ResposibleGrid[] = [];
	actionGridData: ActionGrid[] = [];
	countryGridData: CountryGrid[] = [];

	thresholdValue: number = 60;
	barValueUnit: string = "%";
	rangeList: ChartRangeList[] = [];
	columns: any = [];
	isDialogOpen = false;
	isBusy: boolean = false;
	segments: any = [];

	totalActions: number = 0;
	totalUsers: number = 0;
	totalCountries: number = 0;

	responsibleGridColumns: any = [];
	actionGridColumns: any = [];
	countryGridColumns: any = [];
	rotation: number = -45;
	dateRanges: any = [];
	dateFilterkey: keyof CrmActionLog = "date"; // Initialize with a default key

	dateFilterList: string[] = [];
	segmentFilterList: string[] = [];

	// When clicks on the `onGo` function then re-calculate the grids
	shouldFilterActionGrid: boolean = true;
	shouldFilterUserGrid: boolean = true;
	shouldFilterCountryGrid: boolean = true;
	shouldFilterDateChart: boolean = true;
	shouldFilterSegmentChart: boolean = true;

	@ViewChild("segmentRef") segmentRef: any;
	@ViewChild("actionRef") actionRef: any;
	@ViewChild("userRef") userRef: any;
	@ViewChild("countryRef") countryRef: any;
	@ViewChild("toast") toast?: ToastComponent;
	@ViewChild("gridTable", { static: false }) gridTable: CustomReactGridTable | undefined;

	// Toaster Message
	toastMessage = "";

	// Barchart click events info
	chartEventData: string | null | undefined;

	// Segment BarChart click events info
	segmentChartEvent: string[] | null | undefined;

	// Grid Name enum initialization
	ActionReportGridName = ActionReportGridName;

	// State management
	private subscription: Subscription = new Subscription();

	constructor(
		private commonService: CommonService,
		private actionReportService: ActionReportService,
		private cdr: ChangeDetectorRef,
		private renderer: Renderer2
	) {}

	get actionGridTitle(): string {
		return `Actions(${this.totalActions})`;
	}
	get responsibleGridTitle(): string {
		return `Responsible(${this.totalUsers})`;
	}
	get countryGridTitle(): string {
		return `Country(${this.totalCountries})`;
	}

	ngOnInit(): void {
		// 🌟 Initial API Call:
		// - Ensures data is loaded when the component first initializes,
		//   even if there are no selections made by the user yet.
		this.updateGridAndLoadData();

		// 🌟 Efficiently Listen to Changes in Selection:
		// - Combines multiple observables (actions, users, countries, barChart)
		// - Ensures that API calls are only made when necessary

		this.subscription = combineLatest([
			this.actionReportService.selectionActions$.pipe(startWith([])), // Ensures initial value
			this.actionReportService.selectionUsers$.pipe(startWith([])), // Ensures initial value
			this.actionReportService.selectionCountries$.pipe(startWith([])), // Ensures initial value
			this.actionReportService.actionGridFilter$,
			this.actionReportService.userGridFilter$,
			this.actionReportService.countryGridFilter$,
			this.actionReportService.chartClickEvent$,
			this.actionReportService.dateRangeBarChartFilter$,
			this.actionReportService.verticalChartClickEvent$,
			this.actionReportService.segmentBarChartFilter$,
		])
			.pipe(
				debounceTime(100), // ⏳ Prevents excessive calls (Waits 100ms before triggering an API call)
				distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // 🔄 Avoids unnecessary duplicate calls
			)
			.subscribe(
				([
					actions,
					users,
					countries,
					actionGridFilter,
					userGridFilter,
					countryGridFilter,
					chartEventData,
					filterDateChart,
					verticalChartEventData,
					filterVerticalChart,
				]) => {
					// 🛑 Skip update if there are no real changes (Prevents unnecessary API calls)
					if (
						JSON.stringify(this.selectedActions) === JSON.stringify(actions) &&
						JSON.stringify(this.selectedUsers) === JSON.stringify(users) &&
						JSON.stringify(this.selectedCountries) === JSON.stringify(countries) &&
						this.shouldFilterActionGrid === actionGridFilter &&
						this.shouldFilterUserGrid === userGridFilter &&
						this.shouldFilterCountryGrid === countryGridFilter &&
						this.chartEventData == chartEventData &&
						this.shouldFilterDateChart === filterDateChart &&
						this.segmentChartEvent == verticalChartEventData &&
						this.shouldFilterSegmentChart === filterVerticalChart
					) {
						return;
					}

					// If no actions are selected and filtering is enabled, assign the new action list
					if (!this.selectedActions.length && this.shouldFilterActionGrid) {
						this.selectedActions = actions;
					} else {
						// Otherwise, update the selection: assign actions if available, or reset to an empty array
						this.selectedActions = actions.length ? actions : [];
					}

					// If no users are selected and filtering is enabled, assign the new users list
					if (!this.selectedUsers.length && this.shouldFilterUserGrid) {
						this.selectedUsers = users;
					} else {
						// Otherwise, update the selection: assign users if available, or reset to an empty array
						this.selectedUsers = users.length ? users : [];
					}

					// If no users are selected and filtering is enabled, assign the new users list
					if (!this.selectedCountries.length && this.shouldFilterCountryGrid) {
						this.selectedCountries = countries;
					} else {
						// Otherwise, update the selection: assign countires if available, or reset to an empty array
						this.selectedCountries = countries.length ? countries : [];
					}

					// ✅ Update grid filter conditions
					this.shouldFilterActionGrid = actionGridFilter;
					this.shouldFilterUserGrid = userGridFilter;
					this.shouldFilterCountryGrid = countryGridFilter;
					this.shouldFilterDateChart = filterDateChart;
					this.shouldFilterSegmentChart = filterVerticalChart;

					// ✅ Update bar chart filter conditions
					this.chartEventData = chartEventData;
					this.segmentChartEvent = verticalChartEventData;

					// TODO:: need to handle this if we push multiple entries on CTRL click
					this.dateFilterList = [];
					if (this.chartEventData) {
						this.dateFilterList.push(this.chartEventData);
					}

					this.segmentFilterList = [];
					if (this.segmentChartEvent) {
						this.segmentFilterList = this.segmentChartEvent;
					}

					// If no segment are selected and filtering is enabled, assign the new segment list
					if (!this.selectedMarketSegments.length && this.shouldFilterSegmentChart) {
						this.selectedMarketSegments = this.segmentFilterList;
					} else {
						// Otherwise, update the selection: assign segment if available, or reset to an empty array
						this.selectedMarketSegments = this.segmentFilterList.length
							? this.segmentFilterList
							: [];
					}

					// 🔄 Trigger API Call to Load Data
					this.updateGridAndLoadData();

					// 🎨 Manually trigger change detection to ensure UI updates correctly
					this.cdr.markForCheck();
				}
			);
	}

	ngAfterViewInit(): void {
		this.renderer.listen("document", "click", (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (
				target &&
				target.hasAttribute("data-component-name") &&
				target.getAttribute("data-component-name") === "ToolbarContent"
			) {
				this.actionReportService.clearCustomFilters();
			}
		});
	}

	onSegmentChange(event: any) {
		const selectedItem = event.detail.selectedItems?.[0]; // Get the first selected item

		if (!selectedItem) {
			this.updateGridDataOnBtnSwitch(ChartInterval.DAY, false);
			return;
		}

		const selectedId = selectedItem.id; // Ensure ID exists or use another property

		switch (selectedId) {
			case "day":
				this.updateGridDataOnBtnSwitch(ChartInterval.DAY, false);
				break;
			case "week":
				this.updateGridDataOnBtnSwitch(ChartInterval.WEEK, false);
				break;
			case "month":
				this.updateGridDataOnBtnSwitch(ChartInterval.MONTH, false);
				break;
			default:
				this.updateGridDataOnBtnSwitch(ChartInterval.DAY, false);
		}
	}

	// Method to avoid code duplication
	private updateGridAndLoadData(): void {
		this.initializeGridColumns();
		this.loadMasterData(this.chartRangeType, true);
	}

	updateGridDataOnBtnSwitch(
		chartRangeType: string = ChartInterval.DAY,
		isFromInit = false
	): void {
		this.updateObservableState();
		this.updateGridFilterFlags();
		this.updateNavbarFilterValues();
		this.loadMasterData(chartRangeType, isFromInit);
	}

	ngOnChanges(changes: SimpleChanges): void {}

	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		this.onReset();
	}

	private initializeGridColumns(): void {
		this.responsibleGridColumns = this.actionReportService.generateGridColumns(
			ActionReportGridName.RESPONSIBLE
		);
		this.actionGridColumns = this.actionReportService.generateGridColumns(
			ActionReportGridName.ACTION
		);
		this.countryGridColumns = this.actionReportService.generateGridColumns(
			ActionReportGridName.COUNTRY
		);
	}

	public loadMasterData(chartRangeType: string = ChartInterval.DAY, isFromInit = false): void {
		this.chartRangeType = chartRangeType;
		this.updateDateFilterKey();

		this.isLoading = true;

		let tmpSegments = "";

		if (this.segmentFilterList?.length) {
			tmpSegments = this.segments
				.filter((segment: { name: string }) =>
					this.segmentFilterList.includes(segment.name)
				)
				.map((segment: { id: any }) => segment.id)
				.join(",");
		}

		if (
			this.selectedMarketSegments.length ||
			this.selectedActions.length ||
			this.selectedUsers.length ||
			this.selectedCountries.length ||
			this.dateFilterList.length ||
			this.segmentFilterList.length
		) {
			// this.updateObservableState();
		}

		const params: Record<string, any> = {
			date_range_type: chartRangeType.toUpperCase(),
			segments: this.selectedMarketSegments.join(","),
			actions: this.selectedActions.join(","),
			users: this.selectedUsers.join(","),
			countries: this.selectedCountries.join(","),
			date_filter_list: this.dateFilterList,
			segment_filter_list: tmpSegments,
		};

		// Convert params object into URL query string
		const queryString = new URLSearchParams(params).toString();
		this.isBusy = true;
		this.commonService.get(`${this.apiEndPoint}?${queryString}`, false).subscribe({
			next: (res: any) => {
				this.processResponse(res, isFromInit);
				this.isLoading = false;
				this.isBusy = false;
			},
			error: (err: any) => {
				this.isLoading = false;
				this.isBusy = false;

				console.log(this.toast);

				console.error("Failed to load data");
				this.toastMessage = $localize`Workload re-calculation was not Successfully`;
				this.toast!.open = true;
			},
		});
	}

	private updateDateFilterKey(): void {
		if (this.chartRangeType === ChartInterval.DAY) {
			this.dateFilterkey = "date";
		} else if (this.chartRangeType === ChartInterval.WEEK) {
			this.dateFilterkey = "week_year";
		} else {
			this.dateFilterkey = "month_year";
		}
	}

	private processResponse(res: any, isFromInit: boolean): void {
		// Only update `crmActions`, `countries`, `responsibles`, and `segments` if `isFromInit` is true (initial load)

		this.updateInitialData(res, isFromInit);

		this.masterData = res.masterData;
		this.dateRanges = res.dateRanges;

		if (this.shouldFilterSegmentChart) {
			this.marketSegments = this.actionReportService.getSegmentActionChart(this.masterData);
		}

		if (this.shouldFilterDateChart) {
			this.rangeList = this.generateActionChart();
		}

		if (this.shouldFilterUserGrid) {
			this.responsibleGridData = this.getResponsibleGridData();
			this.totalUsers = this.responsibleGridData.length;
		}

		if (this.shouldFilterActionGrid) {
			this.actionGridData = this.getActionGridData();
			this.totalActions = this.actionGridData.length;
		}

		if (this.shouldFilterCountryGrid) {
			this.countryGridData = this.getCountryGridData();
			this.totalCountries = this.countryGridData.length;
		}
	}

	private updateInitialData(res: any, isFromInit: boolean): void {
		if (!isFromInit || this.hasInitialData()) return;

		this.crmActions = res.crmActions;
		this.segments = res.marketSegments;
		this.countries = res.countries;
		this.responsibles = res.responsible;
	}

	private hasInitialData(): boolean {
		return (
			this.crmActions.length > 0 ||
			this.segments.length > 0 ||
			this.countries.length > 0 ||
			this.responsibles.length > 0
		);
	}

	private generateActionChart(): any {
		return this.actionReportService.generateActionChart(
			this.masterData,
			this.dateRanges,
			this.dateFilterkey
		);
	}

	private getResponsibleGridData(): any {
		return this.actionReportService.getResponsibleGridData(
			this.masterData,
			this.responsibles,
			this.selectedUsers
		);
	}

	private getActionGridData(): any {
		return this.actionReportService.getActionGridData(
			this.masterData,
			this.crmActions,
			this.selectedActions
		);
	}

	private getCountryGridData(): any {
		return this.actionReportService.getCountryGridData(
			this.masterData,
			this.countries,
			this.selectedCountries
		);
	}

	async onGo() {
		this.isBusy = true;
		// this.updateGridFilterFlags();
		this.actionReportService.updateChartClickEvent([]);
		this.actionReportService.updateSegmentBarChartEvent([]);

		if (
			!this.shouldFilterActionGrid ||
			!this.shouldFilterCountryGrid ||
			!this.shouldFilterDateChart ||
			!this.shouldFilterSegmentChart ||
			!this.shouldFilterUserGrid
		) {
			this.updateObservableState();
		}

		if (
			this.selectedMarketSegments.length ||
			this.selectedActions.length ||
			this.selectedUsers.length ||
			this.selectedCountries.length ||
			this.dateFilterList.length ||
			this.segmentFilterList.length
		) {
			// this.updateObservableState();
		}

		this.loadMasterData(this.chartRangeType, false);
	}

	onReset(chartRangeType: string = ChartInterval.DAY) {
		// Find the segmented button
		const segmentedButton = document.querySelector("ui5-segmented-button");
		if (!segmentedButton) return;

		// Find the "Day" button inside the segmented button
		const daySegment = segmentedButton.querySelector("#day") as HTMLElement;
		if (daySegment) {
			// Simulate selection change by dispatching an event
			daySegment.click();
		}

		this.chartRangeType = ChartInterval.DAY;
		this.updateObservableState();
		this.updateGridFilterFlags();
		this.updateNavbarFilterValues();
		this.clearData();
		this.loadMasterData(chartRangeType, true);
	}

	updateObservableState() {
		this.actionReportService.updateSelectedUsers([]);
		this.actionReportService.updateSelectedActions([]);
		this.actionReportService.updateSelectedCountries([]);
		this.actionReportService.updateChartClickEvent([]);
		this.actionReportService.updateSegmentBarChartEvent([]);
	}

	updateGridFilterFlags() {
		this.shouldFilterActionGrid = true;
		this.shouldFilterCountryGrid = true;
		this.shouldFilterUserGrid = true;
		this.shouldFilterDateChart = true;
		this.shouldFilterSegmentChart = true;
	}

	updateNavbarFilterValues() {
		this.selectedMarketSegments = [];
		this.selectedActions = [];
		this.selectedUsers = [];
		this.selectedCountries = [];
		this.dateFilterList = [];
		this.segmentFilterList = [];
	}

	private clearData(): void {
		this.selectedUsers = [];
		this.masterData = [];
		this.crmActions = [];
		this.countries = [];
		this.responsibles = [];
		this.segments = [];
		this.dateRanges = [];
		this.marketSegments = [];
		this.rangeList = [];
		this.responsibleGridData = [];
		this.actionGridData = [];
		this.countryGridData = [];
	}

	public selectSegment(event: any) {
		this.selectedMarketSegments = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	public selectCountry(event: any) {
		this.selectedCountries = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	public selectUser(event: any) {
		this.selectedUsers = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
	}

	public selectAction(event: any) {
		this.selectedActions = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
	}

	deepEqual(obj1: any, obj2: any): boolean {
		if (obj1 === obj2) return true; // Same reference

		if (
			typeof obj1 !== "object" ||
			typeof obj2 !== "object" ||
			obj1 === null ||
			obj2 === null
		) {
			return false; // Not objects or one is null
		}

		const keys1 = Object.keys(obj1);
		const keys2 = Object.keys(obj2);

		if (keys1.length !== keys2.length) return false; // Different number of properties

		return keys1.every(key => this.deepEqual(obj1[key], obj2[key])); // Recursively compare values
	}

	reciveGridExportedData(data: any, gridType: string) {
		this.actionReportService.handleCellClick(data, gridType, -1);
	}
}
