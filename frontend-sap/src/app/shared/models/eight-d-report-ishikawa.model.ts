import { EightDReportIshikawaCategory } from "@app/shared/enums/EightDReportIshikawaCategory";

export interface EightDReportIshikawa {
	id?: number;
	name?: string;
	category: EightDReportIshikawaCategory;
}
