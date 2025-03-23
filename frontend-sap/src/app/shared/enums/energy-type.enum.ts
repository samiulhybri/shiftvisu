export enum EnergyType {
	GAS = 'GAS',
	ELECTRICITY = 'ELECTRICITY',
	HEAT = 'HEAT',
	OIL = 'OIL'
}

export class EnergyTypeClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case EnergyType.GAS:
				return $localize`Gas`;
			case EnergyType.ELECTRICITY:
				return $localize`Electricity`;
			case EnergyType.HEAT:
				return $localize`Heat`;
			case EnergyType.OIL:
				return $localize`Oil`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Gas`:
				return EnergyType.GAS;
			case $localize`Electricity`:
				return EnergyType.ELECTRICITY;
			case $localize`Heat`:
				return EnergyType.HEAT;
			case $localize`Oil`:
				return EnergyType.OIL;
			default:
				return "";
		}
	}

	static getEnergyType() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(EnergyType);
		elemetns.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}