// Angular
import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
// Models
import { Area } from "@app/shared/models/area.model";
import { User } from '@app/shared/models/user.model';
// Services
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { HandleRowClickService } from '@app/shared/services/handle-row-click.service';
import { ToastService } from "@app/shared/services/toaster.service";
// Utility functions for localization and common operations.
import { Localization } from "@app/shared/utils/common-localize";
// UI5 Components
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrl: './areas.component.css'
})
export class AreasComponent {
  @ViewChild("childComponentRef", { static: false }) childComponent:
    | CustomReactGridTable
    | undefined;
  @ViewChild("childComponentAssociateUser", { static: false }) childComponentAssociateUser:
    | CustomReactGridTable
    | undefined;
  localization = Localization;
  isLoading: boolean = false;
  disableButtonDuringRequest: boolean = false;
  isDialogOpen: boolean = false;
	isAssociateDialogOpen: boolean = false;
  @ViewChild("createOrUpdateForm") form?: NgForm;
  customIdValueStateText: string = Localization.invalidEntry;
  customIdState: keyof typeof ValueState = "None";
  dialogTitle: string = "";
  isLoadingCustomId: boolean = false;
  isUpdate?: boolean;
  selectedArea: Area = new Area().deserialize({});
  cachedCustomId?: string = "";
  selectedId = "";
  customId?: string;
	public selectedTab: string = "generalTab";
	addButtonText: string = $localize`Associate`;
	associateDialogTitle: string = $localize`Associate Users`;
	searchedValue: string = "";
  users: User[] = [];
  filteredUsers: User[] = [];
	tempUsers: any[] = [];
  isDeselectEnable: boolean = false;
	topValue: number = 1000;
  @ViewChild("errorDialogArea", { static: false }) errorDialogArea: any;

