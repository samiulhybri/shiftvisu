import { Component, Input } from '@angular/core';
import { Machine } from '@app/shared/models/machine.model';
import MachineMachineStateTime from '@app/shared/models/machine-machine-state-time.model';
import { CommonService } from '@app/shared/services/common.service';
import { ActivatedRoute, } from '@angular/router';
import { MachineBoardEventHandleService } from '@app/modules/machine-board/services/machine-board-event-handle.service';

@Component({
	selector: "app-machine-state-timeline",
	templateUrl: "./machine-state-timeline.component.html",
	styleUrl: "./machine-state-timeline.component.css",
})
export class MachineStateTimelineComponent {
	@Input() machine?: Machine;
	@Input() isBusy = false;
	isDialogOpen = false;
	isChartBusy = false;
	machineStateTimes: MachineMachineStateTime[] = [];
	machineStateSubscriptions?: any;
	currentState: MachineMachineStateTime | undefined = undefined;
	noStateText: string = $localize`No State`;
	
	constructor(
		private commonService: CommonService,
		private route: ActivatedRoute,
		private machineBoardEventService: MachineBoardEventHandleService
	) {}

	ngOnInit(): void {
		this.resetMachineStateTime();
		this.checkRoute();
	}

	resetMachineStateTime(){
		const id = this.route.snapshot.params["id"];
		this.isChartBusy = true;
		this.commonService
			.get(`machines/${id}/machine-state-times`, false)
			.subscribe((data: any) => {
				this.machineStateTimes = data.map((value: any) =>
					new MachineMachineStateTime().deserialize(value)
				);

				this.currentState = this.machineStateTimes.find((data:MachineMachineStateTime)=> !data.end);

				this.isChartBusy = false;
			});
	}

	checkRoute() {
		this.machineStateSubscriptions = this.machineBoardEventService.machineStateChangeEvent.subscribe(
			() => {
				this.resetMachineStateTime();
			}
		);
	}

	openMachineSwithPopUp() {
		this.isDialogOpen = true;
	}

	ngOnDestroy(): void {
		this.machineStateSubscriptions.unsubscribe();
	}

	closeSwitchButton() {
		this.isDialogOpen = false;
	}
}