import { ChangeDetectorRef, Component, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Hall } from "@app/shared/models/hall.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Printer } from "@app/shared/models/printer.model";
import { Terminal } from "@app/shared/models/terminal.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { ipv4Validator } from "@app/shared/validators/ipaddress.validator";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import Toast from "@ui5/webcomponents/dist/Toast";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-terminals",
	templateUrl: "./terminals.component.html",
	styleUrl: "./terminals.component.css",
})
export class TerminalsComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog = false;
	isUpdate?: boolean;
	halls: Hall[] = [];
	printers: Printer[] = [];
	value!: string;
	topValue: number = 1000;
	isLoading: boolean = false;
	warningForHall = "";
	warningForPrinter = "";
	isLoadingBatchCall: boolean = false;
	dialogTitle: string = "";
	isLoadingCustomId: boolean = false;
	disableButtonDuringRequest: boolean = false;
	localization = Localization;
	public isHallValid = true;
	@Output() selectedRowValue: Terminal = new Terminal().deserialize({});
	@ViewChild("printerCombobox") printerCombobox!: ComboBoxComponent;
	@ViewChild("hallCombobox") hallCombobox!: ComboBoxComponent;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("deleteDialogTerminals", { static: false }) deleteDialogTerminal: any;
	@ViewChild("errorDialogTerminals", { static: false }) errorDialogTerminals: any;
	constructor(
		public authService: AuthService,
		public commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.selectedRowValue = new Terminal().deserialize({});
	}

	ngOnInit(): void {
		this.loadData();
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Halls?$expand=hall($select=custom_id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/Printers?$expand=printer($select=id)&$top=${this.topValue}`
			)
		);

		this.isLoadingBatchCall = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((hall: Hall) => {
					const deserializedHall = new Hall().deserialize(hall);
					this.halls.push(deserializedHall);
				});
				response.responses[1]?.body?.value?.map((printer: Printer) => {
					const deserializedPrinter = new Printer().deserialize(printer);
					this.printers.push(deserializedPrinter);
				});
				this.isLoadingBatchCall = false;
			},
			error: e => {},
		});
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
			Header: $localize`Hall`,
			accessor: "hall.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			isSelected: true,
			comboBoxValues: this.halls,
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
			Header: $localize`Printer`,
			accessor: "printer.name",
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			comboBoxValues: this.printers,
			autoResizable: true,
		},
	];

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isUpdateDialog = false;
		this.selectedRowValue = new Terminal().deserialize({});
		this.disableButtonDuringRequest = false;
		this.isDialogOpen = true;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		this.checkCombobox();
		if (!form.valid || !this.checkCombobox()) {
			this.disableButtonDuringRequest = false;
			return;
		}
		this.onCreateOrUpdate();
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	refreshEditData() {
		const url = `Terminals?$filter=id eq ${this.selectedRowValue?.id}&$expand=hall,printer`;
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

		this.commonService.delete(`/Terminals(${this.selectedRowValue.id})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.selectedRowValue, null);
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: (err: Error) => {
				this.disableButtonDuringRequest = false;
				this.errorDialogTerminals.elementRef.nativeElement.open = true;
				this.isLoading = false;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		this.deleteDialogTerminal.elementRef.nativeElement.open = false;
	}

	closeErrorDialog() {
		this.errorDialogTerminals.elementRef.nativeElement.open = false;
	}

	onChangeHall(event: any) {
		this.hallCombobox.element.valueState = "None";
		if (this.selectedRowValue?.hall)
			this.selectedRowValue.hall = new Hall().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});

		this.checkProparData();
	}

	onChangePrinter(event: any) {
		this.printerCombobox.element.valueState = "None";
		if (this.selectedRowValue?.printer)
			this.selectedRowValue.printer = new Printer().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
		this.checkProparData();
	}

	checkProparData() {
		this.warningForHall = this.selectedRowValue.hall?.id ? "None" : "Error";
		this.warningForPrinter = this.selectedRowValue.printer?.id ? "None" : "Error";
		return true;
	}

	onHallInputChange(event: any) {
		const inputValue = event.target.value;
		if (!inputValue) {
			this.isHallValid = false;
			this.selectedRowValue.hall = new Hall().deserialize({
				id: null,
				name: "",
			});
			return;
		}
		const matchHallData = this.halls.find(hall => hall.name === inputValue);
		if (!matchHallData) {
			this.isHallValid = false;
		} else {
			this.isHallValid = true;
			this.selectedRowValue.hall = matchHallData;
		}
	}

	onPrinterInputChange(event: any) {
		const inputValue = event.target.value;
		const matchPrinterData = this.printers.find(printer => printer.name === inputValue);
		if (!matchPrinterData && this.selectedRowValue?.printer) {
			this.selectedRowValue.printer = new Printer().deserialize({
				id: null,
				name: "",
			});
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	async onCreateOrUpdate() {
		if (this.checkProparData()) {
			this.isLoading = true;
			const payload = this.selectedRowValue?.toOdata();
			const method = this.isUpdateDialog ? "put" : "post";
			const urlString = this.isUpdateDialog
				? `Terminals(${this.selectedRowValue?.id})`
				: `Terminals`;
			this.commonService[method](urlString, payload).subscribe({
				next: res => {
					this.selectedRowValue = new Terminal().deserialize(res);
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
					this.errorDialogTerminals.elementRef.nativeElement.open = true;
				},
			});
		}
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.printerCombobox.element.valueState = "None";
		this.hallCombobox.element.valueState = "None";
	}

	deleteClick(value: any): void {
		this.selectedRowValue = new Terminal().deserialize(value);
		this.deleteDialogTerminal.elementRef.nativeElement.open = true;
	}

	editClick(value: any): void {
		this.dialogTitle = this.localization.edit;
		this.selectedRowValue = this.selectedRowValue?.deserialize(value);
		this.isDialogOpen = true;
		this.isUpdateDialog = true;
		this.disableButtonDuringRequest = false;
	}

	public onIpInputChange(event: Event): void {
		const inputControl = this.form?.controls["ip_address"];
		inputControl?.setValidators([ipv4Validator()]);
		inputControl?.updateValueAndValidity();
	}

	checkCombobox(): boolean {
		let isValid = true;

		if (!this.printerCombobox.element.value) {
			this.printerCombobox.element.valueState = "Negative";
			isValid = false;
		} else {
			this.printerCombobox.element.valueState = "None";
		}
		if (!this.hallCombobox.element.value) {
			this.hallCombobox.element.valueState = "Negative";
			isValid = false;
		} else {
			this.hallCombobox.element.valueState = "None";
		}
		return isValid;
	}
}
