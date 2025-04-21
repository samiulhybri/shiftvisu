import {
	Component,
	ElementRef,
	Input,
	ViewChild,
	AfterViewInit,
	OnDestroy,
	SimpleChanges,
} from "@angular/core";
import { Subscription } from "rxjs";

import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { PlanVisuService } from "@app/modules/planvisu/services/plan-visu.service";
import { ChartRangeList } from "@app/shared/interfaces/chart-range-list";

import { readCookie } from "@app/shared/helpers/read-cookie";
import am5locales_en_US from "@amcharts/amcharts5/locales/en_US";
import am5locales_de_DE from "@amcharts/amcharts5/locales/de_DE";
import am5locales_it_IT from "@amcharts/amcharts5/locales/it_IT";

interface ChartData {
	date: number; // or string depending on how the date is stored
	demand_after: number;
	demand_before: number;
	capacity_before: number;
	capacity_after: number;
}

@Component({
	selector: "app-combined-bullet-column-line-chart",
	template: `<div #chartdiv style="height: 100%"></div>`,
})
export class CombinedBulletColumnLineChartComponent implements AfterViewInit, OnDestroy {
	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	@Input() bullterColumnChartData: any[] = [];
	@Input() lang: string = "en"; // 'en', 'de', 'it'

	private chartDataSubscription!: Subscription;
	private root!: am5.Root;

	constructor(private planVisuService: PlanVisuService) {}

	/* ngOnChanges(changes: SimpleChanges): void {
		if (changes["bullterColumnChartData"] && this.chartDiv) {
			console.log("data", this.bullterColumnChartData);
			this.initChart();
		}
	} */

	ngAfterViewInit(): void {
		this.chartDataSubscription = this.planVisuService.combineBulletChartData$.subscribe(
			data => {
				if (data && data.length > 0) {
					this.initChart(data); // pass data directly
				}
			}
		);
	}

