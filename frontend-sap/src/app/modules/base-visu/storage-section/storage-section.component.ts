import { Component, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";

import {
	ProductionPlanningPageName,
	ProductionPlanningPageNameClass,
} from "@app/shared/enums/ProductionPlanningPageName";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { StorageSection } from "@app/shared/models/storage-section.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-storage-section",
	templateUrl: "./storage-section.component.html",
	styleUrl: "./storage-section.component.css",
})
export class StorageSectionComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	selectedStorageSection: StorageSection = new StorageSection().deserialize({});
	@ViewChild("errorDialogStorageSections", { static: false }) errorDialogStorageSections: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogStorageSection", { static: false })
	deleteErrorDialogStorageSection: any;
	public selectedTab: string = "core_data";
	localization = Localization;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
	];

	storageSectionClass = new StorageSection();
	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
	) {
		this.selectedStorageSection = new StorageSection().deserialize({});
	}
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
	}

	getPageName(value: ProductionPlanningPageName) {
		return ProductionPlanningPageNameClass.getStateTranslate(value);
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedStorageSection = new StorageSection().deserialize({});
		this.selectedStorageSection.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedStorageSection.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedStorageSection.custom_id || ""
		);
		const urlString = `StorageSections?$filter=custom_id eq '${this.selectedStorageSection.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
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

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedStorageSection?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `StorageSections(${this.selectedStorageSection?.id})`
			: `StorageSections`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;

				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogStorageSections.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedStorageSection?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedStorageSection.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("StorageSection").catch(() => false);
		this.selectedStorageSection.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedStorageSection.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async getDbAutoIncrementId() {
		this.commonService.getAutoIncrementId("StorageSections").subscribe(res => {
			this.autoIncrementId = res.value[0].id + 1;
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

	refreshEditData() {
		const url = `StorageSections?$filter=is_active eq true and id eq ${this.selectedStorageSection?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogStorageSection") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/StorageSections(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedStorageSection, null);
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogStorageSection.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogStorageSection") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogStorageSection.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeErrorDialog() {
		this.errorDialogStorageSections.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedStorageSection)
			this.selectedStorageSection.is_active = event.target.checked;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.selectedTab = "core_data";
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedStorageSection.custom_id?.trim();
		this.selectedStorageSection.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}
}
