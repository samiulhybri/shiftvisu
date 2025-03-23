export enum ToolRepairLabelType {
	INTERNAL = "INTERNAL",
	EXTERNAL = "EXTERNAL"
}

export class ToolRepairLabelTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ToolRepairLabelType.INTERNAL:
				return $localize`Internal`;
			case ToolRepairLabelType.EXTERNAL:
				return $localize`External`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Internal`:
				return ToolRepairLabelType.INTERNAL;
			case $localize`External`:
				return ToolRepairLabelType.EXTERNAL;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ToolRepairLabelType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}

