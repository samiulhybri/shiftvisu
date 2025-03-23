export enum QuantityType {
	TYPE_1 = "TYPE_1",
	TYPE_2 = "TYPE_2",
}

export class QuantityTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case QuantityType.TYPE_1:
				return $localize`Type 1`;
			case QuantityType.TYPE_2:
				return $localize`Type 2`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Type 1`:
				return QuantityType.TYPE_1;
			case $localize`Type 2`:
				return QuantityType.TYPE_2;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(QuantityType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
