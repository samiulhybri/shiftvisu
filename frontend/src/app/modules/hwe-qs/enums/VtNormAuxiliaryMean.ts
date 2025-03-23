export enum VtNormAuxiliaryMean {
	MAGNIFIER,
	ENDOSCOPE,
	LAMP,
}

export class VtNormAuxiliaryMeanClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case "LAMP":
				return $localize`Lamp`;
			case "MAGNIFIER":
				return $localize`Magnifier`;
			case "ENDOSCOPE":
				return $localize`Endoscope`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(VtNormAuxiliaryMean);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}