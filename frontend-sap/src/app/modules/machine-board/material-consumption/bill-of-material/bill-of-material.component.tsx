import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { BomPosItemTypes } from "@app/shared/enums/BomPosItemType";
import {
	ProdOrderPosOperationStatus,
	ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";
import { TransportableType } from "@app/shared/enums/TransportableType";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { CommonService } from "@app/shared/services/common.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import {
	Button,
	FlexBox,
	Icon,
	ObjectStatus,
	Option,
	Select,
	Text,
} from "@ui5/webcomponents-react";
import React from "react";
import { formatNumber } from "@app/shared/utils/number-formatter";
import { Setting } from "@app/shared/models/setting.model";
import Stock from "@app/shared/models/stock.models";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import {DecimalPipe} from "@angular/common";

@Component({
	selector: "app-bill-of-material",
	templateUrl: "./bill-of-material.component.html",
	styleUrl: "./bill-of-material.component.css",
})
export class BillOfMaterialComponent {
	@Output() isOrderCreateDialogOpen = new EventEmitter<boolean>();
	@Output() shippingRowDataEmit = new EventEmitter<any>();
	@Output() isCustomIdBusyEmit = new EventEmitter<any>();
	@Output() bomSelectedRowsEmit = new EventEmitter<any>();

	@Output() isMultipleOrderEmit = new EventEmitter<{
		isMultipleOrder: boolean;
		dialogSelect?: string;
	}>();
	@Input() bomSelectedRows: any;
	@Input() setting: Setting = new Setting().deserialize({});
	@Input() machine: any;
	@ViewChild("childComponentRef") childComponentRef?: CustomReactGridTable;
	@ViewChild("childComponentOperationRef") childComponentOperationRef?: CustomReactGridTable;

	isOrderCreateDialog: boolean = false;
	shippingRowData: any;
	isBusy: boolean = false;
	isBomBusy: boolean = false;
	isShowStockDialogOpen: boolean = false;
	operationsData: ProdOrderPosOperation[] = [];
	bomData: any[] = [];
	filteredOperationData: any[] = [];
	operationSelectedRow!: ProdOrderPosOperation;
	operationSelectedRowId!: number;
	order_id!: number;
	prod_order_pos_id!: number | undefined;
	custom_id!: string;
	isCustomIdBusy = false;
	isMultipleOrder: boolean = false;
	@Output() transportOrderNoDataEmitter = new EventEmitter<boolean>();
	selectedStatus: string = "all";
	selectedBomPosIndex: number = 0;
	showWarningForItemType: boolean = false;
	filteredBomPos: any = [];
	clonedBomSelectedRows: any = [];
	bomPosItemTypes = BomPosItemTypes;
	prodOrderPosOperationId: number | undefined;
	itemTypeText = $localize`Item Type`;
	actionText = $localize`Action`;
	uoMText = $localize`UoM`;
	stocksForItemPlant: Stock[] = [];
	isItemPlantBusy = false;

	fromProductionPlan = false;
	fromTransportOrder = false;

	@Input() set setFromTransportOrder(item: boolean) {
		this.fromTransportOrder = item;

		if (item && this.prodOrderPosOperationId) {
			this.getBomData(this.prodOrderPosOperationId);
		}
	}

	@Input() set posSelectedRowId(dataItem: number) {
		this.prod_order_pos_id = dataItem;
	}

	@Input() set prodOrderPosId(dataItem: number) {
		if (dataItem) {
			this.fromProductionPlan = true;
			this.prodOrderPosOperationId = dataItem;
			this.getOperationById(dataItem);
			this.getBomData(dataItem);
		}
	}
	constructor(public commonService: CommonService, private decimalPipe: DecimalPipe) {}

	ngOnInit(): void {
		this.bomSelectedRows = [];
		if (!this.fromProductionPlan) this.getOperations();
	}

