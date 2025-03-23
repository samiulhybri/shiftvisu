import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5locales_de_DE from "@amcharts/amcharts5/locales/de_DE";
import am5locales_it_IT from "@amcharts/amcharts5/locales/it_IT";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";
import { PlanVisuService } from "@app/modules/planvisu/services/plan-visu.service";
import { Subscription } from "rxjs";
import { ReportType } from "@app/shared/enums/ReportType";
import { ActionReportService } from "@app/modules/crm/services/action-report.service";

@Component({
	selector: "app-bar-chart",
	template: ` <div #chartdiv style="height: 26vh"></div> `,
})
export class BarChartsComponent implements OnInit, OnChanges, OnDestroy {
	@Input() chartData: ChartRangeList[] = [];
	@Input() thresholdValue = 60;
	@Input() rotation = 0;
	@Input() barValueUnit = "%";
	@Input() showBarValueUnit: boolean = true;
	@Input() isRangeOverview: boolean = false;
	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	@Input() reportType: string = "";
	@Input() crmReport: boolean = false;

	private chartDataSubscription!: Subscription;
	private root!: am5.Root;

	private selectedDates: string[] = []; // Track selected dates for multi-selection
	private filterChartMultiCol = false; // To manage multi-selection state
	private onlyCtrl = false; // For multi-selection with ctrl

	constructor(
		private planVisuService: PlanVisuService,
		private actionReportService: ActionReportService,
		private changeDetection: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.chartDataSubscription = this.planVisuService
			.barChartDataBehaviorObservable()
			.subscribe((data: ChartRangeList[]) => {
				this.chartData = [...data];
				this.initChart();
			});

		this.planVisuService.thresholdValue$.subscribe((threshold: number) => {
			this.thresholdValue = threshold;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["chartData"] && this.chartData) {
			this.initChart();
		}
	}

	ngOnDestroy(): void {
		if (this.chartDataSubscription) {
			this.chartDataSubscription.unsubscribe();
		}
		if (this.root) {
			this.root.dispose();
		}
	}

	private initChart(): void {
		if (this.root) {
			this.root.dispose();
		}

		this.root = am5.Root.new(this.chartDiv.nativeElement);

		// Remove logo
		this.root._logo?.dispose();

		// Apply theme
		this.root.setThemes([am5themes_Animated.new(this.root)]);

		// Create chart container
		const chart = this.root.container.children.push(
			am5xy.XYChart.new(this.root, {
				panX: false,
				panY: false,
				wheelX: "none",
				wheelY: "none",
				pinchZoomX: false,
			})
		);

		// Cursor
		const cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
		cursor.lineY.set("visible", false);

		// Create X-axis
		const xRenderer = am5xy.AxisRendererX.new(this.root, { minGridDistance: 30 });
		xRenderer.labels.template.setAll({
			rotation: this.rotation,
			centerY: am5.p50,
			centerX: am5.p50,
			paddingRight: 0,
			textAlign: "center",
		});
		const xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(this.root, {
				categoryField: "numberOfWeek",
				renderer: xRenderer,
				tooltip: am5.Tooltip.new(this.root, {}),
			})
		);

		// Create Y-axis
		const yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(this.root, {
				renderer: am5xy.AxisRendererY.new(this.root, { strokeOpacity: 0.1 }),
			})
		);

		// Add threshold line
		const rangeDataItem = yAxis.makeDataItem({});
		const thresholdLine = yAxis.createAxisRange(rangeDataItem);

		thresholdLine.get("grid")?.setAll({
			stroke: am5.color(0x0000ff),
			strokeWidth: 2,
			strokeDasharray: [5, 5],
		});

		rangeDataItem.set("value", this.thresholdValue);

		// Create series
		const series = chart.series.push(
			am5xy.ColumnSeries.new(this.root, {
				name: "Series 1",
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "value",
				categoryXField: "numberOfWeek",
				tooltip: am5.Tooltip.new(this.root, {
					labelText: "{valueY}",
				}),
			})
		);

		// Store selected columns

