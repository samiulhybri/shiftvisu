export enum AbsenceManagerFilterType {
	ALL = 'all',
	ALL_EMPLOYEE = 'All Employees',
    ASSIGNED_EMPLOYEE = 'Assigned Employees',
    PENDING = 'PENDING'
}

export class AbsenceManagerFilterTypeClass {
	constructor() { }

	static getStateTranslate(state: any): string {
		switch (state) {
			case AbsenceManagerFilterType.ALL:
				return $localize`all`;
			case AbsenceManagerFilterType.ALL_EMPLOYEE:
				return $localize`All Employees`;
			case AbsenceManagerFilterType.ASSIGNED_EMPLOYEE:
				return $localize`Assigned Employees`;
			case AbsenceManagerFilterType.PENDING:
				return $localize`PENDING`;
			default:
				return "";
		}
	}

	static getEnumArray() {
		let dropdownList: Array<any> = [];
		const elemetns = Object.keys(AbsenceManagerFilterTypeClass);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				dropdownList.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return dropdownList;
	}
}