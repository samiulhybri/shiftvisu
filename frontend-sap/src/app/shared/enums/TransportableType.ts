export enum TransportableType {
	ITEM_PLANT = "App\\Models\\ItemPlant",
	HANDLING_UNIT = "App\\Models\\HandlingUnit",
	EQUIPMENT = "App\\Models\\Equipment",
}

export class TransportableTypeClass {
	static getStateTranslate(state: any): { text: string; modelType: string } | null {
		
		switch (state) {
			case TransportableType.ITEM_PLANT:
				return {
					text: $localize`Item`,
					modelType: TransportableType.ITEM_PLANT,
				};
			case TransportableType.HANDLING_UNIT:
				return {
					text: $localize`Handling Unit`,
					modelType: TransportableType.HANDLING_UNIT,
				};
			case TransportableType.EQUIPMENT:
				return {
					text: $localize`Equipment`,
					modelType: TransportableType.EQUIPMENT,
				};

			default:
				return null;
		}
	}

	static getEnumArray() {
		let res_arr: any = [];
		let enums = Object.keys(TransportableType);
		enums.forEach(elm => {
			if (isNaN(Number(elm))) {
				const enumValue = TransportableType[elm as keyof typeof TransportableType];
				res_arr.push({ value: elm, text: this.getStateTranslate(enumValue) });
			}
		});
		return res_arr;
	}
}
