export enum MPOfferLogType {
	CREATED_OFFER,
	UPDATED_OFFER,
    CLOSED_OFFER,
	CONNECT_TO_PROJECT,
	REOPENED_OFFER,
	DISCONNECTED_PROJECT,
	UPDATED_PROJECT_ORDER
}

export class MPOfferLogTypeClass {
	constructor() { }

	getStateTranslate(state: any): String {
		switch (state) {
			case "CREATED_OFFER":
				return $localize`Created offer`;
			case "UPDATED_OFFER":
				return $localize`Offer is edited`;
			case "CLOSED_OFFER":
				return $localize`Offer is closed`;
			case "CONNECT_TO_PROJECT":
				return $localize`Offer is being connected to project`;
			case "REOPENED_OFFER":
				return $localize`Re-opened offer`;
			case "DISCONNECTED_PROJECT":
				return $localize`Disconnected project from offer`;
			case "UPDATED_PROJECT_ORDER":
				return $localize`Updated project's order`;
			default:
				return "";
		}
	}

	getEnumArray() {
		var res_arr: any = [];
		var elemetns = Object.keys(MPOfferLogType);
		elemetns.forEach((elm) => {
			if (isNaN(Number(elm))) {
				res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return res_arr;
	}
}
