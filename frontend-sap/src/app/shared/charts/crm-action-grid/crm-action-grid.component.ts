import { Component, EventEmitter, Input, input, Output } from "@angular/core";

@Component({
	selector: "app-crm-action-grid",
	templateUrl: "./crm-action-grid.component.html",
	styleUrl: "./crm-action-grid.component.css",
})
export class CrmActionGridComponent {
	@Input() gridTitle: string = "Responsible";

	@Input() columns?: any[] = [];
	@Input() gridData?: any[] = [];

	@Output() onExportGridRowDetailsEvent: EventEmitter<{}> = new EventEmitter();

	constructor() {}

	onActionGridRowSelect(event: any) {
		const ids = event.detail.selectedFlatRows.map(
			(item: { original: any }) => item.original.id
		);
		this.onExportGridRowDetailsEvent.emit(ids);
	}
}
