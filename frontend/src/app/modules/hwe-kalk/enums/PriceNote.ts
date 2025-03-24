export enum PriceNote {
	NOTE_3_2 = "NOTE_3_2",
	NOTE_3_2_MSA = "NOTE_3_2_MSA",
	MANUAL = "MANUAL",
}

export class PriceNoteClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case PriceNote.NOTE_3_2:
				return $localize`3.2`;
			case PriceNote.NOTE_3_2_MSA:
				return $localize`3.2 (MSA)`;
			case PriceNote.MANUAL:
				return $localize`Manual`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		var res_arr: any = [];
		var elements = Object.keys(PriceNote);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
