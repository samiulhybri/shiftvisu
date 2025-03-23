import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { NgForm, NgModel } from "@angular/forms";
import TpmSubGroup from "@app/shared/models/tpm-sub-group.model";
import { TpmGroup } from "@app/shared/models/tpm-group.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ConfigService } from "@app/shared/services/config.service";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
@Component({
	selector: "app-tpm-sub-group",
	templateUrl: "./tpm-sub-group.component.html",
	styleUrl: "./tpm-sub-group.component.css",
})
export class TpmSubGroupComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deleteItemId = "";
	dialogTitle: string = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	popOpen: boolean = false;
	isCustomIDAvailable: boolean = false;
	selectedColor = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	warningForGroup = "";
	tpmGroups: TpmGroup[] = [];
	selectedTpmSubGroup: TpmSubGroup = new TpmSubGroup().deserialize({});
	@ViewChild("createOrUpdateForm") form?: NgForm;
	tpmSubGroupConfig?: any = {};
	localization = Localization;

	@ViewChild("name") nameInput!: NgModel;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("errorDialogTPMSubGroups", { static: false }) errorDialogTPMSubGroups: any;
	@ViewChild("deleteToastTPMsubGroup", { static: false }) deleteToastTPMsubGroup: any;
	@ViewChild("deleteDialogTPMSubGroup", { static: false })
	deleteDialogTPMSubGroup: any;
	@ViewChild("deleteErrorDialogTpmSubGroup", { static: false })
	deleteErrorDialogTpmSubGroup: any;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("tpmGroupCombobox") tpmGroupCombobox!: ComboBoxComponent;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService		
	) {
		this.selectedTpmSubGroup = new TpmSubGroup().deserialize({});
		this.tpmSubGroupConfig = this.configService.getConfigValue("tpm_sub_groups");
	}

	ngOnInit(): void {
		this.getCustomId();
		this.loadData();
	}

	loadData() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/TpmGroups?$expand=topTpmSubGroup($select=custom_id)`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.tpmGroups = response.responses[0]?.body?.value?.map((tpmGroup: TpmGroup) =>
					new TpmGroup().deserialize(tpmGroup)
				);

				this.columns[3].comboBoxValues = this.tpmGroups;
			},
			error: e => {},
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
		const url = `TpmSubGroups?$filter=is_active%20eq%20true and id eq ${this.selectedTpmSubGroup?.id}&$orderby=custom_id%20asc&$expand=tpmGroup`;
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
		this.dialogTitle = this.localization.add;
		this.isUpdate = false;
		this.isDialogOpen = true;
		this.selectedTpmSubGroup = new TpmSubGroup().deserialize({});
		this.selectedTpmSubGroup.custom_id = this.customId;
		this.customIdState = "None";
		this.warningForGroup = "None";
		this.nameInput?.control?.markAsUntouched();
		this.disableButtonDuringRequest = false;

		if (!this.customId) {
			this.selectedTpmSubGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.selectedColor = "";
		this.isCustomIDAvailable = false;
		this.tpmGroupCombobox.element.valueState = "None";
		(this.form as any).onReset();
	}

	closeErrorDialog() {
		this.errorDialogTPMSubGroups.elementRef.nativeElement.open = false;
	}

	checkAllRequiredComboboxes(): boolean {
		if (!this.tpmGroupCombobox.element.value) {
			this.tpmGroupCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.tpmGroupCombobox.element.valueState = "None";
		}
		return true;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	onSubmit(form: NgForm) {
		this.checkAllRequiredComboboxes();
		if (!form.valid || !this.checkAllRequiredComboboxes()) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedTpmSubGroup.custom_id?.trim();
		this.selectedTpmSubGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedTpmSubGroup.custom_id || ""
		);
		const urlString = `TpmSubGroups?$filter=custom_id eq '${this.selectedTpmSubGroup.custom_id}'&$select=custom_id`;
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
		const payload = this.selectedTpmSubGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `TpmSubGroups(${this.selectedTpmSubGroup?.id})`
			: `TpmSubGroups`;
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
				this.errorDialogTPMSubGroups.elementRef.nativeElement.open = true;
			},
		});
		this.isLoading = true;
	}

	deleteClick(value: any): void {
		this.deleteItemId = value.id;
		this.deleteDialogTPMSubGroup.elementRef.nativeElement.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/TpmSubGroups(${this.deleteItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.childComponent?.onFilterAndSortingForEdit(this.selectedTpmSubGroup, null);
				this.isLoading = false;
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: error => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogTpmSubGroup.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		this.deleteDialogTPMSubGroup.elementRef.nativeElement.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogTpmSubGroup.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	onChangeIsActive(event: any) {
		if (this.selectedTpmSubGroup) this.selectedTpmSubGroup.is_active = event.target.checked;
	}
	onChangeName(event: any) {
		if (this.selectedTpmSubGroup) this.selectedTpmSubGroup.name = (event.target as any).value;
	}
	onChangeTPMGroup(event: any) {
		if (this.selectedTpmSubGroup?.tpmGroup) {
			this.selectedTpmSubGroup.tpmGroup = new TpmGroup().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
		}
	}
	onInput(event: any) {
		const inputValue = event.target.value;
		if (!inputValue) {
			this.selectedTpmSubGroup.tpmGroup.id = undefined;
			this.selectedTpmSubGroup.tpmGroup.name = "";
		}
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
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
		{
			Header: $localize`TPM Group`,
			accessor: "tpmGroup.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			comboBoxValues: this.tpmGroups,
			accessorArray: ["tpmGroup.name", "tpmGroup.custom_id"],
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
	];

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("TPMSubGroup").catch(() => false);
		this.selectedTpmSubGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedTpmSubGroup.custom_id = "";
		this.isLoadingCustomId = false;
	}

	editClick(value: any): void {
		this.dialogTitle = this.localization.edit;
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedTpmSubGroup = this.selectedTpmSubGroup?.deserialize(value);
		this.cachedCustomId = this.selectedTpmSubGroup.custom_id;
		this.customIdState = "None";
		this.warningForGroup = "None";
		this.disableButtonDuringRequest = false;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	shouldBeDisabled(fieldName: string) {
		if (this.tpmSubGroupConfig && this.selectedTpmSubGroup) {
			return (
				this.tpmSubGroupConfig[fieldName] === 0 &&
				this.selectedTpmSubGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
