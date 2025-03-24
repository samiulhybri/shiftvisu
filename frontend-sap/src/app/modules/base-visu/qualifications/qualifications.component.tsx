import { ChangeDetectorRef, Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Qualification } from "@app/shared/models/qualification.model";
import { CommonService } from "@app/shared/services/common.service";
import { AnalyticalTableColumnDefinition, Button } from "@ui5/webcomponents-react";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";
import { ConfigService } from "@app/shared/services/config.service";
import { QualificationUser } from "@app/shared/models/qualification-user.model";
import { User } from "@app/shared/models/user.model";
import React from "react";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { debounceTime, Subject, switchMap } from "rxjs";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import { formatNumber } from "@app/shared/utils/number-formatter";

@Component({
	selector: "app-qualifications",
	templateUrl: "./qualifications.component.html",
	styleUrl: "./qualifications.component.css",
})
export class QualificationsComponent {
	private searchMachineSubject = new Subject<string>();
	private searchItemSubject = new Subject<string>();

	isDialogOpen: boolean = false;
	warningText: boolean = false;
	dialogTitle: string = "";
	deletItemId = "";
	warningForMachine: string = "";
	isUpdate?: boolean = false;
	isLoading: boolean = false;
	isAssignedUserLoading: boolean = false;
	localization = Localization;
	qualification: Qualification = new Qualification().deserialize({});
	items?: Item[] = [];
	initialItems?: Item[] = [];
	machines?: Machine[] = [];
	initialMachines?: Machine[] = [];
	qualificationConfig: any = {};
	@ViewChild("create0rUpdateForm") form?: NgForm;
	disableButtonDuringRequest: boolean = false;
	public selectedTab: string = "core_data";
	addButtonText: string = $localize`Associate`;
	isAssociateDialogOpen: boolean = false;
	qualificationUser: User[] = [];
	user: User[] = [];
	associateData: any = [];
	searchedValue: string = "";
	filteredUsers: User[] = [];
	associateTitle: string = $localize`Associate New Assigned Users`;
	isAssociateUpdateDialogOpen: boolean = false;
	associateUser: any = [];
	tempUsers: any[] = [];
	isPreviewDialogOpen: boolean = false;
	topValue: number = 1000;
	isDeselectEnable: boolean = false;
	associateDialogTitle: string = $localize`Assigned Users`;
	selectedQualificationUser: QualificationUser = new QualificationUser().deserialize({});
	allUserQualification: QualificationUser[] = [];
	showAction: boolean = false;
	itemComboboxLoading: boolean = false;

	ngOnInit(): void {
		this.searchItemAPICall();
		this.searchMachineAPICall();
	}

