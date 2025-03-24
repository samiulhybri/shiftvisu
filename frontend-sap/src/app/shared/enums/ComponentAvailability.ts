export enum ComponentAvailability {
	FULL = "FULL",
	PLANNED = "PLANNED",
	PARTIAL = "PARTIAL",
	NONE = "NONE",
}
export class ComponentAvailabilityClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case ComponentAvailability.FULL:
				return $localize`FULL`;
			case ComponentAvailability.PLANNED:
				return $localize`PLANNED`;
			case ComponentAvailability.PARTIAL:
				return $localize`PARTIAL`;
			case ComponentAvailability.NONE:
				return $localize`NONE`;

			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`FULL`:
				return ComponentAvailability.FULL;
			case $localize`PLANNED`:
				return ComponentAvailability.PLANNED;
			case $localize`PARTIAL`:
				return ComponentAvailability.PARTIAL;
			case $localize`NONE`:
				return ComponentAvailability.NONE;

			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ComponentAvailability);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
