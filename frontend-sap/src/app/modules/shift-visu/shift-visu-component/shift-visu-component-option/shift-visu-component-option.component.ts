import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	Output,
	SimpleChanges,
	ViewChild,
} from "@angular/core";
import { NgForm } from "@angular/forms";

import Dialog from "@ui5/webcomponents/dist/Dialog";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ShiftVisuComponentTypeEnum } from "@app/shared/enums/ShiftVisuComponentTypeEnum";
import { ShiftVisuComponentOptionModel } from "@app/shared/models/shift-visu-component-option.model";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";

import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";

@Component({
	selector: "app-shift-visu-component-option",
	templateUrl: "./shift-visu-component-option.component.html",
	styleUrl: "./shift-visu-component-option.component.css",
})
export class ShiftVisuComponentOptionComponent {
	@ViewChild("componentOptionsRef") gridTable: CustomReactGridTable | undefined;
	@ViewChild("addOrEditOptionDialog") addOrEditOptionDialog!: DialogComponent;
	@ViewChild("deleteOptionDialog") deleteOptionDialog!: Dialog;

	@Input() component: ShiftVisuComponentModel = new ShiftVisuComponentModel();
	@Output() updateComponent = new EventEmitter<any>();

	shiftVisuAdminPermission = PermissionEnum.SHIFTVISU_ADMIN;
	baseUrl = "/ShiftVisuComponentOptions";

	isOptionCreationEnabled = false;

	columns: any = [
		{
			Header: $localize`Options`,
			accessor: "option",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
	];

	gridDefaultTitle = $localize`No Component Selected`;

	data: ShiftVisuComponentOptionModel[] = [];

	defaultOptionValue = new ShiftVisuComponentOptionModel().deserialize({
		option: "",
	});

	modalOption: ShiftVisuComponentOptionModel = new ShiftVisuComponentOptionModel().deserialize({
		...this.defaultOptionValue,
	});

	localization = Localization;
	idToIndex: any = [];
	initialSelectedRowsId: any;

	isSavingOrDeletingOption = false;

	saveMode: "post" | "put" | null = null;
	deleteId: any;

	constructor(
		public authService: AuthService,
		private shiftVisuService: ShiftVisuService,
		private toast: ToastService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["component"]?.currentValue) {
			this.data = this.component?.shiftVisuComponentOptions ?? [];
			this.isOptionCreationEnabled = this.checkIfTypeHasOption();
		}
	}

	deleteClick(event: any) {
		this.deleteId = event.id;
		this.deleteOptionDialog.open = true;
	}

	deleteOption() {
		this.isSavingOrDeletingOption = true;
		if (this.deleteId) {
			this.shiftVisuService.delete(`${this.baseUrl}/${this.deleteId}`).subscribe({
				next: () => {
					this.updateOptions();
					this.handleOptionPopupClose();
					this.updateComponent.emit();
				},
				error: () => {
					this.handleOptionPopupClose();
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
					this.updateComponent.emit();
				},
			});
		}
	}

	editClick(data: any) {
		this.saveMode = "put";
		this.modalOption = new ShiftVisuComponentOptionModel().deserialize({ ...data });
		this.addOrEditOptionDialog.isDialogOpen = true;
	}

	newButtonClick() {
		this.modalOption = new ShiftVisuComponentOptionModel().deserialize({
			...this.defaultOptionValue,
			shift_visu_component_id: this.component.id,
		});
		this.saveMode = "post";
		this.addOrEditOptionDialog.isDialogOpen = true;
	}

	onComponentDetailSave(form: NgForm) {
		this.isSavingOrDeletingOption = true;
		let payload = new ShiftVisuComponentOptionModel().deserialize(this.modalOption);
		let url = this.baseUrl + (this.saveMode == "post" ? "" : `/${this.modalOption.id}`);
		if (this.saveMode) {
			this.shiftVisuService[this.saveMode](url, payload).subscribe({
				next: (response: any) => {
					this.modalOption.id = response.id;
					this.updateOptions();
					this.handleOptionPopupClose();
					const { recordSavedSuccessfully } = Localization;
					this.toast.showToast(recordSavedSuccessfully, "success");
					form.resetForm();
					this.updateComponent.emit();
				},
				error: () => {
					this.handleOptionPopupClose();
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
					this.updateComponent.emit();
				},
			});
		}
	}

	updateOptions() {
		this.modalOption = new ShiftVisuComponentOptionModel().deserialize({
			...this.defaultOptionValue,
		});

		this.component.shiftVisuComponentOptions = this.data;

		this.gridTable?.onFilterAndSorting();
	}

	handleOptionPopupClose(form?: NgForm) {
		this.isSavingOrDeletingOption = false;
		this.addOrEditOptionDialog.isDialogOpen = false;
		this.deleteOptionDialog.open = false;
		this.saveMode = null;
		if (form) {
			form.resetForm();
		}
	}

	checkIfTypeHasOption() {
		if (!this.component.id || !this.component.component_type) {
			return false;
		}
		if (this.component.model_type) {
			return false;
		}
		return true;
	}
}
