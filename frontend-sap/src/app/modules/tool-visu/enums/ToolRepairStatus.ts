export enum ToolRepairStatus {
	READY_FOR_USE = "READY_FOR_USE",
	NOT_READY_FOR_USE = "NOT_READY_FOR_USE",
  MAINTENANCE_REQUIRED = "MAINTENANCE_REQUIRED",
	POSSIBLE = "POSSIBLE",
	NOT_POSSIBLE = "NOT_POSSIBLE"
}

export class ToolRepairStatusClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ToolRepairStatus.READY_FOR_USE:
				return $localize`Ready for use`;
			case ToolRepairStatus.NOT_READY_FOR_USE:
				return $localize`Not ready for use`;
			case ToolRepairStatus.MAINTENANCE_REQUIRED:
				return $localize`Maintenance Required`;
			case ToolRepairStatus.POSSIBLE:
				return $localize`Possible`;
			case ToolRepairStatus.NOT_POSSIBLE:
				return $localize`Not Possible`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Ready for use`:
				return ToolRepairStatus.READY_FOR_USE;
			case $localize`Not ready for use`:
				return ToolRepairStatus.NOT_READY_FOR_USE;
			case $localize`Maintenance Required`:
				return ToolRepairStatus.MAINTENANCE_REQUIRED;
			case $localize`Not Possible`:
				return ToolRepairStatus.NOT_POSSIBLE;
			case $localize`Possible`:
				return ToolRepairStatus.POSSIBLE;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ToolRepairStatus);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}

