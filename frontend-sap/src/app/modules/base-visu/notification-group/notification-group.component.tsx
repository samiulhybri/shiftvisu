import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import { QualificationUser } from "@app/shared/models/qualification-user.model";
import { User } from "@app/shared/models/user.model";
import React, { useState } from "react";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Input as UI5Input } from "@ui5/webcomponents-react";
import NotificationGroupEmailAddress from "@app/shared/models/notification-group-email-address.model";
import NotificationGroupUser from "@app/shared/models/notification-group-user.model";
import NotificationGroup from "@app/shared/models/notification-group.model";
import { NotificationTypeClass } from "@app/shared/enums/notificationType";
import NotificationGroupNotificationType from "@app/shared/models/notification-group-notification-type.model";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";

@Component({
	selector: "app-notification-group",
	templateUrl: "./notification-group.component.html",
	styleUrl: "./notification-group.component.css",
})
export class NotificationGroupComponent {
	isDialogOpen: boolean = false;
	warningText: boolean = false;
	dialogTitle: string = "";
	deletItemId = "";
	warningForMachine: string = "";
	isUpdate?: boolean = false;
	isLoading: boolean = false;
	localization = Localization;
	selectedRowValue: NotificationGroup = new NotificationGroup().deserialize({});
	items?: Item[] = [];
	machines?: Machine[] = [];
	qualificationConfig: any = {};
	@ViewChild("create0rUpdateForm") form?: NgForm;
	@ViewChild("typeRef") typeRef: any;
	disableButtonDuringRequest: boolean = false;
	public selectedTab: string = "core_data";
	addButtonText: string = $localize`Associate`;
	isAssociateDialogOpen: boolean = false;
	notificationGroupUser: NotificationGroupUser[] = [];
	user: User[] = [];
	associateData: any = [];
	searchedValue: string = "";
	searchValueLowerCase: string = "";
	filteredUsers: User[] = [];
	associateTitle: string = $localize`Associate New Assigned Users`;
	isAssociateUpdateDialogOpen: boolean = false;
	associateUser: any = [];
	tempUsers: any[] = [];
	isPreviewDialogOpen: boolean = false;
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	associateDialogTitle: string = $localize`Assigned Users`;
	isLoadingCustomId: boolean = false;

	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	customId?: string;
	cachedCustomId?: string = "";
	public selectedTypeList: string[] = [];

	associatedEmailData: NotificationGroupEmailAddress[] = [];
	associatedEmailDataFromDB: NotificationGroupEmailAddress[] = [];
	notificationType = NotificationTypeClass.getEnumArray();

	columns: any = [
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
	];

