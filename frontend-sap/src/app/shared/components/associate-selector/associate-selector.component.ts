import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
	selector: "app-associate-selector",
	templateUrl: "./associate-selector.component.html",
	styleUrl: "./associate-selector.component.css",
})
export class AssociateSelectorComponent {
	selectAllText: string = $localize`Select All`;
	deSelectText: string = $localize`Deselect All`;
	@Input() enableSelection: boolean = false;
	@Output() selectionEvent = new EventEmitter<Boolean>();

	selectAllAssociate() {
		this.selectionEvent.emit(true);
	}

	deselectAllAssociate() {
		this.selectionEvent.emit(false);
	}
}