		/* 
		let selectedColumns: am5.Sprite[] = [];
		series.columns.template.events.on("click", event => {
			const columnSeries = event.target;
			const dataItem = columnSeries.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;

			if (dataItem) {
				const value = dataItem.get("valueY");
				const category = dataItem.get("categoryX");
				this.onYAxisLabelClick(value, category);

				const index = selectedColumns.indexOf(columnSeries);

				if (index > -1) {
					// Column is already selected, unselect it
					columnSeries.set("fillOpacity", 1);
					selectedColumns.splice(index, 1); // Remove from selection
				} else {
					// Select new column
					columnSeries.set("fillOpacity", 0.4);
					selectedColumns.push(columnSeries); // Add to selection
				}

				// Extract selected categories
				const selectedCategories = selectedColumns.map(
					col =>
						(col.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>)?.get(
							"categoryX"
						) ?? ""
				);
				// Update chart click event with selected categories
				this.actionReportService.updateChartClickEvent(selectedCategories);
			}
		}); */

		// Store selected columns
		let selectedColumns: am5.Sprite[] = [];

		series.columns.template.events.on("click", event => {
			const columnSeries = event.target;
			const dataItem = columnSeries.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;

			if (dataItem) {
				const value = dataItem.get("valueY");
				const category = dataItem.get("categoryX");
				this.onYAxisLabelClick(value, category);

				const isCtrlPressed = (event.originalEvent as unknown as KeyboardEvent).ctrlKey; // Check if Ctrl is pressed

				if (!isCtrlPressed) {
					// Check if the clicked column is already selected
					const index = selectedColumns.indexOf(columnSeries);
					if (index > -1) {
						// If already selected, unselect it
						columnSeries.set("fillOpacity", 1);
						selectedColumns.splice(index, 1);
					} else {
						// Normal click: Clear all selections except the clicked one
						series.columns.each(column => column.set("fillOpacity", 1));
						selectedColumns = [columnSeries]; // Store only the clicked column
						columnSeries.set("fillOpacity", 0.4);
					}
				} else {
					// Ctrl + Click: Toggle the clicked column in the selection
					const index = selectedColumns.indexOf(columnSeries);

					if (index > -1) {
						// If already selected, unselect it
						columnSeries.set("fillOpacity", 1);
						selectedColumns.splice(index, 1); // Remove from selection
					} else {
						// Otherwise, add it to selection
						columnSeries.set("fillOpacity", 0.4);
						selectedColumns.push(columnSeries);
					}
				}

				// Extract selected categories
				const selectedCategories = selectedColumns.map(
					col =>
						(col.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>)?.get(
							"categoryX"
						) ?? ""
				);

				// Update chart click event with selected categories
				this.actionReportService.updateChartClickEvent(selectedCategories);
			}
		});

		// Add color logic based on values
		series.columns.template.adapters.add("fill", (fill, target) => {
			const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
			const value = dataItem?.get("valueY") as number;

			return this.getColor(value);
		});

		series.columns.template.adapters.add("stroke", (stroke, target) => {
			const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
			const value = dataItem?.get("valueY") as number;

			return this.getColor(value);
		});

		// Add labels on top of the bars
		series.bullets.push(() => {
			return am5.Bullet.new(this.root, {
				locationX: 0.5,
				locationY: 0.5,
				sprite: am5.Label.new(this.root, {
					text: `{valueY}${this.showBarValueUnit ? this.barValueUnit : ""}`,
					fill: am5.color(0x000000),
					centerY: am5.p100,
					centerX: am5.p50,
					populateText: true,
					fontWeight: "bold",
				}),
			});
		});

		xAxis.data.setAll(this.chartData);
		series.data.setAll(this.chartData);

		// Animation
		series.appear(1000);
		chart.appear(1000, 100);
	}

	// Handle bar click and display its value and category
	onYAxisLabelClick(value: any, category: any): void {
		// Here, you can do any additional logic with the value and category.
	}

	// Update the color based on value and threshold
	getColor = (value: number): am5.Color => {
		const green = am5.color(0x00cc00);
		const red = am5.color(0xff0000);

		if (this.crmReport) {
			return value >= this.thresholdValue ? green : red;
		}
		if (this.reportType === ReportType.MACHINE_WORKLOAD) {
			return value >= this.thresholdValue ? red : green;
		}
		return value >= this.thresholdValue
			? this.isRangeOverview
				? green
				: red
			: this.isRangeOverview
				? red
				: green;
	};
}
