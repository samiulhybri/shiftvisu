export enum FailureSettingsType {
	FAILURE = "FAILURE",
	ARCHIVED = "ARCHIVED",
}

export class FailureSettingsTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case FailureSettingsType.FAILURE:
				return $localize`Failure List`;
			case FailureSettingsType.ARCHIVED:
				return $localize`Archived List`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Failure List`:
				return FailureSettingsType.FAILURE;
			case $localize`Archived List`:
				return FailureSettingsType.ARCHIVED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(FailureSettingsType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
