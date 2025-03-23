export enum MPInjectionType {
	SINGLE,
	HOT_CHANNEL
}
export class MPInjectionTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "SINGLE":
				return $localize`SINGLE`;
			case "HOT_CHANNEL":
				return $localize`HOT_CHANNEL`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MPInjectionType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

}