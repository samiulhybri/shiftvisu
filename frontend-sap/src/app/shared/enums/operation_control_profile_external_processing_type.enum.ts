export enum OperationControlProfileExternalProcessingType {
	INTERNAL = 'INTERNAL',
	EXTERNAL = 'EXTERNAL',
	INTERNAL_EXTERNAL = 'INTERNAL_EXTERNAL',
}

export class OperationControlProfileExternalProcessingTypeClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case OperationControlProfileExternalProcessingType.INTERNAL:
				return $localize`Internal`;
			case OperationControlProfileExternalProcessingType.EXTERNAL:
				return $localize`External`;
			case OperationControlProfileExternalProcessingType.INTERNAL_EXTERNAL:
				return $localize`Internal External`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Internal`:
				return OperationControlProfileExternalProcessingType.INTERNAL;
			case $localize`External`:
				return OperationControlProfileExternalProcessingType.EXTERNAL;
			case $localize`Internal External`:
				return OperationControlProfileExternalProcessingType.INTERNAL_EXTERNAL;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(OperationControlProfileExternalProcessingType);
		elemetns.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}