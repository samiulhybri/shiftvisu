export enum EnergyType {
	GAS = 'GAS',
	ELECTRICITY = 'ELECTRICITY',
	OIL = 'OIL',
	HEAT = 'HEAT'
}

export class EnergyTypeClass {
	constructor() { }

	static getStateTranslate(state: any): String {
		switch (state) {
			case "GAS":
				return $localize`GAS`;
			case "ELECTRICITY":
				return $localize`ELECTRICITY`;
			case "OIL":
				return $localize`OIL`;
			case "HEAT":
				return $localize`HEAT`;

			default:
				return "";
		}
	}

	static getEnergyType() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(EnergyType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}