	protected columns: AnalyticalTableColumnDefinition[] | any[] = [
		{
			Header: $localize`Item`,
			accessor: "item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			accessorArray: ["item.name", "item.custom_id"],
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			comboBoxValues: this.items,
			autoResizable: true,
		},
		{
			Header: $localize`Machine`,
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
			hAlign: "End",
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
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`Users`,
			accessor: "user.id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			maxWidth: 120,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalUsers: any[] = [];

				rowData.users.map((item: any) => {
					totalUsers.push(item.id);
				});
				if (totalUsers.length > 0) {
					return (
						<React.StrictMode>
							<Button onClick={() => this.showPreview(rowData.users)}>
								{totalUsers.length +
									(totalUsers.length > 1 ? $localize` Users` : $localize` User`)}
							</Button>
						</React.StrictMode>
					);
				} else return null;
			},
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
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
	];

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
	@ViewChild("childComponentAssignedUser", { static: false }) childComponentAssignedUser:
		| CustomReactGridTable
		| undefined;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService,
		private cdr: ChangeDetectorRef,
		public handleRowClickService: HandleRowClickService
	) {
		this.qualificationConfig = this.configService.getConfigValue("qualifications");
		this.qualification = new Qualification().deserialize({});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	ngAfterViewInit(): void {
		this.batchCall();
	}

	numberFormat(value?: number): string {
		return formatNumber(value ?? 0, 0, 2);
	}

	newButtonClick() {
		this.dialogTitle = this.localization.add;
		this.isDialogOpen = true;
		this.isUpdate = false;
		this.qualification = new Qualification().deserialize({});
		this.warningForMachine = "None";
		this.disableButtonDuringRequest = false;
		this.qualificationUser = [];
		this.showAction = false;
		this.user.forEach((user: User) => (user.isSelected = false));
	}

	refreshEditData() {
		const url = `Qualifications?$filter=id eq ${this.qualification?.id}&$orderby=id asc&$expand=item,machine,users`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

	deleteClick(value: any) {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = true;
	}

	editClick(value: any) {
		this.dialogTitle = this.localization.edit;
		this.qualification = new Qualification().deserialize(value);
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.warningForMachine = "None";
		this.disableButtonDuringRequest = false;
		this.showAction = true;
		this.loadAssociateData();

		this.items = this.initialItems;
		this.machines = this.initialMachines;
	}

	onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.qualification?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate
			? `Qualifications(${this.qualification?.id})`
			: `Qualifications`;
		this.commonService[method](urlString, payload).subscribe({
			next: (res: any) => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");

				const userIds = this.qualificationUser.map(obj => obj.id);

				const userPayload = {
					userIds: userIds,
					id: res.id,
				};
				const promiseQualification = this.syncAssociateData(
					"base-visu/qualification-user",
					userPayload
				);
				Promise.all([promiseQualification]).then(() => {
					if (!this.isUpdate) {
						this.filterHandler();
					} else {
						this.refreshEditData();
					}
					this.isLoading = false;
					this.isDialogOpen = false;
					(this.form as any).onReset();
					this.disableButtonDuringRequest = false;
				});
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				(document.getElementById("errorDialog") as Dialog).open = true;
				this.isLoading = false;
			},
		});
	}
	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/Qualifications(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.qualification, null);
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
				`\/odata\/Items?$expand=topQualification($select=custom_id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/Machines?$expand=topQualification($select=custom_id)&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/Users?$orderby=custom_id asc&$top=${this.topValue}`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.items = response.responses[0].body.value.map((data: Item) =>
					new Item().deserialize(data)
				);
				this.columns[1].comboBoxValues = this.items;
				this.initialItems = this.items;

				this.machines = response.responses[1].body.value.map((data: Machine) =>
					new Machine().deserialize(data)
				);
				this.columns[2].comboBoxValues = this.machines;

				this.initialMachines = this.machines;

				response.responses[2]?.body?.value?.map((user: User) => {
					this.user.push(new User().deserialize(user));
				});
			},
			error: e => {},
		});
	}

	onChangeItem(event: any) {
		if (this.qualification?.item)
			this.qualification.item = new Item().deserialize({
				name: (event.target as any).value || "",
				id: parseInt((event.detail as any).item.id) || 0,
			});
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeMachine(event: any) {
		if (this.qualification?.machine)
			this.qualification.machine = new Machine().deserialize({
				name: (event.target as any).value || "",
				id: parseInt((event.detail as any).item.id) || 0,
			});
	}

	onMachineInputChange(event: any) {
		const value = event.target.value;

		if (value) {
			this.searchMachineSubject.next(value);
		} else {
			this.machines = this.initialMachines;

			if (this.qualification) {
				this.qualification.machine = new Machine().deserialize({
					id: null,
					name: "",
				});
			}
		}
	}

	onItemInputChange(event: any) {
		const value = event.target.value;

		if (value) {
			this.searchItemSubject.next(value);
		} else {
			this.items = this.initialItems;

			if (this.qualification) {
				this.qualification.item = new Item().deserialize({
					id: null,
					name: "",
				});
			}
		}
	}

	searchItemAPICall() {
		this.searchItemSubject
			.pipe(
				debounceTime(800),
				switchMap(value => {
					this.itemComboboxLoading = true;

					return this.commonService.get(
						`Items?$filter=contains(tolower(name), '${value?.toLowerCase()}') or contains(tolower(custom_id), '${value?.toLowerCase()}')`
					);
				})
			)
			.subscribe({
				next: (response: any) => {
					this.itemComboboxLoading = false;
					this.items = response?.value || [];
				},
				error: err => {
					this.items = this.initialItems;
				},
				complete: () => {},
			});
	}

	searchMachineAPICall() {
		this.searchMachineSubject
			.pipe(
				debounceTime(800),
				switchMap(value => {
					this.itemComboboxLoading = true;

					return this.commonService.get(
						`Machines?$filter=contains(tolower(name), '${value?.toLowerCase()}') or contains(tolower(custom_id), '${value?.toLowerCase()}')`
					);
				})
			)
			.subscribe({
				next: (response: any) => {
					this.itemComboboxLoading = false;
					this.machines = response?.value || [];
				},
				error: err => {
					this.machines = this.initialMachines;
				},
				complete: () => {},
			});
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		setTimeout(() => {
			this.selectedTab = "core_data";
		}, 0);
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			this.selectedTab = "core_data";
			return;
		}
		this.onCreateOrUpdate();
	}

	shouldBeDisabled(fieldName: string) {
		if (this.qualificationConfig && this.qualification) {
			return (
				this.qualificationConfig[fieldName] === 0 && this.qualification.is_imported_from_erp
			);
		} else {
			return false;
		}
	}
	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
		switch (this.selectedTab) {
			case "assigned_user":
				this.associateData = [...this.qualificationUser];
				break;
		}
		if (this.childComponentAssignedUser) {
			this.childComponentAssignedUser.filteredDataCount = this.associateData.length ?? 0;
			this.childComponentAssignedUser.render();
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

	associateEditClick(value: any) {
		if (value) {
			this.associateTitle = $localize`Edit Assigned Users`;
			this.selectedQualificationUser =
				this.allUserQualification.find(
					(qualificationUser: any) => qualificationUser.user_id == value?.id
				) || new QualificationUser().deserialize({});
			// this.loadUserQualificationData(value.id);

			this.isAssociateUpdateDialogOpen = true;
		}
	}

	loadUserQualificationData(user_id: number) {
		this.isAssociateUpdateDialogOpen = true;
		this.isAssignedUserLoading = true;
		this.commonService
			.get(
				`QualificationUsers?$expand=qualification($select=id),user($select=id,name,custom_id)&filter=user_id eq ${user_id}`
			)
			.subscribe({
				next: (response: any) => {
					this.selectedQualificationUser = response.value.length
						? response.value[0]
						: null;
					this.isAssignedUserLoading = false;
					this.cdr.detectChanges();
				},
				error: e => {
					this.isAssignedUserLoading = false;
					this.cdr.detectChanges();
				},
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

	preSelectUser() {
		this.user.forEach((user: User) => (user.isSelected = false));
		this.qualificationUser.forEach((user: any) => {
			this.user.forEach((value: any) => {
				if (value?.id == user?.id) value.isSelected = true;
			});
		});
	}

	loadAssociateData() {
		const qualificationId = this.qualification.id;
		this.qualificationUser = [];
		if (this.childComponentAssignedUser) this.childComponentAssignedUser.isBusy = true;
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/QualificationUsers?$expand=user&filter=qualification_id eq ${qualificationId}`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.allUserQualification = response.responses[0]?.body?.value || [];

				response.responses[0]?.body?.value?.map((qualificationUser: QualificationUser) => {
					this.user.forEach((value: any) => {
						if (value.id == qualificationUser.user?.id) {
							value.isSelected = true;
						}
					});
					this.qualificationUser.push(new User().deserialize(qualificationUser.user));
				});
				this.associateData = [...this.qualificationUser];
				if (this.childComponentAssignedUser) {
					this.childComponentAssignedUser.isBusy = false;
					this.childComponentAssignedUser.filteredDataCount = this.associateData.length ?? 0;
				}
			},
			error: e => {},
		});
	}
	onSearchInput(event: any) {
		this.searchedValue = event.target ? event.target.typedInValue : "";
		this.filteredUsers = this.user.filter(
			item =>
				(item.custom_id &&
					item.custom_id?.toLowerCase()?.includes(this.searchedValue?.toLowerCase())) ||
				(item.name && item.name?.toLowerCase().includes(this.searchedValue?.toLowerCase()))
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
		this.qualificationUser = this.user.filter(user => user.isSelected);
		this.associateData = this.qualificationUser;
		if (this.childComponentAssignedUser) {
			this.childComponentAssignedUser.filteredDataCount = this.associateData.length ?? 0;
			this.childComponentAssignedUser.render();
		}
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
		const payload = {
			is_prequalified: this.selectedQualificationUser.is_prequalified,
			is_suspended: this.selectedQualificationUser.is_suspended,
			qualification_id: this.selectedQualificationUser.qualification?.id,
			user_id: this.selectedQualificationUser.user?.id,
			note: this.selectedQualificationUser.note,
		};

		this.isAssignedUserLoading = true;

		this.commonService
			.put(`QualificationUsers(${this.selectedQualificationUser.id})`, payload)
			.subscribe({
				next: res => {
					this.isAssignedUserLoading = false;
					this.isAssociateUpdateDialogOpen = false;
				},
				error: err => {
					this.isAssignedUserLoading = false;
					this.isAssociateUpdateDialogOpen = false;
				},
			});
	}

	onSearchOnChangeInput(value: any) {
		const searchString = value.toLowerCase();
		const foundArray = this.associateData.filter((data: any) =>
			data.custom_id?.toLowerCase().includes(searchString) ||
			data.name?.toLowerCase().includes(searchString)
     	);
		this.childComponentAssignedUser!.filteredDataCount = foundArray.length;
	}
}
