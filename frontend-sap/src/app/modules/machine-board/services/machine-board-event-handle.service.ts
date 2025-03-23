import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class MachineBoardEventHandleService {
	machineStateChangeEvent = new EventEmitter<void>();
	clockInChangeEvent = new EventEmitter<void>();
	machineKPI1Event = new EventEmitter<void>();
	machineKPI2Event = new EventEmitter<void>();
	quantityChartEvent = new EventEmitter<void>();
	prodOrderPosOperationEvent = new EventEmitter<void>();

	constructor() {}

	triggerMachineStateChange() {
		this.machineStateChangeEvent.emit();
	}

	triggerClockInChangeEvent() {
		this.clockInChangeEvent.emit();
	}
	machineKPI1ChangeEvent() {
		this.machineKPI1Event.emit();
	}
	machineKPI2ChangeEvent() {
		this.machineKPI2Event.emit();
	}
	quantityChartChangeEvent() {
		this.quantityChartEvent.emit();
	}
	prodOrderPosOperationChangeEvent() {
		this.prodOrderPosOperationEvent.emit();
	}
}
