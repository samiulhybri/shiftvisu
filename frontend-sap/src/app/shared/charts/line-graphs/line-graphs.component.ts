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

import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { ChartInterval } from "@app/shared/enums/chartInterval";
import { TimeUnit } from "@amcharts/amcharts5/.internal/core/util/Time";

@Component({
	selector: "app-line-graphs",
	template: ` <div #chartdiv style="height: 100%; width: 100%"></div> `,
	styleUrls: ["./line-graphs.component.css"],
})
export class LineGraphsComponent implements OnChanges, OnDestroy {
	@Input() intervalChart: string = ChartInterval.DAY; // based on this, we will show that data based on date/month/minutes/hour
	@Input() tooltipPattern?: string;
	@Input() chartData: { date: number; value: number }[] = [];
	@Input() dateLines: { date: number; label: string }[] = [];
	@Input() designData: {
		lowerLimit?: number;
		upperLimit?: number;
		rangeColor: string;
		unit?: string;
		lowerRangeColor?: string;
		dateLineColor: string;
	} = {
		rangeColor: "#000000",
		dateLineColor: "#000000",
	};

	@ViewChild("chartdiv", { static: true }) chartDiv!: ElementRef;
	currentLanguage = localStorage.getItem("CurrentLanguage") || "en";

	private root?: am5.Root;

	ngOnDestroy(): void {
		if (this.root) {
			this.root.dispose();
			this.root = undefined; // ✅ Prevent memory leaks
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["chartData"] && this.chartData) {
			this.initChart();
		}
	}

	private initChart(): void {
		// ✅ Dispose old chart instance if it exists
		if (this.root) {
			this.root.dispose();
		}

		this.root = am5.Root.new(this.chartDiv.nativeElement);
		this.root._logo?.dispose(); // ✅ Remove amCharts logo

		// ✅ Apply theme
		this.root.setThemes([am5themes_Animated.new(this.root)]);

		// ✅ Create chart
		let chart = this.root.container.children.push(
			am5xy.XYChart.new(this.root, {
				panX: true,
				panY: true,
				wheelY: "zoomX",
				pinchZoomX: true,
				pinchZoomY: true,
				paddingLeft: 0,
			})
		);

		// ✅ Create axes
		let xAxis = chart.xAxes.push(
			am5xy.DateAxis.new(this.root, {
				maxDeviation: 0.2,
				baseInterval: { timeUnit: this.intervalChart as TimeUnit, count: 1 },
				renderer: am5xy.AxisRendererX.new(this.root, {
					minorGridEnabled: true,
					minGridDistance: 90,
				}),
				tooltip: am5.Tooltip.new(this.root, {}),
				start: -0.1,
				end: 1.1,
			})
		);

		if (this.tooltipPattern) {
			xAxis.set("tooltipDateFormats", { [this.intervalChart]: this.tooltipPattern });
		}

		let allValues = this.chartData.map(c => c.value);

		if (this.designData.lowerLimit != undefined && this.designData.lowerLimit != null) {
			allValues.push(this.designData.lowerLimit);
		}

		if (this.designData.upperLimit != undefined && this.designData.upperLimit != null) {
			allValues.push(this.designData.upperLimit);
		}

		let min = Math.min(...allValues);
		let max = Math.max(...allValues);

		let lowerBoundary = min - (max - min) * 0.1;
		let upperBoundary = max + (max - min) * 0.1;

		let yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(this.root, {
				min: Number(lowerBoundary),
				max: Number(upperBoundary),
				extraTooltipPrecision: 1,
				renderer: am5xy.AxisRendererY.new(this.root, {}),
			})
		);

		if (
			this.designData.lowerLimit != undefined &&
			this.designData.lowerLimit != null &&
			this.designData.upperLimit != undefined &&
			this.designData.upperLimit != null &&
			this.designData.rangeColor
		) {
			addLimits(
				this.root,
				this.designData.lowerLimit,
				this.designData.upperLimit,
				this.designData.rangeColor,
				this.designData.lowerRangeColor ?? this.designData.rangeColor,
				$localize`Min ` +
					(this.designData.lowerLimit != null && this.designData.lowerLimit != undefined
						? `(${this.designData.lowerLimit} ${this.designData.unit ?? ""})`
						: ""),
				$localize`Max ` +
					(this.designData.upperLimit != null && this.designData.upperLimit != undefined
						? `(${this.designData.upperLimit} ${this.designData.unit ?? ""})`
						: "")
			);
		}


		chart.plotContainer.events.on("wheel", function(ev) {
			if (ev.originalEvent.ctrlKey) {
				ev.originalEvent.preventDefault();
				chart.set("wheelX", "panX");
				chart.set("wheelY", "zoomX");
			} else {
				ev.originalEvent.preventDefault();
				chart.set("wheelX", "none");
				chart.set("wheelY", "zoomY");
			}
		});

