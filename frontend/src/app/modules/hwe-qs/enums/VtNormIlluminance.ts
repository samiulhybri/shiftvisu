export enum VtNormIlluminance {
	GREATER_THAN_500,
}

export class VtNormIlluminanceClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case "GREATER_THAN_500":
				return $localize`> 500`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(VtNormIlluminance);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}