export enum MPToolType {
	PLASTIC,
	PLASTIC_RUBBER,
	DIE_CASTING
}

export class MPToolTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "PLASTIC":
				return $localize`PLASTIC`;
			case "PLASTIC_RUBBER":
				return $localize`PLASTIC_RUBBER`;
			case "DIE_CASTING":
				return $localize`DIE_CASTING`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MPToolType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

}