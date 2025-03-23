export enum OperationControlProfileConfirmationType {
	MILESTONE = 'MILESTONE',
	REQUIRED = 'REQUIRED',
	PERMITTED = 'PERMITTED',
	NOT_PERMITTED = 'NOT_PERMITTED'
}

export class OperationControlProfileConfirmationTypeClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case OperationControlProfileConfirmationType.MILESTONE:
				return $localize`Milestone`;
			case OperationControlProfileConfirmationType.REQUIRED:
				return $localize`Required`;
			case OperationControlProfileConfirmationType.PERMITTED:
				return $localize`Permitted`;
			case OperationControlProfileConfirmationType.NOT_PERMITTED:
				return $localize`Not Permitted`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Milestone`:
				return OperationControlProfileConfirmationType.MILESTONE;
			case $localize`Required`:
				return OperationControlProfileConfirmationType.REQUIRED;
			case $localize`Permitted`:
				return OperationControlProfileConfirmationType.PERMITTED;
			case $localize`Not Permitted`:
				return OperationControlProfileConfirmationType.NOT_PERMITTED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(OperationControlProfileConfirmationType);
		elemetns.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}