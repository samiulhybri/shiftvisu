export enum UploadStateType {
	READY = "Ready",
    UPLOADING = "Uploading",
    COMPLETE = "Complete",
    ERROR = "Error",
    PENDING = "Pending",
    TERMINATED = "Terminated"
}

export class UploadStateTypeClass {
	constructor() {}

	static getStateTranslate(state: any): string {
		switch (state) {
			case UploadStateType.READY:
				return $localize`Ready`;
			case UploadStateType.UPLOADING:
				return $localize`Uploading`;
            case UploadStateType.COMPLETE:
				return $localize`Complete`;
            case UploadStateType.ERROR:
                    return $localize`Error`;
            case UploadStateType.PENDING:
				return $localize`Pending`;
            case UploadStateType.TERMINATED:
				return $localize`Terminated`;
			default:
				return "";
		}
	}

	static getStateValue(value: any): string {
		switch (value) {
			case $localize`Ready`:
				return UploadStateType.READY;
			case $localize`Uploading`:
				return UploadStateType.UPLOADING;
            case $localize`Complete`:
                    return UploadStateType.COMPLETE;
            case $localize`Error`:
				return UploadStateType.ERROR;
            case $localize`Pending`:
				return UploadStateType.PENDING;
            case $localize`Terminated`:
				return UploadStateType.TERMINATED;
			default:
				return "";
		}
	}

	static getEnumArray() {
		const enum_arr: any = [];
		const elements = Object.keys(UploadStateType);
		elements.forEach(elm => {
			if (isNaN(Number(elm))) {
				enum_arr.push({ value: elm, text: this.getStateTranslate(elm) });
			}
		});
		return enum_arr;
	}
}
