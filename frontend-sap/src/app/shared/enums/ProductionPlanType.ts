export enum ProductionPlanType {
	SETUP_1 = "SETUP_1",
	MANUAL = "MANUAL",
	SETUP_2 = "SETUP_2",
}

export class ProductionPlanTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ProductionPlanType.SETUP_1:
				return $localize`Setup 1`;
			case ProductionPlanType.MANUAL:
				return $localize`Manual`;
			case ProductionPlanType.SETUP_2:
				return $localize`Setup 2`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Setup 1`:
				return ProductionPlanType.SETUP_1;
			case $localize`Manual`:
				return ProductionPlanType.MANUAL;
			case $localize`Setup 2`:
				return ProductionPlanType.SETUP_2;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ProductionPlanType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
