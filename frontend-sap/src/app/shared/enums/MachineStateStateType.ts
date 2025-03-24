export enum MachineStateStateType {
	PRODUCTION = "PRODUCTION",
	SETUP = "SETUP",
	STANDSTILL = "STANDSTILL",
	OFF = "OFF",
	READY = "READY",
}

export class MachineStateStateTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case MachineStateStateType.PRODUCTION:
				return $localize`Production`;
			case MachineStateStateType.SETUP:
				return $localize`Setup`;
			case MachineStateStateType.STANDSTILL:
				return $localize`Standstill`;
			case MachineStateStateType.OFF:
				return $localize`Machine Off`;
			case MachineStateStateType.READY:
				return $localize`Ready`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Production`:
				return MachineStateStateType.PRODUCTION;
			case $localize`Setup`:
				return MachineStateStateType.SETUP;
			case $localize`Standstill`:
				return MachineStateStateType.STANDSTILL;
			case $localize`Machine Off`:
				return MachineStateStateType.OFF;
			case $localize`Ready`:
				return MachineStateStateType.READY;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(MachineStateStateType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