	getOperations() {
		this.isBusy = true;
		this.commonService
			.get(
				`ProdOrderPosOperations?$expand=prodOrderPosOperationTimes($filter=end eq null and (status eq '${ProdOrderPosOperationStatus.IN_PRODUCTION}' or status eq '${ProdOrderPosOperationStatus.IN_SETUP}' or status eq '${ProdOrderPosOperationStatus.IN_TEARDOWN}')),prodOrderPos($expand=prodOrder,item)&$filter=(status ne 'PLANNED') and (status ne 'CLOSED') and (status ne 'SUSPENDED') and (status ne 'DELETED') and machine_id eq ${this.machine.id}`
			)
			.subscribe({
				next: (response: any) => {
					this.isBusy = false;
					this.operationsData =
						response.value?.filter(
							(operation: ProdOrderPosOperation) =>
								(operation?.prodOrderPosOperationTimes?.length || 0) > 0
						) || [];

					if (this.childComponentOperationRef)
						this.childComponentOperationRef.selectedRowsId = { 0: true };
					this.getBomData(this.operationsData[0]?.id);

					this.operationSelectedRow = this.operationsData[0];

					this.prod_order_pos_id = this.operationsData[0]?.prod_order_pos_id;
					this.filteredOperationData = this.operationsData.filter(
						item => item.id === this.operationsData[0]?.id
					);
				},
				error: () => {},
			});
	}

	getOperationById(operationId: number) {
		this.commonService
			.get(
				`ProdOrderPosOperations(${operationId})?$expand=prodOrderPosOperationTimes($filter=end eq null and (status eq '${ProdOrderPosOperationStatus.IN_PRODUCTION}' or status eq '${ProdOrderPosOperationStatus.IN_SETUP}')),prodOrderPos($expand=prodOrder,item)&$filter=(status ne 'PLANNED') and (status ne 'CLOSED') and (status ne 'SUSPENDED') and (status ne 'DELETED') and machine_id eq ${this.machine.id}`
			)
			.subscribe({
				next: (response: any) => {
					this.operationSelectedRow = response;
				},
			});
	}

	async getCustomId() {
		this.custom_id = await this.commonService.getEntity("TransportOrder").catch(() => false);
		this.isCustomIdBusy = false;
		if (typeof this.custom_id === "boolean") this.shippingRowData.custom_id = "";
	}

	operationRowClick(event: any) {
		this.bomSelectedRows = [];
		this.clonedBomSelectedRows = [];

		this.order_id = event.detail.row.original.prodOrderPos?.prodOrder?.custom_id;
		this.prod_order_pos_id = event.detail.row.original.prod_order_pos_id;

		this.operationSelectedRowId = event.detail.row.original.id;

		const selectedFlatRows = event.detail.selectedFlatRows;

		if (selectedFlatRows.length > 0) {
			this.filteredOperationData = this.operationsData.filter(
				item => item.id === this.operationSelectedRowId
			);
			this.getBomData(this.operationSelectedRowId);
		} else {
			this.filteredOperationData = [];
			this.bomData = [];
		}

		this.operationSelectedRow = event.detail.row.original;
	}

