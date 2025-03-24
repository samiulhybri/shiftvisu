import { Deserializable } from "@app/shared/interfaces/deserializable";
import { formatDate } from "@app/shared/utils/date-time-formatter";

export default class ScheduledCommand implements Deserializable {
    id?: number;
	command?: string = "";
    priority?: number;
    is_active: boolean = false;
    cron_expression: string = "";
    last_run_at?: string = "";
    last_output?: string = "";
    created_at?: string = "";
    updated_at?: string = "";

	isSelected?: boolean = false;

    deserialize(input: any): this {
		Object.assign(this, input);
		
		if (input.last_run_at) this.last_run_at = formatDate(input.last_run_at, false) ?? "";
		else this.last_run_at = "";

		if (input.created_at) this.created_at = formatDate(input.created_at, false) ?? "";
		else this.created_at = "";

        if (input.updated_at) this.updated_at = formatDate(input.updated_at, false) ?? "";
		else this.updated_at = "";

		return this;
	}

    toOdata(): Object {
		return {
			...this,
			isSelected: undefined
		};
	}
}