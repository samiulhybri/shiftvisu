import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { CustomerCrmActionLog } from "@app/shared/models/customer-crm-action-log.model";
import { CrmAction } from "@app/shared/models/crm-action.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import React from "react";
import { FlexBox, Text } from "@ui5/webcomponents-react";
import moment from "moment";
import { ComboBoxComponent } from "@ui5/webcomponents-ngx";
import DatePicker from "@ui5/webcomponents/dist/DatePicker";


@Component({
  selector: 'app-crm-action-logs',
  templateUrl: './crm-action-logs.component.html',
  styleUrl: './crm-action-logs.component.css'
})
export class CrmActionLogsComponent {
    private _customer!: any;
  	filterQuery = "";
    @Input() set customer(value:any){
      this._customer = value;
      if (this._customer?.id) {
        this.filterQuery = `customer_id eq ${this._customer.id}`;
      }
    };
    get customer() { return this._customer; }
    @Input() public tableHeight!: string;
    @ViewChild("childComponentRef", { static: false }) childComponent:
    | CustomReactGridTable
    | undefined;
    localization = Localization;
    isLoading: boolean = false;
    disableButtonDuringRequest: boolean = false;
    @Input() isDialogOpen: boolean = false;
    @Output() public closeActivityDialog: EventEmitter<boolean> = new EventEmitter();
    @Input() contact: any;
    @ViewChild("createOrUpdateForm") form?: NgForm;
    customIdValueStateText: string = Localization.invalidEntry;
    customIdState: keyof typeof ValueState = "None";
    dialogTitle: string = "";
    isLoadingCustomId: boolean = false;
    isUpdate?: boolean;
    selectedCCActionLog: CustomerCrmActionLog = new CustomerCrmActionLog().deserialize({});
    cachedCustomId?: string = "";
    selectedId = "";
    customId?: string;
    action_log_date?: string;
    @ViewChild("errorDialogCrmAction", { static: false }) errorDialogCrmAction: any;
    crmActions: CrmAction[] = [];
  	@ViewChild("crmActionsCombobox") crmActionsCombobox!: ComboBoxComponent;
  	@ViewChild("startInput") startInput!: DatePicker;
    @Output() onActionLogCreated: EventEmitter<any> = new EventEmitter();

