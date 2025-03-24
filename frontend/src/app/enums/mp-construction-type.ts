export enum MPConstructionType {
	NEW,
	RENEWAL,
	ACTIVE_PARTS,
	MAINTAINANCE,
	REPAIR,
	ACCESSORIES,
	PROTOTYPE,
	MODIFICATION
}

export class MPConstructionTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "NEW":
				return $localize`NEW`;
			case "RENEWAL":
				return $localize`RENEWAL`;
			case "ACTIVE_PARTS":
				return $localize`ACTIVE_PARTS`;
			case "MAINTAINANCE":
				return $localize`MAINTAINANCE`;
			case "REPAIR":
				return $localize`REPAIR`;
			case "ACCESSORIES":
				return $localize`ACCESSORIES`;
			case "PROTOTYPE":
				return $localize`PROTOTYPE`;
			case "MODIFICATION":
				return $localize`MODIFICATION`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MPConstructionType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
