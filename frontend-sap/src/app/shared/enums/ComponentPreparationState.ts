export enum ComponentPreparationState {
	NOT_PREPARED = 'NOT_PREPARED',
	PARTIALLY_PREPARED = 'PARTIALLY_PREPARED',
	PREPARED = 'PREPARED'
}

export class ComponentPreparationStateClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case ComponentPreparationState.NOT_PREPARED:
				return $localize`Not Prepared`;
			case ComponentPreparationState.PARTIALLY_PREPARED:
				return $localize`Partially Prepared`;
			case ComponentPreparationState.PREPARED:
				return $localize`Prepared`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`NOT_PREPARED`:
				return ComponentPreparationState.NOT_PREPARED;
			case $localize`PARTIALLY_PREPARED`:
				return ComponentPreparationState.PARTIALLY_PREPARED;
			case $localize`PREPARED`:
				return ComponentPreparationState.PREPARED;
			default:
				return "";
		}
	}

	static getComponentPreparationState() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(ComponentPreparationState);
		elemetns.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}
