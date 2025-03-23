export enum WeekDay {
	SUNDAY = 0,
	MONDAY = 1,
	TUESDAY = 2,
	WEDNESDAY = 3,
	THURSDAY = 4,
	FRIDAY = 5,
	SATURDAY = 6,
}

export class WeekDayClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case WeekDay.MONDAY:
				return $localize`Monday`;
			case WeekDay.TUESDAY:
				return $localize`Tuesday`;
			case WeekDay.WEDNESDAY:
				return $localize`Wednesday`;
			case WeekDay.THURSDAY:
				return $localize`Thursday`;
			case WeekDay.FRIDAY:
				return $localize`Friday`;
			case WeekDay.SATURDAY:
				return $localize`Saturday`;
			case WeekDay.SUNDAY:
				return $localize`Sunday`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): number {
		switch (value) {
			case $localize`Monday`:
				return WeekDay.MONDAY;
			case $localize`Tuesday`:
				return WeekDay.TUESDAY;
			case $localize`Wednesday`:
				return WeekDay.WEDNESDAY;
			case $localize`Thursday`:
				return WeekDay.THURSDAY;
			case $localize`Friday`:
				return WeekDay.FRIDAY;
			case $localize`Saturday`:
				return WeekDay.SATURDAY;
			case $localize`Sunday`:
				return WeekDay.SUNDAY;
			default:
				return 0;
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(WeekDay);
		elements.forEach(elm => {
			const value = Number(elm);
			// It removes sunday if > -1 is not used
			if (Number(value) > -1) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(value) });
			}
		});

		return enum_arr;
	}
}
