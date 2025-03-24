export enum MachineConstraintType {
	CONSTRAINT = "CONSTRAINT",
	MANUAL = "MANUAL",
	FORWARD = "FORWARD",
	BACKWARD = "BACKWARD",
}

export class MachineConstraintTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case MachineConstraintType.CONSTRAINT:
				return $localize`Constraint`;
			case MachineConstraintType.MANUAL:
				return $localize`Manual`;
			case MachineConstraintType.FORWARD:
				return $localize`Forward`;
			case MachineConstraintType.BACKWARD:
				return $localize`Backward`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Constraint`:
				return MachineConstraintType.CONSTRAINT;
			case $localize`Manual`:
				return MachineConstraintType.MANUAL;
			case $localize`Forward`:
				return MachineConstraintType.FORWARD;
			case $localize`Backward`:
				return MachineConstraintType.BACKWARD;
			default:``
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(MachineConstraintType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
