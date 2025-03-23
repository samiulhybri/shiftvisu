import { Component, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { CustomerCategory } from '@app/shared/models/customer-category.model';
import { AuthService } from '@app/shared/services/auth.service';
import { CommonService } from '@app/shared/services/common.service';
import { ConfigService } from '@app/shared/services/config.service';
import { HandleRowClickService } from '@app/shared/services/handle-row-click.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { Localization } from '@app/shared/utils/common-localize';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
  selector: 'app-customer-categories',
  templateUrl: './customer-categories.component.html',
  styleUrl: './customer-categories.component.css'
})
export class CustomerCategoriesComponent {
  	isLoading: boolean = false;
    isDialogOpen: boolean = false;
    isUpdateDialog?: boolean;
    value!: string;
    autoIncrementId!: string;
    dialogTitle: string = "";
    deletItemId = "";
    deleteDialog?: Dialog;
    errorDialog?: Dialog;
    isUpdate?: boolean;
    customId?: string;
    customIdState: keyof typeof ValueState = "None";
    customIdValueStateText: string = Localization.idIsRequired;
    isLoadingCustomId: boolean = false;
    cachedCustomId?: string = "";
    selectedCustomerCategory: CustomerCategory = new CustomerCategory().deserialize({});
    @ViewChild("errorDialogCustomerCategory", { static: false }) errorDialogCustomerCategory: any;
    @ViewChild("createOrUpdateForm") form?: NgForm;
    customerGroupConfig?: any = {};
    disableButtonDuringRequest: boolean = false;
    localization = Localization;

  columns: any = [
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
        Header: $localize`Sort Order`,
        accessor: "sort_order",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
        hAlign: "Right",
        autoResizable: true,
      },
    ];

    @ViewChild("childComponentRef", { static: false }) childComponent:
      | CustomReactGridTable
      | undefined;

    constructor(
      public commonService: CommonService,
      public authService: AuthService,
      private configService: ConfigService,
      public _toasterSrv: ToastService,
      public handleRowClickService: HandleRowClickService
    ) {
      this.selectedCustomerCategory = new CustomerCategory().deserialize({});
      // this.customerGroupConfig = this.configService.getConfigValue("customers_groups");
    }

    ngAfterViewInit(): void {
      this.deleteDialog = document.getElementById("deleteDialogCustomerCategory") as Dialog;
      this.errorDialog = document.getElementById("errorDialogCustomerCategory") as Dialog;
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
      const url = `CustomerCategories?$filter=is_active eq true and id eq ${this.selectedCustomerCategory?.id}`;
      this.commonService.get(url).subscribe({
        next: (response: any) => {
          this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
        }
      });
    }

    async newButtonClick() {
      this.isUpdate = false;
      this.dialogTitle = this.localization.add;
      this.selectedCustomerCategory = new CustomerCategory().deserialize({});
      this.selectedCustomerCategory.custom_id = this.customId;
      this.customIdState = "None";
      this.disableButtonDuringRequest = false;
      if (!this.customId) {
        this.selectedCustomerCategory.custom_id = "";
        this.getCustomId();
      }
      this.isDialogOpen = true;
    }

    async getCustomId() {
      this.isLoadingCustomId = true;
      this.customId = await this.commonService.getEntity("CustomerCategories").catch(() => false);
      this.selectedCustomerCategory.custom_id = this.customId;
      if (typeof this.customId === "boolean") this.selectedCustomerCategory.custom_id = "";
      this.isLoadingCustomId = false;
    }

    async onSave() {
      this.disableButtonDuringRequest = true;
      (this.form as any).onSubmit(undefined);
    }

    onSubmit(form: NgForm) {
      if (!form.valid) {
        this.disableButtonDuringRequest = false;
        return;
      }
      const customId = this.selectedCustomerCategory.custom_id?.trim();
      this.selectedCustomerCategory.custom_id = customId;
      if (this.isUpdate) {
        this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
      } else this.checkCustomId();
    }

    checkCustomId() {
      const result = this.commonService.customIdValidation(
        this.customId || "",
        this.selectedCustomerCategory.custom_id || ""
      );
      const urlString = `CustomerCategories?$filter=custom_id eq '${this.selectedCustomerCategory.custom_id}'&$select=custom_id`;
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
      const payload = this.selectedCustomerCategory?.toOdata();
      const method = this.isUpdate ? "put" : "post";
      const urlString = this.isUpdate
        ? `CustomerCategories(${this.selectedCustomerCategory?.id})`
        : `CustomerCategories`;
      this.commonService[method](urlString, payload).subscribe({
        next: () => {
          const { recordSavedSuccessfully }= Localization;
          this._toasterSrv.showToast(
            recordSavedSuccessfully,
            "success"
          );

          if (!this.isUpdate) {
            this.filterHandler();
          } else {
            this.refreshEditData();
          }
          this.isLoading = false;
          this.isDialogOpen = false;
          this.disableButtonDuringRequest = false;
        },
        error: () => {
          this.disableButtonDuringRequest = false;
          this.isLoading = false;
          this.errorDialogCustomerCategory.elementRef.nativeElement.open = true;
        },
      });
    }

    deleteClick(value: any) {
      this.deletItemId = value.id;
      if (this.deleteDialog) this.deleteDialog.open = true;
    }

    editClick(value: any) {
      this.isDialogOpen = true;
      this.isUpdate = true;
      this.dialogTitle = this.localization.edit;
      this.selectedCustomerCategory?.deserialize(value);
      this.cachedCustomId = this.selectedCustomerCategory.custom_id;
      this.customIdState = "None";
      this.disableButtonDuringRequest = false;
    }

    deleteSubmit() {
      const { recordDeleted } = Localization;
      this.disableButtonDuringRequest = true;
      this.isLoading = true;
      this.commonService.delete(`/CustomerCategories(${this.deletItemId})`).subscribe({
        next: () => {
          this.closeDialogDelete();
          this.isLoading = false;
          this.childComponent?.onFilterAndSortingForEdit(this.selectedCustomerCategory, null);
          this.disableButtonDuringRequest = false;

          this._toasterSrv.showToast(recordDeleted, "success");
        },
        error: () => {
          this.disableButtonDuringRequest = false;
          this.isLoading = false;
          this.closeDialogDelete();
          if (this.errorDialog) this.errorDialog.open = true;
        },
      });
    }

    closeDialogDelete() {
      if (this.deleteDialog) this.deleteDialog.open = false;
    }

    closeDialog() {
      this.isDialogOpen = false;
      (this.form as any).onReset();
    }

    closeErrorDialog() {
      this.errorDialogCustomerCategory.elementRef.nativeElement.open = false;
    }

    onChangeCustomId() {
      this.customIdState = "None";
      this.customIdValueStateText = this.localization.idIsRequired;
    }

    onChangeName(event: any) {
      if (this.selectedCustomerCategory) this.selectedCustomerCategory.name = (event.target as any).value;
    }

}
