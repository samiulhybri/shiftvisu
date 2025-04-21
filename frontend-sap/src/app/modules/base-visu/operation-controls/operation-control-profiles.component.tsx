// Angular
import { Component, ViewChild } from "@angular/core";
import {CustomReactGridTable,GridTableColumnDataType} from "@app/shared/components/CustomGridTable";
// Model
import OperationControlProfile from "@app/shared/models/operation-control-profile.model";
// Services
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ToastService } from "@app/shared/services/toaster.service";
// UI5 Components
import Dialog from "@ui5/webcomponents/dist/Dialog";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
// Utility functions for localization and common operations.
import { Localization } from "@app/shared/utils/common-localize";
import { OperationControlProfileExternalProcessingTypeClass } from "@app/shared/enums/operation_control_profile_external_processing_type.enum";
import { OperationControlProfileConfirmationTypeClass } from "@app/shared/enums/operation_control_profile_confirmation_type.enum";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-operation-control-profiles",
	templateUrl: "./operation-control-profiles.component.html",
})
export class OperationControlProfilesComponent {
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("deleteErrorDialogItems", { static: false }) deleteErrorDialogItems: any;

	operationControlProfile = OperationControlProfile;
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	selectedItem: OperationControlProfile = new OperationControlProfile().deserialize({});
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	itemConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	isPreviewDialogOpen: boolean = false;
	confirmationTypeItems = OperationControlProfileConfirmationTypeClass.getEnumArray();
	externalProcessingTypeItems = OperationControlProfileExternalProcessingTypeClass.getEnumArray();

	url: string = "/OperationControlProfiles";

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		public _toasterSrv: ToastService
	) {}

	ngOnInit(): void {
		this.getCustomId();
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: false,
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			minWidth: 50,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: false,
			autoResizable: true,
		},
		{
			Header: this.localization.autoPostGoodsReceipt,
			accessor: "auto_post_goods_receipt",
			minWidth: 50,
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: false,
			disableGroupBy: false,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`Confirmation Type`,
			accessor: "confirmation_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.confirmationTypeItems,
			autoResizable: true,
		},
		{
			Header: $localize`External Processing Type`,
			accessor: "external_processing_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: this.externalProcessingTypeItems,
			autoResizable: true,
		},
	];

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
		this.selectedItem = this.selectedItem?.deserialize({});
	}

	deleteClick(value: any): void {
		this.selectedItem = new OperationControlProfile().deserialize(value);
		(document.getElementById("deleteDialogItem") as Dialog).open = true;
	}

	async editClick(value: object): Promise<void> {
		this.dialogTitle = this.localization.edit;
		this.selectedItem = this.selectedItem?.deserialize(value);
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedItem.custom_id;
	}

	async newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdate = false;
		this.selectedItem = new OperationControlProfile().deserialize({});
		this.customIdState = "None";
		this.selectedItem.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedItem.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	inputEntryRestrict(event: any, value: any) {
		if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeExternalProcessingType(event: any) {
		this.selectedItem.external_processing_type = event.detail.item.text;
	}

	onConfirmationTypeChange(event: any) {
		this.selectedItem.confirmation_type = event.detail.item.text;
	}

	handleClose() {
		this.selectedItem = new OperationControlProfile().deserialize({});
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService
			.getEntity("OperationControlProfile")
			.catch(() => false);
		this.selectedItem.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedItem.custom_id = "";
		this.isLoadingCustomId = false;
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
		const url = `OperationControlProfiles?$filter=id eq ${this.selectedItem?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/OperationControlProfiles(${this.selectedItem.id})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedItem.id, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogItems.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogItem") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogItems.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedItem.custom_id?.trim();
		this.selectedItem.custom_id = customId;

		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedItem.custom_id || ""
		);
		const urlString = `OperationControlProfiles?$filter=custom_id eq '${this.selectedItem.custom_id}'&$select=custom_id`;
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
		if (this.selectedItem.custom_id) {
			const payload = this.selectedItem?.toOdata();
			const method = this.isUpdate ? "put" : "post";
			const urlString = this.isUpdate
				? `OperationControlProfiles(${this.selectedItem?.id})`
				: `OperationControlProfiles`;
			this.commonService[method](urlString, payload).subscribe({
				next: async (response: any) => {
					const { recordSavedSuccessfully } = Localization;
					this.selectedItem = new OperationControlProfile().deserialize(response);

					this._toasterSrv.showToast(recordSavedSuccessfully, "success");
					if (!this.isUpdate) {
						this.filterHandler();
					} else {
						this.refreshEditData();
					}
					this.handleClose();
					this.isLoading = false;
					this.isDialogOpen = false;
					this.disableButtonDuringRequest = false;
					(this.form as any).onReset();
				},
				error: () => {
					const { failedToSaveData } = Localization;
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
					this._toasterSrv.showToast(failedToSaveData, "error");
				},
			});
		} else {
			this.isLoading = false;
			this.disableButtonDuringRequest = false;
		}
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.itemConfig && this.selectedItem) {
			return this.itemConfig[fieldName] === 0;
		} else {
			return false;
		}
	}
}
