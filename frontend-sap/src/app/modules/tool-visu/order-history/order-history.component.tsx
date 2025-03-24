import { Component, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { Button, FlexBox, Icon, ObjectStatus, Text } from '@ui5/webcomponents-react';
import { ProdOrderType } from '@app/shared/enums/ProdOrderType'
import { ProdOrderPosStatus } from '@app/shared/enums/ProdOrderPosStatus'
import moment from 'moment';
import React from 'react';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { ProdOrderPos } from '@app/shared/models/prod-order-pos.model';
import { Localization } from '@app/shared/utils/common-localize';
import { User } from '@app/shared/models/user.model';
import { AuthService } from '@app/shared/services/auth.service';
import { Suppliers } from '@app/shared/models/suppliers.model';
import OperationPlan from '@app/shared/models/operation-plan.model';
import { ODataBatchCall } from '@app/shared/models/odata-batch-call';
import { PermissionEnum } from '@app/shared/enums/PermissionEnum';

@Component({
    selector: 'app-order-history',
    templateUrl: './order-history.component.html',
    styleUrl: './order-history.component.css'
})

export class OrderHistoryComponent implements OnInit {
    isViewDialogOpen = false;
    isAttachmentDialogOpen = false;
    isLoading = false;
    itemId?: number;
    localization = Localization;
	public filePreviewHeight = 629;
    public fileCount: number = 0;
    public selectedOrder= new ProdOrderPos().deserialize({});
    public authUser!: User;
    public hasAuth: boolean = false;
    public userList: User[] = [];
    public supplierList: Suppliers[] = [];
    public operationPlanList: OperationPlan[] = [];

    segmentButtonItems = [{ id: '1', name: $localize`Active Orders` }, { id: '2', name: $localize`Completed Orders` }]
    CUSTOM_BREAKPOINTS = {
        sm: '(min-width: 400px) and (max-width: 767px)',
        md: '(min-width: 768px) and (max-width: 1279px)',
        lg: '(min-width: 1280px) and (max-width: 1536px)',
        xl: '(min-width: 1537px) and (max-width: 2000px)'
    };

    expandQuery = `$select=id,end,is_sampling_required,is_sampling_done,item_id,actual_time,cost,prod_order_id,user_id_creator,status&$expand=media($select=id),userCreator($select=id,name,custom_id),item($select=id,name,custom_id,is_active,is_tool),prodOrder($select=id,custom_id,order_type)`;
    filterQuery = `((status ne '${ProdOrderPosStatus.CLOSED}' and status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.CLOSED}' and status_plan ne '${ProdOrderPosStatus.DELETED}')) and prodOrder/any(s:s/order_type eq '${ProdOrderType.MAINTENANCE}') and (item/any(b:b/is_tool eq true) and item/any(b:b/is_active eq true))`
    @ViewChild("childComponentRef", { static: false }) childComponent: CustomReactGridTable | undefined;

    columns: any = [
        {
            Header: $localize`Order Id`,
            accessor: "prodOrder.custom_id",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.NestedString,
            width: 200
        },
        {
            Header: $localize`No.`,
            accessor: "item.custom_id",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.NestedString,
            width: 200
        },
        {
            Header: $localize`Name`,
            accessor: "item.name",
            disableFilters: true,
            disableGroupBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.NestedString,
            disableSortBy: true,
        },
        {
            Header: $localize`Actual Time`,
            accessor: "actual_time",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.String,
            hAlign: 'End',
            width: 120
        },
        {
            Header: $localize`Cost`,
            accessor: "cost",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.Number,
            hAlign: 'End',
            width: 120
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
            Header: $localize`Completion Date`,
            accessor: "end",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true, 
            isSelected: true,
            dataType: GridTableColumnDataType.Date,
            hAlign: 'End',
            width: 130,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                if(rowData.end !== null) {
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='End'>
                                <Text>{moment(rowData.end).format("DD.MM.YYYY")}</Text>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else return null;
            },
        },
        {
            Header: $localize`Data Entry`,
            accessor: "userCreator.name",
            disableFilters: true,
            isSelected: true,
            dataType: GridTableColumnDataType.NestedString,
            disableGroupBy: true,
            disableSortBy: true,
            width: 150
        },
        {
            Header: $localize`Attachment`,
            accessor: "item_id",
            hAlign: 'Start',
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.Number,
            width: 120,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;

                let totalAttachments: any[] = [...rowData.media];
                if (totalAttachments.length > 0) {
                    return (
                        <Button
                            id='attachmentView'
                            icon="attachment"
                            onClick={() => this.showPreview(rowData.id, totalAttachments.length)}>
                            {totalAttachments.length > 1 ? totalAttachments.length + ' ' + $localize`Files` : totalAttachments.length + ' ' + $localize`File`}
                        </Button>
                    );
                } else return null;
            },
        },
        {
            Header: $localize`Action`,
            accessor: "status",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            hAlign: "Center",
            width: 120,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                if(this.hasAuth) {
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Stretch'>
                                <Button id='showViewModalButton' icon="edit" design='Transparent' onClick={() => this.openViewModal(rowData)}></Button>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Stretch'>
                                <Button id='showViewModalButton' icon="show" design='Transparent' onClick={() => this.openViewModal(rowData)}></Button>
                            </FlexBox>
                        </React.StrictMode>
                    );
                }
            },
        },
    ];

    constructor(private breakpointObserver: BreakpointObserver,
        private _commonSrv: CommonService,
        private _toasterSrv: ToastService,
        protected _authSrv: AuthService,
    ) { }

    ngOnInit() {
        this.authUser = this._authSrv.getUser();
        this.breakpointObserver.observe([
            this.CUSTOM_BREAKPOINTS.sm,
            this.CUSTOM_BREAKPOINTS.md,
            this.CUSTOM_BREAKPOINTS.lg,
            this.CUSTOM_BREAKPOINTS.xl,
        ]).subscribe((result: BreakpointState) => {
            if (result.matches) {
                if (result.breakpoints[this.CUSTOM_BREAKPOINTS.sm]) this.filePreviewHeight = 400;
                else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.md]) this.filePreviewHeight = 600;
                else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.lg]) this.filePreviewHeight = 500;
                else if (result.breakpoints[this.CUSTOM_BREAKPOINTS.xl]) this.filePreviewHeight = 629;
            }
        });
        this.loadLists();
    }

    public handleRowDoubleClick = (rowData: any): void => {	
      this.openViewModal(rowData); 
    };
    
    openViewModal(data: any) {
        this.itemId = data.id;
        this.isViewDialogOpen = true;
    }

    closeViewDialog() {
        this.isViewDialogOpen = false;
    }
    isSavedModal(){
        this.isViewDialogOpen = false;
        this.childComponent!.onFilterAndSorting('','','Contain')
    }
    showPreview(id: number, count: number) {
        this.itemId = id;
        this.fileCount = count;
        this.isAttachmentDialogOpen = true;
    }

    segmentButtonChange(event: any) {
        this.hasAuth = false;
        if(this.childComponent?.globalSearchFieldValue){
            this.childComponent.globalSearchFieldValue = ''
            this.childComponent.additionalFilterQuery = ''
        }
        if (event.detail.selectedItems[0].id == "1") {
            this.expandQuery = `$select=id,is_sampling_required,is_sampling_done,end,item_id,actual_time,cost,prod_order_id,user_id_creator,status&$expand=media($select=id),userCreator($select=id,name,custom_id),item($select=id,name,custom_id,is_active,is_tool),prodOrder($select=id,custom_id,order_type)`
            this.filterQuery = `((status ne '${ProdOrderPosStatus.CLOSED}' and status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.CLOSED}' and status_plan ne '${ProdOrderPosStatus.DELETED}')) and prodOrder/any(s:s/order_type eq '${ProdOrderType.MAINTENANCE}') and (item/any(b:b/is_tool eq true) and item/any(b:b/is_active eq true))`
        } else {
            const checkAuth = this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_ORDER_HISTORY_EDIT);
            if(checkAuth) this.hasAuth = true;

            this.expandQuery  =`$select=id,end,is_sampling_required,is_sampling_done,actual_time,cost,item_id,prod_order_id,user_id_creator,status&$expand=media($select=id),userCreator($select=id,name,custom_id),item($select=id,name,custom_id,is_active,is_tool),prodOrder($select=id,custom_id,order_type)`
            this.filterQuery =`(status eq '${ProdOrderPosStatus.CLOSED}' or status_plan eq '${ProdOrderPosStatus.CLOSED}') and prodOrder/any(s:s/order_type eq '${ProdOrderType.MAINTENANCE}') and (item/any(b:b/is_tool eq true) and item/any(b:b/is_active eq true))`
        }

        setTimeout(() => {
            this.childComponent?.onFilterAndSorting("", "", "Contains");
        }, 300);
    }

    closeAttachmentDialog() {
        this.isAttachmentDialogOpen = false
    }

    loadLists() {
        let requests: ODataBatchCall[] = [];
        requests.push(new ODataBatchCall(0, "get", `Users?$select=id,custom_id,name,is_active&$filter=is_active eq true&$top=100000`));
        requests.push(new ODataBatchCall(1, "get", `OperationPlans?$select=id,custom_id, is_imported&$filter=custom_id ne null and is_imported eq false&$expand=operationPlanPos($select=id,name,operation_plan_id)&$top=100000`));
        requests.push(new ODataBatchCall(2, "get", `Suppliers?$select=id,custom_id,name,is_active&$filter=is_active eq true&$top=100000`));
    
        this._commonSrv.post("$batch", { requests }).subscribe({
            next: (response: any) => {
                this.userList = [];
                this.operationPlanList = [];
                this.supplierList = [];
    
                if (response.responses[0]?.body?.value) {
                    this.userList = response.responses[0]?.body?.value
                        .map((elm: User) => new User().deserialize(elm));
                }
    
                if (response.responses[1]?.body?.value) {
                    this.operationPlanList = response.responses[1]?.body?.value?.map((elm: OperationPlan) =>
                        new OperationPlan().deserialize(elm)
                    );
                }
    
                if (response.responses[2]?.body?.value) {
                    this.supplierList = response.responses[2]?.body?.value
                        .map((elm: Suppliers) => new Suppliers().deserialize(elm));
                }
            },
            error: e => { },
        });
    }

    isShowMessage(event: any) {
        this._toasterSrv.showToast(event.message, event.type);
    }
}
