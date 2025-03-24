export enum EightDReportIshikawaCategory {
	MATERIALS = "MATERIALS",
	MACHINES = "MACHINES",
	MEASUREMENT = "MEASUREMENT",
	MOTHER_NATURE = "MOTHER_NATURE",
	MANPOWER = "MANPOWER",
	METHODS = "METHODS",
}

export class EightDReportIshikawaCategoryClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case EightDReportIshikawaCategory.MATERIALS:
				return $localize`Materials`;
			case EightDReportIshikawaCategory.MACHINES:
				return $localize`Machines`;
			case EightDReportIshikawaCategory.MEASUREMENT:
				return $localize`Measurement`;
			case EightDReportIshikawaCategory.MOTHER_NATURE:
				return $localize`Mother Nature`;
			case EightDReportIshikawaCategory.MANPOWER:
				return $localize`Manpower`;
			case EightDReportIshikawaCategory.METHODS:
				return $localize`Methods`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Materials`:
				return EightDReportIshikawaCategory.MATERIALS;
			case $localize`Machines`:
				return EightDReportIshikawaCategory.MACHINES;
			case $localize`Measurement`:
				return EightDReportIshikawaCategory.MEASUREMENT;
			case $localize`Mother Nature`:
				return EightDReportIshikawaCategory.MOTHER_NATURE;
			case $localize`Manpower`:
				return EightDReportIshikawaCategory.MANPOWER;
			case $localize`Methods`:
				return EightDReportIshikawaCategory.METHODS;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(EightDReportIshikawaCategory);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
