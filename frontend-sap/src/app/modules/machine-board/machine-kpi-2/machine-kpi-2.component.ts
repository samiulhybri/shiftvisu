import { Component, OnInit, ElementRef, OnDestroy, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CommonService } from "@app/shared/services/common.service";
import { Kpi } from "@app/shared/enums/Kpi";
import { ReplaySubject, takeUntil } from "rxjs";
import { formatValue } from "@app/shared/utils/number-formatter";
import { Machine } from "@app/shared/models/machine.model";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";

@Component({
	selector: "app-machine-kpi-2",
	templateUrl: "./machine-kpi-2.component.html",
	styleUrl: "./machine-kpi-2.component.css",
})
export class MachineKpi2Component implements OnInit, OnDestroy {
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
		this.evt = this.eventEmitter.machineKPI2Event.subscribe({
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
