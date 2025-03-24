import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import { Button, FlexBox, Text } from "@ui5/webcomponents-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CommonService } from "@app/shared/services/common.service";
import { Hall } from "@app/shared/models/hall.model";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { NgForm } from "@angular/forms";
import { environment } from "@app/environments/environment";

@Component({
	selector: "app-forklift",
	templateUrl: "./forklift.component.html",
	styleUrl: "./forklift.component.css",
})
export class ForkliftComponent {
	public dynamicHomeRouteLink = environment.homeLink;
	isLogOutDialogOpen = false;
	showErrorDialog = false;
	errorMessage = "";
	isBusy = false;
	columns = [
		{
			Header: $localize`Order Id`,
			accessor: "prodOrderPos.prodOrder.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
		},
		{
			Header: $localize`Hall`,
			accessor: "machine.hall.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Machine`,
			accessor: "machine.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
		},
		{
			Header: $localize`Quantity`,
			accessor: "prodOrderPos.quantity",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Delivered`,
			accessor: "quantityDelivered",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Type`,
			accessor: "prodOrderPos.calculation.offerPos.product_type",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Start",
			width: 130,
		},
		{
			Header: $localize`Raw Weight`,
			accessor: "prodOrderPos.calculation.offerPos.offerPosRawDimensions[0].gross_weight",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Op. Weight`,
			accessor: "prodOrderPos.calculation.offerPos.offerPosRawDimensions[0].operating_weight",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Preliminary Piece`,
			accessor: "rde",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
		},
		{
			Header: $localize`Delivery Accepted`,
			accessor: "currentDelivery.user.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Begin",
			width: 140,
		},
		{
			Header: $localize`Urgent`,
			accessor: "is_urgent_delivery",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Begin",
			Cell: (instance: any) => {
				const prodOrderPosOperation: ProdOrderPosOperation = instance.row.original;
				return (
					<React.StrictMode>
						{prodOrderPosOperation.is_urgent_delivery ? (
							<div
								style={{
									width: "87px",
									height: "35px",
									borderRadius: "8px",
									backgroundColor: "#F53232",
									display: "flex",
									flexDirection: "row",
									justifyContent: "center",
									alignItems: "center",
								}}>
								<Text
									style={{
										color: "var(--sapBaseColor)",
									}}>{$localize`URGENT`}</Text>
							</div>
						) : null}
					</React.StrictMode>
				);
			},
			width: 90,
		},
	];

	isAcceptDialogOpen = false;
	isConfirmDialogOpen = false;
	isPartialDeliveryDialogOpen = false;

	selectedProdOrderPosOperation?: ProdOrderPosOperation;

	partialQuantity = 1;

