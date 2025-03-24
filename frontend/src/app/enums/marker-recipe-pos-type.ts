export enum MarkerRecipePosType {
	DATA_MATRIX = 'DATA_MATRIX',
	TEXT = 'TEXT'
}

export class MarkerRecipePosTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "DATA_MATRIX":
				return $localize`10 Data Matrix`;
			case "TEXT":
				return $localize`08 Text`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MarkerRecipePosType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
