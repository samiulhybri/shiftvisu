export enum ProductionPlanningPageName {
	DEFAULT = "Default",
	FURNANCE = "Furnace",
	FORGE = "Forge",
}

export class ProductionPlanningPageNameClass {
	constructor() {}

	static getStateTranslate(state: any): String {
		switch (state) {
			case ProductionPlanningPageName.DEFAULT:
				return $localize`Default`;
			case ProductionPlanningPageName.FURNANCE:
				return $localize`Furnace`;
			case ProductionPlanningPageName.FORGE:
				return $localize`Forge`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): ProductionPlanningPageName {
		switch (value) {
			case $localize`Default`:
				return ProductionPlanningPageName.DEFAULT;
			case $localize`Furnace`:
				return ProductionPlanningPageName.FURNANCE;
			case $localize`Forge`:
				return ProductionPlanningPageName.FORGE;
			default:
				return ProductionPlanningPageName.DEFAULT;
		}
	}

	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.values(ProductionPlanningPageName);
		elemetns.forEach(elm => {
			if (elm) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}
