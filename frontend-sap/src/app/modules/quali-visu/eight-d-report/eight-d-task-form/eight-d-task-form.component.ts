import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ComboBoxSelectionChangeEventDetail } from "@ui5/webcomponents/dist/ComboBox";
import { ClassicEditor } from "ckeditor5";

import { TextEditorComponent } from "@app/shared/components/text-editor/text-editor.component";
import { Localization } from "@app/shared/utils/common-localize";

import { QualiVisuService } from "@app/modules/quali-visu/services/quali-visu.service";
import { NgForm } from "@angular/forms";

@Component({
	selector: "app-eight-d-task-form",
	templateUrl: "./eight-d-task-form.component.html",
	styleUrl: "./eight-d-task-form.component.css",
})
export class EightDTaskFormComponent {
	@Input() open: boolean = false;
	@Input() areActionsDisabled: boolean = false;
	@Input() saveMode: string = "";
	@Input() descriptionName: string = "";
	@Input() task: any = {
		name: "",
		responsible_id: "",
		end_date: "",
		progress: 0,
		description: "",
	};

	teamMembers: any[] = [];

	@Output() onPopupSave: EventEmitter<any> = new EventEmitter<any>();
	@Output() onPopupClose: EventEmitter<any> = new EventEmitter<any>();

	config = new TextEditorComponent().config;
	classicEditor = ClassicEditor;

	localization = Localization;

	responsibleText = "";

	constructor(private qualiVisuService: QualiVisuService) {}

	ngOnInit(): void {
		this.qualiVisuService.teamMembersBehaviorObservable().subscribe(members => {
			this.teamMembers = members;
		});

		if (
			this.task?.responsible?.name &&
			this.teamMembers.some(m => m.id == this.task.responsible_id)
		) {
			this.responsibleText = this.task.responsible.name ?? "";
		}
	}

	popupCloseClick() {
		this.onPopupClose.emit({ ...this.task });
		this.task = {
			name: "",
			responsible_id: "",
			end_date: "",
			progress: 0,
			description: "",
		};

		this.responsibleText = "";
	}

	popupSaveClick(form: NgForm) {
		if (form.invalid) {
			(form as any).onSubmit(undefined);
			return;
		}

		this.onPopupSave.emit({ ...this.task });
	}

	setResponsible(event: ComboBoxSelectionChangeEventDetail) {
		this.task.responsible_id = event.item.id;
	}

	checkResponsibleOnBlur() {
		if (!this.teamMembers.some(m => m.id == this.task.responsible_id)) {
			this.task.responsible_id = "";
		}
	}
}
