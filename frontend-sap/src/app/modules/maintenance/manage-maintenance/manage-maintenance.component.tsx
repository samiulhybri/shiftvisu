import { Component, ViewChild, Output, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { OperationPlanPos } from "@app/shared/models/operation-plan-pos";
import BomPos from "@app/shared/models/bom-pos.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { Machine } from "@app/shared/models/machine.model";
import { Item } from "@app/shared/models/item.model";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import React from "react";
import { FlexBox, Text } from "@ui5/webcomponents-react";
import moment from "moment";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { formatDate } from "@app/shared/utils/date-time-formatter";

@Component({
	selector: "app-manage-maintenance",
	templateUrl: "./manage-maintenance.component.html",
	styleUrl: "./manage-maintenance.component.css",
})
export class ManageMaintenanceComponent {
	isDialogOpen: boolean = false;
	dialogTitle: string = "";
	disableButtonDuringRequest = false;
	isValueHelpDialog: boolean = false;
	isWarningDialog: boolean = false;
	bomDialogTitle: string = $localize`Add BOM`;
	maintenanceDialogTitle: string = $localize`Add Maintenance`;
	selectedMaintenanceAfterSaving: OperationPlan = new OperationPlan().deserialize({});
	selectedMachineAfterSaving: Machine = new Machine().deserialize({});
	selectedItemAfterSaving: Item = new Item().deserialize({});
	isLoading: boolean = false;
	isUpdateMaintenance: boolean = false;
	query: string = `(prodOrder/any(p:p/order_type eq '${ProdOrderType.MAINTENANCE}'))&$expand=prodOrderPosOperations($select=id,status),prodOrder` as any;
	deleteMaintenanceId?: string;
	selectedEnd: string = "";
	selectedStart: string = "";
	bomPosFromApi: BomPos[] = [];
	maintenancesFromApi: OperationPlanPos[] = [];
	@ViewChild("createOrUpdateForm") createOrUpdateForm?: NgForm;
	@ViewChild("childComponentRef") childComponentRef?: CustomReactGridTable;
	localization = Localization;

	columns: any = [
		{
			Header: $localize`Order Id`,
			accessor: "prodOrder.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			hAlign: "Left",
		},
		{
			Header: $localize`Start Date`,
			accessor: "start",
			isDateColumn: true,
			filterType: "date",
			filterable: true,
			isSelected: true,
			hAlign: "Right",
			dataType: GridTableColumnDataType.Date,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.start, true, true, false, false, false);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData}</Text>
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
				const rowData = formatDate(row.original.end, true, true, false, false, false);
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];
	
	maintenances: OperationPlanPos[] = [];
	bomPos: BomPos[] = [];
	selectedProdOrderPos: ProdOrderPos = new ProdOrderPos();

	constructor(
		private commonService: CommonService,
		private tosterService: ToastService
	) {}
	

	addMaintenanceOrderButtonClick() {
		this.dialogTitle = Localization.add;
		this.isDialogOpen = true;
		this.selectedMaintenanceAfterSaving = new OperationPlan().deserialize({});
		this.selectedMachineAfterSaving = new Machine().deserialize({});
		this.selectedItemAfterSaving = new Item().deserialize({});
		this.disableButtonDuringRequest = false;
		this.maintenances = [];
		this.bomPos = [];
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.selectedProdOrderPos.id = undefined;
		this.createOrUpdateForm?.onReset();
	}

	deleteManageMaintenance(value: any): void {
		this.isWarningDialog = true;
		this.disableButtonDuringRequest = false;
		this.deleteMaintenanceId = value.id;
	}

	async onEditClick(value: any) {
		this.isDialogOpen = true;
		this.dialogTitle = Localization.edit;
		this.isUpdateMaintenance = true;
		this.selectedProdOrderPos.id = value.id;
	}

	public refreshGridTable() {
		this.childComponentRef?.onFilterAndSorting();
	}

	deleteSubmit() {
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`ProdOrderPos/${this.deleteMaintenanceId}`).subscribe({
			next: () => {
				this.disableButtonDuringRequest = false;
				this.isWarningDialog = false;
				this.isLoading = false;
				this.childComponentRef?.onFilterAndSorting();
			},
			error: () => {
				this.isWarningDialog = false;
				this.tosterService.showToast(this.localization.someThingWentWrong, "error");
				this.deleteMaintenanceId = undefined;
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
			},
		});
	}

	processData(data: any) {
		let processedData: any[] = [];
		if (data.length) {
			processedData = data[0].filter((entry: any) =>
				entry.prodOrderPosOperations.every((op: ProdOrderPosOperation) => op.status !== `${ProdOrderPosOperationStatus.CLOSED}`)
			);
		}			
		if (this.childComponentRef) {
			this.childComponentRef.data = processedData;
			this.childComponentRef.render();
		}
	}

	onCancel() {
		this.isWarningDialog = false;
	}
}
