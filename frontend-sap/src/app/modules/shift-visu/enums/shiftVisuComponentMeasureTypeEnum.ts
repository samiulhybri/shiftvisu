export enum ShiftVisuComponentMeasureTypeEnum {
	DETAILS = "DETAILS",
	CREATOR = "CREATOR",
	RESPONSIBLE = "RESPONSIBLE",
	START_DATE = "START_DATE",
	END_DATE = "END_DATE",
	RESTART_DATE = "RESTART_DATE",
	FINISHED = "FINISHED",
	STATUS = "STATUS",
}

export class ShiftVisuComponentMeasureTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ShiftVisuComponentMeasureTypeEnum.DETAILS:
				return $localize`Details`;
			case ShiftVisuComponentMeasureTypeEnum.CREATOR:
				return $localize`Creator`;
			case ShiftVisuComponentMeasureTypeEnum.RESPONSIBLE:
				return $localize`Responsible`;
			case ShiftVisuComponentMeasureTypeEnum.START_DATE:
				return $localize`Start date`;
			case ShiftVisuComponentMeasureTypeEnum.END_DATE:
				return $localize`End date`;
			case ShiftVisuComponentMeasureTypeEnum.RESTART_DATE:
				return $localize`Restart date`;
			case ShiftVisuComponentMeasureTypeEnum.FINISHED:
				return $localize`Finished`;
			case ShiftVisuComponentMeasureTypeEnum.STATUS:
				return $localize`Status`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Details`:
				return ShiftVisuComponentMeasureTypeEnum.DETAILS;
			case $localize`Creator`:
				return ShiftVisuComponentMeasureTypeEnum.CREATOR;
			case $localize`Responsible`:
				return ShiftVisuComponentMeasureTypeEnum.RESPONSIBLE;
			case $localize`Start date`:
				return ShiftVisuComponentMeasureTypeEnum.START_DATE;
			case $localize`End date`:
				return ShiftVisuComponentMeasureTypeEnum.END_DATE;
			case $localize`Restart date`:
				return ShiftVisuComponentMeasureTypeEnum.RESTART_DATE;
			case $localize`Finished`:
				return ShiftVisuComponentMeasureTypeEnum.FINISHED;
			case $localize`Status`:
				return ShiftVisuComponentMeasureTypeEnum.STATUS;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.values(ShiftVisuComponentMeasureTypeEnum);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