	getBomData(prod_order_pos_operation_id: number | undefined) {
		if (prod_order_pos_operation_id == undefined) {
			this.bomData = [];
			return;
		}

		this.isBomBusy = true;
		if (this.fromTransportOrder) this.createMultipleOrder().then();

		if (this.fromTransportOrder) {
			this.commonService
				.get(
					`machine/${this.machine.id}/${prod_order_pos_operation_id}/propose-transport-order-pos`,
					false
				)
				.subscribe({
					next: (response: any) => {
						this.isBomBusy = false;
						if (response) {
							const data = response;
							const sortByPos = (a: any, b: any) => parseInt(a.pos) - parseInt(b.pos);

							const pcnsData = data
								.filter((item: any) => item.item_type === "PCNS")
								.sort(sortByPos);
							const pccoData = data
								.filter((item: any) => item.item_type === "PCCO")
								.sort(sortByPos);
							const pcsoData = data
								.filter((item: any) => item.item_type === "PCSO")
								.sort(sortByPos);
							const otherData = data
								.filter(
									(item: any) =>
										!["PCNS", "PCCO", "PCSO"].includes(item.item_type)
								)
								.sort(sortByPos);

							this.bomData = [...pcnsData, ...pccoData, ...pcsoData, ...otherData];
						}
						if (this.fromTransportOrder) this.callTransportOrderOpUp();
					},

					error: () => {},
				});
		} else {
			this.commonService
				.get(
					`ProdOrderPosBomPos?$filter=prod_order_pos_operation_id eq ${prod_order_pos_operation_id}&$expand=prodOrderPos($expand=prodOrder),unitOfMeasure(name,custom_id),item($expand=itemPlants),prodOrderPosOperation($expand=machine($expand=plant)),warehouse&$orderby=pos asc`
				)
				.subscribe({
					next: (response: any) => {
						this.isBomBusy = false;
						if (response.value) {
							const data = response.value;
							const sortByPos = (a: any, b: any) => parseInt(a.pos) - parseInt(b.pos);

							const pcnsData = data
								.filter((item: any) => item.item_type === "PCNS")
								.sort(sortByPos);
							const pccoData = data
								.filter((item: any) => item.item_type === "PCCO")
								.sort(sortByPos);
							const pcsoData = data
								.filter((item: any) => item.item_type === "PCSO")
								.sort(sortByPos);
							const otherData = data
								.filter(
									(item: any) =>
										!["PCNS", "PCCO", "PCSO"].includes(item.item_type)
								)
								.sort(sortByPos);

							this.bomData = [...pcnsData, ...pccoData, ...pcsoData, ...otherData];
						}
						if (this.fromTransportOrder) this.callTransportOrderOpUp();
					},

					error: () => {},
				});
		}
	}
	callTransportOrderOpUp() {
		let bomData: { original: any }[] = [];
		this.bomData.map((data: any) => {
			bomData.push({ original: data });
		});
		this.clonedBomSelectedRows = bomData;
		this.createMultipleOrder().then();
	}

	multipleRowSelect(event: any): void {
		this.clonedBomSelectedRows = event.detail.selectedFlatRows;
	}

	async addExtraItems() {
		this.isMultipleOrderEmit.emit({
			isMultipleOrder: true,
			dialogSelect: "multiItemSelectDialog",
		});
		this.isCustomIdBusy = true;
		this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
		await this.getCustomId();
		this.isCustomIdBusy = false;
		this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
		this.bomSelectedRows.custom_id = this.custom_id;
		this.bomSelectedRows.pos = this.bomData.reduce((maxPos, data) => {
			const posNumber = Number(data.pos); // Parse pos as a number
			return posNumber > maxPos ? posNumber : maxPos;
		}, 0); // Start with an initial maxPos of 0
		this.bomSelectedRows.prod_order_pos_id = this.prod_order_pos_id;
		this.bomSelectedRows.prod_order_pos_quantity = this.bomData[0]?.prodOrderPos?.quantity;
		this.bomSelectedRowsEmit.emit(this.bomSelectedRows);
	}

