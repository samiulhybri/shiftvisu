export enum AbsenceStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    NOT_APPROVED = 'NOT APPROVED',
    REVOKE = 'REVOKE',
    REVOKED = 'REVOKED',
    NEW = 'NEW'
}
export class AbsenceStatusClass {
	constructor() { }

	getStateTranslate(state: any): string {
		switch (state) {
			case AbsenceStatus.PENDING:
				return $localize`PENDING`;
			case AbsenceStatus.APPROVED:
				return $localize`APPROVED`;
			case AbsenceStatus.NOT_APPROVED:
				return $localize`NOT APPROVED`;
			case AbsenceStatus.REVOKE:
				return $localize`REVOKE`;
			case AbsenceStatus.REVOKED:
				return $localize`REVOKED`;
			case AbsenceStatus.NEW:
				return $localize`NEW`;
			default:
				return "";
		}
	}
	getColor(state: any): String {
		switch (state) {
			case AbsenceStatus.PENDING:
				return `#FFA600`;
			case AbsenceStatus.APPROVED:
				return `#12B76A`;
			case AbsenceStatus.NOT_APPROVED:
				return `#F04438`;
			case AbsenceStatus.REVOKE:
				return `#AC58FF`;
			case AbsenceStatus.REVOKED:
				return `#4B5FFA`;
			case AbsenceStatus.NEW:
				return `#00A3EC`;
			default:
				return "";
		}
	}
	
	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(AbsenceStatus);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

}