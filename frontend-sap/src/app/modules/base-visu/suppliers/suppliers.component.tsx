import { Component, Input, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Suppliers } from "@app/shared/models/suppliers.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { AuthService } from "@app/shared/services/auth.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-suppliers",
	templateUrl: "./suppliers.component.html",
	styleUrl: "./suppliers.component.css",
})
export class SuppliersComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	selectedRowValue: any;
	isLoading: boolean = false;
	dialogTitle: string = "";
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	isUpdate?: boolean;
	customId?: string;
	cachedCustomId?: string = "";
	supplierConfig?: any = {};
	selectedSupplier: Suppliers = new Suppliers().deserialize({});
	@ViewChild("errorDialogSuppliers", { static: false }) errorDialogSuppliers: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
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
	];

	suppliersClass = new Suppliers();
	constructor(
		public commonService: CommonService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		public authService: AuthService,
	) {
		this.supplierConfig = this.configService.getConfigValue("suppliers");
		this.selectedSupplier = new Suppliers().deserialize({});
	}
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `Suppliers?$filter=id eq ${this.selectedRowValue?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	ngOnInit(): void {
		this.getCustomId();
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedRowValue = new Suppliers().deserialize({});
		this.selectedSupplier = new Suppliers().deserialize({});
		this.selectedSupplier.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedSupplier.custom_id = "";
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
			this.selectedSupplier.custom_id || ""
		);
		const urlString = `Suppliers?$filter=custom_id eq '${this.selectedSupplier.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedSupplier?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Suppliers(${this.selectedSupplier?.id})` : `Suppliers`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				if (!this.isUpdate) {
					this.filterHandler();
				}
				else {
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
				this.errorDialogSuppliers.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedRowValue = this.selectedSupplier?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedSupplier.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Supplier").catch(() => false);
		this.selectedSupplier.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedSupplier.custom_id = "";
		this.isLoadingCustomId = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogSuppliers") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Suppliers(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.errorDialogSuppliers.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogSuppliers") as Dialog;
		dialog.open = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogSuppliers.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedSupplier) this.selectedSupplier.is_active = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedSupplier) this.selectedSupplier.name = (event.target as any).value;
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedSupplier.custom_id?.trim();
		this.selectedSupplier.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.supplierConfig && this.selectedSupplier) {
			return (
				this.supplierConfig[fieldName] === 0 && this.selectedSupplier.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
