import { Component, ViewChild } from "@angular/core";
import React from "react";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Button, FlexBox, Text } from "@ui5/webcomponents-react";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import moment from "moment";
import { ProdOrderPosBomPos } from "@app/shared/models/prod-order-pos-bom-pos.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Machine } from "@app/shared/models/machine.model";
import { Localization } from "@app/shared/utils/common-localize";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { CommonService } from "@app/shared/services/common.service";

@Component({
	selector: "app-maintenance-history",
	templateUrl: "./maintenance-history.component.html",
	styleUrl: "./maintenance-history.component.css",
})
export class MaintenanceHistoryComponent {
	expandQuery = `$select=id,prod_order_id,item_id,start,end&$expand=item($select=name),bomPos($expand=item($expand=operationPlan;select=id,name,operation_plan_id);select=id,item_id,qty_for_one_parent),prodOrderPosOperations($expand=machine($select=name,id);select=id,name,status,machine_id'),prodOrder`;
    filterQuery = `(prodOrder/any(p:p/order_type eq '${ProdOrderType.MAINTENANCE}') and (prodOrderPosOperations/any(a:a/status eq '${ProdOrderPosOperationStatus.CLOSED}')))`
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	constructor(
		private commonService: CommonService
	) {}

	ngOnInit(): void {
		this.updateRowCount();
	}

	isHistoryDialog: boolean = false;
	maintenanceHistoryTitle: string = $localize`Maintenance History`
	selectedMaintenance: any = "";
	formatedEndDate: string = "";
	formatedStartDate: string = "";
	prodOrderPosBomPos: ProdOrderPosBomPos[] = [];
	prodOrderPosOperation: ProdOrderPosOperation[] = [];
	selectedMachine: Machine = new Machine().deserialize({});
	localization = Localization;
	rowCount: number = 0;
	searchValue: string = "";
	isOnInit: boolean = true;

	columns: any = [
		{
			Header: $localize`Order Id`,
			accessor: "prodOrder.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Left",
			dataType: GridTableColumnDataType.NestedString
		},
		{
			Header: $localize`Start Date`,
			accessor: "start",
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
						<Text>{rowData?.start ? moment(rowData.start).format("DD.MM.YYYY, HH:mm") : null}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`End Date`,
			accessor: "end",
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
							<Text>{rowData?.end ? moment(rowData.end).format("DD.MM.YYYY , HH:mm") : null}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},

		{
			Header: $localize`Action`,
			accessor: "status",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			isSelected: true,
			maxWidth: 90,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox alignItems='Stretch'>
							<Button id='showViewModalButton' icon="show" design='Transparent' onClick={() => this.openViewModal(rowData)}></Button>
						</FlexBox>
					</React.StrictMode>
				);
			},
		}

	];

	bomColumns: any = [
		{
			Header: $localize`Item`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Quantity`,
			accessor: "qty_for_one_parent",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
			minWidth: 80,
		},
	];

	maintenanceColumns: any = [
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
	];
	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}


	processData(data: any) {
		let processedData: any[] = [];
		if (data.length) {			
			processedData = data[0].filter((entry: any) =>
				entry.prodOrderPosOperations.every((op: ProdOrderPosOperation) => op.status === `${ProdOrderPosOperationStatus.CLOSED}`)
			);
		}		
		if (this.childComponent) {			
			this.childComponent.data = processedData;
			if (!this.searchValue) this.childComponent!.filteredDataCount = this.rowCount;
			this.childComponent.render();
		}
	}

	openViewModal(data: any) {
		this.isHistoryDialog = true
		this.selectedMaintenance = data
		this.formatedStartDate = moment(this.selectedMaintenance.start).format("DD.MM.YYYY");
		this.formatedEndDate = moment(this.selectedMaintenance.end).format("DD.MM.YYYY");
		this.prodOrderPosBomPos = data.bomPos;
		this.prodOrderPosOperation = data.prodOrderPosOperations;
		this.selectedMachine = new Machine().deserialize(data?.prodOrderPosOperations[0].machine);
	}

	closeHistoryButton() {
		this.isHistoryDialog = false

	}

	updateRowCount() {
		this.commonService.get(`operation-history-count?$search=${this.searchValue}`, false, true).subscribe({
			next: (res: any) => {
				if (this.isOnInit) this.rowCount = res.count;
				this.isOnInit = false;
				this.childComponent!.filteredDataCount = res.count;
				this.childComponent!.render();
			},
			error: () => {
				this.rowCount = 0;
			},
		});
	}

	onSearchOnChangeInput(value: any) {
		this.searchValue = value;
		this.updateRowCount();
	}
}
