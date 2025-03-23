export enum AbsenceManagerPageType {
	MYABSENCE = 'My Absence',
	REQUEST = 'Requests'
}

export class AbsenceManagerPageTypeClass {
	constructor() { }

	static getStateTranslate(state: any): String {
		switch (state) {
			case AbsenceManagerPageType.MYABSENCE:
				return $localize`My Absence`;
			case AbsenceManagerPageType.REQUEST:
				return $localize`Requests`;

			default:
				return "";
		}
	}

	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(AbsenceManagerPageTypeClass);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}