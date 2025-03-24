export enum VtNormRegistrationLimit {
	CRACKS,
}

export class VtNormRegistrationLimitClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case "CRACKS":
				return $localize`Cracks`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(VtNormRegistrationLimit);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}