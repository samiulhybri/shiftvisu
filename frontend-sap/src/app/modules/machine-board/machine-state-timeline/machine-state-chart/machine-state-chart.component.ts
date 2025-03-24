import { ActivatedRoute } from "@angular/router";
import { Component, Input, SimpleChanges } from "@angular/core";
import MachineMachineStateTime from "@app/shared/models/machine-machine-state-time.model";
import { CommonService } from "@app/shared/services/common.service";
import moment from "moment";

@Component({
	selector: "app-machine-state-chart",
	templateUrl: "./machine-state-chart.component.html",
	styleUrl: "./machine-state-chart.component.css",
})
export class MachineStateChartComponent {
	left = 0;
	showPopOver = false;
	opener = "";
	isNoDataPointer = false;
	hoveredMachine?: MachineMachineStateTime;
	@Input() isBusy = false;
	@Input() machineBoardHours = 12;
	@Input() machineStateTimes: MachineMachineStateTime[] = [];

	protected hours: any[] = [];

	ngOnChanges(changes: SimpleChanges): void {
		this.setHour();
	}

	getTotalTime() {
		return this.machineBoardHours * 60 * 60;
	}

	getMaxHour() {
		return moment.utc().local();
	}

	getMinHour() {
		return moment().utc().local().subtract(this.machineBoardHours, "hour");
	}

	setHour() {
		if (!this.getMaxHour()) return;

		this.hours = [];
		let j = this.getMinHour();

		for (let i = 0; i < this.machineBoardHours + 1; i++) {
			this.hours.push(j.format("HH:mm"));

			if (j.hour > this.getMaxHour().hour) break;
			j = j.add(1, "hours");
		}
	}

	getPosition(time?: string | null) {
		if (!time) time = undefined;

		const diff = moment
			.utc(time)
			.local()
			.diff(moment.utc().local().subtract(this.machineBoardHours, "hour"), "seconds");

		const pos = (diff * 100) / this.getTotalTime();

		if (pos < 0) return -10;

		return pos;
	}

	getWidth(start?: string | null, end?: string | null) {
		return this.getPosition(end) - this.getPosition(start);
	}

	onMouseEnterTimeline(event: any, machineStateTime: MachineMachineStateTime, i: number) {
		this.showPopOver = false;
		this.isNoDataPointer = false;
		this.opener = `a${i}`;
		this.hoveredMachine = machineStateTime;
		setTimeout(() => {
			this.showPopOver = true;
		}, 50);
	}

	onMouseEnterBar() {
		this.showPopOver = false;
		this.opener = "bar";
		this.isNoDataPointer=true;
		setTimeout(() => {
			this.showPopOver = true;
		}, 50);
	}

	onMouseLeaveTimeline() {
		this.showPopOver = false;
		this.isNoDataPointer = false;
	}

	close() {
		this.showPopOver = false;
	}
}
