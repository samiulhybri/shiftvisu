import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ClassicEditor } from "ckeditor5";
import { ChangeEvent } from "@ckeditor/ckeditor5-angular";

import { TextEditorComponent } from "@app/shared/components/text-editor/text-editor.component";

@Component({
	selector: "app-description",
	templateUrl: "./description.component.html",
	styleUrl: "./description.component.css",
})
export class DescriptionComponent {
	@Input() description? = '';
	@Input() isSaving: boolean = false;

	@Output() descriptionChange = new EventEmitter<string>();
	config = new TextEditorComponent().config;
	classicEditor = ClassicEditor;

	valueChange() {
		this.descriptionChange.emit(this.description);
	  }
}
