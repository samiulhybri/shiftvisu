import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";

import { Subject, takeUntil } from "rxjs";
import React from "react";

import Dialog from "@ui5/webcomponents/dist/Dialog";
import { FlexBox, Text } from "@ui5/webcomponents-react";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Localization } from "@app/shared/utils/common-localize";
import { DocumentSection } from "@app/shared/models/document-section.model";
import { DirectoryStructure } from "@app/shared/models/directory-structure.model";
import { AuthService } from "@app/shared/services/auth.service";
import { ConfigService } from "@app/shared/services/config.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";

import { DocVisuService } from "@doc-visu/doc-visu.service";

@Component({
	selector: "app-doc-visu-document-section-setting",
	templateUrl: "./doc-visu-document-section-setting.component.html",
	styleUrl: "./doc-visu-document-section-setting.component.css",
})
export class DocVisuDocumentSectionSettingComponent implements OnDestroy {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("createOrUpdateForm") form?: NgForm;

	directoryStructure: DirectoryStructure[] = [];
	selectedDocumentSection: DocumentSection = new DocumentSection().deserialize({});
	@ViewChild("directoryStructureComboBox") directoryStructureComboBox!: ComboBoxComponent;
	modelTypeItems: { modelType: string; value: string }[] = [];
	localization = Localization;
	isDialogOpen: boolean = false;
	dialogTitle: string = "";
	isLoading: boolean = false;
	disableButtonDuringRequest: boolean = false;
	isLoadingCustomId: boolean = false;
	customIdValueStateText: string = Localization.invalidEntry;
	customIdState: keyof typeof ValueState = "None";
	isUpdate?: boolean;
	cachedCustomId?: string = "";
	customId?: string;
	deleteItemId = "";
	selectedRowValue: any;
	documentSectionConfig?: any = {};
	sortOrderValueState: "None" | "Error" = "None";
	modelTypeValueState: "None" | "Positive" | "Critical" | "Negative" | "Information" = "None";
	isEditMode: boolean = false;
	canUpdateStructure: boolean = false;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			maxWidth: 72,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Section Name`,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Model Type`,
			accessor: "model_type",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell } = instance;
				const model = cell.value?.split("\\").pop() ?? "";

				return (
					<React.StrictMode>
						<Text>{model}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Directory Structure`,
			accessor: "directoryStructure.name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			hAlign: "Left",
		},
		{
			Header: $localize`Sort Order`,
			accessor: "sort_order",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Number,
			hAlign: "Right",
		},
	];

	private destroy$ = new Subject<void>();

	constructor(
		public docVisuService: DocVisuService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		private cdr: ChangeDetectorRef
	) {
		this.selectedDocumentSection = new DocumentSection().deserialize({});
		this.documentSectionConfig = this.configService.getConfigValue("document_section");
	}

	ngOnInit(): void {
		this.getCustomId();
		this.loadData();
		this.loadModelTypes();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	loadData() {
		this.docVisuService
			.getDirectoryStructures()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data: any) => {
					this.directoryStructure = data?.map((directory_structure: DirectoryStructure) =>
						new DirectoryStructure().deserialize(directory_structure)
					);
				},
				error: e => {
					this._toasterSrv.showToast(Localization.someThingWentWrong, "error-toaster");
				},
			});
	}

	loadModelTypes(): void {
		this.modelTypeItems = BackendModelTypeClass.getEnumArrayDocVisu().map(value => ({
			modelType: value.modelType,
			value: value.text,
		}));
	}

	newButtonClick() {
		this.disableButtonDuringRequest = false;
		this.isLoading = false;
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.selectedDocumentSection = new DocumentSection().deserialize({});
		this.selectedDocumentSection.custom_id = this.customId;
		this.customIdState = "None";
		this.selectedDocumentSection.model_type = "" as BackendModelType;
		if (!this.customId) {
			this.selectedDocumentSection.custom_id = "";
			this.getCustomId();
		}
		this.isEditMode = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.canUpdateStructure = false;
		this.modelTypeValueState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedDocumentSection.custom_id?.trim();
		this.selectedDocumentSection.custom_id = customId;
		if (this.isUpdate) {
			if (this.cachedCustomId === customId) {
				this.onCreateOrUpdate();
			} else this.checkCustomId();
		} else this.checkCustomId();
	}

	onChangeIsActive(event: any) {
		if (this.selectedDocumentSection)
			this.selectedDocumentSection.is_active = event.target.checked;
	}

	checkCustomId() {
		const result = this.docVisuService.customIdValidation(
			this.customId || "",
			this.selectedDocumentSection.custom_id || ""
		);
		const urlString = `DocumentSections?$filter=custom_id eq '${this.selectedDocumentSection.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.docVisuService
				.get(urlString)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (response: any) => {
						if (response.value.length === 0) this.onCreateOrUpdate();
						else {
							const { idIsAlreadyTaken } = Localization;
							this.disableButtonDuringRequest = false;
							this.customIdState = "Negative";
							this.customIdValueStateText = idIsAlreadyTaken;
						}
					},
					error: () => {
						this.disableButtonDuringRequest = false;
					},
				});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onChangeDirectoryStructure(event: any) {
		if (this.selectedDocumentSection?.directoryStructure)
			this.selectedDocumentSection.directoryStructure = new DirectoryStructure().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onInputChange(event: any) {
		const inputValue = event.target.value;
		const matchDirectoryStructureData = this.directoryStructure.find(
			data => data.name === inputValue
		);
		if (!matchDirectoryStructureData && this.selectedDocumentSection?.directoryStructure) {
			this.selectedDocumentSection.directoryStructure = new DirectoryStructure().deserialize({
				id: null,
				name: "",
			});
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
			const id = event.target.id;
			switch (id) {
				case "directoryStructureComboBox":
					this.selectedDocumentSection.directoryStructure =
						new DirectoryStructure().deserialize({
							id: null,
						});
					break;
				default:
					break;
			}
		} else {
			event.target.value = value;
		}
	}

	deleteClick(value: any): void {
		this.deleteItemId = value.id;
		const dialog = document.getElementById("deleteDocumentSection") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.docVisuService
			.delete(`/DocumentSections(${this.deleteItemId})`)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					this.closeDialogDelete();
					this.isLoading = false;
					this.filterHandler();
					this.disableButtonDuringRequest = false;
					this.docVisuService.docSectionChanged.next({
						id: this.deleteItemId,
						isDeleted: true,
					});
					this._toasterSrv.showToast(recordDeleted, "success");
				},
				error: err => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
					this.closeDialogDelete();
				},
			});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDocumentSection") as Dialog;
		dialog.open = false;
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedDocumentSection = this.selectedDocumentSection?.deserialize(value);
		const model = this.selectedDocumentSection.model_type?.split("\\").pop() ?? "";
		this.selectedDocumentSection.model_type = model as BackendModelType;
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedDocumentSection.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (value?.directory_structure) {
			this.selectedDocumentSection.directoryStructure = this.directoryStructure.find(
				item => item.id === value.directory_structure.id
			);
		}
		this.isEditMode = true;
		this.canUpdateStructure = true;
		if (this.selectedDocumentSection.model_type == ("" as BackendModelType)) {
			this.isEditMode = false;
			this.canUpdateStructure = false;
		}
	}

	checkExistingModel(modelType: string, id?: number): boolean {
		if (this.childComponent && this.childComponent.data.length) {
			return this.childComponent.data.some((item: DocumentSection) => {
				return item.model_type === modelType && item.id != id;
			});
		}

		return false;
	}

	onModelTypeChange(event: any) {
		const newValue = event.target.value.trim();
		if (!newValue) {
			this.modelTypeValueState = "None";
		} else {
			const isDuplicate = this.checkExistingModel(newValue, this.selectedDocumentSection?.id);
			this.modelTypeValueState = isDuplicate ? "Negative" : "None";
		}
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		this.modelTypeValueState = "None";

		const modelType = this.modelTypeItems.find(
			item => item.value === this.selectedDocumentSection.model_type
		);
		const payload = this.selectedDocumentSection?.toOdata() as any;
		payload.model_type = modelType?.modelType;

		if (payload.model_type && this.checkExistingModel(payload.model_type, payload.id)) {
			this.isLoading = false;
			this.disableButtonDuringRequest = false;
			this.modelTypeValueState = "Negative";
			return;
		}

		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `DocumentSections(${this.selectedDocumentSection?.id})`
			: `DocumentSections`;

		this.docVisuService[method](urlString, payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (section: any) => {
					this._toasterSrv.showToast(Localization.recordSavedSuccessfully, "success");
					this.filterHandler();
					this.isLoading = false;
					this.isDialogOpen = false;
					this.disableButtonDuringRequest = false;
					this.docVisuService.docSectionChanged.next(section);
					this.modelTypeValueState = "None";
				},
				error: () => {
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
				},
			});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.docVisuService.getEntity("DocumentSection").catch(() => false);
		this.selectedDocumentSection.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedDocumentSection.custom_id = "";
		this.isLoadingCustomId = false;
	}

	shouldBeDisabled(fieldName: string) {
		if (this.documentSectionConfig && this.selectedDocumentSection) {
			return this.documentSectionConfig[fieldName] === 0;
		} else {
			return false;
		}
	}
}
