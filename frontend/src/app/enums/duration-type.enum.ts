export enum DurationType {
	HOUR = 'HOUR',
	DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
	YEAR = 'YEAR'
}

export class DurationTypeClass {
	constructor() { }

	static getStateTranslate(state: any): String {
		switch (state) {
			case "HOUR":
				return $localize`Hour`;
			case "DAY":
				return $localize`Day`;
            case "WEEK":
                return $localize`Week`;
            case "MONTH":
                return $localize`Month`;
			case "YEAR":
				return $localize`Year`;
			default:
				return "";
		}
	}

	static getDurationType() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(DurationType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}