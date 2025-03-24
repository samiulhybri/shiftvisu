export enum ShiftVisuComponentTypeEnum {
	CHECKBOX = "CHECKBOX",
	COMBOBOX = "COMBOBOX",
	DROPDOWN_SINGLE = "DROPDOWN_SINGLE",
	DROPDOWN_MULTI = "DROPDOWN_MULTI",
	TEXTFIELD = "TEXTFIELD",
	TEXTAREA = "TEXTAREA",
	SWITCH = "SWITCH",
	DATE = "DATE",
	DATETIME = "DATETIME",
	RADIO = "RADIO",
	MEASURE = "MEASURE",
}

export class ShiftVisuComponentOptionTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ShiftVisuComponentTypeEnum.CHECKBOX:
				return $localize`Checkbox`;
			case ShiftVisuComponentTypeEnum.COMBOBOX:
				return $localize`Combo Box`;
			case ShiftVisuComponentTypeEnum.DROPDOWN_SINGLE:
				return $localize`Dropdown Single`;
			case ShiftVisuComponentTypeEnum.DROPDOWN_MULTI:
				return $localize`Dropdown Multi`;
			case ShiftVisuComponentTypeEnum.TEXTFIELD:
				return $localize`Text Field`;
			case ShiftVisuComponentTypeEnum.TEXTAREA:
				return $localize`Text Area`;
			case ShiftVisuComponentTypeEnum.SWITCH:
				return $localize`Switch`;
			case ShiftVisuComponentTypeEnum.DATE:
				return $localize`Date`;
			case ShiftVisuComponentTypeEnum.DATETIME:
				return $localize`Date & Time Field`;
			case ShiftVisuComponentTypeEnum.RADIO:
				return $localize`Radio`;
			case ShiftVisuComponentTypeEnum.MEASURE:
				return $localize`Measure`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Checkbox`:
				return ShiftVisuComponentTypeEnum.CHECKBOX;
			case $localize`Combo Box`:
				return ShiftVisuComponentTypeEnum.COMBOBOX;
			case $localize`Dropdown Single`:
				return ShiftVisuComponentTypeEnum.DROPDOWN_SINGLE;
			case $localize`Dropdown Multi`:
				return ShiftVisuComponentTypeEnum.DROPDOWN_MULTI;
			case $localize`Text Field`:
				return ShiftVisuComponentTypeEnum.TEXTFIELD;
			case $localize`Text Area`:
				return ShiftVisuComponentTypeEnum.TEXTAREA;
			case $localize`Switch`:
				return ShiftVisuComponentTypeEnum.SWITCH;
			case $localize`Date`:
				return ShiftVisuComponentTypeEnum.DATE;
			case $localize`Date & Time Field`:
				return ShiftVisuComponentTypeEnum.DATETIME;
			case $localize`Radio`:
				return ShiftVisuComponentTypeEnum.RADIO;
			case $localize`Measure`:
				return ShiftVisuComponentTypeEnum.MEASURE;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.values(ShiftVisuComponentTypeEnum);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
