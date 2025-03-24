export enum DateToConsider {
	SHIFT_START = "SHIFT_START",
	SHIFT_END = "SHIFT_END",
}

export class DateToConsiderClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case DateToConsider.SHIFT_START:
				return $localize`Shift Start`;
			case DateToConsider.SHIFT_END:
				return $localize`Shift End`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Shift Start`:
				return DateToConsider.SHIFT_START;
			case $localize`Shift End`:
				return DateToConsider.SHIFT_END;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(DateToConsider);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
