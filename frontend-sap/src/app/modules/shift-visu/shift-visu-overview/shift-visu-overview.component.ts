import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";

@Component({
	selector: "app-shift-visu-overview",
	templateUrl: "./shift-visu-overview.component.html",
	styleUrl: "./shift-visu-overview.component.css",
})
export class ShiftVisuOverviewComponent implements OnInit, OnDestroy {
	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	@ViewChild("stockchart", { static: true }) stockChart!: ElementRef;

	private pieRoot!: am5.Root;
	private xyRoot!: am5.Root;

	constructor(private zone: NgZone) {}

	ngOnInit(): void {
		this.zone.runOutsideAngular(() => {
			this.initPieChart();
			this.initXYChart();
		});
	}

	ngOnDestroy(): void {
		if (this.pieRoot) {
			this.pieRoot.dispose();
		}
		if (this.xyRoot) {
			this.xyRoot.dispose();
		}
	}

	private initPieChart(): void {
		this.pieRoot = am5.Root.new(this.chartDiv.nativeElement);
		this.pieRoot.setThemes([am5themes_Animated.new(this.pieRoot)]);

		let chart = this.pieRoot.container.children.push(
			am5percent.PieChart.new(this.pieRoot, {
				layout: this.pieRoot.verticalLayout,
				innerRadius: am5.percent(50),
			})
		);

		let series = chart.series.push(
			am5percent.PieSeries.new(this.pieRoot, {
				valueField: "value",
				categoryField: "category",
				alignLabels: false,
			})
		);

		series.labels.template.setAll({
			textType: "circular",
			centerX: 0,
			centerY: 0,
		});

		

		series.data.setAll([
			{ value: 22, category: "Issues" },
			{ value: 12, category: "Issues" },
			{ value: 20, category: "Issues" },
		]);

		let legend = chart.children.push(
			am5.Legend.new(this.pieRoot, {
				centerX: am5.percent(50),
				x: am5.percent(50),
				marginTop: 15,
				marginBottom: 15,
			})
		);

		legend.data.setAll(series.dataItems);
		series.appear(1000, 100);
		chart.appear(1000, 100);
	}

	private initXYChart(): void {
		this.xyRoot = am5.Root.new(this.stockChart.nativeElement);
		this.xyRoot.setThemes([am5themes_Animated.new(this.xyRoot)]);

		let chart = this.xyRoot.container.children.push(
			am5xy.XYChart.new(this.xyRoot, {
				panX: false,
				panY: false,
				wheelX: "panX",
				wheelY: "zoomX",
				layout: this.xyRoot.verticalLayout,
			})
		);

		let data = [
			{ country: "SSC", visits: 665, columnSettings: { fill: chart.get("colors")?.next() } },
			{ country: "Test", visits: 600, columnSettings: { fill: chart.get("colors")?.next() } },
			{ country: "TDAQ", visits: 441, columnSettings: { fill: chart.get("colors")?.next() } },
			{
				country: "Test2",
				visits: 395,
				columnSettings: { fill: chart.get("colors")?.next() },
			},
			{ country: "HWK", visits: 386, columnSettings: { fill: chart.get("colors")?.next() } },
			{
				country: "Test4",
				visits: 384,
				columnSettings: { fill: chart.get("colors")?.next() },
			},
			{ country: "ADK", visits: 700, columnSettings: { fill: chart.get("colors")?.next() } },
			{
				country: "Test7",
				visits: 328,
				columnSettings: { fill: chart.get("colors")?.next() },
			},
			{ country: "SB", visits: 328, columnSettings: { fill: chart.get("colors")?.next() } },
			{
				country: "Test3",
				visits: 328,
				columnSettings: { fill: chart.get("colors")?.next() },
			},
		];

		let xRenderer = am5xy.AxisRendererX.new(this.xyRoot, {
			cellStartLocation: 0.1,
			cellEndLocation: 0.9,
			minGridDistance: 50,
		});

		let xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(this.xyRoot, {
				categoryField: "country",
				renderer: xRenderer,
				tooltip: am5.Tooltip.new(this.xyRoot, {}),
			})
		);

		xRenderer.grid.template.setAll({
			location: 1,
		});

		xRenderer.labels.template.setAll({
			multiLocation: 0.5,
		});

		xAxis.data.setAll(data);

		let yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(this.xyRoot, {
				renderer: am5xy.AxisRendererY.new(this.xyRoot, {
					strokeOpacity: 0.1,
				}),
			})
		);

		let series = chart.series.push(
			am5xy.ColumnSeries.new(this.xyRoot, {
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "visits",
				categoryXField: "country",
			})
		);

		series.columns.template.setAll({
			tooltipText: "{categoryX}: {valueY}",
			width: am5.percent(90),
			tooltipY: 0,
			strokeOpacity: 0,
			templateField: "columnSettings",
		});

		series.data.setAll(data);

		let exporting = am5plugins_exporting.Exporting.new(this.xyRoot, {
			menu: am5plugins_exporting.ExportingMenu.new(this.xyRoot, {}),
		});

		series.appear();
		chart.appear(1000, 100);
	}

	columns: any = [
		{
			Header: $localize`Error`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Creator`,
			accessor: "model_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},

		{
			Header: $localize`Start Date`,
			accessor: "start_date",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Attachment`,
			accessor: "attachment",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
	];

	issues = [
		{
			label: "Issues Solve",
			percentage: 70,
			bgcolor: "bg-green-600",
			textcolor: "text-green-600",
		},
		{
			label: "Issues Open",
			percentage: 19,
			bgcolor: "bg-orange-500",
			textcolor: "text-orange-500",
		},
		{ label: "Issues Close", percentage: 11, bgcolor: "bg-red-500", textcolor: "text-red-500" },
	];
}
