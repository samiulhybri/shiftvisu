import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CustomerGroup } from "@app/shared/models/customer-group.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ConfigService } from "@app/shared/services/config.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { NgForm } from "@angular/forms";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-customer-group",
	templateUrl: "./customer-group.component.html",
	styleUrl: "./customer-group.component.css",
})
export class CustomerGroupComponent {
	isLoading: boolean = false;
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	value!: string;
	autoIncrementId!: string;
	dialogTitle: string = "";
	deletItemId = "";
	deleteDialog?: Dialog;
	errorDialog?: Dialog;
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	selectedCustomerGroup: CustomerGroup = new CustomerGroup().deserialize({});
	@ViewChild("errorDialogCustomerGroup", { static: false }) errorDialogCustomerGroup: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	customerGroupConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
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
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`CRM Id`,
			accessor: "crm_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Sort Order`,
			accessor: "sort_order",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			autoResizable: true,
		},
	];

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.selectedCustomerGroup = new CustomerGroup().deserialize({});
		this.customerGroupConfig = this.configService.getConfigValue("customers_groups");
	}

	ngAfterViewInit(): void {
		this.deleteDialog = document.getElementById("deleteDialogCustomerGroup") as Dialog;
		this.errorDialog = document.getElementById("errorDialogCustomerGroup") as Dialog;
		this.getCustomId();
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
		const url = `CustomerGroups?$filter=id eq ${this.selectedCustomerGroup?.id}&$orderby=sort_order asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}
	async newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedCustomerGroup = new CustomerGroup().deserialize({});
		this.selectedCustomerGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedCustomerGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("CustomerGroup").catch(() => false);
		this.selectedCustomerGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedCustomerGroup.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedCustomerGroup.custom_id?.trim();
		this.selectedCustomerGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedCustomerGroup.custom_id || ""
		);
		const urlString = `CustomerGroups?$filter=custom_id eq '${this.selectedCustomerGroup.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedCustomerGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `CustomerGroups(${this.selectedCustomerGroup?.id})`
			: `CustomerGroups`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogCustomerGroup.elementRef.nativeElement.open = true;
			},
		});
	}

	deleteClick(value: any) {
		this.deletItemId = value.id;
		if (this.deleteDialog) this.deleteDialog.open = true;
	}

	editClick(value: any) {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.dialogTitle = this.localization.edit;
		this.selectedCustomerGroup?.deserialize(value);
		this.cachedCustomId = this.selectedCustomerGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/CustomerGroups(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.closeDialogDelete();
				if (this.errorDialog) this.errorDialog.open = true;
			},
		});
	}

	closeDialogDelete() {
		if (this.deleteDialog) this.deleteDialog.open = false;
	}

	closeDialog() {
		(this.form as any).onReset();
		this.isDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogCustomerGroup.elementRef.nativeElement.open = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
		this.customIdValueStateText = this.localization.idIsRequired;
	}

	shouldBeDisabled(fieldName: string) {
		if (this.customerGroupConfig && this.selectedCustomerGroup) {
			return (
				this.customerGroupConfig[fieldName] === 0 &&
				this.selectedCustomerGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
