import { Deserializable } from "@app/shared/interfaces/deserializable";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import { Machine } from "@app/shared/models/machine.model";
import { Shift } from "@app/shared/models/shift.model";
import { User } from "@app/shared/models/user.model";
import { DatePipe } from "@angular/common";
import moment from "moment";

export default class MachineUserTime implements Deserializable {
    id?: number;
    machine_id?: number;
    user_id?: number;
    shift_id?: number;
    standard_value_key_activity_type_id?: number;
    start?: Date;
	end?: Date;

    user?: User;
    machine?: Machine;
    shift?: Shift;

    startTime: string = ''; // internal use only
    machineHours: string = ''; // internal use only
    qualified_clockin_user_ids?: string[] = [];

    constructor() {}

    deserialize(input: any) {

        input.machineHours = this.getMachineHours(input.start); // internal use only
        input.startTime = this.getTimeFromDateTime(input.start); // internal use only
        input.start = formatDate(input.start);
		input.end = input.end ? formatDate(input.end) : null;
        
        Object.assign(this, input);

        if (input.machine)
			this.machine = new Machine().deserialize(input.machine);

		if (input.user)
			this.user = new User().deserialize(input.user);

		if (input.shift)
			this.shift = new Shift().deserialize(input.shift);

        return this;
    }

    toOdata(): Object {
		return {
			...this,
            user_id: this.user?.id,
            machine_id: this.machine?.id,
            shift_id: this.shift?.id,
            user: undefined,
            machine: undefined,
            shift: undefined,
            startTime: undefined,
            machineHours: undefined,
            qualified_clockin_user_ids: undefined
		};
	}

    private getTimeFromDateTime(date: Date) {
        const datePipe = new DatePipe('en-US');
		return datePipe.transform(date, 'hh:mm a');
    }

    private getMachineHours(start: Date) {
        const differenceInHours = Math.floor(moment(new Date()).diff(moment(start), 'hours'));
        return differenceInHours + ' hrs';
    }
}
