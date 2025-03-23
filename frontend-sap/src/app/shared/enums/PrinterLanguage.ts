export enum PrinterLanguage {
	ZPL = "ZPL",
	EPL = "EPL",
	IMAGE_FORMAT = "IMAGE_FORMAT",
}

export class PrinterLanguageClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case PrinterLanguage.ZPL:
				return $localize`Zpl`;
			case PrinterLanguage.EPL:
				return $localize`Epl`;
			case PrinterLanguage.IMAGE_FORMAT:
				return $localize`Image Format`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Zpl`:
				return PrinterLanguage.ZPL;
			case $localize`Epl`:
				return PrinterLanguage.EPL;
			case $localize`Image Format`:
				return PrinterLanguage.IMAGE_FORMAT;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: { value: string; text: string }[] = [];
		const elements: string[] = Object.keys(PrinterLanguage);

		elements.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
		
}
