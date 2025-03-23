export enum MPNozzleType {
	COLD,
	HOT,
	CLOGGING
}

export class MPNozzleTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "COLD":
				return $localize`COLD`;
			case "HOT":
				return $localize`HOT`;
			case "CLOGGING":
				return $localize`CLOGGING`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MPNozzleType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

}