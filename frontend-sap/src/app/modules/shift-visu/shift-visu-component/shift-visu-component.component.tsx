import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";

import Dialog from "@ui5/webcomponents/dist/Dialog";
import { Text } from "@ui5/webcomponents-react";
import React from "react";

import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { DialogComponent } from "@app/shared/components/dialog/dialog.component";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import {
	ShiftVisuComponentOptionTypeClass,
	ShiftVisuComponentTypeEnum,
} from "@app/shared/enums/ShiftVisuComponentTypeEnum";
import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import { BackendModelTypeClass } from "@app/shared/enums/BackendModelType";

import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";

@Component({
	selector: "app-component",
	templateUrl: "./shift-visu-component.component.html",
	styleUrl: "./shift-visu-component.component.css",
})
export class ShiftVisuComponentComponent implements OnInit {
	@ViewChild("componentsRef") gridTable: CustomReactGridTable | undefined;
	@ViewChild("addOrEditComponentDialog") addOrEditComponentDialog!: DialogComponent;
	@ViewChild("deleteComponentDialog") deleteComponentDialog!: Dialog;

	localization = Localization;
	modelTypeItems: { modelType: string; value: string }[] = [];
	componentOptionTypeArray = ShiftVisuComponentOptionTypeClass.getEnumArray();
	baseUrl = "/ShiftVisuComponents";

	filterQuery = `startsWith(custom_id,'SVC-')`;

	selectedRowIds: Record<any, any> = {};

	componentDefaultValue = new ShiftVisuComponentModel().deserialize({
		name: "",
		is_required: false,
		model_type: "",
		component_type: ShiftVisuComponentTypeEnum.CHECKBOX,
	});

	selectedComponent: ShiftVisuComponentModel = new ShiftVisuComponentModel().deserialize({
		...this.componentDefaultValue,
	});

	isSavingOrDeletingComponent = false;
	saveMode: "post" | "patch" | null = null;

	modalComponent: ShiftVisuComponentModel = new ShiftVisuComponentModel().deserialize({
		...this.componentDefaultValue,
	});

	selectedModelType = "";

	deleteId: number | null = null;
	isLoadingCustomId: boolean = false;
	customId?: string = "";
	model_type: any;
	isDisabled: boolean = true;

	get shiftVisuAdminPermission() {
		return PermissionEnum.SHIFTVISU_ADMIN;
	}

	get componentOptionTypes() {
		return ShiftVisuComponentTypeEnum;
	}

	columns: any = [
		{
			Header: $localize`Component`,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
		},
		{
			Header: $localize`Component Type`,
			accessor: "component_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			comboBoxValues: this.componentOptionTypeArray,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell } = instance;
				const model = ShiftVisuComponentOptionTypeClass.getStateTranslate(cell.value);

				return (
					<React.StrictMode>
						<Text>{model}</Text>
					</React.StrictMode>
				);
			},
		},
	];

	constructor(
		public authService: AuthService,
		private shiftVisuService: ShiftVisuService,
		private toast: ToastService,
		private cdr: ChangeDetectorRef
	) {
		this.selectedComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});

		this.modalComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});
	}

	async ngOnInit() {
		this.getModelTypes();
		await this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.shiftVisuService
			.getEntity("ShiftVisuComponent")
			.catch(() => false);
		if (typeof this.customId === "boolean") this.modalComponent.custom_id = "";
		this.isLoadingCustomId = false;
	}

	processData(data: any[], recentData: any[]) {
		if (data.length > 0 && data.length == recentData.length) {
			if (this.gridTable?.selectedRowsId) {
				this.selectedRowIds[0] = true;
				this.gridTable.selectedRowsId = structuredClone(this.selectedRowIds);
			}
			this.selectedComponent = structuredClone(data[0]);
			this.cdr.detectChanges();
		} else {
			this.selectedComponent = new ShiftVisuComponentModel().deserialize({
				...this.componentDefaultValue,
			});
		}

		this.modalComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});
	}

	getModelTypes(): void {
		this.modelTypeItems = BackendModelTypeClass.getEnumArrayShiftVisu().map(value => {
			const model = BackendModelTypeClass.getStateTranslate(value.modelType);
			return {
				modelType: value.modelType,
				value: model?.text || this.getModelName(value.modelType),
			};
		});
	}

	updateModelTypeValues(event: any) {
		const selectedItem = this.modelTypeItems.find(
			item => this.getModelName(item.modelType) === event.detail.item.text
		);
		if (selectedItem) {
			this.selectedModelType = selectedItem.modelType;
		}
	}

	onModelTypeBlur() {
		let selectedType = this.modelTypeItems.find(t => t.value == this.selectedModelType);

		if (!selectedType) {
			this.selectedModelType = "";
			this.modalComponent.model_type = "";
		} else {
			this.modalComponent.model_type = selectedType.modelType;
		}
	}

	deleteClick(event: any) {
		this.deleteId = event.id;
		this.deleteComponentDialog.open = true;
	}

	deleteComponent() {
		this.isSavingOrDeletingComponent = true;
		if (this.deleteId) {
			this.shiftVisuService.delete(`${this.baseUrl}/${this.deleteId}`).subscribe({
				next: () => {
					this.updateComponents();
					this.handleComponentPopupClose();
					const { recordDeleted } = Localization;
					this.toast.showToast(recordDeleted, "success");
				},
				error: () => {
					this.handleComponentPopupClose();
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
				},
			});
		}
	}

	editClick(data: any) {
		this.modalComponent = new ShiftVisuComponentModel().deserialize({ ...data });
		this.selectedModelType = this.modalComponent.model_type ?? "";
		this.addOrEditComponentDialog.isDialogOpen = true;
		this.saveMode = "patch";
	}

	newButtonClick() {
		this.modalComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
			custom_id: this.customId,
		});
		this.selectedModelType = "";
		this.addOrEditComponentDialog.isDialogOpen = true;
		this.saveMode = "post";
	}

	onRowClicked(event: any) {
		this.selectedComponent = event.detail.row.original;
	}

	onComponentSave(form: NgForm) {
		this.isSavingOrDeletingComponent = true;
		let payload: any = this.modalComponent.toOdata();

		let url = this.baseUrl + (this.saveMode == "post" ? "" : `/${this.modalComponent.id}`);
		if (this.saveMode) {
			this.shiftVisuService[this.saveMode](url, payload).subscribe({
				next: async response => {
					this.updateComponents();
					this.handleComponentPopupClose();
					const { recordSavedSuccessfully } = Localization;
					this.toast.showToast(recordSavedSuccessfully, "success");
					form.resetForm();
					await this.getCustomId();
				},
				error: async () => {
					this.handleComponentPopupClose();
					const { failedToSaveData } = Localization;
					this.toast.showToast(failedToSaveData, "error");
					form.resetForm();
					await this.getCustomId();
				},
			});
		}
	}

	updateComponents() {
		this.modalComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});
		this.selectedComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});

		this.gridTable?.onFilterAndSorting();
	}

	handleComponentPopupClose(form?: NgForm) {
		this.isSavingOrDeletingComponent = false;
		this.addOrEditComponentDialog.isDialogOpen = false;
		this.deleteComponentDialog.open = false;
		this.saveMode = null;
		this.selectedModelType = "";

		if (form) {
			form.resetForm();
		}
	}

	searchClick() {
		this.selectedComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});
	}

	getModelName(modelType: string | null): string {
		if (!modelType) return "";
		return modelType.split("\\").pop() || modelType;
	}
}
