export enum ProdOrderType {
	PRODUCTION = "PRODUCTION",
	MAINTENANCE = "MAINTENANCE",
}

export class ProdOrderTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ProdOrderType.PRODUCTION:
				return $localize`Production`;
			case ProdOrderType.MAINTENANCE:
				return $localize`Maintenance`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Production`:
				return ProdOrderType.PRODUCTION;
			case $localize`Maintenance`:
				return ProdOrderType.MAINTENANCE;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ProdOrderType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
