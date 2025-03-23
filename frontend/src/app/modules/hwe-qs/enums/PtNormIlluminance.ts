export enum PtNormIlluminance {
	GREATER_THAN_500,
}

export class PtNormIlluminanceClass {
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
		let elemetns = Object.keys(PtNormIlluminance);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}