	async createMultipleOrder() {
		this.selectedBomPosIndex = 0;

		this.bomSelectedRows = this.clonedBomSelectedRows.map((el: any) => {
			const itemPlant = el.original.item?.itemPlants?.find(
				(itemPlant: any) =>
					itemPlant.plant_id == el.original.prodOrderPos?.prodOrder?.plant_id_production
			);

			return {
				...el,
				transportable_type: el.original?.transportable_type ?? TransportableType.ITEM_PLANT,
				transportable_id: el.original?.transportable_id ?? itemPlant?.id,
				transportable_custom_id:
					el.original?.transportable_custom_id ?? el.original.item?.custom_id,
			};
		});

		this.isMultipleOrder = true;
		this.isMultipleOrderEmit.emit({ isMultipleOrder: true });

		if (
			this.selectedBomPosIndex == this.bomSelectedRows.length ||
			!this.setting.is_ewm_enabled
		) {
			this.isOrderCreateDialog = true;
			this.isCustomIdBusy = true;
			this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
			this.isOrderCreateDialogOpen.emit(this.isOrderCreateDialog);

			await this.getCustomId();

			this.isCustomIdBusy = false;
			this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
			this.bomSelectedRows.custom_id = this.custom_id;
			this.bomSelectedRows.pos = this.bomData.reduce((maxPos, data) => {
				const posNumber = Number(data.pos); // Parse pos as a number
				return posNumber > maxPos ? posNumber : maxPos;
			}, 0);
			this.bomSelectedRows.prod_order_pos_id = this.prod_order_pos_id;
			this.bomSelectedRows.prod_order_pos_quantity = this.bomData[0]?.prodOrderPos?.quantity;
			this.bomSelectedRowsEmit.emit(this.bomSelectedRows);
		} else {
			this.selectedBomPosIndex = 0;
			this.filteredBomPos = [];
			this.checkItemType();
		}
	}

	async checkItemType() {
		this.bomSelectedRows.forEach((bom: any, index: number) => {
			if (
				(bom.original?.item_type == this.bomPosItemTypes.PCNS ||
					bom?.original.item_type == this.bomPosItemTypes.PCCO) &&
				!this.showWarningForItemType &&
				index == this.selectedBomPosIndex
			) {
				this.filteredBomPos.push(bom);
				this.selectedBomPosIndex++;
			} else if (index == this.selectedBomPosIndex) {
				this.showWarningForItemType = true;
			}
		});

		if (this.bomSelectedRows.length == this.selectedBomPosIndex) {
			this.bomSelectedRows = this.filteredBomPos;
			this.showWarningForItemType = false;

			this.isOrderCreateDialog = true;
			this.isCustomIdBusy = true;
			this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
			this.isOrderCreateDialogOpen.emit(this.isOrderCreateDialog);
			await this.getCustomId();
			this.isCustomIdBusy = false;
			this.isCustomIdBusyEmit.emit(this.isCustomIdBusy);
			this.bomSelectedRows.custom_id = this.custom_id;
			this.bomSelectedRows.pos = this.bomData.reduce((maxPos, data) => {
				const posNumber = Number(data.pos); // Parse pos as a number
				return posNumber > maxPos ? posNumber : maxPos;
			}, 0);
			this.bomSelectedRows.prod_order_pos_id = this.prod_order_pos_id;
			this.bomSelectedRows.prod_order_pos_quantity = this.bomData[0]?.prodOrderPos?.quantity;
			this.bomSelectedRowsEmit.emit(this.bomSelectedRows);
		}
	}

	closeAndRemoveBomPos() {
		this.selectedBomPosIndex++;
		this.showWarningForItemType = false;
		this.checkItemType();
	}

	closeAndSave() {
		this.filteredBomPos.push(this.bomSelectedRows[this.selectedBomPosIndex]);
		this.selectedBomPosIndex++;
		this.showWarningForItemType = false;

		this.checkItemType();
	}

	addItemTypeColumn() {
		const isAlreadyExist = this.billOfMaterialColumns.find(
			(col: any) => col.Header == this.itemTypeText
		);

		if (!isAlreadyExist) {
			const itemTypeColumn = {
				Header: this.itemTypeText,
				accessor: "item_type",
				hAlign: "Left",
				disableFilters: false,
				disableSortBy: false,
				disableResizing: false,
				disableGroupBy: true,
				canReorder: false,
				isSelected: true,
			};

			const index = this.billOfMaterialColumns.findIndex(
				(col: any) => col.Header == this.uoMText
			);

			this.billOfMaterialColumns.splice(index, 0, itemTypeColumn);

			if (this.childComponentRef) {
				this.childComponentRef.columns = this.billOfMaterialColumns;
				this.childComponentRef?.ngOnChanges();
			}
		}
	}

