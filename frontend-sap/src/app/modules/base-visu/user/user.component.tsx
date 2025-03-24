import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Component, ViewChild, Output } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Toast.js";
import { User } from "@app/shared/models/user.model";
import { UserGroup } from "@app/shared/models/user-group.model";
import { Role } from "@app/shared/models/role.model";
import { NgForm } from "@angular/forms";
import { AuthService } from "@app/shared/services/auth.service";
import { ConfigService } from "@app/shared/services/config.service";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Qualification } from "@app/shared/models/qualification.model";
import { QualificationUser } from "@app/shared/models/qualification-user.model";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import React from "react";
import { Button } from "@ui5/webcomponents-react";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import { ToastService } from "@app/shared/services/toaster.service";
import { ShiftModel } from "@app/shared/models/shift-model.model";
import { Localization } from "@app/shared/utils/common-localize";
import { PlantsService } from "@app/shared/services/plants.service";
import { Hall } from "@app/shared/models/hall.model";

@Component({
	selector: "app-user",
	templateUrl: "./user.component.html",
	styleUrl: "./user.component.css",
})
export class UserComponent {
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	selectedRowValue: any;
	isLoading: boolean = false;
	dialogTitle: string = "";
	selectedTab: string = "core_data";
	addButtonText: string = $localize`Associate`;
	associateDialogTitle: string = "";
	isAssociateDialogOpen: boolean = false;
	user = User;
	customId: string = "";
	userGroups: UserGroup[] = [];
	superVisors: User[] = [];
	machines: Machine[] = [];
	qualification: Qualification[] = [];
	selectedMachines: (number | undefined)[] = [];
	filteredMachines: Machine[] = [];
	filteredQualification: Qualification[] = [];
	qualificationUser: QualificationUser[] = [];
	filteredRoles: Role[] = [];
	filteredUserGroups: UserGroup[] = [];
	shiftModels: ShiftModel[] = [];
	selectedSuperVisor1: User = new User().deserialize({});
	selectedSuperVisor2: User = new User().deserialize({});
	@Output() selectedUser: User = new User().deserialize({});
	@ViewChild("create0rUpdateForm") form = NgForm;
	@ViewChild("supervisor1ComboBox") supervisor1ComboBox!: ComboBoxComponent;
	@ViewChild("supervisor2ComboBox") supervisor2ComboBox!: ComboBoxComponent;
	@ViewChild("errorDialogUsers", { static: false }) errorDialogUsers: any;
	@ViewChild("deleteErrorDialogUsers", { static: false })
	deleteErrorDialogUsers: any;
	isUpdate?: boolean;
	customIdState: keyof typeof ValueState = "None";
	emailState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.invalidEntry;
	emailValueStateText: string = Localization.invalidEntry;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	userConfig?: any = {};
	disableButtonDuringRequest: boolean = false;
	isAssociateUpdateDialogOpen: boolean = false;
	associateData: any = [];
	searchedValue: string = "";
	searchValueLowerCase: string = "";
	tempMachines: any[] = [];
	tempRoles: any[] = [];
	tempUserGroups: any[] = [];
	associateUser: any = [];
	isPreviewDialogOpen: boolean = false;
	associateColumns: any = [];
	associateUserGroupTitle: string = $localize`User Groups`;
	associateMachineTitle: string = $localize`Associated Machines`;
	associateRoleTitle: string = $localize`Associated Roles`;
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	isPasswordNotMatched: boolean = true;
	currentPasswordValueState = ValueState.None;
	newPasswordValueState = ValueState.None;
	confirmPasswordValueState = ValueState.None;
	plantId?: number;
	copyMachinesData: Machine[] = [];
	data: Machine[] = [];
	originalFilteredMachines: Machine[] = [];
	halls: Hall[] = [];

