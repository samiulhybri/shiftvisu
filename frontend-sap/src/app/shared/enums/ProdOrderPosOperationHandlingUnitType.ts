export enum ProdOrderPosOperationHandlingUnitType {
	CONSUMPTION = "CONSUMPTION",
	PROD_GOOD = "PROD_GOOD",
    PROD_GOOD_LEVEL_2 = "PROD_GOOD_LEVEL_2",
	PROD_SCRAP = "PROD_SCRAP",
	PROD_SCRAP_LEVEL_2 = "PROD_SCRAP_LEVEL_2",
	PROD_REWORK = "PROD_REWORK",
	PROD_REWORK_LEVEL_2 = "PROD_REWORK_LEVEL_2",
}

export class ProdOrderPosOperationHandlingUnitTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ProdOrderPosOperationHandlingUnitType.CONSUMPTION:
				return $localize`Consumption`;
			case ProdOrderPosOperationHandlingUnitType.PROD_GOOD:
				return $localize`Production Good`;
			case ProdOrderPosOperationHandlingUnitType.PROD_GOOD_LEVEL_2:
				return $localize`Production Good Level 2`;
			case ProdOrderPosOperationHandlingUnitType.PROD_REWORK:
				return $localize`Production Rework`;
			case ProdOrderPosOperationHandlingUnitType.PROD_REWORK:
				return $localize`Production Rework Level 2`;
			case ProdOrderPosOperationHandlingUnitType.PROD_SCRAP:
				return $localize`Production Scrap`;
			case ProdOrderPosOperationHandlingUnitType.PROD_SCRAP_LEVEL_2:
				return $localize`Production Scrap Level 2`;
			default:
				return state;
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Consumption`:
				return ProdOrderPosOperationHandlingUnitType.CONSUMPTION;
			case $localize`Production Good`:
				return ProdOrderPosOperationHandlingUnitType.PROD_GOOD;
			case $localize`Production Good Level 2`:
				return ProdOrderPosOperationHandlingUnitType.PROD_GOOD_LEVEL_2;
			case $localize`Production Scrap`:
				return ProdOrderPosOperationHandlingUnitType.PROD_SCRAP;
			case $localize`Production Scrap Level 2`:
				return ProdOrderPosOperationHandlingUnitType.PROD_SCRAP_LEVEL_2;
			case $localize`Production Rework`:
				return ProdOrderPosOperationHandlingUnitType.PROD_REWORK;
			case $localize`Production Rework Level 2`:
				return ProdOrderPosOperationHandlingUnitType.PROD_REWORK_LEVEL_2;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: { value: string; text: string }[] = [];
		const elements: string[] = Object.keys(ProdOrderPosOperationHandlingUnitType);

		elements.forEach((elm: string) => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
		
}