	userColumns: any = [
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
			Header: $localize`Username`,
			accessor: "username",
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

	emailColumns: any = [
		{
			Header: $localize`Notification Group Id`,
			accessor: "notificationGroup.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Email`,
			accessor: "email_address",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const [valueState, setValueState] = useState<"None" | "Negative">(
					/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
						this.associatedEmailData?.[row.index]?.email_address
					)
						? "None"
						: "Negative"
				);

				return (
					<React.StrictMode>
						<UI5Input
							className="w-full"
							value={this.associatedEmailData?.[row.index]?.email_address}
							disabled={
								!this.authService.isPermissionValid("TIMEVISU_TIME_RECORD_EDIT")
							}
							onInput={(e: any) => {
								const newValue = e.target.value;

								if (this.associatedEmailData?.[row.index]?.email_address)
									this.associatedEmailData[row.index].email_address = newValue;

								this.onEmailInputChange(newValue, row.index);

								const isExist = this.associatedEmailData.filter(
									(obj: NotificationGroupEmailAddress) =>
										obj.email_address == newValue
								);
								const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
									this.associatedEmailData?.[row.index]?.email_address
								);

								setValueState(
									isEmail && !(isExist.length > 1)
										? ValueState.None
										: ValueState.Negative
								);
							}}
							valueState={valueState}
							placeholder={$localize`Enter Email`}
						/>
					</React.StrictMode>
				);
			},
		},
	];

	onEmailInputChange(newValue: string, index: number) {
		if (this.associatedEmailData && this.associatedEmailData[index]) {
			this.associatedEmailData[index].email_address = newValue;
		}
	}

	showPreview(data: any) {
		this.isPreviewDialogOpen = true;
		this.associateData = [...data];
	}

	closeAssociateDialog() {
		this.isPreviewDialogOpen = false;
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("emailAssociatedChildComponent", { static: false }) emailAssociatedChildComponent:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentUser", { static: false }) childComponentUser:
		| CustomReactGridTable
		| undefined;

	constructor(
		private cdr: ChangeDetectorRef,
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.qualificationConfig = this.configService.getConfigValue("notificationGroup");
		this.selectedRowValue = new NotificationGroup().deserialize({});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	refreshEditData() {
		const url = `NotificationGroups?$filter=id eq ${this.selectedRowValue?.id}&$orderby=custom_id asc&$expand=notificationGroupUsers,notificationGroupEmailAddresses($expand=notificationGroup),notificationGroupNotificationTypes`;
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

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("NotificationGroup").catch(() => false);
		this.selectedRowValue.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedRowValue.custom_id = "";
		this.isLoadingCustomId = false;
	}

	newButtonClick() {
		this.selectedTab = "core_data";
		this.selectedTypeList = [];
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.selectedRowValue = new NotificationGroup().deserialize({});

		this.customIdState = "None";
		this.selectedRowValue.custom_id = this.customId;

		if (!this.customId) {
			this.selectedRowValue.custom_id = "";
			this.getCustomId();
		}

		this.warningForMachine = "None";
		this.disableButtonDuringRequest = false;
		this.notificationGroupUser = [];
		this.user.forEach((user: User) => (user.isSelected = false));
	}

	deleteClick(value: any) {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	editClick(value: any) {
		this.selectedTab = "core_data";
		this.dialogTitle = this.localization.edit;
		this.selectedRowValue = new NotificationGroup().deserialize(value);
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.warningForMachine = "None";

		if (this.selectedRowValue.notificationGroupNotificationTypes) {
			this.selectedTypeList = this.selectedRowValue.notificationGroupNotificationTypes.map(
				el => el.notification_type || ""
			);
		}

		this.customIdState = "None";
		this.cachedCustomId = this.selectedRowValue.custom_id;

		this.disableButtonDuringRequest = false;
		this.loadAssociateData();

		this.associatedEmailData = structuredClone(value.notificationGroupEmailAddresses) || [];
		this.associatedEmailDataFromDB =
			structuredClone(value.notificationGroupEmailAddresses) || [];
		this.emailAssociatedChildComponent?.render();
	}

	onChangeCustomId() {
		this.customIdState = "None";
		this.cdr.detectChanges();
	}

	onChangeName(event: any) {
		if (this.selectedRowValue) this.selectedRowValue.name = (event.target as any).value;
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
		const urlString = `NotificationGroups?$filter=custom_id eq '${this.selectedRowValue.custom_id}'&$select=custom_id`;
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
		if (this.canBeSaved()) {
			this.isLoading = true;
			const payload = this.selectedRowValue?.toOdata();
			const method = this.isUpdate ? "put" : "post";
			const urlString = this.isUpdate
				? `NotificationGroups(${this.selectedRowValue?.id})`
				: `NotificationGroups`;
			this.commonService[method](urlString, payload).subscribe({
				next: async (res: any) => {
					this.selectedRowValue.id = res.id;

					const userIds = this.notificationGroupUser.map(obj => obj.id);

					const userPayload = {
						userIds: userIds,
						id: res.id,
					};

					await this.syncEmailAndTypes(res);

					const promiseNotificationGroupUser = this.syncAssociateData(
						"base-visu/notification-group-user",
						userPayload
					);
					Promise.all([promiseNotificationGroupUser]).then(() => {
						if (!this.isUpdate) {
							this.filterHandler();
						} else {
							this.refreshEditData();
						}
						this.isLoading = false;
						this.isDialogOpen = false;
						(this.form as any).onReset();
						this.disableButtonDuringRequest = false;
						this.cdr.detectChanges();
						const { recordSavedSuccessfully } = Localization;
						this._toasterSrv.showToast(recordSavedSuccessfully, "success");

						if (!this.isUpdate) this.getCustomId();
					});
				},
				error: () => {
					this.disableButtonDuringRequest = false;
					(document.getElementById("errorDialog") as Dialog).open = true;
					this.isLoading = false;
				},
			});
		}
	}

	canBeSaved() {
		const emailSet = new Set(this.associatedEmailData.map(obj => obj.email_address));
		return emailSet.size == this.associatedEmailData.length;
	}

	async syncEmailAndTypes(value: NotificationGroup) {
		let requests: ODataBatchCall[] = [];
		let indexCount = 0;

		if (this.isUpdate) {
			const originalNotificationGroup = this.childComponent?.data?.find(
				(data: NotificationGroup) => data.id == value.id
			) as NotificationGroup;

			const deletedEmails = originalNotificationGroup.notificationGroupEmailAddresses.filter(
				origItem => !this.associatedEmailData.some(valItem => valItem.id === origItem.id)
			);

			deletedEmails.forEach(email => {
				if (email.id) {
					const batchCall = new ODataBatchCall(
						indexCount,
						"delete",
						`\/odata\/NotificationGroupEmailAddresses(${email.id})`
					);
					indexCount++;

					requests.push(batchCall);
				}
			});

			this.associatedEmailData.forEach(email => {
				const descEmail = new NotificationGroupEmailAddress().deserialize(email);

				const batchCall = email.id
					? new ODataBatchCall(
							indexCount,
							"put",
							`\/odata\/NotificationGroupEmailAddresses(${email.id})`
						)
					: new ODataBatchCall(
							indexCount,
							"post",
							`\/odata\/NotificationGroupEmailAddresses`
						);
				const payload = descEmail.toOdata();

				batchCall.body = payload;

				requests.push(batchCall);
			});

			//Types
			const deletedTypes =
				originalNotificationGroup.notificationGroupNotificationTypes.filter(
					origItem =>
						!this.selectedTypeList.some(type => type === origItem.notification_type)
				);

			deletedTypes.forEach(email => {
				if (email.id) {
					const batchCall = new ODataBatchCall(
						indexCount,
						"delete",
						`\/odata\/NotificationGroupNotificationTypes(${email.id})`
					);
					indexCount++;

					requests.push(batchCall);
				}
			});

			this.selectedTypeList.forEach(type => {
				const isTypeExist =
					originalNotificationGroup.notificationGroupNotificationTypes.find(
						(savedTypes: NotificationGroupNotificationType) =>
							type == savedTypes.notification_type
					);

				if (!isTypeExist) {
					const batchCall = new ODataBatchCall(
						indexCount,
						"post",
						`\/odata\/NotificationGroupNotificationTypes`
					);

					const payload = {
						notification_type: type,
						notification_group_id: value.id,
					};
					batchCall.body = payload;

					requests.push(batchCall);
					indexCount++;
				}
			});
		} else {
			//Email Addresses
			this.associatedEmailData?.forEach(
				(notificationGroupEmailAddress: NotificationGroupEmailAddress) => {
					const batchCall = new ODataBatchCall(
						indexCount,
						"post",
						`\/odata\/NotificationGroupEmailAddresses`
					);

					indexCount++;

					const payload = {
						email_address: notificationGroupEmailAddress.email_address,
						notification_group_id: value.id,
					};
					batchCall.body = payload;

					requests.push(batchCall);
				}
			);

			//Type
			this.selectedTypeList?.forEach(type => {
				const batchCall = new ODataBatchCall(
					indexCount,
					"post",
					`\/odata\/NotificationGroupNotificationTypes`
				);

				indexCount++;

				const payload = {
					notification_type: type,
					notification_group_id: value.id,
				};
				batchCall.body = payload;

				requests.push(batchCall);
			});
		}

		await new Promise((resolve, reject) => {
			this.commonService.post("$batch", { requests }).subscribe({
				next: () => {
					resolve(true);
				},
				error: error => {
					reject(false);
					console.log(error);
				},
			});
		});
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/NotificationGroups(${this.deletItemId})`).subscribe({
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
				(document.getElementById("errorDialog") as Dialog).open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	closeErrorDialog() {
		(document.getElementById("errorDialog") as Dialog).open = false;
	}

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Users?$orderby=custom_id asc&$top=${this.topValue}`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((user: User) => {
					this.user.push(new User().deserialize(user));
				});
			},
			error: e => {},
		});
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	closeDialog() {
		this.selectedTypeList = [];
		this.associatedEmailData = [];
		this.typeRef.elementRef.nativeElement.selectedValues = [];
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.selectedTab = "core_data";
			this.disableButtonDuringRequest = false;
			return;
		}

		const customId = this.selectedRowValue.custom_id?.trim();
		this.selectedRowValue.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		switch (this.selectedTab) {
			case "assigned_user":
				this.associateData = [...this.notificationGroupUser];
				this.childComponentUser!.filteredDataCount = this.associateData.length ?? 0;
				break;
			case "emails":
				this.emailAssociatedChildComponent!.filteredDataCount = this.associatedEmailData.length ?? 0;
				this.emailAssociatedChildComponent!.render();
				break;
		}
	}
	associateButtonClick() {
		this.isAssociateDialogOpen = true;
		this.searchedValue = "";
		this.filteredUsers = [...this.user];
		this.tempUsers = [this.filteredUsers];
		this.preSelectUser();
		const isAllUsersSelect = this.filteredUsers.every(user => user.isSelected);
		this.isDeselectEnable = isAllUsersSelect ? true : false;
	}

	syncAssociateData(urlString: string, payload: any) {
		return new Promise((resolve, reject) => {
			try {
				this.commonService.post(urlString, payload, false).subscribe(res => {
					resolve(res);
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	preSelectUser() {
		this.user.forEach((user: User) => (user.isSelected = false));
		this.notificationGroupUser.forEach((user: any) => {
			this.user.forEach((value: any) => {
				if (value?.id == user?.id) value.isSelected = true;
			});
		});
	}

	loadAssociateData() {
		const qualificationId = this.selectedRowValue.id;
		this.notificationGroupUser = [];
		this.childComponentUser!.isBusy = true;
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/NotificationGroupUsers?$expand=user&filter=notification_group_id eq ${qualificationId}`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map(
					(notificationGroupUser: QualificationUser) => {
						this.user.forEach((value: any) => {
							if (value.id == notificationGroupUser.user?.id) {
								value.isSelected = true;
							}
						});
						this.notificationGroupUser.push(
							new NotificationGroupUser().deserialize(notificationGroupUser.user)
						);
					}
				);
				this.associateData = [...this.notificationGroupUser];
				this.childComponentUser!.isBusy = false;
				this.childComponentUser!.filteredDataCount = this.associateData.length ?? 0;
				this.emailAssociatedChildComponent!.filteredDataCount = this.associatedEmailData.length ?? 0;
			},
			error: e => {},
		});
	}

	onSearchInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue : "";
		this.searchValueLowerCase = this.searchedValue.toLowerCase();
		this.filteredUsers = this.user.filter(
			item =>
				(item.custom_id && item.custom_id.includes(this.searchedValue)) ||
				item.name?.toLowerCase().includes(this.searchValueLowerCase)
		);
	}

	cancelDialog() {
		this.isAssociateDialogOpen = false;
		this.isAssociateUpdateDialogOpen = false;
		this.user.map(user => {
			if (this.tempUsers.includes(user.id)) {
				user.isSelected = false;
			}
			return user;
		});
	}

	onSaveUser() {
		this.notificationGroupUser = this.user.filter(user => user.isSelected) as any;
		this.associateData = this.notificationGroupUser;
		this.childComponentUser!.filteredDataCount = this.associateData.length ?? 0;
		this.isAssociateDialogOpen = false;
	}

	userChange(event: any) {
		const selecteduser = event.detail.targetItem.id;
		const index = this.user.findIndex(item => item.id == selecteduser);
		this.user[index].isSelected = !this.user[index].isSelected;
		this.tempUsers.push(selecteduser);
		const selectedUser = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedUser.length > 0 ? true : false;
	}

	selectAllAssociate(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			this.filteredUsers.forEach(user => (user.isSelected = true));
		} else {
			this.isDeselectEnable = false;
			this.filteredUsers.forEach(user => (user.isSelected = false));
		}
	}

	onSaveUserSwitch() {
		this.isAssociateUpdateDialogOpen = false;
	}

	associateEmailButtonClick() {
		this.associatedEmailData.push(
			new NotificationGroupEmailAddress().deserialize({
				notificationGroup: this.selectedRowValue,
			})
		);
		this.emailAssociatedChildComponent!.filteredDataCount = this.associatedEmailData.length ?? 0;
		this.emailAssociatedChildComponent?.render();
	}

	associateEmailDeleteClick(value: any) {
		this.associatedEmailData = this.associatedEmailData.filter(
			(data: NotificationGroupEmailAddress) =>
				value.id ? data.id !== value.id : data.email_address !== value.email_address
		);

		this.emailAssociatedChildComponent!.filteredDataCount = this.associatedEmailData.length ?? 0;
		this.emailAssociatedChildComponent?.render();
	}

	onTypeChange() {
		this.selectedTypeList = this.typeRef.elementRef.nativeElement.selectedValues.map(
			(el: any) => el.id
		) as string[];
	}

	onSearchOnChangeInput(value: string, tableName: string) {
		const data = tableName === "user" ? this.associateData : this.associatedEmailData;
		const foundArray = this.deepSearch(data, value, tableName);
		const component = tableName === "user" ? this.childComponentUser : this.emailAssociatedChildComponent;
		if (component) {
			component.filteredDataCount = foundArray.length;
		}
	}

	deepSearch(arr: any[], searchString: string, tableName: string) {
		const lowerSearchString = searchString.toLowerCase();
		const fieldsToSearch = tableName === "user" ? ["custom_id", "name", "username"] : ["email_address", "notificationGroup.custom_id"];
		return arr.filter(item => fieldsToSearch.some(field => {
			const fieldValue = field.split('.').reduce((o, i) => o[i], item);
			return fieldValue?.toLowerCase().includes(lowerSearchString);
		}));
	}
}
