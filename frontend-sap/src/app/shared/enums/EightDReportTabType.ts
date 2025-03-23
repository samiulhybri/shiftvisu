export enum EightDReportTabType {
	GENERAL = "GENERAL",
	DESCRIPTION = "DESCRIPTION",
	IMMEDIATE = "IMMEDIATE",
	CORRECTIVE = "CORRECTIVE",
	IMPLEMENTED = "IMPLEMENTED",
	PREVENTIVE = "PREVENTIVE",
	CONGRATULATION = "CONGRATULATION",
	FIVE_W = "FIVE_W",
	ISHIKAWA = "ISHIKAWA",
	ATTACHMENT = "ATTACHMENT",
}

export class EightDReportTabTypeClass {
	constructor() {}

	static getEnumArray(): EightDReportTabType[] {
		const enum_arr: any = [];
		const elements = Object.keys(EightDReportTabType);
		elements.forEach(elm => {
			enum_arr.push(elm);
		});
		return enum_arr;
	}
}