	private getISOWeekNumber(date: Date): number {
		const d = new Date(date.getTime());
		d.setHours(0, 0, 0, 0);

		// Adjust the date to the nearest Thursday (ISO standard)
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));

		// Get the first day of the year
		const yearStart = new Date(d.getFullYear(), 0, 1);

		// Calculate the ISO week number
		const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

		return weekNumber;
	}

	private initChart(bullterColumnChartData: any): void {
		if (this.root) {
			this.root.dispose();
		}

		let selectedLocale = am5locales_en_US;
		this.lang = readCookie("sct_language") ?? "en";
		if (this.lang === "de") selectedLocale = am5locales_de_DE;
		else if (this.lang === "it") selectedLocale = am5locales_it_IT;

		this.root = am5.Root.new(this.chartDiv.nativeElement);
		this.root._logo?.dispose();
		this.root.locale = selectedLocale;

		this.root.setThemes([am5themes_Animated.new(this.root)]);

		// const data = this.bullterColumnChartData;
		const data = bullterColumnChartData;

		const root = this.root;

		root.dateFormatter.setAll({
			dateFormat: "yyyy-MM-dd",
			dateFields: ["valueX"],
		});

		const chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: false,
				panY: false,
				wheelX: "panX",
				wheelY: "zoomX",
				layout: root.verticalLayout,
			})
		);

		const cursor = chart.set(
			"cursor",
			am5xy.XYCursor.new(root, {
				behavior: "zoomX",
			})
		);
		cursor.lineY.set("visible", false);

		const xAxis = chart.xAxes.push(
			am5xy.DateAxis.new(root, {
				baseInterval: { timeUnit: "week", count: 1 },
				renderer: am5xy.AxisRendererX.new(root, {
					minorGridEnabled: true,
					minGridDistance: 30,
				}),
				groupData: true,
				markUnitChange: true,
				// startLocation: 0.5, // Center the data
				// endLocation: 0.5, // Center the data
				tooltip: am5.Tooltip.new(root, {}),
			})
		);

		// Custom label format: yyyy-ww
		xAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
			const dataItem = target.dataItem;
			if (!dataItem) return text;

			// Type assertion to ensure dataContext is of type ChartData
			const dataContext = dataItem.dataContext as ChartData;
			if (!dataContext || !dataContext.date) return text;

			const date = new Date(dataContext.date);
			const year = date.getFullYear();
			const weekNumber = this.getWeekNumber(date);

			// Return formatted date as 'YYYY-WW'
			return `${year}-${weekNumber}`;
		});

		// Adjust label alignment
		xAxis.get("renderer").labels.template.setAll({
			// centerX: am5.p50,
			location: 0.5, // Center of the time interval
		});

		const yAxis0 = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				renderer: am5xy.AxisRendererY.new(root, {
					pan: "zoom",
				}),
			})
		);

		const yRenderer1 = am5xy.AxisRendererY.new(root, {
			opposite: true,
		});
		yRenderer1.grid.template.set("forceHidden", true);

		const yAxis1 = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				renderer: yRenderer1,
				syncWithAxis: yAxis0,
			})
		);

		const columnSeries1 = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: $localize`Demand Before`,
				xAxis,
				yAxis: yAxis0,
				valueYField: "demand_before",
				valueXField: "date",
				clustered: false,
				tooltip: am5.Tooltip.new(root, {
					pointerOrientation: "horizontal",
					labelText: "{name}: {valueY}",
				}),
			})
		);
		columnSeries1.columns.template.setAll({
			width: am5.percent(60),
			fillOpacity: 0.5,
			strokeOpacity: 0,
		});
		columnSeries1.data.processor = am5.DataProcessor.new(root, {
			dateFields: ["date"],
			dateFormat: "yyyy-MM-dd",
		});

		const columnSeries0 = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: $localize`Demand After`,
				xAxis,
				yAxis: yAxis0,
				valueYField: "demand_after",
				valueXField: "date",
				clustered: false,
				tooltip: am5.Tooltip.new(root, {
					pointerOrientation: "horizontal",
					labelText: "{name}: {valueY}",
				}),
			})
		);
		columnSeries0.columns.template.set("width", am5.percent(40));
		columnSeries0.data.processor = am5.DataProcessor.new(root, {
			dateFields: ["date"],
			dateFormat: "yyyy-MM-dd",
		});

		const series0 = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: $localize`Capacity Before`,
				xAxis,
				yAxis: yAxis1,
				valueYField: "capacity_before",
				valueXField: "date",
				tooltip: am5.Tooltip.new(root, {
					pointerOrientation: "horizontal",
					labelText: "{name}: {valueY}",
				}),
			})
		);
		series0.strokes.template.setAll({ strokeWidth: 2 });
		series0.bullets.push(() =>
			am5.Bullet.new(root, {
				sprite: am5.Circle.new(root, {
					stroke: series0.get("fill"),
					strokeWidth: 2,
					fill: root.interfaceColors.get("background"),
					radius: 5,
				}),
			})
		);

		const series1 = chart.series.push(
			am5xy.SmoothedXLineSeries.new(root, {
				name: $localize`Capacity After`,
				xAxis,
				yAxis: yAxis1,
				valueYField: "capacity_after",
				valueXField: "date",
			})
		);
		series1.strokes.template.setAll({
			strokeWidth: 2,
			strokeDasharray: [2, 2],
		});
		series1.set(
			"tooltip",
			am5.Tooltip.new(root, {
				pointerOrientation: "horizontal",
				labelText: "{name}: {valueY}",
			})
		);
		series1.bullets.push(() =>
			am5.Bullet.new(root, {
				sprite: am5.Circle.new(root, {
					stroke: series1.get("fill"),
					strokeWidth: 2,
					fill: root.interfaceColors.get("background"),
					radius: 5,
				}),
			})
		);

		const legend = chart.children.push(
			am5.Legend.new(root, {
				x: am5.p50,
				centerX: am5.p50,
			})
		);
		legend.data.setAll(chart.series.values);

		// Set data
		columnSeries0.data.setAll(data);
		columnSeries1.data.setAll(data);
		series0.data.setAll(data);
		series1.data.setAll(data);

		// Animate
		series0.appear(1000);
		series1.appear(1000);
		chart.appear(1000, 100);
	}

	ngOnDestroy(): void {
		if (this.chartDataSubscription) {
			this.chartDataSubscription.unsubscribe();
		}
		if (this.root) {
			this.root.dispose();
		}
	}

	// Helper function to calculate the week number of the year
	private getWeekNumber(date: Date): string {
		const startDate = new Date(date.getFullYear(), 0, 1);
		const diff = date.getTime() - startDate.getTime();
		const days = Math.floor(diff / (1000 * 3600 * 24));
		const weekNumber = Math.ceil((days + 1) / 7);
		return weekNumber.toString().padStart(2, "0"); // Ensure 2-digit week number
	}
}
