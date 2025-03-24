export enum HweCostCalcType {
	PIECE = "PIECE",
	POSITION = "POSITION",
	SAMPLE_PIECE = "SAMPLE_PIECE",
}

export class HweCostCalcTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case HweCostCalcType.PIECE:
				return $localize`Per Piece`;
			case HweCostCalcType.POSITION:
				return $localize`Per Position`;
			case HweCostCalcType.SAMPLE_PIECE:
				return $localize`Per Sample Piece`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(HweCostCalcType);
		elemetns.forEach(elm => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
