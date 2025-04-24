import {
	Component,
	ElementRef,
	EventEmitter,
	NgZone,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from "@angular/core";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting";
import React from "react";
import { Button, FlexBox, Icon } from "@ui5/webcomponents-react";
import { CommonService } from "@app/shared/services/common.service";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";

@Component({
	selector: "app-shift-visu-overview",
	templateUrl: "./shift-visu-overview.component.html",
	styleUrl: "./shift-visu-overview.component.css",
})
export class ShiftVisuOverviewComponent implements OnInit, OnDestroy {
	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	@ViewChild("stockchart", { static: true }) stockChart!: ElementRef;
	@Output() openIssueViewer: EventEmitter<any> = new EventEmitter<any>();
	@ViewChild("ShiftvisuOverviewdetails", { static: false }) ShiftvisuOverviewdetails:
		| CustomReactGridTable
		| undefined;
	private pieRoot!: am5.Root;
	private xyRoot!: am5.Root;
	DetailLists: any[] = [];
	IsLoading :boolean = true;
	constructor(
		private zone: NgZone,
		public commonService: CommonService
	) {}

	ngOnInit(): void {
		this.zone.runOutsideAngular(() => {
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

	processData(data: any): any {
		this.IsLoading = false;
		this.DetailLists = data[0].map((item: any) => item);
		this.initPieChart(this.DetailLists.length, 12, 6);
	}

	private initPieChart(total: number, urgent: number, not_urgent: number): void {
		this.pieRoot = am5.Root.new(this.chartDiv.nativeElement);

		this.pieRoot.setThemes([am5themes_Animated.new(this.pieRoot)]);

		const chart = this.pieRoot.container.children.push(
			am5percent.PieChart.new(this.pieRoot, {
				layout: this.pieRoot.verticalLayout,
				innerRadius: am5.percent(50),
				paddingBottom: 15,
				paddingTop: 15,
				paddingLeft: 15,
				paddingRight: 15,
			})
		);

		const series = chart.series.push(
			am5percent.PieSeries.new(this.pieRoot, {
				valueField: "value",
				categoryField: "category",
				alignLabels: false,
			})
		);

		series.labels.template.adapters.add("text", (text, target) => {
			const dataItem = target.dataItem;
			if (!dataItem) return text;

			const context = dataItem.dataContext as { category: string; value: number };
			const evenValue = context.value % 2 === 0 ? context.value : context.value;
			return `${context.category}: ${evenValue}`;
		});

		series.slices.template.adapters.add("fill", (fill, target) => {
			const data = target.dataItem?.dataContext as { color?: am5.Color };
			return data?.color ?? fill;
		});

		series.slices.template.adapters.add("stroke", (stroke, target) => {
			const data = target.dataItem?.dataContext as { color?: am5.Color };
			return data?.color ?? stroke;
		});

		const ChartData: any[] = [];

		if (urgent > 0) {
			ChartData.push({ value: urgent, category: "Urgent", color: am5.color(0xff0000) });
		}

		if (total > 0) {
			ChartData.push({ value: total, category: "Total", color: am5.color(0x0000ff) });
		}

		if (not_urgent > 0) {
			ChartData.push({
				value: not_urgent,
				category: "Not Urgent",
				color: am5.color(0x07b00d),
			});
		}

		series.data.setAll(ChartData);
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
			{ country: "SSC", visits: 665, columnSettings: { fill: am5.color(0x0000ff) } },
			{ country: "Test", visits: 600, columnSettings: { fill: am5.color(0x0000ff) } },
			{ country: "TDAQ", visits: 441, columnSettings: { fill: am5.color(0x0000ff) } },
			{
				country: "Test2",
				visits: 395,
				columnSettings: { fill: am5.color(0x0000ff) },
			},
			{ country: "HWK", visits: 386, columnSettings: { fill: am5.color(0x0000ff) } },
			{
				country: "Test4",
				visits: 384,
				columnSettings: { fill: am5.color(0x0000ff) },
			},
			{ country: "ADK", visits: 700, columnSettings: { fill: am5.color(0x0000ff) } },
			{
				country: "Test7",
				visits: 328,
				columnSettings: { fill: am5.color(0x0000ff) },
			},
			{ country: "SB", visits: 328, columnSettings: { fill: am5.color(0x0000ff) } },
			{
				country: "Test3",
				visits: 328,
				columnSettings: { fill: am5.color(0x0000ff) },
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

		am5plugins_exporting.Exporting.new(this.xyRoot, {
			menu: am5plugins_exporting.ExportingMenu.new(this.xyRoot, {}),
		});

		series.appear();
		chart.appear(1000, 100);
	}

	columns = [
		{
			Header: $localize`Id`,
			accessor: "id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Error`,
			accessor: "error.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Creator`,
			accessor: "creator.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Start Date`,
			accessor: "created_at",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Descreption`,
			accessor: "description",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Button
							icon="message-information"
							onClick={e => {
								this.openIssueViewer.emit({
									data: instance.row.original,
									tab: "details",
								});
							}}
							design="Transparent"></Button>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Attachment`,
			accessor: "attachment",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				return (
					<React.StrictMode>
						<Button
							onClick={e => {
								this.openIssueViewer.emit({
									data: instance.row.original,
									tab: "attachment",
								});
							}}
							icon="attachment"
							design="Transparent">
							2 Files
						</Button>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				const { row } = instance;
				return (
					<React.StrictMode>
						<Button
							icon="show"
							onClick={e => {
								this.openIssueViewer.emit({
									data: instance.row.original,
									tab: "overview",
								});
							}}
							design="Transparent"></Button>
					</React.StrictMode>
				);
			},
		},
	];

	issues = [
		{
			label: "Production",
			percentage: 70,
			bgcolor: "bg-green-600",
			textcolor: "text-green-600",
		},
		{
			label: "Setup",
			percentage: 19,
			bgcolor: "bg-orange-500",
			textcolor: "text-orange-500",
		},
		{ label: "Machine Off", percentage: 11, bgcolor: "bg-red-500", textcolor: "text-red-500" },
	];
}
