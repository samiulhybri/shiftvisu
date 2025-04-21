import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { Button, FlexBox, Icon, ObjectStatus } from "@ui5/webcomponents-react";
import React from "react";
import {
	ToolRepairStatus,
	ToolRepairStatusClass,
} from "@app/modules/tool-visu/enums/ToolRepairStatus";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { ProdOrderPosStatus } from "@app/shared/enums/ProdOrderPosStatus";
import { CommonService } from "@app/shared/services/common.service";
import { ActiveRepairComponent } from "@app/modules/tool-visu/shared/active-repair/active-repair.component";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
//import * as XLSX from 'xlsx';

@Component({
	selector: "app-tool-overview",
	templateUrl: "./tool-overview.component.html",
	styleUrl: "./tool-overview.component.css",
})
export class ToolOverviewComponent {
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("activeRepairTable", { static: false }) activeRepairTable!: ActiveRepairComponent;

	protected tableData: any[] = [];
	public isOpenToolDetails: boolean = false;
	public dialogTitle: string = "";
	public selectedTool!: Item;
	public toolOrdersList: any;
	public isActiveRepairsDialogOpen: boolean = false;
	public selectedRepair!: ProdOrderPos;
	public isViewDialogOpen: boolean = false;
	public isRepairHistoryComponentShow: boolean = false;
	localization = Localization;

	public expandQuery: string = `$select=id,custom_id,name,is_active,is_tool,repair_req_percentage&$expand=prodOrderPos($select=id,is_production_possible,status,status_plan,pos;$expand=prodOrder($select=id;$filter=order_type eq '${ ProdOrderType.MAINTENANCE }'),prodOrderPosOperations($select=id,name,status,operation_plan_id_origin,operation_plan_pos_id_origin,is_automatic_created_repair);$filter=(status ne '${ProdOrderPosStatus.CLOSED}' and status ne '${ProdOrderPosStatus.DELETED}') or (status_plan ne '${ProdOrderPosStatus.CLOSED}' and status_plan ne '${ProdOrderPosStatus.DELETED}'))`;

