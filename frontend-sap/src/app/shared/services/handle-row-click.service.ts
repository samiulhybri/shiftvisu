import { Injectable } from "@angular/core";

@Injectable({
	providedIn: "root",
})
export class HandleRowClickService {
	private clickCount = 0;
	private singleClickTimeout: any;

	constructor() {}

	handleRowClick<T>(
		event: any,
		handleSingleClick: (rowData: T) => void,
		handleDoubleClick: (rowData: T) => void
	): void {
		const DOUBLE_CLICK_DELAY = 300;
		this.clickCount++;

		if (this.clickCount === 1) {
			this.singleClickTimeout = setTimeout(() => {
				if (this.clickCount === 1) {
					const rowData: T = event?.detail?.row?.original;
					handleSingleClick(rowData);
				}
				this.clickCount = 0;
			}, DOUBLE_CLICK_DELAY);
		} else if (this.clickCount === 2) {
			clearTimeout(this.singleClickTimeout);
			this.clickCount = 0;
			const rowData: T = event?.detail?.row?.original;
			handleDoubleClick(rowData);
		}
	}
}
