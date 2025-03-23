export enum EmailEncryption {
	SSL = "SSL",
	TSL = "TSL",
}
export class EmailEncryptionClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case EmailEncryption.SSL:
				return $localize`SSL`;
			case EmailEncryption.TSL:
				return $localize`TSL`;

			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`SSL`:
				return EmailEncryption.SSL;
			case $localize`TSL`:
				return EmailEncryption.TSL;

			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(EmailEncryption);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
