export enum TransportOrderPosStatus {
	DELIVERED = "DELIVERED",
	PROCESSING = "PROCESSING",
	PARTIAL_DELIVERED = "PARTIAL_DELIVERED",
	NOT_ACCEPTED = "NOT_ACCEPTED",
}

export class TransportOrderPosStatusClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case TransportOrderPosStatus.DELIVERED:
				return $localize`Delivered`;
			case TransportOrderPosStatus.PARTIAL_DELIVERED:
				return $localize`Partial Delivered`;
			case TransportOrderPosStatus.PROCESSING:
				return $localize`Processing`;
			case TransportOrderPosStatus.NOT_ACCEPTED:
				return $localize`Not Accepted`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Delivered`:
				return TransportOrderPosStatus.DELIVERED;
			case $localize`Partial Delivered`:
				return TransportOrderPosStatus.PARTIAL_DELIVERED;
			case $localize`Processing`:
				return TransportOrderPosStatus.PROCESSING;
			case $localize`Not Accepted`:
				return TransportOrderPosStatus.NOT_ACCEPTED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(TransportOrderPosStatus);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