	halls = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};

	selectedHalls = [];

	prodOrderPosOperation = ProdOrderPosOperation;

	segmentButtonItems = [
		{
			id: "notDone",
			name: $localize`Not Done`,
		},
		{
			id: "done",
			name: $localize`Transportation Done`,
		},
	];

	transportationMode = "notDone";

	@ViewChild("gridTable") gridTable?: CustomReactGridTable;
	@ViewChild("quantityForm") quantityForm?: NgForm;

	constructor(
		public router: Router,
		public authService: AuthService,
		private commonService: CommonService
	) { }

	ngOnInit() {
		this.setColumns();
		this.loadHalls();
	}

	setColumns() {
		let columns: any = localStorage.getItem("forkFift");
		if (!columns) return;

		columns = JSON.parse(columns);
		const newColumns: any[] = [];
		columns.forEach((column: any) => {
			const data = this.columns.find((clm: any) => column.accessor == clm.accessor);
			data!.isSelected = column.isSelected;
			newColumns.push(data);
		});

		this.columns = newColumns;
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	logOut() {
		this.isBusy = true;
		this.authService.logout().then(
			() => {
				this.isBusy = false;
				this.closeDialog();
				this.router.navigate(["/login"], { replaceUrl: true });
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	loadHalls() {
		this.commonService.get("Halls?$filter=is_active eq true").subscribe({
			next: (data: any) => {
				this.halls.data = data.value.map((hall: any) => new Hall().deserialize(hall));
				this.gridTable?.render();
			},
		});
	}

	handleRowClick(event: any) {
		this.selectedProdOrderPosOperation = event.detail.row.original;
	}

	acceptClick() {
		this.isAcceptDialogOpen = true;
	}

	closeAcceptDialog() {
		this.isAcceptDialogOpen = false;
	}

	acceptOrder() {
		this.isBusy = true;
		const data = {
			prod_order_pos_operation_id: this.selectedProdOrderPosOperation?.id,
			user_id: this.authService.loggedInUser.id,
		};

		this.commonService.post("accept-order", data, false).subscribe({
			next: value => {
				this.isBusy = false;
				this.gridTable?.onFilterAndSorting();
				this.closeAcceptDialog();
				this.selectedProdOrderPosOperation = undefined;
			},
			error: err => {
				if (err == "Conflict") {
					this.errorMessage = $localize`User already assigned for this order`;
				} else {
					this.errorMessage = $localize`Order is not saved`;
					console.error(err);
				}

				this.closeAcceptDialog();
				this.showErrorDialog = true;
			},
		});
	}

	closeErrorDialog() {
		this.showErrorDialog = false;
	}

	doPartialDelivery() { }

	clickTransportationDone() {
		this.isConfirmDialogOpen = true;
	}

	transportationDone() {
		this.isBusy = true;
		const data = {
			prod_order_pos_operation_id: this.selectedProdOrderPosOperation?.id,
			id: this.selectedProdOrderPosOperation?.currentDelivery?.id,
			quantity:
				(this.selectedProdOrderPosOperation?.prodOrderPos?.quantity ??
					0) - this.selectedProdOrderPosOperation?.quantityDelivered!,
		};

		this.commonService.post("transport-done", data, false).subscribe({
			next: value => {
				this.gridTable?.onFilterAndSorting();
				this.isBusy = false;
				this.closeConfirmDialog();
				this.selectedProdOrderPosOperation = undefined;
			},
			error: err => {
				this.errorMessage = $localize`Order is not saved`;
				this.isBusy = false;

				this.closeConfirmDialog();
				this.showErrorDialog = true;
				console.error(err);
			},
		});
	}

	closeConfirmDialog() {
		this.isConfirmDialogOpen = false;
	}

	opneParitalDeleveryDialog() {
		this.partialQuantity = 1;
		this.isPartialDeliveryDialogOpen = true;
	}

	closePartialDeliveryDialog() {
		this.isPartialDeliveryDialogOpen = false;
	}

	partialDeliveryDone() {
		if (
			!this.quantityForm?.valid ||
			this.selectedProdOrderPosOperation?.prodOrderPos?.quantity! -
			this.selectedProdOrderPosOperation?.quantityDelivered! <
			this.partialQuantity ||
			this.partialQuantity < 1
		)
			return;

		this.isBusy = true;
		const data = {
			prod_order_pos_operation_id: this.selectedProdOrderPosOperation?.id,
			id: this.selectedProdOrderPosOperation?.currentDelivery?.id,
			quantity: this.partialQuantity,
		};

		this.commonService.post("transport-done", data, false).subscribe({
			next: value => {
				this.gridTable?.onFilterAndSorting();
				this.isBusy = false;
				this.closePartialDeliveryDialog();
				this.selectedProdOrderPosOperation = undefined;
			},
			error: err => {
				this.errorMessage = $localize`Order is not saved`;
				this.isBusy = false;

				this.closePartialDeliveryDialog();
				this.showErrorDialog = true;
				console.error(err);
			},
		});
	}

	processData(data: any[], tableDate: any[]) {
		const clonnedData: any[] = [];
		(data as ProdOrderPosOperation[]).forEach(prodOrderPosOperation => {
			const isFullFilledOrder =
				prodOrderPosOperation?.prodOrderPos?.quantity! >
				prodOrderPosOperation!.quantityDelivered!;
			const canAddOperation =
				this.transportationMode == "notDone" ? isFullFilledOrder : !isFullFilledOrder;

			if (canAddOperation) {
				if (this.selectedHalls.length && prodOrderPosOperation.machine?.hall?.is_active) {
					this.selectedHalls.forEach(h => {
						if (h == prodOrderPosOperation.machine?.hall!.id) {
							clonnedData.push(prodOrderPosOperation);
						}
					});
				} else {
					clonnedData.push(prodOrderPosOperation);
				}
			}
		});

		this.gridTable!.data = clonnedData;
		this.gridTable?.render();

		if (
			clonnedData.length == 0 &&
			tableDate.length != 0 &&
			clonnedData.length < this.gridTable!.limit
		) {
			this.gridTable?.onPagination();
		}
	}

	multiSelectOneSelectionChange(event: any) {
		this.selectedHalls = event.detail.items.map((item: any) => item.id);

		this.selectedProdOrderPosOperation = undefined;
		this.gridTable!.skip = 0;
		this.gridTable?.onPagination(true);
	}

	segmentButtonChange(event: any) {
		this.transportationMode = event.detail.selectedItems[0].id;
		if (event.detail.selectedItems[0].id == 'done') {
			this.gridTable!.expandQuery =
				"$expand=prodOrderProdOperationDeliveries($expand=user),prodOrderPos($expand=item,prodOrder,calculation(expand=offerPos($expand=offerPosRawDimensions))),machine($expand=hall) & $filter= status eq 'IN_PRODUCTION' or status eq 'CLOSED'";
		} else {
			this.gridTable!.expandQuery =
				"$expand=prodOrderProdOperationDeliveries($expand=user),prodOrderPos($expand=item,prodOrder,calculation(expand=offerPos($expand=offerPosRawDimensions))),machine($expand=hall) & $filter= status eq 'IN_PREPARATION' or status eq 'WAITING_FOR_PREPARATION' or status eq 'WAITING_FOR_SETUP'";
		}
		this.selectedProdOrderPosOperation = undefined;
		this.gridTable!.skip = 0;
		this.gridTable?.onPagination(true);
	}

	onColumnsReorder(event: any) {
		const newColumnList = event.detail.columnsNewOrder.splice(2, 15);
		localStorage.setItem(
			"forkFift",
			JSON.stringify(
				newColumnList.map((column: any) => {
					const currentColumn = this.columns.find(
						(column2: any) => column2.accessor == column.id
					);
					return { accessor: column.id, isSelected: currentColumn?.isSelected };
				})
			)
		);
	}
}