	handleStockClick(data: any) {
		this.isShowStockDialogOpen = true;
		this.isItemPlantBusy = true;
		const itemPlant = data.item.itemPlants.find(
			(itemPlant: any) =>
				itemPlant.plant_id == data.prodOrderPos.prodOrder.plant_id_production
		);

		this.commonService
			.get(`stock/itemPlant/${itemPlant?.id}/get-stocks-by-type`, false)
			.subscribe({
				next: (response: any) => {
					this.isItemPlantBusy = false;
					this.stocksForItemPlant = response;
				},

				error: () => {
					this.isItemPlantBusy = false;
				},
			});
	}

	closeStocksForItem(){
		this.isShowStockDialogOpen = false
	}

	addActionColumn() {
		const isAlreadyExist = this.billOfMaterialColumns.find(
			(col: any) => col.Header == this.actionText
		);

		if (!isAlreadyExist) {
			const actionColumn = {
				Header: this.actionText,
				accessor: "batch",
				hAlign: "Center",
				disableFilters: false,
				disableSortBy: false,
				disableResizing: false,
				disableGroupBy: true,
				canReorder: false,
				isSelected: true,
				Cell: (instance: any) => {
					const { row } = instance;

					return (
						<FlexBox style={{ gap: "5px" }}>
							<Button
								id="stockButton"
								onClick={() => this.handleStockClick(row.original)}
								icon="shelf"
								style={{ border: "none" }}
							/>
						</FlexBox>
					);
				},
			};

			this.billOfMaterialColumns.push(actionColumn);

			if (this.childComponentRef) {
				this.childComponentRef.columns = this.billOfMaterialColumns;
				this.childComponentRef?.ngOnChanges();
			}
		}
	}

