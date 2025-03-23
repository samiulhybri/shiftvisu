export enum StatusBoardCardType {
	VIEW_1 = "VIEW_1",
	VIEW_2 = "VIEW_2",
}

export class StatusBoardCardTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case StatusBoardCardType.VIEW_1:
				return $localize`View 1`;
			case StatusBoardCardType.VIEW_2:
				return $localize`View 2`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`View 1`:
				return StatusBoardCardType.VIEW_1;
			case $localize`View 2`:
				return StatusBoardCardType.VIEW_2;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(StatusBoardCardType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
