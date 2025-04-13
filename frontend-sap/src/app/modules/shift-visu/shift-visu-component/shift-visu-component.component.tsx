import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnInit,
	ViewChild,
} from "@angular/core";
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
import {
	ShiftVisuComponentMeasureTypeEnum,
	ShiftVisuComponentMeasureTypeClass,
} from "@shift-visu/enums/shiftVisuComponentMeasureTypeEnum";
import {
	shiftVisuComponentViewTypeEnum,
	ShiftVisuComponentViewTypeClass,
} from "@shift-visu/enums/shiftVisuComponentViewTypeEnum";

import { ShiftVisuComponentModel } from "@app/shared/models/shift-visu-component.model";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import { BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import { MultiComboBoxSelectionChangeEventDetail } from "@ui5/webcomponents/dist/MultiComboBox";
import { ShiftVisuService } from "@shift-visu/services/shift-visu.service";

@Component({
	selector: "app-component",
	templateUrl: "./shift-visu-component.component.html",
	styleUrl: "./shift-visu-component.component.css",
})
export class ShiftVisuComponentComponent implements OnInit, AfterViewInit {
	@ViewChild("componentsRef") gridTable: CustomReactGridTable | undefined;
	@ViewChild("addOrEditComponentDialog") addOrEditComponentDialog!: DialogComponent;
	@ViewChild("deleteComponentDialog") deleteComponentDialog!: Dialog;
	@ViewChild("measureComboBox") measureComboBox!: any;

	localization = Localization;
	modelTypeItems: { modelType: string; value: string }[] = [];
	componentOptionTypeArray = ShiftVisuComponentOptionTypeClass.getEnumArray();
	componentMeasureTypeArray = ShiftVisuComponentMeasureTypeClass.getEnumArray();
	componentViewTypeArray = ShiftVisuComponentViewTypeClass.getEnumArray();
	baseUrl = "/ShiftVisuComponents";

	filterQuery = `startsWith(custom_id,'SVC-')`;

	selectedRowIds: Record<any, any> = {};

	componentDefaultValue = new ShiftVisuComponentModel().deserialize({
		name: "",
		is_required: false,
		model_type: "",
		view_in: shiftVisuComponentViewTypeEnum.OVERVIEW,
		measure_options: [],
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
	selectedMeasureOption: any[] = [];
	selectedViewComponent = "";

	deleteId: number | null = null;
	isLoadingCustomId: boolean = false;
	customId?: string = "";
	componentId: number | undefined;

	get shiftVisuAdminPermission() {
		return PermissionEnum.SHIFTVISU_ADMIN;
	}
	get componentViewTypes() {
		return shiftVisuComponentViewTypeEnum;
	}
	get componentOptionTypes() {
		return ShiftVisuComponentTypeEnum;
	}
	get componentMeasureTypes() {
		return ShiftVisuComponentMeasureTypeEnum;
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
			Header: $localize`Model Type`,
			accessor: "model_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				let model = BackendModelTypeClass.getStateTranslate(row.original.model_type);
				return (
					<React.StrictMode>
						<Text>{model?.text}</Text>
					</React.StrictMode>
				);
			},
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
	ngAfterViewInit(): void {
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

	onComponentTypeSelect(type: any): void {
		this.modalComponent.component_type = type.value;
	}

	translate(modelType: any): any {
		return BackendModelTypeClass.getStateTranslate(modelType)?.text || "";
	}

	processData(data: any[], recentData: any[]) {
		if (data.length > 0 && data.length == recentData.length) {
			if (this.componentId) {
				const id = this.componentId;
				const index: number = this.gridTable?.data.findIndex((item: any) => item.id === id);

				if (
					this.gridTable &&
					this.gridTable?.data.length &&
					index !== undefined &&
					index >= 0
				) {
					this.gridTable.selectedRowsId = { [index]: true };
					this.selectedRowIds = { [index]: true };
					this.selectedComponent = structuredClone(this.gridTable?.data[index]);
					this.cdr.detectChanges();
				}
			} else {
				if (this.gridTable?.selectedRowsId) {
					this.selectedRowIds[0] = true;
					this.gridTable.selectedRowsId = structuredClone(this.selectedRowIds);
				}
				this.selectedComponent = structuredClone(data[0]);
				this.cdr.detectChanges();
			}
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
		this.modelTypeItems = BackendModelTypeClass.getEnumArrayShiftVisu().map(value => ({
			modelType: value.modelType,
			value: value.text,
		}));
	}

	onMeasureOptionSelectReset() {
		this.selectedMeasureOption = [];
		this.measureComboBox.elementRef.nativeElement.items.forEach(
			(item: any) => (item.selected = false)
		);
	}

	updateModelTypeValues(data: any) {
		this.modalComponent.model_type = data.detail.item.id;
		this.modalComponent.component_type = ShiftVisuComponentTypeEnum.DROPDOWN_SINGLE;
	}

	updateMeasureTypeValues(event: Event): void {
		const customEvent = event as CustomEvent;
		const selectedValues = customEvent.detail.items.map((item: any) => item.id);
		this.modalComponent.measure_options = selectedValues;
	}
	updateComponentViewInValues(data: any) {
		this.modalComponent.view_in = data.detail.item.text;
	}
	onModelTypeInput(event: Event): void {
		const customEvent = event as CustomEvent;
		const comboBox = customEvent.target as any;

		const filterValue = comboBox.filterValue;
		if (filterValue == "") {
			this.selectedModelType = "";
			this.modalComponent.model_type = "";
		}
	}

	get viewTypeValue(): string {
		const value =
			this.modalComponent.component_type === this.componentOptionTypes.MEASURE
				? "Disabled"
				: this.componentViewTypes.OVERVIEW;
		this.selectedViewComponent = value;
		return value;
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
		this.componentId = undefined;
		if (this.modalComponent.measure_options) {
			this.selectedMeasureOption = JSON.parse(this.modalComponent.measure_options);

			const selectedItems = this.measureComboBox.elementRef.nativeElement.items.filter(
				(item: any) => this.selectedMeasureOption.includes(item.id)
			);
			selectedItems.forEach((item: any) => (item.selected = true));
		}
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
		if (this.gridTable) this.gridTable.selectedRowsId = { [event?.detail?.row?.index]: true };
		const tempSelectedComponent = { ...this.selectedComponent };
		this.selectedComponent = event.detail.row.original;
		this.componentId = this.selectedComponent.id;
	}

	onComponentSave(form: NgForm): void {
		this.isSavingOrDeletingComponent = true;
		if (this.modalComponent.component_type === ShiftVisuComponentTypeEnum.MEASURE) {
			this.modalComponent.view_in = "";
			this.modalComponent.measure_options = JSON.stringify(
				this.modalComponent.measure_options
			);
		} else {
			delete this.modalComponent.measure_options;
		}
		const payload = this.modalComponent.toOdata();
		const isPost = this.saveMode === "post";
		const url = `${this.baseUrl}${isPost ? "" : `/${this.modalComponent.id}`}`;

		if (!this.saveMode || !payload) {
			this.toast.showToast(Localization.failedToSaveData, "error");
			this.isSavingOrDeletingComponent = false;
			return;
		}

		this.shiftVisuService[this.saveMode](url, payload).subscribe({
			next: async (response: any) => {
				this.componentId = response?.id;
				this.updateComponents();
				this.handleComponentPopupClose();
				this.toast.showToast(Localization.recordSavedSuccessfully, "success");
				form.resetForm();
				await this.getCustomId();
				this.isSavingOrDeletingComponent = false;
			},
			error: async (error: any) => {
				console.error("Failed to save component:", error);
				this.handleComponentPopupClose();
				this.toast.showToast(Localization.failedToSaveData, "error");

				form.resetForm();
				await this.getCustomId();
				this.isSavingOrDeletingComponent = false;
			},
		});
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
		this.selectedViewComponent = "";
		if (form) {
			form.resetForm();
		}
		this.onMeasureOptionSelectReset();
	}

	searchClick() {
		this.selectedComponent = new ShiftVisuComponentModel().deserialize({
			...this.componentDefaultValue,
		});
	}
}
