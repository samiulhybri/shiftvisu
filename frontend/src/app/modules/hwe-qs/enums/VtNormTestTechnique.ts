export enum VtNormTestTechnique {
	GENERAL_VISUAL_INSPECTION,
	DIRECT_VISUAL_INSPECTION,
	INDIRECT_VISUAL_INSPECTION
}

export class VtNormTestTechniqueClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case "GENERAL_VISUAL_INSPECTION":
				return $localize`GENERAL VISUAL INSPECTION`;
			case "DIRECT_VISUAL_INSPECTION":
				return $localize`DIRECT VISUAL INSPECTION`;
			case "INDIRECT_VISUAL_INSPECTION":
				return $localize`INDIRECT VISUAL INSPECTION`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(VtNormTestTechnique);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}