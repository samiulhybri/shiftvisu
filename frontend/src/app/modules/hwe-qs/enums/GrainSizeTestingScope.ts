export enum GrainSizeTestingScope {
	AUSTENIT = "AUSTENIT",
	FERRIT = "FERRIT"
}

export class GrainSizeTestingScopeClass {
	constructor() {
	}

	static getStateTranslate(state: any): string {
		switch (state) {
			case "AUSTENIT":
				return $localize`Austenit`;
			case "FERRIT":
				return $localize`Ferrit`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let elemetns = Object.keys(GrainSizeTestingScope);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;

	}
}

