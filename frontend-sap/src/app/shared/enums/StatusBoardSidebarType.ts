export enum StatusBoardSidebarType {
	STANDARD_1 = "STANDARD_1",
	STANDARD_2 = "STANDARD_2",
}

export class StatusBoardSidebarTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case StatusBoardSidebarType.STANDARD_1:
				return $localize`Standard 1`;
			case StatusBoardSidebarType.STANDARD_2:
				return $localize`Standard 2`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Standard 1`:
				return StatusBoardSidebarType.STANDARD_1;
			case $localize`Standard 2`:
				return StatusBoardSidebarType.STANDARD_2;
			default:
				return "";
		}
	}
	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(StatusBoardSidebarType);
		elemetns.forEach(elm => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}
