import {
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
import { MarketSegments } from "@app/modules/crm/interfaces/action-report";
import { ActionReportService } from "@app/modules/crm/services/action-report.service";

@Component({
	selector: "app-vertical-bar-chart",
	template: ` <div #chartdiv style="height: 100%"></div> `,
})
export class VerticalBarChartComponent implements OnInit, OnChanges, OnDestroy {
	@Input() chartData: MarketSegments[] = [];
	@Input() thresholdValue = 60;
	@Input() barValueUnit = "%";
	@Input() showBarValueUnit: boolean = true;
	@Input() isRangeOverview: boolean = false;
	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	private chartDataSubscription!: Subscription;
	maxCategoryWidth: number = 320;

	private root!: am5.Root;

	constructor(
		private planVisuService: PlanVisuService,
		private actionReportService: ActionReportService
	) {}

	ngOnInit(): void {
		/* this.chartDataSubscription = this.planVisuService
			.barChartDataBehaviorObservable()
			.subscribe((data: MarketSegments[]) => {
				this.chartData = data;
				this.initChart();
			}); */
		this.maxCategoryWidth = this.getValueBasedOnWidth(window.innerWidth);
	}

	getValueBasedOnWidth(width: number): number {
		if (width >= 2560) {
			return 400;
		} else if (width >= 1920) {
			return 320;
		} else if (width >= 1536) {
			return 250;
		}
		return 250; // Default value if the width is smaller than 1536
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
		this.root._logo?.dispose();
		this.root.setThemes([am5themes_Animated.new(this.root)]);

		const chart = this.root.container.children.push(
			am5xy.XYChart.new(this.root, {
				panX: false,
				panY: false,
				wheelX: "none",
				wheelY: "none",
				pinchZoomX: false,
			})
		);

		// Add a scrollbar for Y-axis when data exceeds 20 items
		if (this.chartData.length > 30) {
			chart.set("scrollbarY", am5.Scrollbar.new(this.root, { orientation: "vertical" }));
		}

		const cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {}));
		cursor.lineX.set("visible", false); // Hide vertical cursor line

		// Swap X and Y axis
		const yRenderer = am5xy.AxisRendererY.new(this.root, { minGridDistance: 12 });
		yRenderer.labels.template.setAll({
			rotation: 0,
			textAlign: "left", // Align text to the left
			centerY: am5.p50,
			centerX: 0,
			paddingRight: 5,
			oversizedBehavior: "truncate", // Truncate long labels with ellipsis
			maxWidth: this.maxCategoryWidth, // Adjust based on available space
			tooltipText: "{category}", // Show full text on hover
		});

		const yAxis = chart.yAxes.push(
			am5xy.CategoryAxis.new(this.root, {
				categoryField: "name", // Now category on Y-axis
				renderer: yRenderer,
				tooltip: am5.Tooltip.new(this.root, {}),
			})
		);

		const xAxis = chart.xAxes.push(
			am5xy.ValueAxis.new(this.root, {
				renderer: am5xy.AxisRendererX.new(this.root, { strokeOpacity: 0.1 }),
			})
		);

		// Add threshold line
		const rangeDataItem = xAxis.makeDataItem({});
		const thresholdLine = xAxis.createAxisRange(rangeDataItem);

		thresholdLine.get("grid")?.setAll({
			stroke: am5.color(0x0000ff),
			strokeWidth: 2,
			strokeDasharray: [5, 5],
		});

		rangeDataItem.set("value", this.thresholdValue);

		// Series configuration for vertical bars
		const series = chart.series.push(
			am5xy.ColumnSeries.new(this.root, {
				name: "Series 1",
				xAxis: xAxis,
				yAxis: yAxis,
				valueXField: "ratio", // Swapped to X
				categoryYField: "name", // Swapped to Y
				tooltip: am5.Tooltip.new(this.root, {
					labelText: "{valueX}",
				}),
			})
		);

		// Store the previously selected column (use am5.Rectangle instead of am5xy.Column)
		let selectedColumns: am5.Rectangle[] = [];

		// Add click event for bar chart columns
		series.columns.template.events.on("click", event => {
			const columnSeries = event.target;
			const dataItem = columnSeries.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;

			const isCtrlPressed = (event.originalEvent as unknown as KeyboardEvent).ctrlKey; // Check if Ctrl is pressed

			if (dataItem) {
				const data = dataItem.dataContext as { name: string; ratio: number }; // Type assertion
				const category = data.name;
				const value = data.ratio;

				this.onYAxisLabelClick(value, category);

				if (!isCtrlPressed) {
					// Normal click: Clear all selections except the clicked one
					series.columns.each(column => column.set("fillOpacity", 1));
					selectedColumns = [columnSeries];
					columnSeries.set("fillOpacity", 0.4);
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
			}

			// Extract selected categories
			const selectedCategories = selectedColumns.map(col => {
				const dataItem = col.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
				const data = dataItem?.dataContext as { name: string } | null; // Explicitly define the expected structure

				return data?.name ?? "";
			});

			// Update chart event with selected categories
			this.actionReportService.updateSegmentBarChartEvent(selectedCategories);
		});

		series.columns.template.adapters.add("fill", (fill, target) => {
			const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
			const value = dataItem?.get("valueX") as number;
			return value >= this.thresholdValue ? am5.color(0x00cc00) : am5.color(0xff0000);
		});

		series.columns.template.adapters.add("stroke", (stroke, target) => {
			const dataItem = target.dataItem as am5.DataItem<am5xy.IColumnSeriesDataItem>;
			const value = dataItem?.get("valueX") as number;
			return value >= this.thresholdValue ? am5.color(0x00cc00) : am5.color(0xff0000);
		});

		// Labels on top of bars
		series.bullets.push(() => {
			return am5.Bullet.new(this.root, {
				locationX: 0.5,
				locationY: 0.5,
				sprite: am5.Label.new(this.root, {
					text: `{valueX} ${this.showBarValueUnit ? this.barValueUnit : ""}`,
					fill: am5.color(0x000000),
					centerY: am5.p50,
					// centerX: am5.p100,
					populateText: true,
					fontWeight: "bold",
				}),
			});
		});

		const currentLanguage = localStorage.getItem("CurrentLanguage") || "en";

		if (currentLanguage === "de") this.root.locale = am5locales_de_DE;
		if (currentLanguage === "it") this.root.locale = am5locales_it_IT;

		this.root.numberFormatter.setAll({
			numberFormat: "#,###",
			numericFields: ["valueX"],
		});

		// Set data
		yAxis.data.setAll(this.chartData);
		series.data.setAll(this.chartData);

		// Animation
		series.appear(1000);
		chart.appear(1000, 100);
	}

	// Handle bar click and display its value and category
	onYAxisLabelClick(value: any, category: any): void {
		// Here, you can do any additional logic with the value and category.
	}
}
