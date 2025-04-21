import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";
import { Component, Renderer2, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Machine } from "@app/shared/models/machine.model";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { ReplaySubject, takeUntil } from "rxjs";
import { QuantityChartComponent } from "./quantity-chart/quantity-chart.component";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";

@Component({
	selector: "app-machine-board",
	templateUrl: "./machine-board.component.html",
	styleUrl: "./machine-board.component.css",
})
export class MachineBoardComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	protected readonly MachineBoardType = MachineBoardType;
	protected readonly machineBoardTypeClass = MachineBoardTypeClass;
	public machine?: Machine;
	isBusy = false;
	prodOrderPosOperations: any[] = [];
	graphHeight: string = "";
	machineEventSubscription?: any;

	@ViewChild("quantityChart") quantityChart!: QuantityChartComponent;

	constructor(
		private renderer: Renderer2,
		private route: ActivatedRoute,
		public commonService: CommonService,
		private dataService: DataService,
		private machineBoardEventService: MachineBoardEventHandleService,
		private machineboardService: MachineboardService,
	) {}

	async ngOnInit(): Promise<void> {
		this.isBusy = true;
		this.renderer.addClass(document.body, "sapUiSizeCozy");
		this.renderer.removeClass(document.body, "sapUiSizeCompact");
		const id = this.route.snapshot.params["id"];
		this.getMachineById(id);
		this.setMachineMachineStateTimes(id);
		this.setHeight();
		this.checkRoute();
		// this.quantityChart.render();
	}

	setHeight() {
		const height = window.innerHeight;
		this.graphHeight = height > 800 ? `${height - 627}px` : "400px";
	}

	setMachineMachineStateTimes(id: string) {
		this.commonService
			.get(
				`/MachineProdOrderPosOperationTimes?$filter=machine_id eq ${id} and end eq null and (status eq '${ProdOrderPosOperationStatus.IN_PRODUCTION}' or status eq '${ProdOrderPosOperationStatus.IN_SETUP}' or status eq '${ProdOrderPosOperationStatus.IN_TEARDOWN}')`
			)
			.subscribe((data: any) => {
				this.prodOrderPosOperations = data.value.map(
					(value: any) => value.prod_order_pos_operation_id
				);
			});
	}

	checkRoute() {
		this.machineEventSubscription =
			this.machineBoardEventService.prodOrderPosOperationEvent.subscribe(() => {
				const id = this.route.snapshot.params["id"];
				this.setMachineMachineStateTimes(id);
			});
	}

	async getMachineById(id: string) {
		this.commonService
			.get(`Machines/${id}?$expand=plant`)
			.pipe(takeUntil(this.destroyed$))
			.subscribe((machineResponse: any) => {
				this.machine = new Machine(this.commonService).deserialize(machineResponse);
				this.machineboardService.updateSelectedMachine(this.machine);
				this.dataService.machineData = new Machine().deserialize(machineResponse);
				this.isBusy = false;
			});
	}

	ngOnDestroy(): void {
		this.renderer.removeClass(document.body, "sapUiSizeCozy");
		this.renderer.addClass(document.body, "sapUiSizeCompact");
		this.machineboardService.updateSelectedMachine(undefined);
		this.destroyed$.next(true);
		this.destroyed$.complete();
		this.machineEventSubscription.unsubscribe();
	}
}
