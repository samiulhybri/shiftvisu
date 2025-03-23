export enum MachineBoardType {
	VIEW_1 = "VIEW_1",
	VIEW_2 = "VIEW_2",
}

export class MachineBoardTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case MachineBoardType.VIEW_1:
				return $localize`View 1`;
			case MachineBoardType.VIEW_2:
				return $localize`View 2`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`View 1`:
				return MachineBoardType.VIEW_1;
			case $localize`View 2`:
				return MachineBoardType.VIEW_2;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(MachineBoardType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
