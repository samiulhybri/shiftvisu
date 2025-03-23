export enum MachineBoardStateType {
	MACHINE_STATE = "MACHINE_STATE",
	OPERATION_STATE = "OPERATION_STATE",
}

export class MachineBoardStateTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case MachineBoardStateType.MACHINE_STATE:
				return $localize`Machine State`;
			case MachineBoardStateType.OPERATION_STATE:
				return $localize`Operation State`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Machine State`:
				return MachineBoardStateType.MACHINE_STATE;
			case $localize`Operation State`:
				return MachineBoardStateType.OPERATION_STATE;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(MachineBoardStateType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
