import { EightDReportTabType } from "@app/shared/enums/EightDReportTabType";

export interface EightDReportAction {
    id?: number,
	name?: string;
	responsible_id?: string;
	end_date?: string;
	progress?: number;
	description?: string;
	action_type?: EightDReportTabType;
}
