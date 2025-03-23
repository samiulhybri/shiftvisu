export enum ProdOrderPosOperationStatus {
	PROPOSED = "PROPOSED",
	PLANNED = "PLANNED",
	TERMINATED = "TERMINATED",
	SUSPENDED = "SUSPENDED",
	WAITING_FOR_PREPARATION = "WAITING_FOR_PREPARATION",
	IN_PREPARATION = "IN_PREPARATION",
	WAITING_FOR_SETUP = "WAITING_FOR_SETUP",
	IN_SETUP = "IN_SETUP",
    IN_TEARDOWN  = "IN_TEARDOWN",
	IN_PRODUCTION = "IN_PRODUCTION",
	CLOSED = "CLOSED",
	DELETED = "DELETED",
}

export class ProdOrderPosOperationStatusClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case ProdOrderPosOperationStatus.PROPOSED:
				return $localize`Proposed`;
			case ProdOrderPosOperationStatus.PLANNED:
				return $localize`Planned`;
			case ProdOrderPosOperationStatus.TERMINATED:
				return $localize`Terminated`;
			case ProdOrderPosOperationStatus.SUSPENDED:
				return $localize`Suspended`;
			case ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION:
				return $localize`Waiting For Preparation`;
			case ProdOrderPosOperationStatus.IN_PREPARATION:
				return $localize`In Preparation`;
			case ProdOrderPosOperationStatus.WAITING_FOR_SETUP:
				return $localize`Waiting For Setup`;
			case ProdOrderPosOperationStatus.IN_SETUP:
				return $localize`In Setup`;
            case ProdOrderPosOperationStatus.IN_TEARDOWN :
				return $localize`Teardown`;
			case ProdOrderPosOperationStatus.IN_PRODUCTION:
				return $localize`In Production`;
			case ProdOrderPosOperationStatus.CLOSED:
				return $localize`Closed`;
			case ProdOrderPosOperationStatus.DELETED:
				return $localize`Deleted`;

			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Proposed`:
				return ProdOrderPosOperationStatus.PROPOSED;
			case $localize`Planned`:
				return ProdOrderPosOperationStatus.PLANNED;
			case $localize`Terminated`:
				return ProdOrderPosOperationStatus.TERMINATED;
			case $localize`Suspended`:
				return ProdOrderPosOperationStatus.SUSPENDED;
			case $localize`Waiting For Preparation`:
				return ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION;
			case $localize`In Preparation`:
				return ProdOrderPosOperationStatus.IN_PREPARATION;
			case $localize`Waiting For Setup`:
				return ProdOrderPosOperationStatus.WAITING_FOR_SETUP;
			case $localize`In Setup`:
				return ProdOrderPosOperationStatus.IN_SETUP;
			case $localize`In Production`:
				return ProdOrderPosOperationStatus.IN_PRODUCTION;
			case $localize`Closed`:
				return ProdOrderPosOperationStatus.CLOSED;
			case $localize`Deleted`:
				return ProdOrderPosOperationStatus.DELETED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(ProdOrderPosOperationStatus);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