		// ✅ Add series
		let series = chart.series.push(
			am5xy.LineSeries.new(this.root, {
				minBulletDistance: 10,
				name: "Series",
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: "value",
				valueXField: "date",
				maskBullets: true,
				stroke: am5.color("#000000"),
				legendValueText: "{valueY}",
				tooltip: am5.Tooltip.new(this.root, {
					pointerOrientation: "horizontal",
					labelText: ("{valueY} " + (this.designData.unit ?? "")).trim()+ "\nUser: {user}",
				}),
				snapTooltip: true,
			})
		);

		if (this.root) {
			series.bullets.push(() => {
				{
					return am5.Bullet.new(this.root!, {
						sprite: am5.Circle.new(this.root!, {
							radius: 3,
							fill: am5.color("#000000"),
							tooltip: am5.Tooltip.new(this.root!, {
								labelText: "Value: {valueY}",
							}),
						}),
					});
				}
			});
		}

		var rangeDataItem = yAxis.makeDataItem({});
		yAxis.createAxisRange(rangeDataItem);

		var container = am5.Container.new(this.root, {
			centerY: am5.p50,
			draggable: true,
			layout: this.root.horizontalLayout,
		});

		container.adapters.add("x", function () {
			return 0;
		});

		yAxis.topGridContainer.children.push(container);

		rangeDataItem.set(
			"bullet",
			am5xy.AxisBullet.new(this.root, {
				sprite: container,
			})
		);

		var background = am5.RoundedRectangle.new(this.root, {
			fill: am5.color(0xffffff),
			fillOpacity: 1,
			strokeOpacity: 0.5,
			cornerRadiusTL: 0,
			cornerRadiusBL: 0,
			cursorOverStyle: "ns-resize",
			stroke: am5.color(0xff0000),
		});

		container.set("background", background);

		// ✅ Add scrollbar
		// TODO:: Uncomment this block if you want to have horizontal Scrolbar
		// chart.set("scrollbarX", am5.Scrollbar.new(this.root, { orientation: "horizontal" }));

		if (this.currentLanguage !== "en") this.root.locale = am5locales_de_DE;

		// ✅ Set data
		series.data.setAll(this.chartData);

		// ✅ Add cursor
		let cursor = chart.set(
			"cursor",
			am5xy.XYCursor.new(this.root, {
				behavior: "none",
				snapToSeries: [series],
			})
		);

		cursor.lineY.set("visible", false);

		this.dateLines.forEach((dateLine, i, []) => {
			var line = xAxis.createAxisRange(xAxis.makeDataItem({ value: dateLine.date }));
			var boundary = xAxis.createAxisRange(xAxis.makeDataItem({ value: dateLine.date }));

			if (this.root) {
				line.get("grid")?.setAll({
					visible: true,
					strokeDasharray: [5, 5],
					stroke: am5.color(this.designData.dateLineColor),
					strokeOpacity: 1,
					strokeWidth: 2,
					location: 1,
				});

				boundary.get("grid")?.setAll({
					visible: true,
					stroke: am5.color(this.designData.dateLineColor),
					strokeOpacity: 0,
					strokeWidth: 20,
					location: 1,
					tooltipText: dateLine.label,
					tooltipPosition: "fixed",
					showTooltipOn: "hover",
					tooltip: am5.Tooltip.new(this.root, {
						pointerOrientation: "horizontal",
					}),
				});
			}
		});

		// ✅ Animate on load
		series.appear(1000);
		chart.appear(1000, 100);

		function createRange(
			root: am5.Root,
			value: number,
			endValue?: number,
			label?: string,
			color?: am5.Color,
			dashed: boolean = false
		) {
			let rangeDataItem = yAxis.makeDataItem({
				value: Number(value),
				endValue: Number(endValue),
			});

			let range = yAxis.createAxisRange(rangeDataItem);

			if (endValue) {
				range.get("axisFill")?.setAll({
					fill: color,
					fillOpacity: 0.2,
					visible: true,
				});
			} else {
				range.get("grid")?.setAll({
					stroke: color,
					strokeOpacity: 1,
					strokeWidth: 2,
					location: 1,
				});
				const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
				cursor.lineY.set("visible", false);
			}

			if (dashed) {
				range.get("grid")?.set("strokeDasharray", [5, 5]);
			}

			if (label) {
				range.get("label")?.setAll({
					text: label,
					location: 1,
					fontWeight: "bold",
					inside: true,
					centerX: am5.p0,
					centerY: am5.p100,
				});
			}
		}

		function addLimits(
			root: am5.Root,
			lower: number,
			upper: number,
			color: string,
			lowerLimitColor: string,
			lowerLabel: string = "",
			upperLabel: string = ""
		) {
			// Add range fill
			createRange(root, lower, upper, undefined, am5.color(color));

			// Add upper/lower lines
			createRange(root, upper, undefined, upperLabel, am5.color(color), true);
			createRange(root, lower, undefined, lowerLabel, am5.color(lowerLimitColor), true);
		}
	}
}
