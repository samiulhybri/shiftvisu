export enum GrainSizeProcedure {
	LINEAR_CUTTING = "LINEAR_CUTTING",
	CIRCULAR_CUTTING = "CIRCULAR_CUTTING"
}

export class GrainSizeProcedureClass {
	constructor() {
	}

	static getStateTranslate(state: any): string {
		switch (state) {
			case "LINEAR_CUTTING":
				return $localize`Linear Cutting`;
			case "CIRCULAR_CUTTING":
				return $localize`Circular Cutting`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(GrainSizeProcedure);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}

