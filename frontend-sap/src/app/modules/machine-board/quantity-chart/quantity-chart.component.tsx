import {
	AfterViewInit,
	Component,
	ElementRef,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	ViewChild,
	ViewEncapsulation,
} from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import * as React from "react";
import { Root, createRoot } from "react-dom/client";
import { Card, CardHeader, FlexBox, Text, ThemeProvider } from "@ui5/webcomponents-react";
import { ColumnChart } from "@ui5/webcomponents-react-charts";
import { ColumnChartData } from "@app/shared/interfaces/columnChart";
import { ProdOrderPosOperationQuantity } from "@app/shared/models/prod-order-pos-operation-quantity.model";
import moment from "moment";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";

const containerElementRef = "columnChartPageLayout";

@Component({
	selector: "app-quantity-chart",
	templateUrl: "./quantity-chart.component.html",
	encapsulation: ViewEncapsulation.None,
})
export class QuantityChartComponent implements OnChanges, OnDestroy, AfterViewInit, OnInit {
	private root: Root | null = null;
	private targetLocalized = $localize`Target`;
	@ViewChild(containerElementRef, { static: true }) containerRef!: ElementRef;
	evt: any;
	machine_id!: number;

	@Input() public chartHeight = "";

	@Input()
	public set machineId(id: any) {
		if (id) {
			this.machine_id = id;
			this.loadData(id);
		}
	}

	data: ColumnChartData = {
		target: 0,
		values: [],
	};

	// CLass is not working properly with React Flexbox
	legendWrapper = {
		gap: "10px",
		padding: "0px 16px 16px 50px",
		marginTop: "-10px",
	};

	measures = [
		{
			accessor: `scrap`,
			label: $localize`Scrap`,
			color: "var(--badPartColor)",
			stackId: "A",
			formatter: (res: any) => new Intl.NumberFormat("en-US").format(res),
		},
		{
			accessor: `rework`,
			label: $localize`Rework`,
			color: "var(--reworkPartColor)",
			stackId: "A",
			formatter: (res: any) => new Intl.NumberFormat("en-US").format(res),
		},

		{
			accessor: "good",
			label: $localize`Good`,
			stackId: "A",
			color: "var(--goodPartColor)",
			formatter: (res: any) => new Intl.NumberFormat("en-US").format(res),
		},
	];

	constructor(
		public commonService: CommonService,
		private eventEmitter: MachineBoardEventHandleService
	) {
		this.evt = this.eventEmitter.quantityChartEvent.subscribe({
			next: () => {
				this.loadData(this.machine_id);
			},
		});
	}

	ngOnInit() {
		this.ngOnChanges();
	}

	ngOnChanges(): void {
		if (!this.root) {
			this.root = createRoot(this.containerRef.nativeElement!);
		}

		this.render();
	}

	ngAfterViewInit() {
		this.render();
	}

	ngOnDestroy() {
		this.root?.unmount();
		this.evt.unsubscribe();
	}

	loadData(machineId: number) {
		try {
			this.commonService
				.get(`machine-board/machine-production-quantity-chart/${machineId}`, false)
				.subscribe((res: any) => {
					this.data.values = new ProdOrderPosOperationQuantity().processData(res || {});
					this.data.target = res.target;
					this.render();
				});
		} catch (error) {
			console.log(error);
		}
	}

	render() {
		let {} = this;

		this.root?.render(
			<React.StrictMode>
				<ThemeProvider>
					<Card header={<CardHeader titleText="Production Quantities" />} style={{ height: "100%" }}>
						<div className="hrStyle"></div>
						<div className="pl-3 h-[25vh]">
							<ColumnChart
								style={{ height: '100%' }}
								dataset={this.data?.values}
								dimensions={[
									{
										accessor: "name",
										formatter: (res: any) =>
											moment.utc(res, "HH:mm").local().format("HH:mm"),
									},
								]}
								measures={this.measures}
								chartConfig={{
									referenceLine: {
										color: "var(--targetPartColor)",
										value: this.data.target,
										strokeWidth: 2,
									},
									margin: {
										top: 10,
										bottom: 10,
										left: 20,
										right: 10,
									},
								}}
								noLegend
							/>

							<FlexBox
								alignItems="Stretch"
								direction="Row"
								justifyContent="Start"
								style={this.legendWrapper}
								wrap="NoWrap">
								<FlexBox className="gap-8">
									<div
										className="legendColor"
										style={{
											backgroundColor: this.measures[2].color,
										}}></div>
									<Text>{this.measures[2].label}</Text>
								</FlexBox>
								<FlexBox className="gap-8">
									<div
										className="legendColor"
										style={{
											backgroundColor: this.measures[1].color,
										}}></div>
									<Text>{this.measures[1].label}</Text>
								</FlexBox>
								<FlexBox className="gap-8">
									<div
										className="legendColor"
										style={{
											backgroundColor: this.measures[0].color,
										}}></div>
									<Text>{this.measures[0].label}</Text>
								</FlexBox>
								<FlexBox className="gap-8">
									<div
										className="legendColor"
										style={{
											backgroundColor: "var(--targetPartColor)",
										}}></div>
									<Text>{this.targetLocalized}</Text>
								</FlexBox>
							</FlexBox>
						</div>
					</Card>
				</ThemeProvider>
			</React.StrictMode>
		);
	}
}