	columns: any = [
		{
			Header: $localize`Active`,
			accessor: "is_active",
			hAlign: "Center",
			isSelected: true,
			dataType: GridTableColumnDataType.Boolean,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			maxWidth: 150,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { cell, row, webComponentsReactProperties } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={rowData.is_active ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`No.`,
			accessor: "custom_id",
			minWidth: 100,
			isSelected: true,
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.String,
		},
		{
			Header: $localize`Name`,
			accessor: "name",
			minWidth: 200,
			isSelected: true,
			disableFilters: true,
			disableSortBy: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.String,
		},
		{
			Header: $localize`Granted Shot`,
			accessor: "granted_shot",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			disableFilters: true,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Number,
		},
		{
			Header: $localize`Shot Done`,
			accessor: "is_shot_done",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Number,
		},
		{
			Header: $localize`Cavity`,
			accessor: "tool_cavity",
			hAlign: "Center",
			minWidth: 50,
			isSelected: false,
			disableFilters: false,
			disableGroupBy: true,
			dataType: GridTableColumnDataType.Number,
		},
		{
			Header: $localize`Status`,
			accessor: "prodOrderPos.status",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedArray,
			hAlign: "Left",
			minWidth: 230,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const prodOrderPos = rowData.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];				
				let isNotPossible;
				if (prodOrderPos.length == 0) {
					return (
						<React.StrictMode>
							<FlexBox>
								<ObjectStatus
									showDefaultIcon
									state={ValueState.Positive}
									style={{
										width: "200px",
										height: "18px",
										backgroundColor: "var(--production-lite-color)",
										color: "var(--status-true-text-color)",
										border: "var(--status-border-color)",
										padding: "5px 8px 5px 8px",
										borderRadius: "8px",
										fontWeight: 700,
									}}>
									{ToolRepairStatusClass.getStateTranslate(
										ToolRepairStatus.READY_FOR_USE
									)}
								</ObjectStatus>
							</FlexBox>
						</React.StrictMode>
					);
				} else {
					isNotPossible = prodOrderPos.find(
						(elm: ProdOrderPos) =>
							elm.is_production_possible == null ||
							elm.is_production_possible === false
					);
					if (isNotPossible) {
						return (
							<React.StrictMode>
								<FlexBox>
									<ObjectStatus
										showDefaultIcon
										state={ValueState.Negative}
										style={{
											width: "200px",
											height: "18px",
											backgroundColor: "var(--standstill-lite-color)",
											color: "var(--statnstill-color-compact-hover)",
											border: "var(--bom-status-error-border-color)",
											padding: "5px 8px 5px 8px",
											borderRadius: "8px",
											fontWeight: 700,
										}}>
										{ToolRepairStatusClass.getStateTranslate(
											ToolRepairStatus.NOT_READY_FOR_USE
										)}
									</ObjectStatus>
								</FlexBox>
							</React.StrictMode>
						);
					} else {
						return (
							<React.StrictMode>
								<FlexBox>
									<ObjectStatus
										showDefaultIcon
										state={ValueState.Critical}
										style={{
											width: "200px",
											height: "18px",
											backgroundColor: "var(--bom-status-warning-bgcolor)",
											color: "var(--bom-status-warning-color)",
											border: "var(--bom-status-warning-border-color)",
											padding: "5px 8px 5px 8px",
											borderRadius: "8px",
											fontWeight: 700,
										}}>
										{ToolRepairStatusClass.getStateTranslate(
											ToolRepairStatus.MAINTENANCE_REQUIRED
										)}
									</ObjectStatus>
								</FlexBox>
							</React.StrictMode>
						);
					}
				}
			},
		},
		{
			Header: $localize`State`,
			accessor: "prodOrderPos.status_plan",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: false,
			maxWidth: 80,
			dataType: GridTableColumnDataType.String,
			hAlign: "Left",
		},
		{
			Header: $localize`Action`,
			accessor: "prodOrderPos.pos",
			disableFilters: true,
			disableGroupBy: true,
			isSelected: true,
			dataType: GridTableColumnDataType.String,
			disableSortBy: true,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Button
								onClick={() => this.openDocvisuDetails(rowData)}
								design="Emphasized">
								{$localize`Doc Visu`}
							</Button>
							<Button
								style={{ marginLeft: "10px" }}
								onClick={() => this.openLog(rowData, false)}
								design="Default">
								{$localize`Log`}
							</Button>
							<Button
								style={{ marginLeft: "10px" }}
								icon="hint"
								onClick={() => this.openToolDetails(rowData)}
								design="Transparent"></Button>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	constructor(
		private _commonSrv: CommonService,
		private _toasterSrv: ToastService
	) {}

	ngOnInit() {}

	openDocvisuDetails(data: Item) {
		this.selectedTool = new Item().deserialize(data);
	}

	openToolDetails(data: Item) {
		this.dialogTitle = $localize`Tool Overview`;
		this.selectedTool = new Item().deserialize(data);
		this.isOpenToolDetails = true;
	}

	openLog(data: Item, isCompletedOrders: boolean) {
		this.selectedTool = new Item().deserialize(data);
		let url: string = "";

		try {
			if (isCompletedOrders) {
				url = `/Items(${this.selectedTool.id})?$select=id&$expand=prodOrderPos($filter=(status eq '${ProdOrderPosStatus.CLOSED}' or status_plan eq '${ProdOrderPosStatus.CLOSED}');$expand=media($select=id),userCreator($select=id,custom_id,name),userResponsible($select=id,custom_id,name),toolSupplier($select=id,custom_id,name),prodOrder($select=id,custom_id,order_type;$filter=order_type eq '${ProdOrderType.MAINTENANCE}'),item($select=id,name,custom_id,is_active,is_tool),prodOrderPosOperations($select=id,is_automatic_created_repair))`;
				this.activeRepairTable.gridHeader = $localize`Completed Order List`;
			} else {
				url = `/Items(${this.selectedTool.id})?$select=id&$expand=prodOrderPos($filter=(status ne '${ProdOrderPosStatus.DELETED}' and status ne '${ProdOrderPosStatus.CLOSED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}' and status_plan ne '${ProdOrderPosStatus.CLOSED}');$expand=media($select=id),userCreator($select=id,custom_id,name),userResponsible($select=id,custom_id,name),toolSupplier($select=id,custom_id,name),prodOrder($select=id,custom_id,order_type;$filter=order_type eq '${ProdOrderType.MAINTENANCE}'),item($select=id,name,custom_id,is_active,is_tool),prodOrderPosOperations($select=id,is_automatic_created_repair))`;
				this.activeRepairTable.gridHeader = $localize`Active Order List`;
			}
			
			if (this.activeRepairTable && this.activeRepairTable.childComponentForActiveToolOverviewRef) {								
				this.activeRepairTable.childComponentForActiveToolOverviewRef.data = [];
				this.activeRepairTable.childComponentForActiveToolOverviewRef.isBusy = true;
				this.activeRepairTable.childComponentForActiveToolOverviewRef?.render();
			}
			this.isActiveRepairsDialogOpen = true;

			this._commonSrv.get(url).subscribe({
				next: (response: any) => {
					let repair:any = [];
					response.prodOrderPos.forEach((element:any) => {
						if(element.prodOrder) {
							repair.push(element);
						}
					});
					this.toolOrdersList = repair
					if (this.activeRepairTable && this.activeRepairTable.childComponentForActiveToolOverviewRef) {
						this.activeRepairTable.childComponentForActiveToolOverviewRef.data = this.toolOrdersList;
						this.activeRepairTable.childComponentForActiveToolOverviewRef.isBusy = false;
						this.activeRepairTable.childComponentForActiveToolOverviewRef.render();
						this.activeRepairTable.isLoading = false;
					}
				},
				error: e => {
					console.error("Error while getting ProdOrderPos: ", e);
					this.activeRepairTable.isLoading = false;
					this._toasterSrv.showToast($localize`Data loading issue. Check log`, "error");
				},
			});
		} catch (error) {
			console.log("error");
		}
	}

	onChangeRepairGrid(data: any) {
		if (data == 1) this.openLog(this.selectedTool, false);
		else this.openLog(this.selectedTool, true);
	}

	afterTabchangeFromToolOverview() {
		this.openLog(this.selectedTool, false)
	}

	closeActiveRepairsDialog() {
		this.isActiveRepairsDialogOpen = false;
	}

	closeViewDialog() {
		this.isViewDialogOpen = false;
	}

	closeDialog() {
		this.isOpenToolDetails = false;
		this.dialogTitle = "";
	}
	isSavedModal(){
        this.isViewDialogOpen = false;
        this.childComponent!.onFilterAndSorting('','','Contain')
    }

	OnClickDownload() {
		this.tableData = this.childComponent?.data;
		if (this.tableData) {
			let filteredData = this.tableData.map((item: Item) => {
				return {
					is_active: item.is_active ? 1 : 0,
					custom_id: item.custom_id,
					name: item.name,
					part_nr: "",
					other: false,
					guarantee_qualification: 0,
					nester: 0,
					tool_generation: "",
					regal: 0,
				};
			});

			const headers = this.columns.map((col: any) => col.Header);
			const wsData = [
				headers,
				...filteredData.map((row: any) =>
					this.columns.map((col: any) => row[col.accessor])
				),
			];
			/*
			const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(wsData);
			const wb: XLSX.WorkBook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
			XLSX.writeFile(wb, 'Tool_overview.xlsx');
			*/
		}
	}
}
