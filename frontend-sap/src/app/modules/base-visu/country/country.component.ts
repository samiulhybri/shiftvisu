import { Component, ViewChild } from "@angular/core";
import { Country } from "@app/shared/models/country.model";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import { AuthService } from "@app/shared/services/auth.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-country",
	templateUrl: "./country.component.html",
	styleUrl: "./country.component.css",
})
export class CountryComponent {
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("errorDialogCountries", { static: false }) errorDialogCountries: any;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	isUpdateDialog = false;
	selectedRowValue = new Country().deserialize({});
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	isDialogOpen = false;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	customId?: string;
	isLoadingCustomId: boolean = false;
	disableButtonDuringRequest: boolean = false;
	cachedCustomId?: string = "";
	countryConfig?: any = {};

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			autoResizable: true,
		},
		{
			Header: $localize`CRM Id`,
			accessor: "crm_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			autoResizable: true,
		},
		{
			Header: $localize`HWE Freight Surplus`,
			accessor: "hwe_freight_surplus",
			dataType: GridTableColumnDataType.Number,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`HWE Overhead Surplus`,
			accessor: "hwe_overhead_surplus",
			dataType: GridTableColumnDataType.Number,
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "End",
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.countryConfig = this.configService.getConfigValue("countries");
	}

	async newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdateDialog = false;
		this.selectedRowValue = new Country().deserialize({});
		this.customIdState = "None";
		this.selectedRowValue.custom_id = this.customId;
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedRowValue.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	deleteClick(value: any): void {
		this.selectedRowValue = new Country().deserialize(value);
		(document.getElementById("deleteDialog") as Dialog).open = true;
	}

	editClick(value: object): void {
		this.dialogTitle = this.localization.edit;
		this.selectedRowValue = new Country().deserialize(value);
		(document.getElementById("countriesDialog") as Dialog).open = true;
		this.isDialogOpen = true;
		this.isUpdateDialog = true;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedRowValue.custom_id;
	}

	handleClose() {
		this.selectedRowValue = new Country().deserialize({});
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Country").catch(() => false);
		this.selectedRowValue.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedRowValue.custom_id = "";
		this.isLoadingCustomId = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
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
		const url = `Countries?$filter=id eq ${this.selectedRowValue?.id}`;
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

		this.commonService.delete(`/Countries(${this.selectedRowValue.id})`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue.id, null);
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogCountries.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
		this.isDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogCountries.elementRef.nativeElement.open = false;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedRowValue.custom_id || ""
		);
		const urlString = `Countries?$filter=custom_id eq '${this.selectedRowValue.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedRowValue?.toOdata();
		const method = this.isUpdateDialog ? "put" : "post";
		const urlString = this.isUpdateDialog
			? `Countries(${this.selectedRowValue?.id})`
			: `Countries`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				if (!this.isUpdateDialog) {
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
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogCountries.elementRef.nativeElement.open = true;
			},
		});
	}
	onChangeName(event: any) {
		if (this.selectedRowValue) this.selectedRowValue.name = (event.target as any).value;
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}

		const customId = this.selectedRowValue.custom_id?.trim();
		this.selectedRowValue.custom_id = customId;
		if (this.isUpdateDialog) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}
}
