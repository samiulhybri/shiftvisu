import { Deserializable } from "@app/shared/interfaces/deserializable";
import MachineState from "@app/shared/models/machine-state.model";
import moment from "moment";

export default class MachineMachineStateTime implements Deserializable {
	id?: number;
	name?: string = "";
	machine_id?: number;
	machine_state_id?: number;
	machineState?: MachineState;
	duration?: string;
	start?: Date;
	end?: Date;
	isSplit?: boolean = false;
	editable?: boolean = false;

	deserialize(input: any): this {
		if (input.machineState)
			this.machineState = new MachineState().deserialize(input.machineState);
		if (input.machine_state)
			this.machineState = new MachineState().deserialize(input.machine_state);

		return Object.assign(this, input);
	}

	toOdata(): Object {
		return {
			...this,
			machineState: undefined,
			machine_state: undefined,
			editable: undefined,
			isSplit: undefined
		};
	}

	getPrevious30Date() {
		const currentDate = moment().utc();
		const last30DaysDate = currentDate.subtract(30, "days");
		return last30DaysDate.format("YYYY-MM-DD");
	}

	setRangeDatePickerValue() {
		const currentDate = moment().utc();
		const today = currentDate.format("LL");
		const last30DaysDate = currentDate.subtract(30, "days");
		return `${last30DaysDate.format("LL")} - ${today}`;
	}

	calDuration(startTime: Date, endTime: Date) {
		if (!startTime || !endTime) return "";
		return moment
			.duration(moment(endTime).startOf("minute").diff(moment(startTime).startOf("minute")))
			.asMinutes();
	}
}
