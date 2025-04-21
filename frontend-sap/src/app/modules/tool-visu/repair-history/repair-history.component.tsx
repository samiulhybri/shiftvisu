import { Component, Input, ViewChild } from '@angular/core';
import { CustomReactGridTable, GridTableColumnDataType } from '@app/shared/components/CustomGridTable';
import { ProdOrderType } from '@app/shared/enums/ProdOrderType';
import { ProdOrderPosStatus } from '@app/shared/enums/ProdOrderPosStatus';
import { FlexBox, Button, Text, ObjectStatus, Icon } from '@ui5/webcomponents-react';
import moment from 'moment';
import React from 'react';
import { ProdOrderPos } from '@app/shared/models/prod-order-pos.model';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { ProdOrderPosOperation } from '@app/shared/models/prod-order-pos-operation.model';

@Component({
  selector: 'app-repair-history',
  templateUrl: './repair-history.component.html',
  styleUrl: './repair-history.component.css'
})
export class RepairHistoryComponent {
  @ViewChild("childComponentRef", { static: false }) childComponent:
    | CustomReactGridTable
    | undefined;
  public selectedToolFromOverviewComponent?: any;
  @Input() public set item(dataItem: any) {
    this.selectedToolFromOverviewComponent = dataItem ? dataItem : undefined
  }
  processDataSet: any = [];
  isViewDialogOpen = false;
  isLoading = false;
  itemId?: number;
  public selectedOrder!: ProdOrderPos;
  extendQuery = `$filter=(item/any(s:s/is_active eq true) and item/any(b:b/is_tool eq true)) and ((status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}'))&$select=id,status_plan,status,item_id,prod_order_id,start&$expand=prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($select=id,name,prod_order_pos_id,is_repair_completed,repair_completed_date,operation_plan_id_origin,operation_plan_pos_id_origin,is_automatic_created_repair;$expand=user(id,name),operationPlan($select=id,custom_id),operationPlanPos($select=id,operation_plan_id,name)),item($select=id,custom_id,name,is_tool,operation_plan_id)`

  columns: any = [
    {
      Header: $localize`Auto Repair`,
      accessor: "is_automatic_created_repair",
      hAlign: "Center",
      isSelected: true,
      dataType: GridTableColumnDataType.Boolean,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      minWidth: 150,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { cell, row, webComponentsReactProperties } = instance;
        const rowData = row.original;
        const operations = rowData.prodOrderPosOperation;
        let isAutoRepairFound: boolean = operations ? operations.is_automatic_created_repair == true : false;

        return (
          <React.StrictMode>
            <FlexBox>
              <Icon name={isAutoRepairFound ? "accept" : "decline"} />
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Order No.`,
      accessor: "prodOrderPosOperation.res.prodOrder.custom_id",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'Start',
      maxWidth: 150,
      dataType: GridTableColumnDataType.String,
    },
    {
      Header: $localize`Tool No.`,
      accessor: "prodOrderPosOperation.res.item.custom_id",
      // minWidth: 184,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'Start',
      dataType: GridTableColumnDataType.String,
    },
    {
      Header: $localize`Repair Type`,
      accessor: "custom_id",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      minWidth: 150,
      dataType: GridTableColumnDataType.String,
    },
    {
      Header: $localize`Repair`,
      accessor: "prodOrderPosOperation.name",
      // minWidth: 184,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: false,
      dataType: GridTableColumnDataType.String,
    },
    {
      Header: $localize`Date`,
      accessor: "prodOrderPosOperation.res.start",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'End',
      maxWidth: 120,
      dataType: GridTableColumnDataType.Date,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='End'>
              <Text>{rowData?.prodOrderPosOperation?.res?.start ? moment(rowData.prodOrderPosOperation.res.start).format("DD.MM.YYYY") : null}</Text>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Complete`,
      accessor: "prodOrderPosOperation.is_repair_completed",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'Center',
      minWidth: 100,
      dataType: GridTableColumnDataType.Boolean,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='Stretch'>
              <Icon name={rowData?.prodOrderPosOperation?.is_repair_completed ? "accept" : "decline"} />

            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Complete Date`,
      accessor: "prodOrderPosOperation.repair_completed_date",
      maxWidth: 120,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'End',
      dataType: GridTableColumnDataType.Date,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='End'>
              <Text>{rowData?.prodOrderPosOperation?.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format("DD.MM.YYYY") : null}</Text>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Complete By`,
      accessor: "prodOrderPosOperation.user.name",
      minWidth: 200,
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'End',
      dataType: GridTableColumnDataType.String,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='End'>
              <Text>{rowData?.prodOrderPosOperation?.user ? rowData.prodOrderPosOperation.user.name : null}</Text>
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
    {
      Header: $localize`Action`,
      accessor: "ac",
      disableFilters: true,
      disableGroupBy: true,
      disableSortBy: true,
      hAlign: 'Center',
      maxWidth: 100,
      Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
        const { row } = instance;
        const rowData = row.original;
        return (
          <React.StrictMode>
            <FlexBox alignItems='Stretch'>
              {<Button id='showViewModalButton' icon="show" design='Transparent' onClick={() => this.openViewModal(rowData?.prodOrderPosOperation?.res?.id)}></Button>}
            </FlexBox>
          </React.StrictMode>
        );
      },
    },
  ];
  constructor(
    private _commonSrv: CommonService,
    private _toasterSrv: ToastService
  ) { }
  ngOnChanges(changes: any) {
    this.extendQuery = `$filter=(item/any(s:s/id eq ${this.selectedToolFromOverviewComponent?.id})) and ((status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}'))&$select=id,status_plan,status,item_id,prod_order_id,start&$expand=prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($select=id,name,prod_order_pos_id,is_repair_completed,repair_completed_date,operation_plan_id_origin,operation_plan_pos_id_origin,is_automatic_created_repair;$expand=user(id,name),operationPlan($select=id,custom_id),operationPlanPos($select=id,operation_plan_id,name)),item($select=id,custom_id,name,is_tool,operation_plan_id)`
  }
  openViewModal(id: any) {
    this.itemId = id;
    this.isViewDialogOpen = true;

  }
  closeViewDialog() {
    this.isViewDialogOpen = false;
  }
  isSavedModal() {
    this.isViewDialogOpen = false;
    this.childComponent!.onFilterAndSorting('', '', 'Contain')
  }
  processData(data: any) {

    const gridData = this.childComponent?.data;
    gridData?.forEach((res: any) => {
      res?.prodOrderPosOperations?.forEach((op: any) => {
        op.prodOrder = { ...op.prodOrder }
        if (op.operationPlan) {
          op.operationPlan.prodOrderPosOperation = { ...op, res, operationPlan: undefined, operationPlanPos: undefined };
          this.processDataSet.push(op.operationPlan)
        }
      })
    });
    if (this.childComponent) {
      this.childComponent.data = this.processDataSet || [];
      this.childComponent.render()
    }
  }
}
