export enum Protocol {
	TCP = "TCP",
	UDP = "UDP",
	SMTP = "SMTP",
}

export class ProtocolClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case Protocol.TCP:
				return $localize`Tcp`;
			case Protocol.UDP:
				return $localize`Udp`;
			case Protocol.SMTP:
				return $localize`Smtp`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Tcp`:
				return Protocol.TCP;
			case $localize`Udp`:
				return Protocol.UDP;
			case $localize`Smtp`:
				return Protocol.SMTP;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: { value: string; text: string }[] = [];
		const elements: string[] = Object.keys(Protocol);

		elements.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
