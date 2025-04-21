import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { TpmGroup } from "@app/shared/models/tpm-group.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { NgForm, NgModel } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-tpm-group",
	templateUrl: "./tpm-group.component.html",
	styleUrl: "./tpm-group.component.css",
})
export class TpmGroupComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deleteItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	popOpen: boolean = false;
	isCustomIDAvailable: boolean = false;
	selectedColor = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	selectedTPMGroup: TpmGroup = new TpmGroup().deserialize({});
	tpmGroupConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	localization = Localization;

	@ViewChild("name") nameInput!: NgModel;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("errorDialogTPMGroups", { static: false }) errorDialogTPMGroups: any;
	@ViewChild("deleteToastTPMGroup", { static: false }) deleteToastTPMGroup: any;
	@ViewChild("deleteDialogTPMGroup", { static: false })
	deleteDialogTPMGroup: any;
	@ViewChild("createOrUpdateForm") form?: NgForm;
	@ViewChild("deleteErrorDialogTpmGroup", { static: false })
	deleteErrorDialogTpmGroup: any;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
	) {
		this.selectedTPMGroup = new TpmGroup().deserialize({});
		this.tpmGroupConfig = this.configService.getConfigValue("tpm_groups");
	}

	ngOnInit(): void {
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
		const url = `TpmGroups?$filter=id eq ${this.selectedTPMGroup?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	openColorPicker() {
		this.popOpen = true;
	}
	closeResponsiveDialog() {
		this.popOpen = false;
	}

	newButtonClick() {
		this.isUpdate = false;
		this.isDialogOpen = true;
		this.dialogTitle = this.localization.add;
		this.selectedTPMGroup = new TpmGroup().deserialize({});
		this.selectedTPMGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		this.nameInput?.control.markAsUntouched();

		if (!this.customId) {
			this.selectedTPMGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.selectedColor = "";
		this.isCustomIDAvailable = false;
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogTPMGroups.elementRef.nativeElement.open = false;
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
		const customId = this.selectedTPMGroup.custom_id?.trim();
		this.selectedTPMGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const urlString = `TpmGroups?$filter=custom_id eq '${this.selectedTPMGroup.custom_id}'&$select=custom_id`;
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedTPMGroup.custom_id || ""
		);
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
		const payload = this.selectedTPMGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `TpmGroups(${this.selectedTPMGroup?.id})` : `TpmGroups`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogTPMGroups.elementRef.nativeElement.open = true;
			},
		});
	}

	deleteClick(value: any): void {
		this.deleteItemId = value.id;
		this.deleteDialogTPMGroup.elementRef.nativeElement.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.isLoading = true;
		this.disableButtonDuringRequest = true;
		this.commonService.delete(`/TpmGroups(${this.deleteItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.childComponent?.onFilterAndSortingForEdit(this.deleteItemId, null);
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogTpmGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		this.deleteDialogTPMGroup.elementRef.nativeElement.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogTpmGroup.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onChangeIsActive(event: any) {
		if (this.selectedTPMGroup) this.selectedTPMGroup.is_active = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedTPMGroup) this.selectedTPMGroup.name = (event.target as any).value;
	}

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
			maxWidth: 72,
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

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("TPMGroup").catch(() => false);
		this.selectedTPMGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedTPMGroup.custom_id = "";
		this.isLoadingCustomId = false;
	}

	editClick(value: any): void {
		this.isDialogOpen = true;
		this.dialogTitle = this.localization.edit;
		this.isUpdate = true;
		this.selectedTPMGroup = this.selectedTPMGroup?.deserialize(value);
		this.cachedCustomId = this.selectedTPMGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.tpmGroupConfig && this.selectedTPMGroup) {
			return (
				this.tpmGroupConfig[fieldName] === 0 && this.selectedTPMGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
