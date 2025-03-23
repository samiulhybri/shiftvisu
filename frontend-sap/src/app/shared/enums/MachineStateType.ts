export enum MachineStateType {
	MANUAL = "MANUAL",
	IIOT = "IIOT",
}

export class MachineStateTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case MachineStateType.MANUAL:
				return $localize`Manual`;
			case MachineStateType.IIOT:
				return $localize`IIOT`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Manual`:
				return MachineStateType.MANUAL;
			case $localize`IIOT`:
				return MachineStateType.IIOT;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(MachineStateType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
