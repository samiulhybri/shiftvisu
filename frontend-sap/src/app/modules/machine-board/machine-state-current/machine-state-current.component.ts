import { Component } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { ActivatedRoute} from "@angular/router";
import { Machine } from "@app/shared/models/machine.model";
import {
	MachineStateStateType,
} from "@app/shared/enums/MachineStateStateType";
import moment from "moment";
import { secondsToHms } from "@app/shared/utils/seconds-to-hms";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { MachineBoardType, MachineBoardTypeClass } from "@app/shared/enums/MachineBoardType";

@Component({
	selector: "app-machine-state-current",
	templateUrl: "./machine-state-current.component.html",
	styleUrl: "./machine-state-current.component.css",
})
export class MachineStateCurrentComponent {
	selectedMachine?: Machine;
	isBusy = false;
	machineStateStateType = MachineStateStateType;
	elapsedTime = "00:00:00";
	residualTime = "00:00:00";
	isComingFromMachineState = false;
	machineStateEventSubscription?:any;
	noStateText: string = $localize`No State`;

	constructor(
		public commonService: CommonService,
		private route: ActivatedRoute,
		private machineBoardEventService: MachineBoardEventHandleService
	) {}

	ngOnInit(): void {
		this.resetMachine();
		setInterval(() => {
			this.setElaspedTime();
			this.setResidualTime();
		}, 1000);
		this.checkRoute();
	}

	resetMachine() {
		this.isBusy = true;
		const id = this.route.snapshot.params["id"];
		this.commonService.get(`machine/${id}/machine-current-state`, false).subscribe({
			next: (value: any) => {
				this.selectedMachine = new Machine().deserialize(value);
				this.isBusy = false;
			},
		});
	}

	ngOnDestroy(): void {
		this.machineStateEventSubscription.unsubscribe();
	}

	checkRoute() {
		this.machineStateEventSubscription  = this.machineBoardEventService.machineStateChangeEvent.subscribe(() => {
			this.resetMachine();
		});
	}

	isInProduction() {
		return this.selectedMachine?.status == MachineStateStateType.PRODUCTION;
	}

	isInSetup() {
		return this.selectedMachine?.status == MachineStateStateType.SETUP
				&& this.selectedMachine?.machine_board_type == MachineBoardTypeClass.getStateTranslate(MachineBoardType.VIEW_1);
	}

	isOff() {
		return this.selectedMachine?.status == MachineStateStateType.OFF;
	}

	isReady() {
		return this.selectedMachine?.status == MachineStateStateType.READY
				&& this.selectedMachine?.machine_board_type == MachineBoardTypeClass.getStateTranslate(MachineBoardType.VIEW_2);
	}

	getCurrentStartTime() {
		if (!this.selectedMachine?.machine_machine_state_time?.start) return "00:00:00";

		if (this.showStartTimewithDate()) {
			return moment
				.utc(this.selectedMachine?.machine_machine_state_time?.start)
				.local()
				.format("DD.MM.YYYY");
		} else {
			return moment
				.utc(this.selectedMachine?.machine_machine_state_time?.start)
				.local()
				.format("HH:mm:ss");
		}
	}

	showStartTimewithDate() {
		const duration = moment().diff(
			moment.utc(this.selectedMachine?.machine_machine_state_time?.start).local(),
			"hours"
		);

		return duration > 24;
	}

	setElaspedTime() {
		if (!this.selectedMachine?.machine_machine_state_time?.start) {
			this.elapsedTime = "00:00:00";
			return;
		}

		const duration = this.getElapsedSeconds();

		this.elapsedTime = secondsToHms(duration);
	}

	getElapsedSeconds() {
		return moment
			.utc()
			.diff(
				moment.utc(this.selectedMachine?.machine_machine_state_time?.start).local(),
				"seconds"
			);
	}

	setResidualTime() {
		const tr = this.selectedMachine?.tr ?? 0;
		const elapsedTime = this.getElapsedSeconds();
		const residualTimeIsSeconds = Math.abs(tr - elapsedTime);
		const time = secondsToHms(residualTimeIsSeconds);

		this.residualTime = tr < elapsedTime ? "00:00:00" : time;
	}
}
