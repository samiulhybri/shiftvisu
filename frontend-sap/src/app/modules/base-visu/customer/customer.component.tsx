import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Customer } from "@app/shared/models/customer.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { DeliveryTerm } from "@app/shared/models/delivery-term.model";
import { PaymentTerm } from "@app/shared/models/payment-term.model";
import { SalesArea } from "@app/shared/models/sales-area.model";
import { SalesGroup } from "@app/shared/models/sales-group.model";
import { Country } from "@app/shared/models/country.model";
import { CustomerGroup } from "@app/shared/models/customer-group.model";
import { Sector } from "@app/shared/models/sector.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import "@ui5/webcomponents/dist/Toast.js";
import Toast from "@ui5/webcomponents/dist/Toast.js";
import { NgForm } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-customer",
	templateUrl: "./customer.component.html",
	styleUrl: "./customer.component.css",
})
export class CustomerComponent {
	isUpdate?: boolean = false;
	isDialogOpen: boolean = false;
	dialogTitle: string = "";
	customId?: string;
	deletItemId = "";
	isLoading: boolean = false;
	isUpdateDialog?: boolean;
	value!: string;
	autoIncrementId!: string;
	deliveryTerm: DeliveryTerm[] = [];
	paymentTerm: PaymentTerm[] = [];
	salesAreas: SalesArea[] = [];
	salesGroup: SalesGroup[] = [];
	country: Country[] = [];
	customerGroup: CustomerGroup[] = [];
	sector: Sector[] = [];
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	customerConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	@ViewChild("errorDialogTPMSubGroups", { static: false }) errorDialogTPMSubGroups: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	selectedCustomer: Customer = new Customer().deserialize({});
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
			Header: $localize`Delivery Term`,
			accessor: "deliveryTerm.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Payment Term`,
			accessor: "paymentTerm.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Sales Area`,
			accessor: "salesArea.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Sales Group`,
			accessor: "salesGroup.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Customer Group`,
			accessor: "customerGroup.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Sector`,
			accessor: "sector.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
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
			Header: $localize`Name 2`,
			accessor: "name2",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Address`,
			accessor: "address",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Postal Code`,
			accessor: "postal_code",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Country`,
			accessor: "country.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`City`,
			accessor: "city",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Telephone`,
			accessor: "telephone",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Vat`,
			accessor: "vat",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Total Insured`,
			accessor: "total_insured",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
		{
			Header: $localize`Total Production`,
			accessor: "total_production",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
		{
			Header: $localize`Total Outstanding`,
			accessor: "total_outstanding",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
		{
			Header: $localize`Total Revenue`,
			accessor: "total_revenue",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
	];
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	constructor(
		private cdr: ChangeDetectorRef,
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.customerConfig = this.configService.getConfigValue("customers");
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
		const url = `Customers?$filter=id eq ${this.selectedCustomer?.id}&$orderby=custom_id asc&$expand=deliveryTerm,paymentTerm,salesArea,salesGroup,customerGroup,country,sector`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	ngAfterViewInit(): void {
		this.batchCall();
		this.getCustomId();
		this.cdr.detectChanges();
	}

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/DeliveryTerms?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/PaymentTerms?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/SalesAreas?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				3,
				"get",
				`\/odata\/SalesGroups?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				4,
				"get",
				`\/odata\/Countries?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				5,
				"get",
				`\/odata\/CustomerGroups?$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(6, "get", `\/odata\/Sectors?$expand=topCustomer($select=custom_id)`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.deliveryTerm = response.responses[0].body.value.map(
					(deliveryTerm: DeliveryTerm) => new DeliveryTerm().deserialize(deliveryTerm)
				);

				this.paymentTerm = response.responses[1].body.value.map(
					(paymentTerm: PaymentTerm) => new PaymentTerm().deserialize(paymentTerm)
				);

				this.salesAreas = response.responses[2].body.value.map((salesArea: SalesArea) =>
					new SalesArea().deserialize(salesArea)
				);

				this.salesGroup = response.responses[3].body.value.map((salesGroup: SalesGroup) =>
					new SalesGroup().deserialize(salesGroup)
				);

				this.country = response.responses[4].body.value.map((country: Country) =>
					new Country().deserialize(country)
				);

				this.customerGroup = response.responses[5].body.value.map(
					(customerGroup: CustomerGroup) => new CustomerGroup().deserialize(customerGroup)
				);

				this.sector = response.responses[6].body.value.map((sector: Sector) =>
					new Sector().deserialize(sector)
				);

				this.columns[3].comboBoxValues = this.deliveryTerm;
				this.columns[4].comboBoxValues = this.paymentTerm;
				this.columns[5].comboBoxValues = this.salesAreas;
				this.columns[6].comboBoxValues = this.salesGroup;
				this.columns[7].comboBoxValues = this.customerGroup;
				this.columns[8].comboBoxValues = this.sector;
				this.columns[13].comboBoxValues = this.country;
			},
			error: e => {},
		});
	}

	async newButtonClick() {
		this.selectedCustomer = new Customer().deserialize({});
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedCustomer.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedCustomer.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Customer").catch(() => false);
		this.selectedCustomer.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedCustomer.custom_id = "";
		this.isLoadingCustomId = false;
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogCustomer") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/Customers(${this.deletItemId})`).subscribe({
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
				(document.getElementById("errorDialogCustomer") as Dialog).open = true;
			},
		});
	}

	closeErrorDialog() {
		(document.getElementById("errorDialogCustomer") as Dialog).open = false;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogCustomer") as Dialog;
		dialog.open = false;
	}

	editClick(value: any) {
		this.dialogTitle = this.localization.edit;
		this.selectedCustomer = new Customer().deserialize(value);
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.customIdState = "None";
		this.cachedCustomId = this.selectedCustomer.custom_id;
		this.disableButtonDuringRequest = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedCustomer) this.selectedCustomer.is_active = event.target.checked;
	}

	onChangeDeliveryTerm(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.deliveryTerm = new DeliveryTerm().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeName(event: any) {
		if (this.selectedCustomer) this.selectedCustomer.name = (event.target as any).value;
	}
	onChangePaymentTerm(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.paymentTerm = new PaymentTerm().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeSalesAreas(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.salesArea = new SalesArea().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeSalesGroup(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.salesGroup = new SalesGroup().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeCustomerGroup(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.customerGroup = new CustomerGroup().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeCountry(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.country = new Country().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeSectors(event: any) {
		if (this.selectedCustomer) {
			this.selectedCustomer.sector = new Sector().deserialize({
				name: (event.target as any).value,
				id: (event.detail as any).item.id,
			});
		}
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedCustomer.custom_id || ""
		);
		const urlString = `Customers?$filter=custom_id eq '${this.selectedCustomer.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedCustomer?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Customers(${this.selectedCustomer?.id})` : `Customers`;
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
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				(document.getElementById("errorDialogCustomer") as Dialog).open = true;
			},
		});
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedCustomer.custom_id?.trim();
		this.selectedCustomer.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.customerConfig && this.selectedCustomer) {
			return this.customerConfig[fieldName] === 0 && this.customerConfig.is_imported_from_erp;
		} else {
			return false;
		}
	}
}
