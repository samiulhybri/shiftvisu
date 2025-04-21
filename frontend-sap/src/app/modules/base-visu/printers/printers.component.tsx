import { Component, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { PrinterLanguageClass } from "@app/shared/enums/PrinterLanguage";
import { ProtocolClass } from "@app/shared/enums/Protocol";
import { RequestTypeClass } from "@app/shared/enums/RequestType";
import { Printer } from "@app/shared/models/printer.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { ipv4Validator } from "@app/shared/validators/ipaddress.validator";
import { portValidator } from "@app/shared/validators/input.validator";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-printers",
	templateUrl: "./printers.component.html",
	styleUrl: "./printers.component.css",
})
export class PrintersComponent {
	printerModel = Printer;
	isDialogOpen: boolean = false;
	isUpdateDialog = false;
	isUpdate?: boolean;
	value!: string;
	autoIncrementId!: string;
	deletItemId = "";
	isLoading: boolean = false;
	isLoadingBatchCall: boolean = false;
	dialogTitle: string = "";
	warningForGroup = "";
	selectedValue: any;
	selectedRowValue: Printer = new Printer().deserialize({});
	requestTypeItems = RequestTypeClass.getEnumArray();
	protocolItems = ProtocolClass.getEnumArray();
	PrinterLanguageTypes = PrinterLanguageClass.getEnumArray();
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	clickTimeout: any;
	@ViewChild("errorDialogPrinters", { static: false }) errorDialogPrinters: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	constructor(
		public authService: AuthService,
		public commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.selectedRowValue = new Printer().deserialize({});
	}

	columns: any = [
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
			Header: $localize`Brand`,
			accessor: "brand",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Model`,
			accessor: "model",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`IP Address`,
			accessor: "ip_address",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Port`,
			accessor: "port",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Request Type`,
			accessor: "request_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: RequestTypeClass.getEnumArray(),
			autoResizable: true,
		},
		{
			Header: $localize`Protocol`,
			accessor: "protocol",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: ProtocolClass.getEnumArray(),
			autoResizable: true,
		},
		{
			Header: $localize`Printer Language`,
			accessor: "language",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			comboBoxValues: PrinterLanguageClass.getEnumArray(),
			autoResizable: true,
		},
	];

	public onIpInputChange(event: Event): void {
		const inputControl = this.form?.controls["ip_address"];
		inputControl?.setValidators([ipv4Validator()]);
		inputControl?.updateValueAndValidity();
	}

	public onPortInputChange(event: any): void {
		const value = event.target.value;
		this.selectedRowValue.port = value;
		const inputControl = this.form?.controls["port"];
		inputControl?.setValidators([portValidator()]);
		inputControl?.updateValueAndValidity();
	}

	onRequestTypeInputChange(event: any) {
		const inputValue = event.target.value;
		const matchRequestTypeData = this.requestTypeItems.find(item => item.text === inputValue);
		if (!matchRequestTypeData && this.selectedRowValue?.request_type) {
			this.selectedRowValue.request_type = "";
		}
	}

	onPrinterLanguageInputChange(event: any) {
		const inputValue = event.target.value;
		const matchPrinterLanguageData = this.PrinterLanguageTypes.find(
			(item: { text: any }) => item.text === inputValue
		);
		if (!matchPrinterLanguageData && this.selectedRowValue?.language) {
			this.selectedRowValue.language = "";
		}
	}

	onProtocolInputChange(event: any) {
		const inputValue = event.target.value;
		const matchProtocolInputData = this.protocolItems.find(item => item.text === inputValue);
		if (!matchProtocolInputData && this.selectedRowValue?.protocol) {
			this.selectedRowValue.protocol = "";
		}
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdateDialog = false;
		this.selectedRowValue = new Printer().deserialize({});
		this.disableButtonDuringRequest = false;
		this.isDialogOpen = true;
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
		this.onCreateOrUpdate();
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.dialogTitle = this.localization.edit;
		this.selectedValue = this.selectedRowValue?.deserialize(value);
		this.isUpdateDialog = true;
		this.selectedRowValue.request_type = value.request_type;
		this.selectedRowValue.protocol = value.protocol;
		this.selectedRowValue.language = value.language;
		this.disableButtonDuringRequest = false;
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	refreshEditData() {
		const url = `Printers?$filter=id eq ${this.selectedValue?.id}`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
				const index = this.childComponent?.data.findIndex((data: any) => data.id === response?.value[0].id);
				this.childComponent!.data[index] = new Printer().deserialize(
					this.childComponent!.data[index]
				);
			}
		});
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedRowValue?.toOdata();
		const method = this.isUpdateDialog ? "put" : "post";
		const urlString = this.isUpdateDialog
			? `Printers(${this.selectedRowValue?.id})`
			: `Printers`;
		this.commonService[method](urlString, payload).subscribe({
			next: res => {
				this.selectedRowValue = new Printer().deserialize(res);
				if (!this.isUpdateDialog) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				this.disableButtonDuringRequest = false;
				(this.form as any).onReset();
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: (err: Error) => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogPrinters.elementRef.nativeElement.open = true;
			},
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Printers(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: (err: Error) => {
				this.disableButtonDuringRequest = false;
				this.errorDialogPrinters.elementRef.nativeElement.open = true;
				this.isLoading = false;
				this.closeDialogDelete();
			},
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogPrinter") as Dialog;
		dialog.open = true;
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogPrinter") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogPrinters.elementRef.nativeElement.open = false;
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeRequestTypes(event: any) {
		this.selectedRowValue.request_type = event.detail.item.text;
	}

	onChangeProtocol(event: any) {
		this.selectedRowValue.protocol = event.detail.item.text;
	}

	onChangePrinterLanguage(event: any) {
		this.selectedRowValue.language = event.detail.item.text;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}
}
