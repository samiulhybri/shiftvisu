import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import { ProdOrderPosOperationHandlingUnitType } from "@app/shared/enums/ProdOrderPosOperationHandlingUnitType";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPosOperationHandlingUnit } from "@app/shared/models/prod-order-pos-operation-handling-unit.model";
import Stock from "@app/shared/models/stock.models";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { Button, FlexBox } from "@ui5/webcomponents-react";
import { SegmentedButtonSelectionChangeEventDetail } from "@ui5/webcomponents/dist/SegmentedButton";
import React from "react";
import { ReplaySubject, takeUntil } from "rxjs";
import { StorageLocation } from "@app/shared/models/storage-location.model";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Localization } from "@app/shared/utils/common-localize";
import { ToastService } from "@app/shared/services/toaster.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
	selector: "app-carton-packaging",
	templateUrl: "./carton-packaging.component.html",
	styleUrl: "./carton-packaging.component.css",
})
export class CartonPackagingComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@Input("handlingUnits") public handlingUnits: HandlingUnit[] = [];
	@Input() public selectedOperationId: number = -1;
	@Input() public selectedHandlingUnit = new HandlingUnit().deserialize({});
	@Input() public selectedItem = new Item().deserialize({});
	@Output() public onOpenHandlingUnit = new EventEmitter<any>();
	@Output() public onUpdateSelectedHU = new EventEmitter<any>();
	@Output() public packagingPositionLength = new EventEmitter<any>();
	@Output() public onStockPackaging = new EventEmitter<any>();
	@Output() public onStockDisuniting = new EventEmitter<any>();
	@Output() public onDePackaging = new EventEmitter<any>();
	@Output() public onDeleteHandlingUnit = new EventEmitter<any>();
	@ViewChild('unlinkDialog', { static: false }) unlinkDialog!: Dialog;
	@ViewChild("childComponentRef", { static: false }) childComponent!: CustomReactGridTable;
	@ViewChild("childComponentPackagingRef", { static: false }) packagingPosComponent:
		| CustomReactGridTable
		| undefined;
	@ViewChild("handlingUnitChildComponentRef", { static: false }) handlingUnitComponent:
		| CustomReactGridTable
		| undefined;
	packagingPositionData: Stock[] = [];
	depackagingData: Stock[] = [];
	modifiedPosData: Stock[] = [];
	savedHandlingUnits: any[] = [];
	prodOrderPosHU: any = null;
	prevPosData: any = [];
	newAddedPackagePosData: any[] = [];
	newAddedStock: Stock | null = null;
	disableButtonDuringRequest = false;
	isLoading = false;
	dialogTitle = $localize`Add Handling Unit`;
	currentMachine: Machine | undefined;
	stocksData: any = [];
	stocksUpdatedData: any[] = [];
	prodOrderPosOperationHandlingUnit: ProdOrderPosOperationHandlingUnit =
		new ProdOrderPosOperationHandlingUnit().deserialize({});
	stocks: Stock = new Stock().deserialize({});
	isQuantitySelected = true;
	expandQuery = "$expand=prodOrderPosOperation($expand=prodOrderPos($expand=item))";
	filterQuery = "";
	selectedStocks: any[] = [];
	selectedPosHu: any[] = [];
	orderDetails: OrderDetails[] = [];
	isEmptyQuantitySelected: boolean = true;
	stockCustomUrl: string = "";
	isLoadingHandlingUnit: boolean = true;
	selectedRowsId: any;
	selectedGoodsReceiptStorageLocation?: StorageLocation;
	onStorageLocationSelected?: (data?: StorageLocation) => void;
	toastMessage: string = "";
	isPrintDialogOpen = false;
	printDialogType = ValueState.Positive;
	printDialogMessage = "";
	printDialogHeaderText = "";
	unlinkDialogMessage = "";
	localization = Localization;

	constructor(
		private commonService: CommonService,
		private dataService: DataService,
		public _toasterSrv: ToastService
	) {
		this.getCurrentMachine();
	}

	ngOnInit(): void {
		this.packagingPositionLength.emit(0);
		this.handlingData();
	}

	handlingData() {
		this.isLoadingHandlingUnit = true;
		const filterQuery = `&$filter=machine_id eq ${this.currentMachine?.id} and type eq '${ProdOrderPosOperationHandlingUnitType.PROD_GOOD}'`;
		const apiUrl = `ProdOrderPosOperationHandlingUnits?$expand=handlingUnit($expand=item)${filterQuery}`;

		this.commonService.get(apiUrl).subscribe((res: any) => {
			this.isLoadingHandlingUnit = false;
			this.savedHandlingUnits = res.value;
			this.handlingUnitComponent?.render();
		});
	}

	updatedSelectedRow() {
		const mappedObj: any = {};
		this.savedHandlingUnits.forEach((el, index) => {
			if (el.handlingUnit.custom_id === this.prodOrderPosHU.handlingUnit.custom_id) {
				mappedObj[index] = true;
			}
		});
		this.selectedRowsId = mappedObj;
	}

	onHandlingUnitSelect(data: any) {
		this.selectedPosHu = [];
		this.depackagingData = [];
		this.newAddedPackagePosData = [];
		this.packagingPositionLength.emit(0);
		const isSelected = data.detail.row.isSelected;
		if (isSelected) {
			const selectedHU = data.detail.row.original;
			if (selectedHU && selectedHU.handling_unit_id) {
				this.childComponent?.onFilterAndSorting();
				if (this.packagingPosComponent) {
					this.packagingPosComponent.isBusy = true;
					this.packagingPosComponent.render();
				}
				this.selectedHandlingUnit =
					this.savedHandlingUnits
						.map(el => el.handlingUnit)
						.find(handlingUnit => handlingUnit.id === selectedHU.handling_unit_id) ||
					new HandlingUnit().deserialize({});

				this.onUpdateSelectedHU.emit(this.selectedHandlingUnit);
				this.getStockPosData();
				this.childComponent?.render();
			} else {
				this.onUpdateSelectedHU.emit(selectedHU.handlingUnit);
				this.packagingPositionData = [];
				this.packagingPosComponent?.render();
				this.childComponent?.onFilterAndSorting();
			}
		} else {
			this.onUpdateSelectedHU.emit(new HandlingUnit().deserialize({}));
			this.packagingPositionData = [];
		}
	}

	getStockPosData() {
		this.commonService
			.get(
				`stock/stocks?positionable_id=${this.selectedHandlingUnit.id}&positionable_type=${BackendModelType.HANDLINGUNIT}`,
				false
			)
			.pipe(takeUntil(this.destroyed$))
			.subscribe((res: any) => {
				const mappedStocks = res.map((el: any) => new Stock().deserialize(el)) as Stock[];
				this.packagingPositionData = mappedStocks.filter(
					el => el.quantity && +el.quantity > 0
				);
				this.packagingPosComponent!.isBusy = false;
				this.packagingPosComponent?.render();
			});
	}

	createHandlingUnit() {
		this.onOpenHandlingUnit.emit(true);
	}

	selectHandlingUnit() {
		this.onOpenHandlingUnit.emit(false);
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
			if (this.currentMachine) {
				this.stockCustomUrl = `/stock/${this.currentMachine.id}/packaging/stocks`;
			}
		});
	}

	ngOnDestroy() {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	multiplePosSelect(event: any): void {
		let selectedRows = event.detail.selectedFlatRows as any[];
		selectedRows = selectedRows.map((el: any, index: number) => {
			if (
				el.id.toString().includes(".") ||
				+el.original.quantity < 1 ||
				el.original.isNewlyAdded
			) {
				el.isSelected = false;
				delete event.detail.selectedRowIds[el.id];
			}
			return el;
		});
		this.selectedPosHu = event.detail.selectedFlatRows
			.filter((el: any) => event.detail.selectedRowIds[el.id])
			.map((el: any) => el.original) as any[];
	}

	multipleRowSelect(event: any): void {
		let selectedRows = event.detail.selectedFlatRows as any[];
		selectedRows = selectedRows.map((el: any, index: number) => {
			if (
				el.id.toString().includes(".") ||
				(el.original.handlingUnit &&
					el.original.handlingUnit.custom_id === this.selectedHandlingUnit.custom_id)
			) {
				el.isSelected = false;
				delete event.detail.selectedRowIds[el.id];
			}
			return el;
		});

		event.detail.selectedFlatRows = selectedRows.filter(
			el => event.detail.selectedRowIds[el.id]
		);
		this.selectedStocks = event.detail.selectedFlatRows
			.filter((el: any) => event.detail.selectedRowIds[el.id])
			.map((el: any) => el.original);
		const emptyQuantitySelected = this.selectedStocks.filter(el => +el.quantity < 1);
		this.isEmptyQuantitySelected = emptyQuantitySelected.length ? true : false;
	}

	onMultiplePackaging() {
		const selectedStockIds = this.selectedStocks.map(el => el.id);
		const stockDataList = this.childComponent!.data as any[];
		this.selectedStocks.forEach(el => {
			const stockIndex = stockDataList.findIndex((stock: any) => stock.id === el.id);
			if (stockIndex !== -1) {
				const newPosItem = new Stock().deserialize({
					id: el.id,
					item: el?.item,
					batch: el.batch,
					serial: el.serial,
					quantity: el.quantity,
					stockable_type: el?.stockable_type,
					stockable_id: el?.stockable_id,
					positionable_type: el?.positionable_type,
					positionable_id: el?.positionable_id,
					itemState: el?.itemState,
					isNewlyAdded: true,
				});

				this.stocksUpdatedData.push({ ...el, quantity: 0 });

				this.newAddedPackagePosData.push({
					...newPosItem,
				});

				this.packagingPositionData.push(newPosItem);
			}
		});

		const filteredStocks = stockDataList.map(el => {
			if (selectedStockIds.includes(el.id)) {
				el.quantity = 0;
			}
			return el;
		});
		this.childComponent!.data = filteredStocks;
		this.selectedStocks = [];
		this.childComponent?.render();
		this.packagingPosComponent?.render();
		this.packagingPositionLength.emit(this.newAddedPackagePosData.length);
	}

	onSave() {
		return this.onSaveCarton();
	}

	stocksDataUpdate(stocksData: any[]) {
		const requests: ODataBatchCall[] = [];
		stocksData.forEach((stock: any, index: number) => {
			delete stock.item;
			const payload = stock;
			const reqType = +stock.quantity > 0 ? "patch" : "delete";
			if (reqType == "patch") {
				delete payload.prodOrderPosOperation;
			}
			const stockUpdateRequest = new ODataBatchCall(
				index + 1,
				reqType,
				`Stocks/${payload.id}`
			);
			stockUpdateRequest.body = payload;
			requests.push(stockUpdateRequest);
		});
		return this.commonService.post("$batch", { requests });
	}

	onSaveCarton() {
		const packagingPositionData = this.newAddedPackagePosData.map((row: any) => {
			return {
				batch: row?.batch,
				serial: row?.serial,
				quantity: row?.quantity,
				stockable_type: row?.stockable_type,
				stockable_id:
					row?.stockable_id === 0 ? this.selectedHandlingUnit?.id : row?.stockable_id,
				positionable_type: BackendModelType.HANDLINGUNIT,
				positionable_id: this.selectedHandlingUnit?.id,
				item_state_id: row.itemState.id,
			};
		});

		const consumedStockData = this.newAddedPackagePosData.map((row: any) => {
			return {
				batch: row?.batch,
				serial: row?.serial,
				quantity: -row?.quantity,
				stockable_type: row?.stockable_type,
				stockable_id:
					row?.stockable_id === 0 ? this.selectedHandlingUnit?.id : row?.stockable_id,
				positionable_type: row.positionable_type,
				positionable_id: row.positionable_id,
				item_state_id: row.itemState.id,
			};
		});

		if (this.newAddedStock) {
			this.newAddedStock.stockable_id = this.selectedHandlingUnit?.id;
			if (this.currentMachine?.production_supply_area_id) {
				this.newAddedStock.positionable_type = BackendModelType.PRODUCTIONSUPPLYAREA;
				this.newAddedStock.positionable_id = this.currentMachine.production_supply_area_id;
			} else {
				this.newAddedStock.positionable_type = BackendModelType.MACHINE;
				this.newAddedStock.positionable_id = this.currentMachine?.id;
			}
		}

		const allStockReqData = this.newAddedStock
			? [this.newAddedStock.toJSON(), ...consumedStockData, ...packagingPositionData]
			: [...consumedStockData, ...packagingPositionData];

		if (this.childComponent) {
			this.childComponent.selectedRowsId = {};
			this.childComponent?.render();
		}
		return this.commonService.put("stock/update-stock", allStockReqData, false);
	}

	toggleSelectButton(event: SegmentedButtonSelectionChangeEventDetail) {
		this.selectedStocks = [];
		this.newAddedPackagePosData = [];
		this.depackagingData = [];
		const selectedId = event.selectedItems[0].id;
		this.childComponent!.data = [];
		if (selectedId === "stock-seg-btn") {
			this.isQuantitySelected = true;
			this.stockCustomUrl = `/stock/${this.currentMachine!.id}/packaging/stocks`;
		} else {
			this.isQuantitySelected = false;
			this.stockCustomUrl = `/stock/${this.currentMachine!.id}/packaging/handling-units`;
		}

		this.packagingPositionLength.emit(0);
		this.packagingPositionData = [];
		this.packagingPosComponent!.isBusy = true;
		this.packagingPosComponent?.render();

		if (this.selectedHandlingUnit.id) {
			this.commonService
				.get(
					`stock/stocks?positionable_id=${this.selectedHandlingUnit.id}&positionable_type=${BackendModelType.HANDLINGUNIT}`,
					false
				)
				.pipe(takeUntil(this.destroyed$))
				.subscribe((res: any) => {
					const mappedStocks = res.map((el: any) =>
						new Stock().deserialize(el)
					) as Stock[];
					this.packagingPositionData = mappedStocks.filter(
						el => el.quantity && +el.quantity > 0
					);
					this.packagingPosComponent!.isBusy = false;
					this.packagingPosComponent?.render();
				});
		} else {
			this.packagingPosComponent!.isBusy = false;
			this.packagingPosComponent?.render();
		}
		setTimeout(() => {
			this.childComponent?.onFilterAndSorting();
		});
	}

	onPackageStockItem(data: any) {
		this.onStockPackaging.emit(data);
	}

	onCreateGoodsReceipt(data: any) {
		this.disableButtonDuringRequest = true;
		if (data.stockable_type !== BackendModelType.PRODORDERPOSOPERATION) {
			return;
		}

    //TODO: Temp disabled
		// this.selectedGoodsReceiptStorageLocation = data.goodsReceiptStorageLocation;
		// this.onStorageLocationSelected = (storageLocation?: StorageLocation) => {
		// 	if (!storageLocation) {
		// 		return;
		// 	}

			const payload = {
				prod_order_pos_operation_id: data.stockable_id,
				item_state_id: data.item_state_id,
				quantity: data.quantity,
				serials: data.serial ? [data.serial] : [],
				batch: data.batch,
				// storage_location_id: storageLocation.id,
			};



			this.childComponent.isBusy = true;
			this.childComponent.render();

      console.log('post');
			this.commonService
				.post(`quantity/create_goods_receipt/${this.currentMachine?.id}`, payload, false)
				.subscribe({
					next: (res: any) => {
						// Reset the table
						this.childComponent.onPagination(true);
						this.disableButtonDuringRequest = false;
						this.toastMessage = $localize`Goods Receipt created successfully`;
						// this.onStorageLocationSelected = undefined;
					},
					error: () => {
						this.childComponent.isBusy = false;
						this.childComponent.render();
						this.toastMessage = $localize`Failed to create Goods Receipt`;
						this.disableButtonDuringRequest = false;
						// this.onStorageLocationSelected = undefined;
					},
				});
		// };
	}

	onUnpackageHandlingUnit(data: any) {
		this.onStockDisuniting.emit(data);
	}

	onClickDePack() {
		const selectedStockIds = this.selectedPosHu.map(el => el.id);

		this.selectedPosHu.forEach(el => {
			const stockIndex = this.packagingPositionData.findIndex(
				(stock: any) => stock.id === el.id
			);
			if (stockIndex !== -1) {
				const newDepackData = new Stock().deserialize({
					id: el.id,
					item: el?.item,
					batch: el.batch,
					serial: el.serial,
					quantity: +el.quantity,
					stockable_type: el?.stockable_type,
					stockable_id: el?.stockable_id,
					positionable_type: el?.positionable_type,
					positionable_id: el?.positionable_id,
					itemState: el?.itemState,
				});

				const depackIndex = this.depackagingData.findIndex(
					el => el.id === newDepackData.id
				);
				if (depackIndex !== -1) {
					const prevQuantity = this.depackagingData[depackIndex].quantity!;
					this.depackagingData[depackIndex].quantity =
						prevQuantity + newDepackData.quantity!;
				} else {
					this.depackagingData.push(newDepackData);
				}
			}

			const updatedPosData = this.packagingPositionData.map(el => {
				if (selectedStockIds.includes(el.id)) {
					return { ...el, quantity: 0 };
				}
				return { ...el };
			}) as Stock[];

			this.packagingPositionData = [...updatedPosData];
		});
		this.selectedPosHu = [];
		this.onDePackaging.emit();
	}

	deleteHUClick(event: any) {
		this.disableButtonDuringRequest = true;
		this.handlingUnitComponent!.isBusy = true;
		this.handlingUnitComponent?.render();
		const deleteHandlingUnitId = event?.id;
		this.commonService
			.delete(`/ProdOrderPosOperationHandlingUnits(${deleteHandlingUnitId})`)
			.subscribe({
				next: () => {
					this.savedHandlingUnits = this.savedHandlingUnits.filter(
						(data: any) => data.id !== deleteHandlingUnitId
					);
					this.onDeleteHandlingUnit.emit();
					this.packagingPositionData = [];
					this.newAddedPackagePosData = [];
					this.packagingPositionLength.emit(0);
					this.onUpdateSelectedHU.emit(new HandlingUnit().deserialize({}));
					this.depackagingData = [];
					this.childComponent?.onFilterAndSorting();
					this.handlingUnitComponent!.isBusy = false;
					this.handlingUnitComponent?.render();
					this.handlingData();
					this.disableButtonDuringRequest = false;
				},
				error: () => {
					this.handlingUnitComponent!.isBusy = false;
					this.handlingUnitComponent?.render();
					this.disableButtonDuringRequest = false;
				},
				complete: () => {},
			});
	}

	printHUClick(prodOrderPosOperationHandlingUnit: ProdOrderPosOperationHandlingUnit) {
		this.commonService
			.get(`warehouse/${this.selectedOperationId}/${prodOrderPosOperationHandlingUnit.handlingUnit?.id}/print`, false)
			.subscribe({
				next: res => {
					this._toasterSrv.showToast($localize`Print Successfully!`, "success");
				},
				error: (e: any) => {
					this.isPrintDialogOpen = true;
					this.printDialogType = ValueState.Negative;
					this.printDialogHeaderText = $localize`Error`;
					this.printDialogMessage = $localize`Print Failed!`;
				},
			});
	}

	onPrint(prodOrderPosOperationHandlingUnit: ProdOrderPosOperationHandlingUnit) {
		this.selectedHandlingUnit = prodOrderPosOperationHandlingUnit as HandlingUnit;
		this.unlinkDialog.open = true;
		this.unlinkDialogMessage = $localize`Do you want to unlink the Handling Unit from the machine?`
		this.printHUClick(this.selectedHandlingUnit);
	}

	closeDialog() {
		this.unlinkDialog.open = false;
	}

	confirmUnlink() {
		if (this.selectedHandlingUnit) {
			this.deleteHUClick(this.selectedHandlingUnit);
		}
		this.closeDialog();
	}

	closePrintDialog() {
		this.isPrintDialogOpen = false;
	}

	quantityColumn = [
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Serial`,
			accessor: "serial",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Batch`,
			accessor: "batch",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Item State Id`,
			accessor: "itemState.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Item State Type`,
			accessor: "itemState.item_state_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							{!rowData.serial ? (
								<Button
									onClick={() => this.onPackageStockItem(rowData)}
									design="Transparent"
									disabled={
										!this.selectedHandlingUnit?.custom_id ||
										this.selectedStocks.length > 1 ||
										!rowData.quantity
									}
									icon="tnt/block"></Button>
							) : (
								<></>
							)}
							<Button
								onClick={() => this.onCreateGoodsReceipt(rowData)}
								design="Transparent"
								disabled={
									(rowData.stockable_type !==
									BackendModelType.PRODORDERPOSOPERATION) || this.disableButtonDuringRequest
								}
								tooltip={$localize`Create Goods Receipt`}
								icon="paper-plane"></Button>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	handlingUnitColumns = [
		{
			Header: $localize`Handing Unit Id`,
			accessor: "handlingUnit.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
	];

	packagingPositionColumn = [
		{
			Header: $localize`Item Id`,
			accessor: "item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Item Name`,
			accessor: "item.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Serial`,
			accessor: "serial",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Item State Type`,
			accessor: "itemState.item_state_type",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
		},
		{
			Header: $localize`Quantity`,
			accessor: "quantity",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Right",
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							{!rowData.serial ? (
								<Button
									onClick={() => this.onUnpackageHandlingUnit(rowData)}
									design="Transparent"
									disabled={
										!this.selectedHandlingUnit?.custom_id ||
										this.selectedStocks.length > 1 ||
										!rowData.quantity ||
										rowData.isNewlyAdded
									}
									icon="tnt/block"></Button>
							) : (
								<></>
							)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];

	handlingUnitColumn: any = [
		{
			Header: $localize`Handling Unit Id`,
			accessor: "handlingUnit.custom_id",
			hAlign: "Left",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			hAlign: "Center",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox style={{ gap: "5px" }}>
							{rowData.handling_unit_id ? (
								<Button
									id="printButton"
									onClick={() => this.onPrint(rowData)}
									icon="print"
									design="Transparent"
								/>
							) : (
								<></>
							)}
							{rowData.handling_unit_id ? (
								<Button
									id="deleteButton"
									onClick={() => this.deleteHUClick(rowData)}
									icon="broken-link"
									design="Transparent"
									disabled={this.disableButtonDuringRequest}
								/>
							) : (
								<></>
							)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
	];
}
