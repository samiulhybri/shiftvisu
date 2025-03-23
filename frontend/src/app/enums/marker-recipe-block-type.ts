export enum MarkerRecipeBlockType {
	TEXT = 'TEXT',
    ASCII_CHARACTER = 'ASCII_CHARACTER',
    DAY_COUNTER = 'DAY_COUNTER',
	ORDER_COUNTER = 'ORDER_COUNTER',
    DATETIME = 'DATETIME'
}

export class MarkerRecipeBlockTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "TEXT":
				return $localize`Text`;
            case "ASCII_CHARACTER":
                return $localize`ASCII`;
            case "DAY_COUNTER":
				return $localize`Day Counter`;
			case "ORDER_COUNTER":
				return $localize`Order Counter`;
            case "DATETIME":
				return $localize`Date Time`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MarkerRecipeBlockType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
