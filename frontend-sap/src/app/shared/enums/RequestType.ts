export enum RequestType {
	HTTP = "HTTP",
	HTTPS = "HTTPS",
}
export class RequestTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case RequestType.HTTP:
				return $localize`Http`;
			case RequestType.HTTPS:
				return $localize`Https`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Http`:
				return RequestType.HTTP;
			case $localize`Https`:
				return RequestType.HTTPS;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: { value: string; text: string }[] = [];
		const elements: string[] = Object.keys(RequestType);

		elements.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
