import { Component, Input, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { UserGroup } from "@app/shared/models/user-group.model";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-user-group",
	templateUrl: "./user-group.component.html",
	styleUrl: "./user-group.component.css",
})
export class UserGroupComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	dialogTitle: string = "";
	@Output() selectedUserGroup: UserGroup = new UserGroup().deserialize({});
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	userGroupConfig?: any = {};
	cachedCustomId?: string = "";
	isLoadingCustomId: boolean = false;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("errorDialogUserGroups", { static: false }) errorDialogUserGroups: any;
	disableButtonDuringRequest: boolean = false;
	isEnabledForClockinTitle: string = $localize`Is Enabled For Clock In`;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			isSelected: true,
			minWidth: 50,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			isSelected: true,
			minWidth: 50,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
		{
			Header: this.isEnabledForClockinTitle,
			accessor: "is_enabled_for_clockin",
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			isSelected: true,
			minWidth: 50,
			disableFilters: true,
			disableGroupBy: true,
			autoResizable: true,
		},
	];

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.userGroupConfig = this.configService.getConfigValue("user_groups");
		this.selectedUserGroup = new UserGroup().deserialize({});
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
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
		const url = `UserGroups?$filter=id eq ${this.selectedUserGroup?.id}&$orderby=custom_id asc`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogUserGroup") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/UserGroups(${this.deletItemId})`).subscribe({
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
				this.errorDialogUserGroups.elementRef.nativeElement.open = true;
				this.closeDialogDelete();
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogUserGroup") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		this.errorDialogUserGroups.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedUserGroup) this.selectedUserGroup.is_active = event.target.checked;
	}

	newButtonClick() {
		this.disableButtonDuringRequest = false;
		this.isUpdate = false;
		this.isLoading = false;
		this.dialogTitle = this.localization.add;
		this.selectedUserGroup = new UserGroup().deserialize({});
		this.selectedUserGroup.custom_id = this.customId;
		this.customIdState = "None";
		if (!this.customId) {
			this.selectedUserGroup.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedUserGroup?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `UserGroups(${this.selectedUserGroup?.id})`
			: `UserGroups`;
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
				this.errorDialogUserGroups.elementRef.nativeElement.open = true;
			},
		});
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedUserGroup.custom_id || ""
		);
		const urlString = `UserGroups?$filter=custom_id eq '${this.selectedUserGroup.custom_id}'&$select=custom_id`;
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

	editClick(value: object): void {
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedUserGroup?.deserialize(value);
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedUserGroup.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("UserGroup").catch(() => false);
		this.selectedUserGroup.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedUserGroup.custom_id = "";
		this.isLoadingCustomId = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onChangeName(event: any) {
		if (this.selectedUserGroup) this.selectedUserGroup.name = (event.target as any).value;
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedUserGroup.custom_id?.trim();
		this.selectedUserGroup.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.userGroupConfig && this.selectedUserGroup) {
			return (
				this.userGroupConfig[fieldName] === 0 && this.selectedUserGroup.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
}
