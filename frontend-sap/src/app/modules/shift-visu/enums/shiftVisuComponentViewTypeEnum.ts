export enum shiftVisuComponentViewTypeEnum {
	OVERVIEW = "OVERVIEW",
	DETAILS = "DETAILS",
}

export class ShiftVisuComponentViewTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case shiftVisuComponentViewTypeEnum.OVERVIEW:
				return $localize`Overview`;
			case shiftVisuComponentViewTypeEnum.DETAILS:
				return $localize`Details`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Overview`:
				return shiftVisuComponentViewTypeEnum.OVERVIEW;
			case $localize`Details`:
				return shiftVisuComponentViewTypeEnum.DETAILS;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.values(shiftVisuComponentViewTypeEnum);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
