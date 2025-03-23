export enum PlanVisuPage {
	PRODUCTION_PLAN = "PRODUCTION_PLAN",
}

export class PlanVisuPageClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case PlanVisuPage.PRODUCTION_PLAN:
				return $localize`Production Plan`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Production Plan`:
				return PlanVisuPage.PRODUCTION_PLAN;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(PlanVisuPage);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