    columns: any = [
      {
        Header: $localize`User`,
        accessor: "user.name",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
        dataType: GridTableColumnDataType.NestedString,
      },
      {
        Header: $localize`Activity`,
        accessor: "crmAction.name",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
        dataType: GridTableColumnDataType.NestedString,
      },
      {
        Header: $localize`Contact`,
        accessor: "contact",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
        dataType: GridTableColumnDataType.NestedString,
        Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          
          return (
            <React.StrictMode>
              <FlexBox>
                <Text>{`${rowData?.contact?.first_name || ''} ${rowData?.contact?.last_name || ''}`.trim()}</Text>
              </FlexBox>
            </React.StrictMode>
          );
        },
      },
      {
        Header: $localize`Note`,
        accessor: "note",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
      },
      {
        Header: $localize`Date`,
        accessor: "log_date",
        disableFilters: false,
        disableGroupBy: true,
        disableSortBy: false,
        isSelected: true,
        hAlign: "Right",
        dataType: GridTableColumnDataType.Date,
        Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          return (
            <React.StrictMode>
              <FlexBox>
                <Text>{rowData?.log_date.includes(',') ? rowData?.log_date : rowData?.log_date ? moment(rowData.log_date).format("DD.MM.YYYY, HH:mm") : null}</Text>
              </FlexBox>
            </React.StrictMode>
          );
        },
      },
    ];

    constructor(
      private commonService: CommonService,
      public _authService: AuthService,
      public _toasterSrv: ToastService
    ) { }

    ngOnInit(): void {
      this.loadData();
    }

    loadData() {
      let requests: ODataBatchCall[] = [];
      requests.push(
        new ODataBatchCall(
          0,
          "get",
          `CrmActions?$orderby=sort_order asc`
        )
      );
      this.commonService.post("$batch", { requests }).subscribe({
        next: (response: any) => {
          this.crmActions = response.responses[0]?.body?.value?.map((crmAction: CrmAction) =>
            new CrmAction().deserialize(crmAction)
          );

          if (this.childComponent) {
            this.columns[1].comboBoxValues = this.crmActions;
          }
        },
        error: e => { },
      });
    }

  
    newButtonClick() {
      this.dialogTitle = this.localization.add;
      this.isDialogOpen = true;
      this.isUpdate = false;
      this.customIdState = "None";
      this.disableButtonDuringRequest = false;
      this.selectedCCActionLog = new CustomerCrmActionLog().deserialize({'log_date':moment(new Date()).format("DD.MM.YYYY, HH:mm")});
    }
  
    editClick(value: any): void {
      console.log(value.log_date);
      
      this.isDialogOpen = true;
      this.isUpdate = true;
      this.dialogTitle = this.localization.edit;
      this.customIdState = "None";
      value.log_date = value?.log_date.includes(',') ? value?.log_date : moment(value.log_date).format("DD.MM.YYYY, HH:mm");
      this.selectedCCActionLog = this.selectedCCActionLog?.deserialize(value);
      this.disableButtonDuringRequest = false;
    }
  
    onSubmit(form: NgForm) {
      if (!form.valid || !this.checkAllRequiredComboboxes() || !this.checkDatepickerValidity()) {
        this.disableButtonDuringRequest = false;
        return;
      }

      this.selectedCCActionLog.user_id = this._authService.getUser().id;
      this.selectedCCActionLog.customer_id = this.customer.id;

      this.onCreateOrUpdate();
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
      this.commonService.delete(`/CustomerCrmActionLogs(${this.selectedId})`).subscribe({
        next: () => {
          this.closeDialogDelete();
          this.isLoading = false;
          this.filterHandler();
          this.disableButtonDuringRequest = false;
          this._toasterSrv.showToast(recordDeleted, "success");
        },
        error: err => {
          this.closeDialogDelete();
          this.disableButtonDuringRequest = false;
          this.isLoading = false;
          this.errorDialogCrmAction.elementRef.nativeElement.open = true;
        },
      });
    }
  
  async onCreateOrUpdate() {
      this.isLoading = true;
      if (this.contact) {
          this.selectedCCActionLog.contact = this.contact;
      }
      const payload = this.selectedCCActionLog?.toOdata();
      const method = this.isUpdate ? "put" : "post";
      const urlString = this.isUpdate
        ? `CustomerCrmActionLogs(${this.selectedCCActionLog?.id})`
        : `CustomerCrmActionLogs`;
      this.commonService[method](urlString, payload).subscribe({
        next: (response: any) => {
          const { recordSavedSuccessfully } = Localization;
          this._toasterSrv.showToast(recordSavedSuccessfully, "success");
          this.isLoading = false;
          this.isDialogOpen = false;
          this.filterHandler();
          (this.form as any).onReset();
          this.disableButtonDuringRequest = false;
          this.closeActivityDialog.emit(true);                    
          // Emit event
          if (!this.isUpdate) this.onActionLogCreated.emit({...response, crmAction: this.selectedCCActionLog.crmAction});
        },
        error: () => {
          this.disableButtonDuringRequest = false;
          this.isLoading = false;
          this.errorDialogCrmAction.elementRef.nativeElement.open = true;
        },
      });
    }
  
    public filterHandler(
      fieldName: string = "",
      value: string = "",
      filterOperator: string = "Contain"
    ) {
      this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
    }
  
  
  closeDialog() {
      this.closeActivityDialog.emit(true);
      this.isDialogOpen = false;
      this.crmActionsCombobox.element.valueState = "None";
      (this.form as any).onReset();
    }
  
    closeErrorDialog() {
      this.errorDialogCrmAction.elementRef.nativeElement.open = false;
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

	onChangeCrmAction(event: any) {
		if (this.selectedCCActionLog?.crmAction)
			this.selectedCCActionLog.crmAction = new CrmAction().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	checkAllRequiredComboboxes(): boolean {
    console.log(this.startInput);
    
		if (!this.crmActionsCombobox.element.value) {
			this.crmActionsCombobox.element.valueState = "Negative";
			return false;
		} else {
			this.crmActionsCombobox.element.valueState = "None";
		}
		return true;
	}
  checkDatepickerValidity(): boolean {
    const datepicker = this.startInput as any; // Reference to DatePicker
    const dateValue = datepicker.value;
  
    if (!dateValue) {
      datepicker.valueState = "Negative";
      datepicker.valueStateMessage = "Date is required.";
      return false;
    }
  
    // Validate Date Format (dd.MM.yyyy , HH:mm)
    const dateFormatRegex = /^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}$/;
    if (!dateFormatRegex.test(dateValue)) {
      datepicker.valueState = "Negative";
      datepicker.valueStateMessage = "Invalid date format. Use dd.MM.yyyy, HH:mm.";
      return false;
    }
  
    // Reset value state if valid
    datepicker.valueState = "None";
    return true;
  }
  
  preventKeys(event: KeyboardEvent) {
    const isNumberKey = (event.key >= "0" && event.key <= "9");
    if(event.key === 'Backspace' || !isNumberKey || event.key === 'Delete') {
      event.preventDefault();
    }
  }
	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}
}
