import { Component, Input } from "@angular/core";
import { ActivatedRoute} from "@angular/router";
import MachineMachineStateTime from "@app/shared/models/machine-machine-state-time.model";
import MachineState from "@app/shared/models/machine-state.model";
import { Machine } from "@app/shared/models/machine.model";
import { CommonService } from "@app/shared/services/common.service";
import { convertSeconds } from "@app/shared/utils/duration-to-hour";
import moment from "moment";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";

@Component({
	selector: "app-machine-state-list",
	templateUrl: "./machine-state-list.component.html",
	styleUrl: "./machine-state-list.component.css",
})
export class MachineStateListComponent {
	isBusy = false;
	@Input() machine?: Machine;
	@Input() machineStates: MachineState[] = [];
	@Input() machineBoardHours?: number;
	@Input() machineStateTimes: MachineMachineStateTime[] = [];
	machineStateSubscriptions?:any;

	constructor(
		private commonService: CommonService,
		private route: ActivatedRoute,
		private machineBoardEventService: MachineBoardEventHandleService
	) {}

	ngOnInit(): void {
		this.setMachineState();
		this.checkRoute();
	}

	checkRoute() {
		this.machineStateSubscriptions = this.machineBoardEventService.machineStateChangeEvent.subscribe(
			(val: any) => {
				this.setMachineState();
			}
		);
	}

	setMachineState() {
		this.isBusy = true;
		const id = this.route.snapshot.params["id"];

		this.commonService.get(`machine/${id}/machine-current-states`, false).subscribe({
			next: (data: any) => {
				this.isBusy = false;
				this.machineStates = data.map((value: any) =>
					new MachineState().deserialize(value)
				);
			},
		});
	}

	ngOnDestroy(): void {
		this.machineStateSubscriptions.unsubscribe();
	}

	getStateTotalTime(stateId?: number) {
		let time = 0;
		this.machineStateTimes.forEach((machineStateTime: MachineMachineStateTime, i: number) => {
			if (
				machineStateTime?.machineState?.id == stateId &&
				(machineStateTime.end == null ||
					moment(machineStateTime.end).diff(moment.utc().local(), "hours") <
						this.machineBoardHours! ||
					12)
			) {
				let startIme;
				if (
					moment
						.utc()
						.local()
						.subtract(this.machineBoardHours ?? 12, "hours")
						.diff(moment.utc(machineStateTime.start).local(), "seconds") > 0
				) {
					startIme = moment
						.utc()
						.local()
						.subtract(this.machineBoardHours ?? 12, "hours");
				} else {
					startIme = moment.utc(machineStateTime.start).local();
				}

				if (!machineStateTime.end) {
					time += moment.utc().local().diff(moment.utc(startIme).local(), "seconds");
				} else {
					time += moment
						.utc(machineStateTime.end)
						.local()
						.diff(moment.utc(startIme).local(), "seconds");
				}
			}
		});

		return convertSeconds(time);
	}
}
