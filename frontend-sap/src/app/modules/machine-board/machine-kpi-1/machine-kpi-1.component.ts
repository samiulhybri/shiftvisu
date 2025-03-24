import { Component, ElementRef, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { ReplaySubject } from "rxjs";
import { Machine } from "@app/shared/models/machine.model";
import { Kpi } from "@app/shared/enums/Kpi";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";

@Component({
	selector: "app-machine-kpi-1",
	templateUrl: "./machine-kpi-1.component.html",
	styleUrl: "./machine-kpi-1.component.css",
})
export class MachineKpi1Component implements OnDestroy, OnInit {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@Input() machine?: Machine;
	evt: any;

	constructor(
		public commonService: CommonService,
		public el: ElementRef,
		private eventEmitter: MachineBoardEventHandleService
	) {}

	ngOnInit(): void {
		this.machine?.updateKpis([Kpi.MACHINE_USAGE, Kpi.MACHINE_PERFORMANCE, Kpi.SCRAP, Kpi.OEE]);
		this.evt = this.eventEmitter.machineKPI1Event.subscribe({
			next: () => {
				this.machine?.updateKpis([
					Kpi.MACHINE_USAGE,
					Kpi.MACHINE_PERFORMANCE,
					Kpi.SCRAP,
					Kpi.OEE,
				]);
			},
		});
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
		this.evt.unsubscribe();
	}
}
