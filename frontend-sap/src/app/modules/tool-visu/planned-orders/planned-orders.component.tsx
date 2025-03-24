import { Component, ViewChild } from '@angular/core';
import { Button, CheckBox, FlexBox, Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import moment from 'moment';
import React from 'react';
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { User } from "@app/shared/models/user.model";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import { ODataBatchCall } from '@app/shared/models/odata-batch-call';
import { OperationPlan } from '@app/shared/models/operation-plan';
import { ProdOrderType } from '@app/shared/enums/ProdOrderType';
import { ProdOrderPosStatus } from '@app/shared/enums/ProdOrderPosStatus';
import { RepairDetailsComponent } from '@app/modules/tool-visu/shared/repair-details/repair-details.component';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { RepairTreeComponent } from '@app/modules/tool-visu/shared/repair-tree/repair-tree.component';
import BusyIndicator from '@ui5/webcomponents/dist/BusyIndicator';
import { Localization } from '@app/shared/utils/common-localize';
import { AuthService } from '@app/shared/services/auth.service';
import bwipjs from 'bwip-js';
import { environment } from '@app/environments/environment';
import { PermissionEnum } from '@app/shared/enums/PermissionEnum';
import { Suppliers } from '@app/shared/models/suppliers.model';

@Component({
  selector: 'app-planned-orders',
  templateUrl: './planned-orders.component.html',
  styleUrl: './planned-orders.component.css'
})
export class PlannedOrdersComponent {
  @ViewChild("repairDetailsTable", { static: false }) childComponentDetailsTable: RepairDetailsComponent | undefined;
  @ViewChild("childComponentRef", { static: false }) childComponent: CustomReactGridTable | undefined;
  @ViewChild("childComponentRefOtherRepairTable", { static: false }) childComponentRefOtherRepairTable: CustomReactGridTable | undefined;
  @ViewChild("treeComponent", { static: false }) treeComponent: RepairTreeComponent | undefined;
  @ViewChild("isTypeOfRepairLoadingView", { static: false }) isTypeOfRepairLoadingView: BusyIndicator | undefined;

  private authUser!: User;
  public hasAuth: boolean = true;
  isViewDialogOpen = false;
  isLoading: boolean = false;
  isAttachmentDialogOpen = false;
  filePreviewHeight = 745;
  isEditDialogOpen = false;
  selectedActiveRepair?: ProdOrderPos;
  operationPlanList: any[] = [];
  otherRepairList: any[] = [];
  allOperationPlanList = [];
  ProdOrderType = ProdOrderType;
  userList: User[] = [];
  supplierList: Suppliers[] = [];
  itemId?: number
  isSaveProdOrderPos: boolean = false;
  isTypeOfRepairLoading: boolean = false;
  typeOfRepairTreeTableData: any = []
  otherRepairTableData: any = []
  idDeleteModalOpen = false;
  isDeleteLoading = false;
  minRows = 7;
  isTreeTableShow = true;
  localization = Localization;
  isOtherRepairTableTableShow = true;
  tableTitle: string = $localize`Repair Type`;
  selectedRow:any;
  isRemarkModal:boolean = false;
  orderNote = '';
  barcodeSvg: any;
  clientName = environment.clientName ?? ''
  query = `(item/any(s:s/is_active eq true) and item/any(b:b/is_tool eq true)) and (prodOrder/any(x:x/order_type eq '${ProdOrderType.MAINTENANCE}')) and ((status ne '${ProdOrderPosStatus.CLOSED}' and status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.CLOSED}' and status_plan ne '${ProdOrderPosStatus.DELETED}'))&$select=id,is_sampling_required,is_sampling_done,notes,label,status,actual_time,cost,status_plan,is_production_possible,item_id,prod_order_id,start,release_date,user_id_creator,user_id_responsible,supplier_id_tool&$expand=media($select=id),prodOrder($select=id,custom_id,order_type),item($select=custom_id,is_tool,name, height, width, length, total_weight),userResponsible($select=id,name)`

  columns: any = [
    {
      Header: $localize`Order No.`,
      accessor: "prodOrder.custom_id",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.NestedString,
      width:200
    },
    {
      Header: $localize`No.`,
      accessor: "item.custom_id",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.NestedString,
      width: 200
    },
    {
      Header: $localize`Name`,
      accessor: "item.name",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.NestedString,
      width:200
    },
    {
      Header: $localize`Start Date`,
      accessor: "start",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.Date,
      hAlign: 'End',
      width: 130,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='End'>
              <Text>{rowData.start ? moment(rowData.start).format("DD.MM.YYYY"): null}</Text>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Attachment`,
      accessor: "status",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      width: 100,
      isSelected: true,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;

        let totalAttachments: any[] = [];
        totalAttachments = [...totalAttachments, ...rowData.media]
        if (totalAttachments.length > 0) {
          return (
            <Button
              icon="attachment"
              onClick={() => this.showPreview(rowData.id)}>
              {totalAttachments.length > 1 ? `${totalAttachments.length} ${$localize`Files`}` : `${totalAttachments.length} ${$localize`File`}`}
            </Button>
          );
        } else return null;
      },
    },
    {
      Header: $localize`Planned Production`,
      accessor: "release_date",
      dataType: GridTableColumnDataType.Date,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      hAlign: 'End',
      width: 172,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='End'>
              <Text>{rowData.release_date ? moment(rowData.release_date).format("DD.MM.YYYY") : null}</Text>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Responsible`,
      accessor: "userResponsible.name",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.NestedString,
      width:200
    },
    {
      Header: $localize`Repair Type`,
      accessor: "status_plan",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      width: 123,
      hAlign: "Center",
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='Center'>
              <Button id="viewModalButton" onClick={() => this.openEditOrVIewModal(rowData, 'view')} design='Transparent'>{$localize`View`}</Button>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Production`,
      accessor: "is_production_possible",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      dataType: GridTableColumnDataType.Boolean,
      width: 215,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox>
              <ObjectStatus showDefaultIcon state={rowData.is_production_possible ? ValueState.Positive : ValueState.Negative}
                style={{
                  width: '160px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '12px',
                  backgroundColor: rowData.is_production_possible ? 'var(--production-lite-color)' : 'var(--standstill-lite-color)',
                  color: rowData.is_production_possible ? 'var(--status-true-text-color)' : 'var(--status-false-text-color)',
                  border: 'var(--status-border-color)',
                  padding: '5px 8px 5px 8px',
                  borderRadius: '8px',
                  fontWeight: 700
                }}>
                <div style={{ display: 'flex', alignItems: 'center', height: '12px' }}>{rowData.is_production_possible ? $localize`Possible` : $localize`Not Possible`}</div>
              </ObjectStatus>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Sampling required`,
      accessor: "is_sampling_required",
      width: 120,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      dataType: GridTableColumnDataType.Boolean,
      hAlign: 'Center',
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='Stretch'>
               {rowData?.is_sampling_required ? <Icon name={rowData?.is_sampling_required ? "accept": "decline"}/> : null}

            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Sampling done`,
      accessor: "is_sampling_done",
      width: 120,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      dataType: GridTableColumnDataType.Boolean,
      hAlign: 'Center',
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='Stretch'>
              {rowData?.is_sampling_required ? <Icon name={rowData?.is_sampling_done ? "accept": "decline"}/>: null}

            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Remarks`,
      accessor: "notes",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      dataType: GridTableColumnDataType.String,
      width: 80,
      hAlign: 'Center',
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox>
            <Button design='Transparent' icon='hint' onClick={() => this.openNoteModal(rowData.notes)}></Button>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Actual Time`,
      accessor: "actual_time",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.String,
      hAlign: 'End',
    },
    {
      Header: $localize`Cost`,
      accessor: "cost",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      isSelected: true,
      dataType: GridTableColumnDataType.Number,
      hAlign: 'End',
    },
    {
      Header: $localize`Action`,
      accessor: "pos",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      isSelected: true,
      hAlign: "Center",
      width: 120,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        
        return (
          <React.StrictMode>
            <FlexBox alignItems='Stretch'>
              <Button design='Transparent' icon={this.hasAuth ? 'edit' : 'show'} onClick={() => this.openEditOrVIewModal(rowData, 'edit')}></Button>
              <Button design='Transparent' icon="print" onClick={() => this.openPrintModal(rowData)}></Button>
              <Button design='Transparent' icon="delete" onClick={() => this.openDeleteModal(rowData)} disabled={this.hasAuth ? false : true}></Button>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
  ];

  treeViewcolumns: any = [
    {
      Header: $localize`Repair Type`,
      accessor: 'custom_id',
      autoResizable: true,
      headerTooltip: 'Name',
      disableFilters: true,
    },
    {
      Header: $localize`Repair`,
      accessor: 'name',
      autoResizable: true,
      headerTooltip: 'Name',
      disableFilters: true,
    },
    {
      Header: $localize`Completed`,
      headerTooltip: $localize`Completed`,
      accessor: 'is_repair_completed',
      autoResizable: true,
      hAlign: "Center",
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          return (
              <React.StrictMode>
                  <FlexBox alignItems='Center'>
                      {rowData.pos ? <CheckBox
                          text=""
                          valueState="None"
                          disabled={true}
                          checked={rowData.prodOrderPosOperation.is_repair_completed}
                      /> : null}
                  </FlexBox>
              </React.StrictMode>
          );
      },
  },
  {
      Header: $localize`Completed Date`,
      headerTooltip: $localize`Completed`,
      accessor: 'repair_completed_date',
      autoResizable: true,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          return (
              <React.StrictMode>
                  <FlexBox alignItems='Stretch'>
                      {rowData.pos && rowData.prodOrderPosOperation.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format('DD.MM.YYYY') : null}
                  </FlexBox>
              </React.StrictMode>
          );
      },
  },
  {
    Header: $localize`Completed By`,
    headerTooltip: $localize`Completed`,
    accessor: 'user.name',
    autoResizable: true,
    Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
            <React.StrictMode>
                <FlexBox alignItems='Stretch'>
                    {rowData.pos && rowData.prodOrderPosOperation.user ? rowData.prodOrderPosOperation.user.name  : null}
                </FlexBox>
            </React.StrictMode>
        );
    },
}

  ]
  otherRepairColumns: any = [
    {
      Header: $localize`Repair Type`,
      accessor: "custom_id",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
    },
    {
      Header: $localize`Repair`,
      accessor: "prodOrderPosOperation.name",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'End',
    },
    {
      Header: $localize`Completed`,
      headerTooltip: $localize`Completed`,
      accessor: 'is_repair_completed',
      hAlign: 'Center',
      autoResizable: true,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          return (
              <React.StrictMode>
                  <FlexBox alignItems='Center'>
                      <CheckBox
                          text=""
                          disabled={true}
                          checked={rowData.prodOrderPosOperation.is_repair_completed}
                          valueState="None"
                      />
                  </FlexBox>
              </React.StrictMode>
          );
      },
  },
  {
          Header: $localize`Completed Date`,
          headerTooltip: $localize`Completed`,
          accessor: 'repair_completed_date',
          autoResizable: true,
          Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
              const { row } = instance;
              const rowData = row.original;
              return (
                  <React.StrictMode>
                      <FlexBox alignItems='Stretch'>
                          {rowData.prodOrderPosOperation.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format('DD.MM.YYYY') : null}
                      </FlexBox>
                  </React.StrictMode>
              );
          },
  },
    {
      Header: $localize`Completed By`,
      headerTooltip: $localize`Completed`,
      accessor: 'prodOrderPosOperation.user.name',
      autoResizable: true,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
          const { row } = instance;
          const rowData = row.original;
          return (
              <React.StrictMode>
                  <FlexBox alignItems='Stretch'>
                      {rowData.prodOrderPosOperation.is_repair_completed && rowData.prodOrderPosOperation.user ? rowData.prodOrderPosOperation.user.name  : null}
                  </FlexBox>
              </React.StrictMode>
          );
      },
    }

  ]
  CUSTOM_BREAKPOINTS = {
    sm: '(min-width: 400px) and (max-width: 767px)',
    md: '(min-width: 768px) and (max-width: 1279px)',
    lg: '(min-width: 1280px) and (max-width: 1536px)',
    xl: '(min-width: 1537px) and (max-width: 2000px)'
  };

  constructor(private breakpointObserver: BreakpointObserver, private _commonService: CommonService, protected _toastSrv: ToastService, private _authSrv: AuthService) { }

  ngOnInit() {
    this.authUser = this._authSrv.getUser();
    const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') || 
                      this.authUser.roleString?.includes('ADMIN_TOOLVISU') ||
                      this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_PLANNED_ORDERS_EDIT);
    if(checkAuth) this.hasAuth = true;
    else this.hasAuth = false;

    this.loadLists();

    this.breakpointObserver.observe([
      this.CUSTOM_BREAKPOINTS.sm,
      this.CUSTOM_BREAKPOINTS.md,
      this.CUSTOM_BREAKPOINTS.lg,
      this.CUSTOM_BREAKPOINTS.xl,
    ]).subscribe((result: BreakpointState) => {

      if (result.matches) {
        if (result.breakpoints[this.CUSTOM_BREAKPOINTS.sm]) {
          this.filePreviewHeight = 400;
        } else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.md]) {
          this.filePreviewHeight = 600;

        } else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.lg]) {
          this.filePreviewHeight = 500;
        } else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.xl]) {
          this.filePreviewHeight = 745;
        }
      }
    });
  }
  generateBarcode(value: string): void {
    try {
      // Generate barcode using bwip-js
      this.barcodeSvg = bwipjs.toSVG({
        bcid: 'code128', // Barcode type
        text: value,    // Data to encode
        scale: 1,       // Scaling factor
        height: 6,
        includetext: true, // Include human-readable text
        textxalign: 'center', // Align text to center
        textsize: 1
      });
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  }
  loadLists() {
    let requests: ODataBatchCall[] = [];
    requests.push(new ODataBatchCall(0, "get", `Users?$select=id,name,username,custom_id&$filter=is_active eq true&$top=100000`));
    requests.push(new ODataBatchCall(1, "get", `OperationPlans?$select=id,custom_id&$filter=custom_id ne null&$top=100000`));
    requests.push(new ODataBatchCall(1, "get", `Suppliers?$select=id,name,custom_id&$filter=is_active eq true&$top=100000`));

    this._commonService.post("$batch", { requests }).subscribe({
      next: (response: any) => {
        this.userList = response.responses[0]?.body?.value.map((elm: User) => {
          return new User().deserialize(elm);
        })
        this.allOperationPlanList = [];
        if (response.responses[1]?.body?.value) {
          this.allOperationPlanList = response.responses[1]?.body?.value?.map((elm: OperationPlan) =>
            new OperationPlan().deserialize(elm)
          );
        }
        this.supplierList = response.responses[2]?.body?.value.map((elm: Suppliers) => {
          return new Suppliers().deserialize(elm);
        })
      },
      error: e => { },
    });
  }
  openNoteModal(note:any){
    this.isRemarkModal = true;
    this.orderNote = note;
  }
  openDeleteModal(selectedRowData:any){
    this.idDeleteModalOpen = true;
    this.selectedRow = selectedRowData;
  }
  DeleteThisOrder(){
    this._commonService.put(`ProdOrderPos(${this.selectedRow.id})`, {status: ProdOrderPosStatus.DELETED, status_plan:ProdOrderPosStatus.DELETED}).subscribe({
      next:()=>{
        this.closeDialog('delete')
        this._toastSrv.showToast(this.localization.recordDeleted, 'success');
        this.selectedRow = undefined
        this.filterHandler();
      },
      error:()=>{
        this._toastSrv.showToast(this.localization.someThingWentWrong, 'error-toaster');
        this.closeDialog('delete')
      }
    })

  }
  closeDialog(type='view') {
    this.isViewDialogOpen = false;
    if(type== 'delete'){
      this.selectedRow = undefined
      this.idDeleteModalOpen = false;
    }
    if(type = 'remark'){
      this.isRemarkModal = false;
    }
  }

  showPreview(itemId: number) {
    this.itemId = itemId
    this.isAttachmentDialogOpen = true;
  }
  openPrintModal(data:any){
    this.generateBarcode(data.item.custom_id)
    fetch('assets/view/plannedOrderPrint.html').then(response => response.text()).then(content => {
    var iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    document.body.appendChild(iframe);
    let changeData = [
      {
          key:'valueClientName',
          value: this.clientName
      },
      {
          key:"valuePresentDate",
          value: moment().format('D. MMMM YYYY')
      },
      {
          key:'titleOrderNr',
          value: $localize `Tool Order Nr.`
      },
      {
          key:'valueOrderNr',
          value: data.prodOrder.custom_id
      },
      {
          key:'titleRepairStartDate',
          value: $localize `Repair Start-Date`
      },
      {
          key:'valueRepairStartDate',
          value: moment(data.start).format("DD.MM.YYYY")
      },
      {
          key:'titleRepairEndDate',
          value: $localize `Repair End-Date`
      },
      {
          key:'valueRepairEndDate',
          value: ''
      },
      {
          key:'barcodeSvg',
          value: this.barcodeSvg
      },
      {
          key:'ToolName',
          value: data.item.name
      },
      {
          key:'titleToolNr',
          value: $localize `Machine/Tool-Nr.`
      },
      {
          key:'valueToolNr',
          value: data.item.custom_id
      },
      {
          key:'titleToolCalculation',
          value: $localize `Mass(L x W x H)`
      },
      {
          key:"valueLenghtWidthHeight",
          value: `${data.item.length ? data.item.length : 0} x ${data.item.width ? data.item.width : 0} x
                            ${data.item.height ? data.item.height : 0}`,
      },
      {
          key:'titleTotalWeight',
          value: $localize `Weight(kg)`
      },
      {
          key:'valueTotalWeight',
          value: `${data.item.total_weight ? data.item.total_weight : 0}`
      },
      {
          key:'titleRessGrp',
          value:$localize `Nr.Ress.-Gruppe`
      },
      {
          key:'titleRessNr',
          value: $localize `Ressourcennr.`
      },
      {
          key:'titleIsProduction',
          value: $localize `Prod. Stop`
      },
      {
          key: 'valueIsProductionPossible',
          value: data.is_production_possible ? $localize `No` : $localize `Yes`
      },
      {
          key:'titleLabelExternal',
          value: $localize `Label External`
      },
      {
          key:'valueLabelExternal',
          value: data.label == 'INTERNAL' ? $localize `No` : $localize `Yes`
      },
      {
          key:'titleSuppliers',
          value: $localize `Suppliers`
      },
      {
          key:'titleContactRef',
          value: $localize `Contract Ref.`
      },
      {
          key:'titleRemarks',
          value: $localize `Remarks:`
      },
      {
          key:'valueRemarks',
          value: data.notes
      },
      {
          key:'titleCompletedBy',
          value: $localize `Completed By:`
      },
      {
          key:'titleTime',
          value: $localize `at:`
      },
    ]
    changeData.forEach(f=>{
      content = content.replace(f.key,f.value)
    })
    var iframeDocument = iframe.contentDocument || iframe?.contentWindow?.document;
    iframeDocument?.open();
    iframeDocument?.write(content)
    iframeDocument?.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    document.body.removeChild(iframe);
    }).catch(error => console.error('Error reading the file:', error));
  }
	openEditOrVIewModal(repair: any, modalType: string) {
		if (modalType == "view") {
			this.typeOfRepairTreeTableData = [];
			this.otherRepairTableData = [];
			this.isViewDialogOpen = true;
      this.isTypeOfRepairLoadingView!.active = true;
      this._commonService
			.get(
				`ProdOrderPos/${repair.id}?$select=id,notes,estimated_hours,label,prod_order_id,item_id,user_id_creator,user_id_responsible,start,created_at,updated_at,status,release_date,is_production_possible,supplier_id_tool&$expand=prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($select=id,user_id,name,prod_order_pos_id,operation_plan_pos_id_origin,operation_plan_id_origin,is_repair_completed,repair_completed_date;$expand=operationPlan,user($select=id,name),operationPlanPos($select=id,name,operation_plan_id,pos)),item($select=id,name,custom_id),userCreator($select=id,name),userResponsible($select=id,name),toolSupplier($select=id,name)`
			).subscribe({
        next: async(res:any)=>{
          res.prodOrderPosOperations!.forEach((op: any) => {
            if(!op.operation_plan_id_origin && !op.operation_plan_pos_id_origin) return;
            if(!op.operationPlanPos){              
              op.operationPlan.prodOrderPosOperation = {
                ...op,
                operationPlan: undefined,
                operationPlanPos: undefined,
              };
              this.otherRepairTableData.push(op.operationPlan);
            }else{
              const opPlan = this.typeOfRepairTreeTableData.find(
                  (p: any) => p?.id == op?.operationPlan?.id
                )
                if (!opPlan && op.operationPlan){
                  op.operationPlan.prodOrderPosOperation = {
                    ...op,
                    operationPlan: undefined,
                    operationPlanPos: undefined,
                    name: undefined,
                  };
                  this.typeOfRepairTreeTableData.push(op.operationPlan)
                }
            }
          });
    
          res.prodOrderPosOperations!.forEach((op: any) => {
            if (!op.operationPlanPos) return;
            op.operationPlanPos.prodOrderPosOperation = {
              ...op,
              operationPlan: undefined,
              operationPlanPos: undefined,
            };
    
            const opPlan2 = this.typeOfRepairTreeTableData.find(
              (p: any) => p?.id == op.operationPlanPos?.operation_plan_id
            );
            if (opPlan2 && !opPlan2?.operationPlanPos) {
              opPlan2.operationPlanPos = [];
            }
    
            if (opPlan2) {
              const operationPlanPosTemp = opPlan2!.operationPlanPos!.find(
                (k: any) => k.id == op.operationPlanPos.id
              );
              if (!operationPlanPosTemp)
                opPlan2!.operationPlanPos!.push(op.operationPlanPos);
            }
          });
          if (this.typeOfRepairTreeTableData.length == 0)
          	this.isTreeTableShow = false;
          else this.isTreeTableShow = true;
          if (this.otherRepairTableData.length == 0)
          	this.isOtherRepairTableTableShow = false;
          else this.isOtherRepairTableTableShow = true;
    
          this.treeComponent?.render();
          this.childComponentRefOtherRepairTable?.render();
          this.isTypeOfRepairLoadingView!.active = false;
        }
      })
		}else{
      this.isSaveProdOrderPos = false;
      this.selectedActiveRepair = repair
		  this.isEditDialogOpen = true;
    }
	}
  public handleRowDoubleClick = (rowData: any): void => {	
    const modalType = this.hasAuth ? 'edit' : 'show'; 
    this.openEditOrVIewModal(rowData, modalType); 
  };
  closeUpdateDialog() {
    this.isEditDialogOpen = false;
    if (this.isSaveProdOrderPos) this.filterHandler();
    this.selectedActiveRepair = undefined
  }
  filterHandler(fieldName: string = "", value: string = "", filterOperator: string = "Contain") {
    this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
  }
  isSavedModal() {
    this.isSaveProdOrderPos = true;
  }
  closeAttachmentDialog() {
      this.isAttachmentDialogOpen = false
  }
}
