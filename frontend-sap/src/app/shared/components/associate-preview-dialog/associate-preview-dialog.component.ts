import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
@Component({
	selector: "app-associate-preview-dialog",
	templateUrl: "./associate-preview-dialog.component.html",
	styleUrl: "./associate-preview-dialog.component.css",
})
export class AssociatePreviewDialogComponent {
	@Input() isPreviewDialogOpen: boolean = false;
	@Input() title: string = "";
	@Input() columns: [] = [];
	@Input() data: any = [];
	@Output() closeAssociate = new EventEmitter();
	@ViewChild("associateComponentRef", { static: false }) associateComponent:
		| CustomReactGridTable
		| undefined;

	closeAssociateDialog() {
		this.closeAssociate.emit();
		if (this.associateComponent) {
			this.associateComponent.globalSearchFieldValue = "";
			this.associateComponent?.render();
		}
	}
}
