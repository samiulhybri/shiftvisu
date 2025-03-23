export enum NotificationType {
	ABSENCE_APPROVAL = "ABSENCE_APPROVAL",
	ABSENCE_REQUEST_CANCELLED = "ABSENCE_REQUEST_CANCELLED",
	EXPORT_IS_FAILED = "EXPORT_IS_FAILED",
	SCHEDULED_COMMAND_IS_FAILED = "SCHEDULED_COMMAND_IS_FAILED",
}

export class NotificationTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case NotificationType.ABSENCE_APPROVAL:
				return $localize`Absence Approval`;
			case NotificationType.ABSENCE_REQUEST_CANCELLED:
				return $localize`Absence Request Cancelled`;
			case NotificationType.EXPORT_IS_FAILED:
				return $localize`Export Failed`;
			case NotificationType.SCHEDULED_COMMAND_IS_FAILED:
				return $localize`Scheduled Command Failed`;
			default:
				return "";
		}
	}

	static getStateValue(value: string): string {
		switch (value) {
			case $localize`Absence Approval`:
				return NotificationType.ABSENCE_APPROVAL;
			case $localize`Absence Request Cancelled`:
				return NotificationType.ABSENCE_REQUEST_CANCELLED;
			case $localize`Export Failed`:
				return NotificationType.EXPORT_IS_FAILED;
			case $localize`Scheduled Command Failed`:
				return NotificationType.SCHEDULED_COMMAND_IS_FAILED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(NotificationType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}