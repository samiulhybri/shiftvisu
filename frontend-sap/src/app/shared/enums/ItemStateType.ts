export enum ItemStateType {
	GOOD = "GOOD",
	SCRAP = "SCRAP",
	REWORK = "REWORK"
}

export class ItemStateTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ItemStateType.GOOD:
				return $localize`Good`;
			case ItemStateType.SCRAP:
				return $localize`Scrap`;
			case ItemStateType.REWORK:
				return $localize`Rework`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Good`:
				return ItemStateType.GOOD;
			case $localize`Scrap`:
				return ItemStateType.SCRAP;
			case $localize`Rework`:
				return ItemStateType.REWORK;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ItemStateType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