	passwords = {
		newPassword: "",
		confirmPassword: "",
	};

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Boolean,
			isSelected: true,
			hAlign: "Center",
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
			hAlign: "Center",
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
			Header: $localize`Username`,
			accessor: "username",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Email`,
			accessor: "email",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Supervisor 1`,
			accessor: "supervisorOne.username",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Supervisor 2`,
			accessor: "supervisorTwo.username",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Chip Number`,
			accessor: "chip_number",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			autoResizable: true,
		},

		{
			Header: $localize`Melter`,
			accessor: "is_melter",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`MP Offer User`,
			accessor: "is_mp_offer_user",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`MP Offer Admin`,
			accessor: "is_mp_offer_admin",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`MP Reoffer Allowed`,
			accessor: "mp_is_allowed_reoffer",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`Supervisor`,
			accessor: "is_supervisor",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			dataType: GridTableColumnDataType.Boolean,
			hAlign: "Center",
			autoResizable: true,
		},
		{
			Header: $localize`User Type`,
			accessor: "user_type",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			autoResizable: true,
		},
		{
			Header: $localize`Absence Manager Admin`,
			accessor: "is_absence_manager_admin",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			autoResizable: true,
		},
		{
			Header: $localize`IP Address`,
			accessor: "ip_address",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			autoResizable: true,
		},
		{
			Header: $localize`Hall`,
			accessor: "hall.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["hall.name", "hall.custom_id"],
			isSelected: true,
			comboBoxValues: this.halls,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Roles`,
			accessor: "userRoles.id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalRoles: any[] = [];
				rowData.userRoles.map((role: any) => {
					totalRoles.push(role.id);
				});
				if (totalRoles.length > 0) {
					return (
						<React.StrictMode>
							<Button
								onClick={() =>
									this.showPreview(
										rowData.userRoles,
										this.associateRoleTitle,
										this.roleColumns
									)
								}>
								{totalRoles.length +
									(totalRoles.length > 1 ? $localize` Roles` : $localize` Role`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
			Header: $localize`Machines`,
			accessor: "machines.id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				let machines = this.getMachinesByPlantId([...rowData.machines], this.plantId);

				if (machines.length > 0) {
					return (
						<React.StrictMode>
							<Button
								onClick={() =>
									this.showPreview(
										machines,
										this.associateMachineTitle,
										this.machineColumns
									)
								}>
								{machines.length +
									(machines.length > 1
										? $localize` Machines`
										: $localize` Machine`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
		{
			Header: $localize`User Groups`,
			accessor: "userGroup.id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalUserGroups: any[] = [];

				rowData.userGroup.map((item: any) => {
					totalUserGroups.push(item.id);
				});
				if (totalUserGroups.length > 0) {
					return (
						<React.StrictMode>
							<Button
								onClick={() =>
									this.showPreview(
										rowData.userGroup,
										this.associateUserGroupTitle,
										this.userGroupColumns
									)
								}>
								{totalUserGroups.length +
									(totalUserGroups.length > 1
										? $localize` Groups`
										: $localize` Group`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
		},
	];

	machineColumns: any = [
		{
			Header: $localize`Machine Id`,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			width: 200,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Name`,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];
	roleColumns: any = [
		{
			Header: $localize`Role Name`,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];
	userGroupColumns: any = [
		{
			Header: $localize`User Id`,
			accessor: "custom_id",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			hAlign: "Left",
			width: 200,
			autoResizable: true,
		},
		{
			Header: $localize`User Group Name`,
			accessor: "name",
			isSelected: true,
			disableFilters: false,
			disableGroupBy: true,
			autoResizable: true,
		},
	];
	qualificationColumns: any = [
		{
			Header: $localize`Item Id`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Id`,
			accessor: "machine.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			accessorArray: ["machine.name", "machine.custom_id"],
			dataType: GridTableColumnDataType.NestedString,
			comboBoxValues: this.machines,
			autoResizable: true,
		},
		{
			Header: $localize`Operation Code`,
			accessor: "operation_code",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Qualification Hours`,
			accessor: "min_qualification_hours",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
		{
			Header: $localize`Qualification Operations`,
			accessor: "min_qualification_operations",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.Number,
			autoResizable: true,
		},
	];
	roles: Role[] = [];

	@ViewChild("childComponentRoles", { static: false }) childComponentRoles:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentMachines", { static: false }) childComponentMachines:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentUserGroup", { static: false }) childComponentUserGroup:
		| CustomReactGridTable
		| undefined;

	@ViewChild("childComponentQualification", { static: false }) childComponentQualification:
		| CustomReactGridTable
		| undefined;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		plantService: PlantsService,
	) {
		this.selectedUser = new User().deserialize({});
		this.userConfig = this.configService.getConfigValue("user");
		plantService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}

	ngOnInit(): void {
		this.loadData();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.userConfig && this.selectedUser) {
			return this.userConfig[fieldName] === 0 && this.selectedUser.is_imported_from_erp;
		} else {
			return false;
		}
	}

	showPreview(data: any, title: string, column: any) {
		this.isPreviewDialogOpen = true;
		this.associateDialogTitle = title;
		this.associateColumns = column;
		this.associateData = [...data];
	}

	closeAssociateDialog() {
		this.isPreviewDialogOpen = false;
	}

	closeErrorDialog() {
		this.errorDialogUsers.elementRef.nativeElement.open = false;
	}

	setUserGroupsAndMachines() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(0, "get", `UserGroups?$orderby=custom_id asc&$top=${this.topValue}`)
		);
		requests.push(
			new ODataBatchCall(1, "get", `Machines?$orderby=custom_id asc&$top=${this.topValue}`)
		);
		requests.push(new ODataBatchCall(2, "get", `ShiftModels?$orderby=custom_id asc`));
		requests.push(
			new ODataBatchCall(3, "get", `Halls?$filter=is_active eq true&$orderby=custom_id asc`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.userGroups = response.responses[0]?.body?.value.map((userGroup: any) =>
					new UserGroup().deserialize(userGroup)
				);

				this.machines = response.responses[1]?.body?.value?.map((machine: Machine) =>
					new Machine().deserialize({ ...machine, isSelected: false })
				);
				this.shiftModels = response.responses[2]?.body?.value?.map(
					(shiftModel: ShiftModel) => new ShiftModel().deserialize(shiftModel)
				);

				this.halls = response.responses[3]?.body?.value?.map((hall: Hall) =>
					new ShiftModel().deserialize(hall)
				);

				this.data = [...this.machines];
				this.filteredMachines = this.data;
				this.filteredUserGroups = this.userGroups;
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

	onChangeHall(event: any) {
		if (this.selectedUser)
			this.selectedUser.hall = new Hall().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onHallInputChange(event: any) {
		const inputValue = event.target.value;
		const matchHallData = this.halls.find(hall => hall.name === inputValue);
		if (!matchHallData && this.selectedUser?.hall) {
			this.selectedUser.hall = new Hall().deserialize({
				id: null,
				name: "",
			});
		}
	}

	getMachinesByPlantId(machines: any[], plantId: number | undefined): any[] {
		return machines.filter((machine: any) => machine.plant_id === plantId);
	}

	machineChange(event: any) {
		const selectedMachine = event.detail.targetItem.id;
		const index = this.machines.findIndex(item => item.id == selectedMachine);
		this.machines[index].isSelected = !this.machines[index].isSelected;
		this.tempMachines.push(parseInt(selectedMachine));
		this.updateSelectionText(event);
	}

	changeUserGroups(event: any) {
		const selectedRole = event.detail.targetItem.id;
		const index = this.userGroups.findIndex(item => item.id == selectedRole);
		this.userGroups[index].isSelected = !this.userGroups[index].isSelected;
		this.tempUserGroups.push(parseInt(selectedRole));
		this.updateSelectionText(event);
	}

	changeRoles(event: any) {
		const selectedRole = event.detail.targetItem.id;
		const index = this.roles.findIndex(item => item.id == selectedRole);
		this.roles[index].isSelected = !this.roles[index].isSelected;
		this.tempRoles.push(parseInt(selectedRole));
		this.updateSelectionText(event);
	}

	updateSelectionText(event: any) {
		const selectedItems = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedItems.length > 0 ? true : false;
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	newButtonClick() {
		this.selectedTab = "core_data";
		this.emailState = ValueState.None;
		this.dialogTitle = this.localization.add;
		this.isUpdate = false;
		this.selectedUser = new User().deserialize({});
		this.qualificationUser = [];
		this.qualification.forEach((quali: Qualification) => (quali.isSelected = false));
		this.selectedUser.custom_id = this.customId;
		this.selectedUser.is_active = true;
		this.copyMachinesData = [];

		this.passwords = {
			newPassword: "",
			confirmPassword: "",
		};

		this.selectedMachines = [];
		this.preselectedMachines();

		this.setSuperVisors();
		this.resetGroupSelection();
		this.resetRoleSelection();
		this.clearSupervisors();
		this.customIdState = "None";
		if (!this.customId) {
			this.selectedUser.custom_id = "";
			this.setUserCustomId();
		}
		this.isDialogOpen = true;
	}

	preselectedMachines() {
		this.machines.forEach((machine: Machine) => (machine.isSelected = false));
		this.selectedUser.machines.forEach((machine: any) => {
			this.machines.forEach((value: any) => {
				if (value?.id == machine?.id) value.isSelected = true;
			});
		});
		this.filteredMachines = this.machines;
		this.isDialogOpen = true;
	}

	syncMachineUserRestriction() {
		const selectedMachine = this.machines.filter(machine => machine.isSelected);
		const machineIds = selectedMachine.map((machine: any) => machine.id);
		const payload = this.selectedUser.userMachineRestrictionPayload(machineIds);

		return new Promise((resolve, reject) => {
			try {
				this.commonService
					.post("base-visu/machine-user-restriction", payload, false)
					.subscribe(res => {
						resolve(res);
					});
			} catch (error) {
				reject(error);
			}
		});
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

	async onSubmit(form: NgForm) {
		if (!form.valid) {
			this.selectedTab = "core_data";
			return;
		}
		this.isLoading = true;
		const roles = this.roles.filter(role => role.isSelected);
		const userGroups = this.userGroups.filter(userGroup => userGroup.isSelected);

		this.selectedUser.roles = roles;
		this.selectedUser.user_group = userGroups;

		if (!this.isUpdate) {
			if (
				!this.passwords.newPassword ||
				(this.passwords.newPassword &&
					this.passwords.newPassword === this.passwords.confirmPassword)
			) {
				this.selectedUser.password = this.passwords.newPassword;
			} else {
				this.newPasswordValueState = ValueState.Negative;
				this.confirmPasswordValueState = ValueState.Negative;

				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				return;
			}

			this.commonService.post("create-user", this.selectedUser.toJson(), false).subscribe({
				next: (res: any) => {
					const { recordSavedSuccessfully } = Localization;
					this.selectedUser.id = res.id;

					const qualificationIds = this.qualificationUser.map(obj => obj.id);

					const qualiPayload = {
						qualificationIds: qualificationIds,
						id: res.id,
					};
					const promiseQualification = this.syncAssociateData(
						"base-visu/qualification-user",
						qualiPayload
					);

					const promiseMachineUser = this.syncMachineUserRestriction();
					Promise.all([promiseQualification, promiseMachineUser]).then(() => {
						this.filterHandler();
						this.isLoading = false;
						this.isDialogOpen = false;
						this.loadData();
						this.childComponent?.onFilterAndSorting();
						form.onReset();
					});
					this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				},
				error: (err: Error) => {
					this.disableButtonDuringRequest = false;
					this.isLoading = false;
					this.errorDialogUsers.elementRef.nativeElement.open = true;
				},
			});
		} else {
			let updateUserPayload = this.selectedUser.toJson() as User;

			if (
				this.passwords.newPassword &&
				this.passwords.newPassword === this.passwords.confirmPassword
			) {
				updateUserPayload.password = this.passwords.newPassword;
			}

			this.commonService
				.put(`user/${this.selectedUser.id}`, updateUserPayload, false)
				.subscribe({
					next: (res: any) => {
						const qualificationIds = this.qualificationUser.map(obj => obj.id);

						const qualiPayload = {
							qualificationIds: qualificationIds,
							id: res.id,
						};
						const promiseQualification = this.syncAssociateData(
							"base-visu/qualification-user",
							qualiPayload
						);

						const promiseMachineUser = this.syncMachineUserRestriction();

						try {
							this.commonService
								.post(`user/manage-superVisor/${this.selectedUser.id}`, {}, false)
								.subscribe(res => {});
						} catch (error) {}

						Promise.all([promiseQualification, promiseMachineUser])
							.then(() => {
								this.filterHandler();
								this.isLoading = false;
								this.isDialogOpen = false;
								this.loadData();
								this.childComponent?.onFilterAndSorting();
								const { recordSavedSuccessfully } = Localization;
								this._toasterSrv.showToast(recordSavedSuccessfully, "success");

								form.onReset();
							})
							.catch(error => {
								this.disableButtonDuringRequest = false;
								this.isLoading = false;
								this.errorDialogUsers.elementRef.nativeElement.open = true;
							});
					},
					error: (err: Error) => {
						this.disableButtonDuringRequest = false;
						this.isLoading = false;
						this.errorDialogUsers.elementRef.nativeElement.open = true;
					},
				});
		}
	}

	onSave() {
		const customId = this.selectedUser.custom_id?.trim();
		this.selectedUser.custom_id = customId;

		if (this.passwords.newPassword && !this.isPasswordNotMatched) return;

		if (this.isUpdate) {
			this.cachedCustomId === customId
				? (this.form as any).onSubmit(undefined)
				: this.checkCustomId();
		} else this.checkCustomId();
	}

	checkCustomId() {
		const urlString = `Users?$filter=custom_id eq '${this.selectedUser.custom_id}' or email eq '${this.selectedUser.email}'`;
		if (this.selectedUser.custom_id) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (!response.value.length) (this.form as any).onSubmit(undefined);
					else {
						if (response.value[0].custom_id == this.selectedUser.custom_id) {
							const { idIsAlreadyTaken } = Localization;
							this.customIdState = "Negative";
							this.customIdValueStateText = idIsAlreadyTaken;
						} else {
							const { emailIsAlreadyTaken } = Localization;
							this.emailState = "Negative";
							this.emailValueStateText = emailIsAlreadyTaken;
						}
					}
				},
				error: e => {},
			});
		} else {
			const { idIsRequired } = Localization;
			this.customIdState = "Negative";
			this.customIdValueStateText = idIsRequired;
		}
	}

	setUserCustomId() {
		this.isLoadingCustomId = true;
		this.commonService.get("generateId?entity=User", false).subscribe({
			next: (response: any) => {
				this.customId = response.entity;
				this.selectedUser.custom_id = this.customId;
				this.setSuperVisors();
				this.isLoadingCustomId = false;
			},
			error: () => {
				if (typeof this.customId === "boolean") this.selectedUser.custom_id = "";
				this.isLoadingCustomId = false;
			},
		});
	}

	editClick(value: any): void {
		this.selectedTab = "core_data";
		this.passwords = {
			newPassword: "",
			confirmPassword: "",
		};

		this.dialogTitle = this.localization.edit;
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.selectedUser?.deserialize(value);
		this.setSuperVisors();
		this.setUserGroupSelection();
		this.setRoleSelection();
		this.setSupervisorName();
		this.cachedCustomId = this.selectedUser.custom_id || "";
		this.customIdState = "None";
		this.emailState = "None";
		this.selectedMachines =
			this.selectedUser.machines.map((machine: Machine) => machine.id) || [];
		this.copyMachinesData = this.getMachinesByPlantId(
			[...this.selectedUser.machines],
			this.plantId
		);
		this.preselectedMachines();
		this.loadAssociateData();
	}

	clearPasswordInput(): void {}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.setUserCustomId();
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	handleClose() {
		this.selectedUser = new User().deserialize({});
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogUsers.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/Users(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.filterHandler();
				this.loadData();
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: err => {
				this.isLoading = false;
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogUsers.elementRef.nativeElement.open = true;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

	loadData() {
		this.setUserCustomId();
		this.setUserGroupsAndMachines();
		this.setRoles();
	}

	setRoles() {
		this.commonService.get("Roles").subscribe({
			next: (response: any) => {
				this.roles = response.value.map((role: any) => new Role().deserialize(role));
				this.filteredRoles = this.roles;
			},
		});
	}

	setSuperVisors() {
		this.superVisors = this.childComponent?.data.filter(
			(data: any) => data.custom_id != this.selectedUser.custom_id
		);
	}

	changeSuperVisor1(event: any) {
		const superVisor = this.superVisors.find(
			superVisor => superVisor.id == event.detail.item.id
		);
		this.selectedUser.supervisor1_user_id = superVisor!.id?.toString();

		this.selectedSuperVisor1 = superVisor as User;
	}

	changeSuperVisor2(event: any) {
		const superVisor = this.superVisors.find(
			superVisor => superVisor.id == event.detail.item.id
		);
		this.selectedUser.supervisor2_user_id = superVisor!.id?.toString();

		this.selectedSuperVisor2 = superVisor as User;
	}

	onSuperVisor1InputChange(event: any) {
		const inputValue = event.target.value;
		if (this.selectedSuperVisor1.name !== inputValue) {
			this.selectedUser.supervisor1_user_id = null;
			this.selectedSuperVisor1 = new User().deserialize({});
		}
	}

	onSuperVisor2InputChange(event: any) {
		const inputValue = event.target.value;
		if (this.selectedSuperVisor2.name !== inputValue) {
			this.selectedUser.supervisor2_user_id = null;
			this.selectedSuperVisor2 = new User().deserialize({});
		}
	}

	setUserGroupSelection() {
		this.userGroups.forEach(group => {
			group.isSelected = false;
		});
		this.selectedUser.user_group?.forEach(userGroup => {
			const userGr = this.userGroups.find(ug => ug.id == userGroup.id);
			userGr!.isSelected = true;
		});
	}

	setRoleSelection() {
		this.roles.forEach(role => {
			role.isSelected = false;
		});
		this.selectedUser.roles?.forEach(role => {
			const userGr = this.roles.find(r => r.id == role.id);
			if (userGr) userGr.isSelected = true;
		});
	}
	loadAssociateData() {
		const userId = this.selectedUser.id;
		this.qualificationUser = [];
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/QualificationUsers?$expand=qualification($expand=item,machine)&filter=user_id eq ${userId}`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((qualificationUser: QualificationUser) => {
					this.qualification.forEach((value: any) => {
						if (value.id == qualificationUser.qualification?.id) {
							value.isSelected = true;
						}
					});

					this.qualificationUser.push(
						new QualificationUser().deserialize(qualificationUser.qualification)
					);
				});
				this.associateData = [...this.qualificationUser];
			},
			error: e => {},
		});
	}

	resetGroupSelection() {
		this.userGroups.forEach(userGroup => {
			userGroup.isSelected = false;
		});
	}

	resetRoleSelection() {
		this.roles.forEach(role => {
			role.isSelected = false;
		});
	}

	setSupervisorName() {
		let isSupervisorIdOneUser = false;
		let isSupervisorIdTwoUser = false;

		this.superVisors.forEach(supervisor => {
			if (supervisor.id == this.selectedUser.supervisor1_user_id) {
				this.selectedSuperVisor1 = supervisor;
				isSupervisorIdOneUser = true;
			}

			if (supervisor.id == this.selectedUser.supervisor2_user_id) {
				this.selectedSuperVisor2 = supervisor;
				isSupervisorIdTwoUser = true;
			}
		});
		if (!isSupervisorIdOneUser) {
			this.selectedSuperVisor1 = new User().deserialize({});
			this.supervisor1ComboBox.element.value = "";
		}
		if (!isSupervisorIdTwoUser) {
			this.selectedSuperVisor2 = new User().deserialize({});
			this.supervisor2ComboBox.element.value = "";
		}
	}

	clearSupervisors() {
		this.selectedSuperVisor1 = new User().deserialize({});
		this.selectedSuperVisor2 = new User().deserialize({});
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onChangeShiftModel(event: any) {
		const customId = event.detail.item.text;

		this.selectedUser.shiftModel = this.shiftModels.find(
			(shiftModel: ShiftModel) => shiftModel.custom_id === customId
		);
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		switch (this.selectedTab) {
			case "assigned_roles":
				this.associateData = [...this.roles];
				this.associateDialogTitle = $localize`Associate New Role`;
				if (this.childComponentRoles) {
					this.childComponentRoles.filteredDataCount =
						this.selectedUser.roles.length ?? 0;
					this.childComponentRoles.render();
				}
				break;
			case "accessible_machines":
				this.associateData = [...this.machines];
				this.associateDialogTitle = $localize`Associate New Machine`;
				if (this.childComponentMachines) {
					this.childComponentMachines.filteredDataCount =
						this.copyMachinesData?.length ?? 0;
					this.childComponentMachines.render();
				}
				break;
			case "user_groups":
				this.associateData = [...this.userGroups];
				this.associateDialogTitle = $localize`Associate New User Group`;
				if (this.childComponentUserGroup) {
					this.childComponentUserGroup.filteredDataCount =
						this.selectedUser?.user_group?.length ?? 0;
					this.childComponentUserGroup.render();
				}
				break;
			case "qualifications":
				this.associateData = [...this.qualificationUser];
				this.associateDialogTitle = $localize`Qualifications`;
				this.childComponentQualification!.filteredDataCount = this.associateData.length;
				break;
		}
	}

	associateButtonClick(dialogId: string) {
		switch (dialogId) {
			case "assigned_roles":
				this.setRoleSelection();
				this.filteredRoles = [...this.roles];
				this.tempRoles = [];
				this.checkEnableSelection(this.filteredRoles);
				break;

			case "user_groups":
				this.setUserGroupSelection();
				this.filteredUserGroups = [...this.userGroups];
				this.tempUserGroups = [];
				this.checkEnableSelection(this.filteredUserGroups);
				break;
			case "accessible_machines":
				this.preselectedMachines();
				this.originalFilteredMachines = this.getMachinesByPlantId(this.data, this.plantId);
				this.filteredMachines = [...this.originalFilteredMachines];
				this.tempMachines = [];
				this.checkEnableSelection(this.filteredMachines);
				break;
		}
		this.isAssociateDialogOpen = true;
		this.searchedValue = "";
	}

	checkEnableSelection(data: any[]): void {
		this.isDeselectEnable = data.some(item => item.isSelected);
	}

	associateEditClick(value: any) {
		this.associateDialogTitle = $localize`Edit User Qualification`;
		this.isAssociateUpdateDialogOpen = true;
		this.associateUser = new Qualification().deserialize(value);
	}

	onSaveUserSwitch() {
		this.isAssociateUpdateDialogOpen = false;
	}

	onSearchInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue : "";
		this.searchValueLowerCase = this.searchedValue.toLowerCase();
		switch (this.selectedTab) {
			case "assigned_roles":
				this.filteredRoles = this.roles.filter(
					item => item.name && item.name.toLowerCase().includes(this.searchValueLowerCase)
				);
				break;
			case "accessible_machines":
				this.filteredMachines = this.originalFilteredMachines.filter(
					item =>
						(item.custom_id && item.custom_id.includes(this.searchedValue)) ||
						item.name?.toLowerCase().includes(this.searchValueLowerCase)
				);
				break;

			case "user_groups":
				this.filteredUserGroups = this.userGroups.filter(
					item =>
						(item.custom_id && item.custom_id.includes(this.searchedValue)) ||
						item.name?.toLowerCase().includes(this.searchValueLowerCase)
				);
				break;
		}
	}

	onAssociateSave() {
		if (this.selectedTab == "assigned_roles") {
			this.selectedUser.roles = this.roles.filter(role => role.isSelected);
			if (this.childComponentRoles) {
				this.childComponentRoles.filteredDataCount = this.selectedUser.roles.length ?? 0;
				this.childComponentRoles.render();
			}
		} else if (this.selectedTab == "user_groups") {
			this.selectedUser.user_group = this.userGroups.filter(
				userGroup => userGroup.isSelected
			);
			if (this.childComponentUserGroup) {
				this.childComponentUserGroup.filteredDataCount =
					this.selectedUser?.user_group?.length ?? 0;
				this.childComponentUserGroup.render();
			}
		} else {
			this.selectedUser.machines = this.machines.filter(machine => machine.isSelected);
			this.copyMachinesData = this.getMachinesByPlantId(
				[...this.selectedUser.machines],
				this.plantId
			);
			if (this.childComponentMachines) {
				this.childComponentMachines.filteredDataCount = this.copyMachinesData?.length ?? 0;
				this.childComponentMachines.render();
			}
		}
		this.isAssociateDialogOpen = false;
	}

	selectAllAssociate(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			if (this.selectedTab === "assigned_roles") {
				this.filteredRoles.forEach(role => (role.isSelected = true));
			} else if (this.selectedTab === "accessible_machines") {
				this.filteredMachines.forEach(machine => (machine.isSelected = true));
			} else {
				this.filteredUserGroups.forEach(userGroup => (userGroup.isSelected = true));
			}
		} else {
			this.isDeselectEnable = false;
			if (this.selectedTab === "assigned_roles") {
				this.filteredRoles.forEach(role => (role.isSelected = false));
			} else if (this.selectedTab === "accessible_machines") {
				this.filteredMachines.forEach(machine => (machine.isSelected = false));
			} else {
				this.filteredUserGroups.forEach(userGroup => (userGroup.isSelected = false));
			}
		}
	}

	cancelDialog() {
		this.isAssociateDialogOpen = false;
		this.isAssociateUpdateDialogOpen = false;
	}

	async fillYourIP() {
		const ip = await this.authService.getLocalIP();
		this.selectedUser.ip_address = ip?.[0] || "";
	}

	passwordMatch() {
		if (this.passwords.newPassword) {
			if (this.passwords.newPassword == this.passwords.confirmPassword) {
				this.isPasswordNotMatched = true;
			} else {
				this.isPasswordNotMatched = false;
			}
		}
	}

	onSearchOnChangeInput(value: string, tableName: string) {
		const lowerCaseValue = value.toLowerCase();
		let filteredDataCount = 0;

		switch (tableName) {
			case "roles":
				filteredDataCount = this.selectedUser.roles.filter((data: any) =>
					data.name?.toLowerCase().includes(lowerCaseValue)
				).length ?? 0;
				this.childComponentRoles!.filteredDataCount = filteredDataCount;
				break;
			case "machines":
				filteredDataCount = this.copyMachinesData.filter((data: any) =>
					data.name?.toLowerCase().includes(lowerCaseValue) ||
					data.custom_id?.toLowerCase().includes(lowerCaseValue)
				).length ?? 0;
				this.childComponentMachines!.filteredDataCount = filteredDataCount;
				break;
			case "user_groups":
				filteredDataCount = this.selectedUser.user_group?.filter((data: any) =>
					data.name?.toLowerCase().includes(lowerCaseValue) ||
					data.custom_id?.toLowerCase().includes(lowerCaseValue)
				).length ?? 0;
				this.childComponentUserGroup!.filteredDataCount = filteredDataCount;
				break;
			case "qualification":
				filteredDataCount = this.associateData.filter((data: any) =>
					data.item.name?.toLowerCase().includes(lowerCaseValue) ||
					data.machine.custom_id?.toLowerCase().includes(lowerCaseValue) ||
					data.operation_code?.toLowerCase().includes(lowerCaseValue) ||
					data.min_qualification_hours?.toString().includes(lowerCaseValue) ||
					data.min_qualification_operations?.toString().includes(lowerCaseValue)
				).length ?? 0;
				this.childComponentQualification!.filteredDataCount = filteredDataCount;
				break;
		}
	}
}