  column: any = [
    {
      Header: this.localization.active,
      accessor: "is_active",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      hAlign: "Center",
      dataType: GridTableColumnDataType.Boolean,
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
      hAlign: "Left",
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

  userColumns: any = [
    {
      Header: this.localization.id,
      accessor: "custom_id",
      isSelected: true,
      disableFilters: false,
      disableGroupBy: true,
      hAlign: "Left",
      width: 200,
      autoResizable: true,
    },
    {
      Header: this.localization.name,
      accessor: "name",
      isSelected: true,
      disableFilters: false,
      disableGroupBy: true,
      autoResizable: true,
    },
	];

  constructor(
    private commonService: CommonService,
    public _authService: AuthService,
    public _toasterSrv: ToastService
  ) {}

  ngOnInit(): void {
    this.getCustomId();
    this.loadData();
  }

  loadData() {
      this.commonService.get(`Users?$orderby=custom_id asc&$top=${this.topValue}`).subscribe({
        next: (response: any) => {
          this.users = response.value?.map((user: User) =>
            new User().deserialize({ ...user, isSelected: false })
          );
  
          this.filteredUsers = this.users;
        },
        error: e => {},
      });
    }

  newButtonClick() {
    this.selectedTab = "generalTab";
    this.dialogTitle = this.localization.add;
    this.isDialogOpen = true;
    this.isUpdate = false;
    this.customIdState = "None";
    this.disableButtonDuringRequest = false;
    this.selectedArea = new Area().deserialize({});
    this.selectedArea.custom_id = this.customId;
    if (!this.customId) {
      this.selectedArea.custom_id = "";
      this.getCustomId();
    }
  }

  editClick(value: object): void {
    this.selectedTab = "generalTab";
    this.isDialogOpen = true;
    this.isUpdate = true;
    this.dialogTitle = this.localization.edit;
    this.customIdState = "None";
    this.selectedArea = this.selectedArea?.deserialize(value);
    this.cachedCustomId = this.selectedArea.custom_id;
    this.disableButtonDuringRequest = false;
  }
    
  onSubmit(form: NgForm) {
    if (!form.valid) {
      this.disableButtonDuringRequest = false;
      return;
    }
    const customId = this.selectedArea.custom_id?.trim();
    this.selectedArea.custom_id = customId;
    if (this.isUpdate) {
      this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
    } else this.checkCustomId();
  }

  deleteClick(value: any) {
    this.selectedId = value.id;
    const dialog = document.getElementById("deleteDialog") as Dialog;
    dialog.open = true;
  }

  deleteSubmit() {
    const { recordDeleted } = Localization;
    this.disableButtonDuringRequest = true;
    this.isLoading = true;
    this.commonService.delete(`/Areas(${this.selectedId})`).subscribe({
      next: () => {
        this.closeDialogDelete();
        this.isLoading = false;
        this.childComponent?.onFilterAndSortingForEdit(this.selectedId, null);
        this.disableButtonDuringRequest = false;
        this._toasterSrv.showToast(recordDeleted, "success");
      },
      error: err => {
        this.closeDialogDelete();
        this.disableButtonDuringRequest = false;
        this.isLoading = false;
        this.errorDialogArea.elementRef.nativeElement.open = true;
      },
    });
  }

  async onCreateOrUpdate() {
    this.isLoading = true;
    const payload = this.selectedArea?.toOdata();
    const method = this.isUpdate ? "put" : "post";
    const urlString = this.isUpdate
      ? `Areas(${this.selectedArea?.id})`
      : `Areas`;
    this.commonService[method](urlString, payload).subscribe({
      next: (res) => {
        this.selectedArea = new Area().deserialize(res);
        this.syncAreaUser();
      },
      error: () => {
        this.disableButtonDuringRequest = false;
        this.isLoading = false;
        this.errorDialogArea.elementRef.nativeElement.open = true;
      },
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
		const url = `Areas?$filter=id eq ${this.selectedArea?.id}&$expand=users`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			}
		});
	}

  async getCustomId() {
    this.isLoadingCustomId = true;
    try {
      this.customId = await this.commonService.getEntity("Area");
      if (this.customId) {
        this.selectedArea.custom_id = this.customId;
      } else {
        this.selectedArea.custom_id = "";
      }
    } catch (error) {
      this.selectedArea.custom_id = "";
    } finally {
      this.isLoadingCustomId = false;
    }
  }

  closeDialog() {
    this.isDialogOpen = false;
    (this.form as any).onReset();
  }

  closeErrorDialog() {
    this.errorDialogArea.elementRef.nativeElement.open = false;
  }

  closeDialogDelete() {
    const dialog = document.getElementById("deleteDialog") as Dialog;
    dialog.open = false;
  }

  onChangeCustomId() {
    this.customIdState = "None";
  }

  onSave() {
    this.disableButtonDuringRequest = true;
    (this.form as any).onSubmit(undefined);
  }

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedArea.custom_id || ""
		);
		const urlString = `Areas?$filter=custom_id eq '${this.selectedArea.custom_id}'&$select=custom_id`;
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

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
    if (this.selectedTab === 'associateUserTab') this.childComponentAssociateUser!.filteredDataCount = this.selectedArea?.users.length ?? 0;
	}

  selectAllAssociate(enableSelection: any): void {
		if (enableSelection) {
			this.isDeselectEnable = true;
			this.filteredUsers.forEach(user => user.isSelected = true);
		} else {
			this.isDeselectEnable = false;
			this.filteredUsers.forEach(user => user.isSelected = false);
		}
	}

	onSearchInput(event: any) {
            this.searchedValue = event.target ? event.target.typedInValue.toLowerCase() : "";
            this.filteredUsers = this.users.filter(user =>
              (user.custom_id && user.custom_id.toLowerCase().includes(this.searchedValue)) ||
              (user.name && user.name.toLocaleLowerCase().includes(this.searchedValue)));
	}

	onUserChange(event: any) {
		const selectedUserId = event.detail.targetItem.id;
		const userIndex = this.users.findIndex(user => user.id == selectedUserId);
		this.users[userIndex].isSelected = !this.users[userIndex].isSelected;
		this.tempUsers.push(parseInt(selectedUserId));
		const selectedItems = event.detail?.selectedItems || [];
		this.isDeselectEnable = selectedItems.length > 0 ? true : false;
	}

  associateButtonClick() {
		this.isAssociateDialogOpen = true;
		this.searchedValue = "";
		this.preselectedUsers();
		this.filteredUsers = [...this.users];
		this.tempUsers = [];
		const isAllUserSelected = this.filteredUsers.some(user => user.isSelected);
		this.isDeselectEnable = isAllUserSelected ? true : false;
	}

  preselectedUsers() {
      this.users.forEach((u: User) => (u.isSelected = false));
      this.selectedArea.users.forEach((machine: any) => {
        this.users.forEach((value: any) => {
          if (value?.id == machine?.id) value.isSelected = true;
        });
      });
      this.filteredUsers = this.users;
      this.isDialogOpen = true;
    }

  cancelDialog() {
    this.isAssociateDialogOpen = false;
  }

  onUsersSave() {
    const selectedUsers = this.users.filter(user => user.isSelected);
    this.selectedArea.users = selectedUsers;
    this.childComponentAssociateUser!.filteredDataCount = this.selectedArea.users.length ?? 0;
    this.isAssociateDialogOpen = false;
  }

  syncAreaUser() {
		const selectedUsers = this.users.filter(user => user.isSelected);
		const selectedUserIds = selectedUsers.map((user: any) => user.id);
		const payload = this.selectedArea.toJSONData(selectedUserIds);
    this.commonService.post(`areas/${this.selectedArea.id}/sync`, payload, false).subscribe({
      next: () => {
        const { recordSavedSuccessfully } = Localization;
        this._toasterSrv.showToast(recordSavedSuccessfully, "success");
        this.isLoading = false;
        this.isDialogOpen = false;
        if (!this.isUpdate) { 
          this.filterHandler();
        } else {
          this.refreshEditData();
        }
        (this.form as any).onReset();
        this.disableButtonDuringRequest = false;
      },
    })
	}

  onChangeName(event: any) {
    if (this.selectedArea) this.selectedArea.name = (event.target as any).value;
  }
 
  onSearchOnChangeInput(value: string) {
    const searchString = value.toLowerCase();
    const foundArray = this.selectedArea.users.filter(user =>
      user.custom_id?.toLowerCase().includes(searchString) ||
      user.name?.toLowerCase().includes(searchString)
    );
    this.childComponentAssociateUser!.filteredDataCount = foundArray.length;
  }

}
