export enum UserTypes {
    ADMIN = 'ADMIN',
    GUEST = 'GUEST',
}
export class UserTypesClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case UserTypes.ADMIN:
				return $localize`ADMIN`;
			case UserTypes.GUEST:
				return $localize`GUEST`;
			default:
				return "";
		}
	}
	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(UserTypes);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}

}