	operationsColumns: any = [
		{
			Header: $localize`Order Id`,
			accessor: "prodOrderPos.prodOrder.custom_id",
			hAlign: "Right",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			width: 100,
			isSelected: true,
		},
		{
			Header: $localize`Operation`,
			accessor: "pos",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			width: 100,
			isSelected: true,
		},
		{
			Header: $localize`Quantity`,
			accessor: "prodOrderPos.quantity",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			maxWidth: 80,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				const quantity = rowData.prodOrderPos.quantity;

				return this.decimalPipe.transform(quantity, '1.0-' + 3);
			},
		},
		{
			Header: $localize`Operation Name`,
			accessor: "name",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			maxWidth: 150,
			isSelected: true,
		},
		{
			Header: $localize`Status`,
			accessor: ".",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			minWidth: 250,
			isSelected: true,
			filter: (rows: any[], accessor: string, filterValue: string) => {
				let selectedIndexes: boolean[] = [];
				this.selectedStatus = filterValue;

				if (filterValue === "") {
					return rows;
				}
				if (filterValue === "waitingForPreparation") {
					selectedIndexes = rows.map(
						(row: any) =>
							row.original.status ==
							ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}

				if (filterValue === "inPreparation") {
					selectedIndexes = rows.map(
						(row: any) =>
							row.original.status == ProdOrderPosOperationStatus.IN_PREPARATION
					);
					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}

				if (filterValue === "waitingForSetup") {
					selectedIndexes = rows.map(
						(row: any) =>
							row.original.status == ProdOrderPosOperationStatus.WAITING_FOR_SETUP
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}
				if (filterValue === "inSetup") {
					selectedIndexes = rows.map(
						(row: any) => row.original.status == ProdOrderPosOperationStatus.IN_SETUP
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}
				if (filterValue === "inTeardown") {
					selectedIndexes = rows.map(
						(row: any) => row.original.status == ProdOrderPosOperationStatus.IN_TEARDOWN
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}
				if (filterValue === "inProduction") {
					selectedIndexes = rows.map(
						(row: any) =>
							row.original.status == ProdOrderPosOperationStatus.IN_PRODUCTION
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}

				return rows;
			},
			Filter: ({ column, popoverRef }: any) => {
				const handleChange = (event: any) => {
					// set filter
					column.setFilter(event.detail.selectedOption.getAttribute("value"));
					// close popover
					popoverRef.current.close();
				};
				const showAll = $localize`Show all`;
				return (
					<Select
						onChange={handleChange}
						style={{ width: "100%" }}
						value={column.filterValue ? column.filterValue : ""}>
						<Option selected={this.selectedStatus == "all"} value="">
							{showAll}
						</Option>
						<Option
							selected={this.selectedStatus == "waitingForPreparation"}
							value="waitingForPreparation">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION
							)}
						</Option>
						<Option
							selected={this.selectedStatus == "inPreparation"}
							value="inPreparation">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.IN_PREPARATION
							)}
						</Option>
						<Option
							selected={this.selectedStatus == "waitingForSetup"}
							value="waitingForSetup">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.WAITING_FOR_SETUP
							)}
						</Option>
						<Option selected={this.selectedStatus == "inSetup"} value="inSetup">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.IN_SETUP
							)}
						</Option>
						<Option selected={this.selectedStatus == "inTeardown"} value="inTeardown">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.IN_TEARDOWN
							)}
						</Option>
						<Option
							selected={this.selectedStatus == "inProduction"}
							value="inProduction">
							{ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.IN_PRODUCTION
							)}
						</Option>
					</Select>
				);
			},
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row?.original;
				const status = data.status;
				const state =
					status == ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION
						? ProdOrderPosOperationStatusClass.getStateTranslate(
								ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION
							)
						: status == ProdOrderPosOperationStatus.IN_PREPARATION
							? ProdOrderPosOperationStatusClass.getStateTranslate(
									ProdOrderPosOperationStatus.IN_PREPARATION
								)
							: status == ProdOrderPosOperationStatus.WAITING_FOR_SETUP
								? ProdOrderPosOperationStatusClass.getStateTranslate(
										ProdOrderPosOperationStatus.WAITING_FOR_SETUP
									)
								: status == ProdOrderPosOperationStatus.IN_SETUP
									? ProdOrderPosOperationStatusClass.getStateTranslate(
											ProdOrderPosOperationStatus.IN_SETUP
										)
									: status == ProdOrderPosOperationStatus.IN_TEARDOWN
										? ProdOrderPosOperationStatusClass.getStateTranslate(
												ProdOrderPosOperationStatus.IN_TEARDOWN
											)
										: ProdOrderPosOperationStatusClass.getStateTranslate(
												ProdOrderPosOperationStatus.IN_PRODUCTION
											);

				const valueState =
					status == ProdOrderPosOperationStatus.IN_PREPARATION ||
					status == ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION ||
					status == ProdOrderPosOperationStatus.WAITING_FOR_SETUP ||
					status == ProdOrderPosOperationStatus.IN_SETUP ||
					status == ProdOrderPosOperationStatus.IN_TEARDOWN
						? ValueState.Critical
						: status == ProdOrderPosOperationStatus.IN_PRODUCTION
							? ValueState.Positive
							: ValueState.Negative;

				const iconName = getIconName(status);
				const styles = getStylesByValueState(valueState);
				const iconDesign = getIconDesign(valueState);

				function getStylesByValueState(valueState: ValueState): React.CSSProperties {
					switch (valueState) {
						case ValueState.Positive:
							return {
								backgroundColor: "var(--production-lite-color)",
								color: "var(--status-true-text-color)",
								border: "1px solid var(--status-border-color)",
								width: "200px",
								height: "18px",
								padding: "5px 8px",
								borderRadius: "8px",
								fontWeight: 700,
							};
						case ValueState.Critical:
							return {
								backgroundColor: "var(--bom-status-warning-bgcolor)",
								color: "var(--bom-status-warning-color)",
								border: "1px solid var(--bom-status-warning-border-color)",
								width: "200px",
								height: "18px",
								padding: "5px 8px",
								borderRadius: "8px",
								fontWeight: 700,
							};
						case ValueState.Negative:
							return {
								backgroundColor: "var(--standstill-lite-color)",
								color: "var(--status-false-text-color)",
								border: "1px solid var(--bom-status-error-border-color)",
								width: "200px",
								height: "18px",
								padding: "5px 8px",
								borderRadius: "8px",
								fontWeight: 700,
							};
						default:
							return {
								backgroundColor: "var(--color-white)",
								color: "var(--blackBorderColor)",
								border: "1px solid var(--card-border-color)",
								width: "200px",
								height: "18px",
								padding: "5px 8px",
								borderRadius: "8px",
								fontWeight: 700,
							};
					}
				}

				function getIconName(status: ProdOrderPosOperationStatus): string {
					switch (status) {
						case ProdOrderPosOperationStatus.IN_SETUP:
							return "action-settings";
						case ProdOrderPosOperationStatus.IN_TEARDOWN:
							return "action-settings";
						case ProdOrderPosOperationStatus.IN_PREPARATION:
						case ProdOrderPosOperationStatus.WAITING_FOR_PREPARATION:
						case ProdOrderPosOperationStatus.WAITING_FOR_SETUP:
							return "lateness";
						case ProdOrderPosOperationStatus.IN_PRODUCTION:
							return "sys-enter-2";
						default:
							return "sys-cancel";
					}
				}

				function getIconDesign(valueState: ValueState): any {
					switch (valueState) {
						case ValueState.Positive:
							return "Positive";
						case ValueState.Critical:
							return "Critical";
						case ValueState.Negative:
							return "Negative";
						default:
							return "Default";
					}
				}
				return (
					<React.StrictMode>
						<ObjectStatus
							icon={<Icon name={iconName} />}
							state={valueState}
							style={styles}>
							{state}
						</ObjectStatus>
					</React.StrictMode>
				);
			},
		},
	];

	billOfMaterialColumns: any = [
		{
			Header: $localize`Pos`,
			accessor: "pos",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			hAlign: "Right",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Operation`,
			accessor: "prodOrderPosOperation.name",
			hAlign: "Right",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: () => {
				return this.operationSelectedRow?.name;
			},
		},
		{
			Header: $localize`Quantity`,
			accessor: "qty_for_one_parent",
			hAlign: "Right",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const quantity = row?.original?.qty_for_one_parent ?? 0;

				return formatNumber(quantity);
			},
		},
		{
			Header: $localize`UoM`,
			accessor: "unitOfMeasure.custom_id",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		}
	];

	stockForItemPlantColumns: any = [
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			hAlign: "Right",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Batch`,
			accessor: "batch",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
		},
		{
			Header: $localize`Position`,
			accessor: "positionable_type", // just for placeholders
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;

				const type = BackendModelTypeClass.getStateTranslate(data.positionable_type);

				return (data?.position?.custom_id || "") + " - " + type?.text || "";
			},
		},
		{
			Header: $localize`Parent Position`,
			accessor: "positionable_id", // just for placeholders
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;

				const type = BackendModelTypeClass.getStateTranslate(
					data?.parentPosition?.positionable_type
				);

				if (!data?.parentPosition?.positionable_type) {
					return "";
				}

				if (data?.parentPosition?.positionable_type == BackendModelType.HANDLINGUNIT) {
					const typeL2 = BackendModelTypeClass.getStateTranslate(
						data?.parentPosition?.parentL2?.positionable_type
					);
					return (
						<React.StrictMode>
							<Text>
								{(data?.parentPosition?.positionable?.custom_id || "") +
									" - " +
									(type?.text || "")}{" "}
								<b className="px-2">→</b>{" "}
								{(data?.parentPosition?.parentL2?.positionable?.custom_id || "") +
									" - " +
									(typeL2?.text || "")}
							</Text>
						</React.StrictMode>
					);
				} else {
					return (
						(data?.parentPosition?.positionable?.custom_id || "") +
							" - " +
							type?.text || ""
					);
				}
			},
		},
	];
}
