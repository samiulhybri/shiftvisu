import { Component, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import { TransportableType, TransportableTypeClass } from "@app/shared/enums/TransportableType";
import {
	TransportOrderPosStatus,
	TransportOrderPosStatusClass,
} from "@app/shared/enums/TransportOrderPosStatus";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { TransportOrderPos } from "@app/shared/models/transport-order-pos.model";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { formatNumber } from "@app/shared/utils/number-formatter";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { FlexBox, Icon, ObjectStatus, Option, Select } from "@ui5/webcomponents-react";
import React from "react";
import { ReplaySubject, takeUntil } from "rxjs";

@Component({
	selector: "app-transport-order",
	templateUrl: "./transport-order.component.html",
	styleUrl: "./transport-order.component.css",
})
export class TransportOrderComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	dynamicURL: string = "";
	selectedStatus: string = "all";
	isLoading = false;
	transportOrders: any = [];
	transportOrderPosData: TransportOrderPos[] = [];
	currentMachine: Machine | undefined;

	@ViewChild("transportOrderTable", { static: false }) transportOrderTable:
		| CustomReactGridTable
		| undefined;

	constructor(
		public commonService: CommonService,
		private dataService: DataService
	) {
		this.getCurrentMachine();
	}

	columns: any = [
		{
			Header: $localize`Type`,
			accessor: "item.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;
				const type = TransportableTypeClass.getStateTranslate(data.transportable_type);

				return type?.text;
			},
		},
		{
			Header: $localize`Id`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;

				return data?.transportable?.custom_id || data?.transportable?.item?.custom_id || "";
			},
		},
		{
			Header: $localize`Source`,
			accessor: "source.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;

				const isAvailableType =
					rowData.source_type === BackendModelType.STORAGE_LOCATION ||
					rowData.source_type === BackendModelType.PRODUCTIONSUPPLYAREA ||
					rowData.source_type === BackendModelType.MACHINE;

				return isAvailableType ? rowData.source?.custom_id : rowData.source?.id;
			},
		},
		{
			Header: $localize`Destination`,
			accessor: "destination.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;

				const isAvailableType =
					rowData.destination_type === BackendModelType.STORAGE_LOCATION ||
					rowData.destination_type === BackendModelType.PRODUCTIONSUPPLYAREA ||
					rowData.destination_type === BackendModelType.MACHINE;

				return isAvailableType ? rowData.destination?.custom_id : rowData.source?.id;
			},
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Right",
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;
				
				let quantity = 0;

				if(data.transportable_type == TransportableType.ITEM_PLANT){
					quantity = data.quantity;
				}else quantity = 1; // Default quantity 1 for equipment and HU

				return formatNumber(quantity);
			},
		},
		{
			Header: $localize`Transport Order Type`,
			accessor: "transportOrderType.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedArray,
		},
		{
			Header: $localize`Delivered Quantity`,
			accessor: "deliveredQuantity",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				let sum = 0;
				row.original.transportOrderPosDeliveries.forEach(
					(item: any) => (sum += item.delivered_quantity)
				);
				return formatNumber(sum);
			},
		},
		{
			Header: $localize`UoM`,
			accessor: "prodOrderPosBomPos.unit_of_measure.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedArray,
		},
		{
			Header: $localize`Accepted`,
			accessor: "is_accepted",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;
				const tranportData = data.transportOrderPosDeliveries.find(
					(item: any) => item.is_completed == false
				);
				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={tranportData?.user?.id ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Urgent`,
			accessor: "is_urgent",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={data.is_urgent ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Transport Person`,
			accessor: "responsibleUser.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedArray,
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;

				const tranportData = data.transportOrderPosDeliveries.find(
					(item: any) => item.is_completed == false
				);

				return tranportData ? tranportData?.user?.name : "";
			},
		},
		{
			Header: $localize`Status`,
			accessor: "responsible_user_id", //Need to update. we can't use status as accessor. it break the table
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			width: 200,
			filter: (rows: any[], accessor: string, filterValue: string) => {
				let selectedIndexes: boolean[] = [];
				this.selectedStatus = filterValue;

				if (filterValue === "") {
					return rows;
				}
				if (filterValue === "delivered") {
					selectedIndexes = rows.map(
						(row: any) => row.original.status == TransportOrderPosStatus.DELIVERED
					);

					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}

				if (filterValue === "processing") {
					selectedIndexes = rows.map(
						(row: any) => row.original.status == TransportOrderPosStatus.PROCESSING
					);
					return rows.filter((row: any, i: any) => selectedIndexes[i] == true);
				}

				if (filterValue === "notAccepted") {
					selectedIndexes = rows.map(
						(row: any) => row.original.status == TransportOrderPosStatus.NOT_ACCEPTED
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
						<Option selected={this.selectedStatus == "delivered"} value="delivered">
							{TransportOrderPosStatusClass.getStateTranslate(
								TransportOrderPosStatus.DELIVERED
							)}
						</Option>
						<Option selected={this.selectedStatus == "processing"} value="processing">
							{TransportOrderPosStatusClass.getStateTranslate(
								TransportOrderPosStatus.PROCESSING
							)}
						</Option>
						<Option selected={this.selectedStatus == "notAccepted"} value="notAccepted">
							{TransportOrderPosStatusClass.getStateTranslate(
								TransportOrderPosStatus.NOT_ACCEPTED
							)}
						</Option>
					</Select>
				);
			},
			Cell: (instance: any) => {
				const { row } = instance;
				const data = row.original;
				const parentQuantity = data?.prodOrderPosBomPos?.qty_for_one_parent;
				const prodOrderPosQuantity = data.prodOrderPosBomPos?.prod_order_pos?.quantity;
				const orderQuantity = parentQuantity * prodOrderPosQuantity;
				let totalDelivered = 0;

				data.transportOrderPosDeliveries.forEach((item: any) => {
					totalDelivered += item.delivered_quantity;
				});
				const isProcessing = data.transportOrderPosDeliveries.find(
					(item: any) => item.is_completed == false
				);

				const isComplete = data?.is_completed;

				const isPartial = totalDelivered > 0 && orderQuantity > totalDelivered;

				const state = isComplete
					? TransportOrderPosStatusClass.getStateTranslate(
							TransportOrderPosStatus.DELIVERED
					  )
					: isProcessing
					? TransportOrderPosStatusClass.getStateTranslate(
							TransportOrderPosStatus.PROCESSING
					  )
					: isPartial
					? TransportOrderPosStatusClass.getStateTranslate(
							TransportOrderPosStatus.PARTIAL_DELIVERED
					  )
					: TransportOrderPosStatusClass.getStateTranslate(
							TransportOrderPosStatus.NOT_ACCEPTED
					  );

				const iconName = isComplete ? "sys-enter-2" : isPartial ? "lateness" : "sys-cancel";

				const styles = isComplete
					? {
							backgroundColor: "var(--production-lite-color)",
							color: "var(--status-true-text-color)",
							border: "1px solid var(--status-border-color)",
							width: "200px",
							height: "18px",
							padding: "5px 8px",
							borderRadius: "8px",
							fontWeight: 700,
					  }
					: isPartial
					? {
							backgroundColor: "var(--bom-status-warning-bgcolor)",
							color: "var(--bom-status-warning-color)",
							border: "1px solid var(--bom-status-warning-border-color)",
							width: "200px",
							height: "18px",
							padding: "5px 8px",
							borderRadius: "8px",
							fontWeight: 700,
					  }
					: {
							backgroundColor: "var(--standstill-lite-color)",
							color: "var(--status-false-text-color)",
							border: "1px solid var(--bom-status-error-border-color)",
							width: "200px",
							height: "18px",
							padding: "5px 8px",
							borderRadius: "8px",
							fontWeight: 700,
					  };

				return (
					<React.StrictMode>
						<ObjectStatus
							icon={<Icon name={iconName} />}
							style={styles}
							state={
								isComplete
									? ValueState.Positive
									: isPartial
										? ValueState.Critical
										: ValueState.Negative
							}>
							{state}
						</ObjectStatus>
					</React.StrictMode>
				);
			},
		},
	];

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
			if (this.currentMachine.id) {
				this.loadDataForTransportOrder();
			}
		});
	}

	loadDataForTransportOrder() {
		let requests: ODataBatchCall[] = [];
		this.isLoading = true;
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/TransportOrders?$orderby=custom_id desc&$expand=transportOrderPos($filter=destination_id eq ${this.currentMachine?.id};$select=id,machine_id)`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.isLoading = false;
				this.transportOrders = response.responses[0]?.body?.value;
				this.transportOrders = this.transportOrders.filter(
					(transportOrder: any) => transportOrder.transportOrderPos.length > 0
				);

				const firstOrder = this.transportOrders[0];
				if (firstOrder && this.transportOrderTable) {
					this.loadTransportOrderPosForTransportOrder(firstOrder?.id);
				}
			},
			error: () => {
				this.isLoading = false;
			},
		});
	}

	loadTransportOrderPosForTransportOrder(id: number) {
		this.transportOrderPosData = [];

		this.commonService.get("transport-order-pos/" + id, false).subscribe({
			next: (response: any) => {
				 this.transportOrderPosData = response;
			},
			error: (e: any) => {
				console.log(e);
			},
		});
	}

	tabChanges() {
		this.loadDataForTransportOrder();
	}

	onListClick(e: any) {
		const transportOrderId = parseInt(e.detail.item.id);

		this.loadTransportOrderPosForTransportOrder(transportOrderId);
	}
}
