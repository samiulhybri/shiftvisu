import { Component, Input, ViewChild } from "@angular/core";
import { Setting } from "@app/shared/models/setting.model";
import { CommonService } from "@app/shared/services/common.service";
import { NgForm } from "@angular/forms";
import { StatusBoardSidebarTypeClass } from "@app/shared/enums/StatusBoardSidebarType";
import { AuthService } from "@app/shared/services/auth.service";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import Toast from "@ui5/webcomponents/dist/Toast";
import { DateToConsiderClass } from "@app/shared/enums/DateToConsider";
import { EmailEncryptionClass } from "@app/shared/enums/EmailEncryption";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import ItemState from "@app/shared/models/item-state.model";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-settings",
	templateUrl: "./settings.component.html",
	styleUrl: "./settings.component.css",
})
export class SettingsComponent {
	dialogTitle: string = $localize`Warning`;
	settingPage: string = $localize`Settings`;
	isEditMode: boolean = false;
	isDialogOpen: boolean = false;
	isLoading: boolean = false;
	isUpdateDialog = false;
	selectedRowValue: Setting = new Setting().deserialize({});
	cacheSelectedRowValue: Setting = new Setting().deserialize({});
	disableButtonDuringRequest: boolean = false;
	statusBoardTypeItems = StatusBoardSidebarTypeClass.getEnumArray();
	emailEncryptionItems = EmailEncryptionClass.getEnumArray();
	dateToConsiderItems = DateToConsiderClass.getEnumArray();
	allData: Setting[] = [];
	@Input() isUpdate?: boolean;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("emailEncryptionCombobox") emailEncryptionCombobox!: ComboBoxComponent;
	@ViewChild("status_board_type") status_board_type!: ComboBoxComponent;
	@ViewChild("dateToConsiderCombobox") dateToConsiderCombobox!: ComboBoxComponent;
	@ViewChild("resetDialog", { static: false }) resetDialog: any;
	isResetDialogOpen: boolean = false;
	localization = Localization;

	constructor(
		public authService: AuthService,
		public commonService: CommonService,
		public _toasterSrv: ToastService
	) {
		this.selectedRowValue = new Setting().deserialize({});
	}

	ngOnInit() {
		this.loadData();
	}

	onEditClick(): void {
		this.isEditMode = true;
		this.disableButtonDuringRequest = false;
	}

	async onUpdate() {
		this.isLoading = true;
		const payload = this.selectedRowValue?.toOdata();
		const urlString = `Settings(${this.selectedRowValue?.id})`;
		this.commonService.put(urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully }= Localization;
				this.loadData();
				this.isEditMode = false;
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(
					recordSavedSuccessfully,
					"success"
				);
			},
			error: (err: Error) => {
				alert(err.message);
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
		});
	}

	onSubmit(form: NgForm) {
		this.checkAllRequiredComboboxes();
		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			return;
		}
		this.onUpdate();
	}

	onSave() {
		(this.form as any).onSubmit(undefined);
	}

	onResetPopUp(){
		this.isResetDialogOpen = true;
	}

	onReset(){
		this.selectedRowValue = new Setting().deserialize(this.cacheSelectedRowValue);
		this.closeDialogReset();
	}

	closeDialogReset(){
		this.isResetDialogOpen = false;
	}

	checkAllRequiredComboboxes(): boolean {
		let numOfRequiredFieldEmpty = 0;

		if (!this.emailEncryptionCombobox.element.value) {
			this.emailEncryptionCombobox.element.valueState = "Negative";
			numOfRequiredFieldEmpty++;
		} else {
			this.emailEncryptionCombobox.element.valueState = "None";
		}
		if (!this.status_board_type.element.value) {
			this.status_board_type.element.valueState = "Negative";
			numOfRequiredFieldEmpty++;
		} else {
			this.status_board_type.element.valueState = "None";
		}
		if (!this.dateToConsiderCombobox.element.value) {
			this.dateToConsiderCombobox.element.valueState = "Negative";
			numOfRequiredFieldEmpty++;
		} else {
			this.dateToConsiderCombobox.element.valueState = "None";
		}
		return numOfRequiredFieldEmpty ? false : true;
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeStatusBoardSidebarType(event: any) {
		this.selectedRowValue.status_board_sidebar_type = event.detail.item.text;
		this.status_board_type.element.valueState = "None";
	}

	onChangeEmailEncryption(event: any) {
		this.selectedRowValue.email_encryption = event.detail.item.text;
		this.emailEncryptionCombobox.element.valueState = "None";
	}

	onChangeDataToConsider(event: any) {
		this.selectedRowValue.date_to_consider = event.detail.item.text;
		this.dateToConsiderCombobox.element.valueState = "None";
	}

	loadData() {
		let requests: ODataBatchCall[] = [];

		requests.push(new ODataBatchCall(0, "get", `/odata/Settings`));
		this.isLoading = true;

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.selectedRowValue = new Setting().deserialize(
					response.responses[0]?.body?.value?.[0] || {}
				);

				this.cacheSelectedRowValue = new Setting().deserialize(
					response.responses[0]?.body?.value?.[0] || {}
				);

				this.isLoading = false;
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}
}
