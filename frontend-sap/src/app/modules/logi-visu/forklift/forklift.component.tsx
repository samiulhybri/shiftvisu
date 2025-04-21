import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import "@ui5/webcomponents-icons/dist/search";
import { FlexBox, Text, Icon } from "@ui5/webcomponents-react";
import * as React from "react";
import { CommonService } from "@app/shared/services/common.service";
import Popover from "@ui5/webcomponents/dist/Popover";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { NgForm } from "@angular/forms";
import { TransportOrderPos } from "@app/shared/models/transport-order-pos.model";
import { TransportableType, TransportableTypeClass } from "@app/shared/enums/TransportableType";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { PlantsService } from "@app/shared/services/plants.service";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Item } from "@app/shared/models/item.model";
import { debounceTime, Subject, switchMap, tap } from "rxjs";
import { BackendModelType, BackendModelTypeClass } from "@app/shared/enums/BackendModelType";
import Button from "@ui5/webcomponents/dist/Button";
import {
	BarcodeFormat,
	BrowserCodeReader,
	BrowserMultiFormatReader,
	IScannerControls,
} from "@zxing/browser";
import Stock from "@app/shared/models/stock.models";
import { MultiInputComponent } from "@ui5/webcomponents-ngx";
import { MultiInputTokenDeleteEventDetail } from "@ui5/webcomponents/dist/MultiInput";
import { formatNumber } from "@app/shared/utils/number-formatter";

@Component({
	selector: "app-forklift",
	templateUrl: "./forklift.component.html",
	styleUrl: "./forklift.component.css",
})
export class ForkliftComponent {
	@ViewChild("itemsMultiInputRef") itemsMultiInputRef!: any;
	@ViewChild("itemListPopover") itemListPopover!: Popover;
	@ViewChild("batchMultiInput") batchMultiInput!: any;
	@ViewChild("batchListPopover") batchListPopover!: Popover;
	@ViewChild("codeScannerDialog", { static: false }) codeScannerDialog: any;
	@ViewChild("scanMultiInput") scanMultiInput?: MultiInputComponent;

	isLogOutDialogOpen = false;
	showErrorDialog = false;
	errorMessage = "";
	isBusy = false;
	loading = false;
	isBatchBusy = false;
	isDeclineDialogOpen = false;
	backendModelType = BackendModelType;
	transportableTypeClass = TransportableTypeClass;
	transportableTypeEnum = TransportableType;
	transportableTypeArray = TransportableTypeClass.getEnumArray();
	private searchItemSubject = new Subject<string>();
	scannerControls: IScannerControls | undefined;
	videoInputDevices: MediaDeviceInfo[] = [];
	scannedToken: string[] = [];

	transportableType = "";
	transportableTypeName = "";
	transportableCustomId = "";
	transportableId = 0;
	selectedItemName = "";
	popupHeader = "";
	batchNumber = "";
	selectedItem: any;
	isSearchingOn = false;
	isQuantityDisabled = false;
	duringButtonClick: boolean = false;
	isShowStockDialogOpen: boolean = false;
	isBusyForStocks: boolean = false;
	stocksForItem: any[] = [];
	columns = [
		{
			Header: $localize`Order Id`,
			accessor: "transportOrder.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
		},
		{
			Header: $localize`Type`,
			accessor: "item.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;
				const type = TransportableTypeClass.getStateTranslate(
					rowData.transportable_type
				) as any;

				return type?.text || "";
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
				const rowData = row.original;
				let custom_id = "";

				switch (rowData.transportable_type) {
					case TransportableType.ITEM_PLANT:
						custom_id = rowData?.itemPlant?.item?.custom_id;
						break;
					case TransportableType.HANDLING_UNIT:
						custom_id = rowData?.handlingUnit?.custom_id;
						break;
					case TransportableType.EQUIPMENT:
						custom_id = rowData?.equipment?.custom_id;
						break;

					default:
						break;
				}

				return custom_id;
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
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "End",
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let quantity = 0;

				switch (rowData.transportable_type) {
					case TransportableType.ITEM_PLANT:
						quantity =
							parseFloat(row.original?.quantity) ||
							(this.calculateQuantity(
								row.original.prodOrderPosBomPos?.qty_for_one_parent,
								row.original.prodOrderPosBomPos?.prodOrderPos?.quantity
							) as any);
						break;
					case TransportableType.HANDLING_UNIT:
						quantity = 1;
						break;
					case TransportableType.EQUIPMENT:
						quantity = 1;
						break;

					default:
						break;
				}

				const formattedQuantity = formatNumber(quantity);

				return (
					<React.StrictMode>
						<Text>{formattedQuantity}</Text>
					</React.StrictMode>
				);
			},
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
				let quantity = row.original?.delivered_quantity;

				quantity = quantity % 1 === 0 ? quantity : parseFloat(quantity).toFixed(3);

				const formattedQuantity = formatNumber(quantity);

				return (
					<React.StrictMode>
						<Text>{formattedQuantity}</Text>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`UoM`,
			accessor: "unitOfMeasure.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
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

				return (
					<React.StrictMode>
						<FlexBox>
							<Icon name={data.currentDelivery?.user?.id ? "accept" : "decline"} />
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Transport Order Type`,
			accessor: "transportOrderType.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
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
				const tranportData = row.original.transportOrderPosDeliveries.find(
					(item: any) => item.is_completed == false
				);
				return tranportData ? tranportData?.user?.name : "";
			},
		},
		{
			Header: $localize`Urgent`,
			accessor: "is_urgent",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
			isSelected: true,
			hAlign: "Center",
			Cell: (instance: any) => {
				const transportOrderPos: TransportOrderPos = instance.row.original;
				return (
					<React.StrictMode>
						{transportOrderPos.is_urgent ? (
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
	isDeliveryDialogOpen = false;
	isCompleted = false;
	isCanAccept = true;
	allDataForSelectedType: any = [];
	selectedType = "";
	selectedId = "";
	url = "";
	itemUrl: string = "";
	skip: number = 0;
	top: number = 200;
	initialItems: Item[] = [];
	initialEquipments: any[] = [];
	initialHandlingUnits: HandlingUnit[] = [];
	handlingUnits: HandlingUnit[] = [];
	items: Item[] = [];
	equipments: any = [];
	allBatches: any = [];
	selectedPlant: any;

	selectedTransportOrderPos?: any;
	allSelectedRows: TransportOrderPos[] = [];
	transportOrderPos = TransportOrderPos;

	quantity: any = 0;
	batch = "";
	page = 1;
	perPage = 50;
	isDone = 0;
	transportOrderPosCustomUrl = "";
	selectedBatch: any = undefined;
	globalSearchValue = "";
	customAPI = "";
	scannedStocks: Stock[] = [];

	selectedTransportOrderType = [];
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
		private commonService: CommonService,
		private plantsService: PlantsService
	) {
		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.itemUrl = `/Plants(${plantId})/items`;
			}
		});

		this.plantsService.plant.subscribe((plant: any) => {
			if (plant) {
				this.selectedPlant = plant;
			}
		});
	}

	public orderTypeFilterItems = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};

	ngOnInit() {
		this.transportOrderPosCustomUrl = this.getUpdatedURL();

		this.setColumns();
		this.loadData();

		this.getDataForSearch();
		this.loadTransportOrderType();
	}

	loadTransportOrderType() {
		this.commonService.get("TransportOrderTypes").subscribe({
			next: (response: any) => {
				this.orderTypeFilterItems.data = response.value.map((item: any) => {
					return {
						id: item.id,
						name: item.custom_id,
						key: item.custom_id,
					};
				});
				this.gridTable?.render();
			},
		});
	}

	loadData() {
		this.loading = true;
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/HandlingUnits?$top=${this.top}&$skip=${this.skip}`
			),
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/${this.itemUrl}?$top=${this.top}&$skip=${this.skip}&$expand=itemPlants(id,plant_id,item_id),unitOfMeasure`
			),
			new ODataBatchCall(2, "get", `\/odata\/Equipment?$top=${this.top}&$skip=${this.skip}`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				if (response.responses[0]?.body?.value?.length > 0) {
					response.responses[0]?.body?.value?.map((handlingUnit: HandlingUnit) => {
						const deserializedHandlingUnit = new HandlingUnit().deserialize(
							handlingUnit
						);
						this.handlingUnits.push(deserializedHandlingUnit);
					});
					this.initialHandlingUnits = [
						...this.initialHandlingUnits,
						...this.handlingUnits,
					];
				}

				if (response.responses[1]?.body?.value?.length > 0) {
					this.items = response.responses[1]?.body?.value;
					this.initialItems = [...this.initialItems, ...this.items];
				}

				if (response.responses[2]?.body?.value?.length > 0) {
					this.equipments = response.responses[2]?.body?.value;
					this.initialEquipments = [...this.initialEquipments, ...this.equipments];
				}

				this.skip += 200;

				this.top += 200;

				switch (this.transportableType) {
					case TransportableType.ITEM_PLANT:
						this.allDataForSelectedType = this.initialItems;
						break;
					case TransportableType.HANDLING_UNIT:
						this.allDataForSelectedType = this.initialHandlingUnits;
						break;
					case TransportableType.EQUIPMENT:
						this.allDataForSelectedType = this.initialEquipments;
						break;

					default:
						break;
				}

				this.loading = false;
			},
		});
	}

	setColumns() {
		let columns: any = localStorage.getItem("forkFift-logivisu");
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

	handleRowClick(event: any) {
		this.allSelectedRows = [];

		this.allSelectedRows = event.detail.selectedFlatRows.map((row: any) => row.original) || [];
		const firstUserId = this.allSelectedRows?.[0]?.currentDelivery?.user?.id;

		const isDifferentExist = this.allSelectedRows.find(
			(row: any) => row.currentDelivery?.user?.id != firstUserId
		);

		this.isCanAccept = isDifferentExist ? false : true;

		this.selectedTransportOrderPos = this.allSelectedRows[0] as any;
		const qtyForOneParent =
			this.selectedTransportOrderPos?.prodOrderPosBomPos?.qty_for_one_parent || 0;
		const prodOrderPosQty =
			this.selectedTransportOrderPos?.prodOrderPosBomPos?.prodOrderPos?.quantity || 0;
		const quantity =
			parseFloat(this.selectedTransportOrderPos?.quantity) ||
			this.calculateQuantity(qtyForOneParent, prodOrderPosQty);

		this.transportableType = this.selectedTransportOrderPos?.transportable_type || "";
		this.transportableId = this.selectedTransportOrderPos?.transportable_id || -1;

		if (this.selectedTransportOrderPos) {
			this.selectedTransportOrderPos.quantity =
				this.selectedTransportOrderPos?.transportable_type == TransportableType.ITEM_PLANT
					? quantity
					: 1;
		}
	}

	getTypeValue() {
		const type = TransportableTypeClass.getStateTranslate(
			this.selectedTransportOrderPos?.transportable_type
		) as any;

		return type?.text || "";
	}

	getIdValue() {
		let custom_id = "";

		switch (this.selectedTransportOrderPos?.transportable_type) {
			case TransportableType.ITEM_PLANT:
				custom_id = this.selectedTransportOrderPos?.itemPlant?.item?.custom_id;
				break;
			case TransportableType.HANDLING_UNIT:
				custom_id = this.selectedTransportOrderPos?.handlingUnit?.custom_id;
				break;
			case TransportableType.EQUIPMENT:
				custom_id = this.selectedTransportOrderPos?.equipment?.custom_id;
				break;

			default:
				break;
		}

		return custom_id || "";
	}

	acceptClick() {
		this.isAcceptDialogOpen = true;
	}

	closeAcceptDialog() {
		this.isAcceptDialogOpen = false;
		this.isDeclineDialogOpen = false;
	}

	closeErrorDialog() {
		this.showErrorDialog = false;

		if (this.scannedToken.length) {
			const toRemove = new Set(
				this.scannedStocks
					?.filter((item: any) => {
						return (
							Number(item.quantity) === 0 ||
							(this.selectedTransportOrderPos?.source_type &&
								this.selectedTransportOrderPos?.source_id &&
								(this.selectedTransportOrderPos?.source_type !==
									item.positionable_type ||
									this.selectedTransportOrderPos?.source_id !==
										item.positionable_id))
						);
					})
					?.flatMap((item: any) => [item.stockable_custom_id, item.batch])
					?.filter(Boolean)
			);

			this.scannedToken = this.scannedToken.filter(value => !toRemove.has(value)) || [];

			this.getStocksForScannedId();
		}
	}

	openDeliveryDialog() {
		this.scannedStocks = [];
		this.selectedBatch = undefined;
		
		this.quantity = this.selectedTransportOrderPos.quantity == 1 ? 1 : 0;
		this.isCompleted = this.quantity == 1 ? true : false;

		this.batchNumber = "";
		this.isDeliveryDialogOpen = true;

		const matchTypeData = this.transportableTypeArray.find(
			(type: any) =>
				type.text.modelType === this.selectedTransportOrderPos?.transportable_type
		);

		if (matchTypeData) {
			this.transportableType = matchTypeData.text.modelType;
			this.transportableTypeName = matchTypeData.text.text;
			this.transportableId = this.selectedTransportOrderPos?.transportable_id || -1;

			this.isSearchingOn = false;

			switch (this.transportableType) {
				case TransportableType.ITEM_PLANT:
					this.transportableCustomId = (
						this.selectedTransportOrderPos as any
					)?.itemPlant?.item?.custom_id;

					this.allDataForSelectedType = this.initialItems;
					this.popupHeader = $localize`Items`;
					this.url = this.itemUrl;
					this.isQuantityDisabled = false;

					break;
				case TransportableType.HANDLING_UNIT:
					this.transportableCustomId = (
						this.selectedTransportOrderPos as any
					)?.handlingUnit?.custom_id;

					this.allDataForSelectedType = this.initialHandlingUnits;
					this.popupHeader = $localize`Handling Units`;
					this.url = "HandlingUnits";

					this.isQuantityDisabled = true;
					break;
				case TransportableType.EQUIPMENT:
					this.transportableCustomId = (
						this.selectedTransportOrderPos as any
					)?.equipment?.custom_id;

					this.allDataForSelectedType = this.initialEquipments;
					this.popupHeader = $localize`Equipments`;
					this.url = "Equipment";

					this.isQuantityDisabled = true;
					break;

				default:
					break;
			}
		}
	}

	closeDeliveryDialog() {
		this.isDeliveryDialogOpen = false;
		this.isCompleted = false;
		this.scannedToken = [];
	}

	multiSelectOneSelectionChange(event: any) {
		this.selectedTransportOrderType = event.detail.items.map((item: any) => Number(item.id));
		this.selectedTransportOrderPos = undefined;
		this.gridTable!.skip = 0;
		this.page = 1;

		// Update API URL
		this.transportOrderPosCustomUrl = this.getUpdatedURL();

		// Apply new URL to the table
		if (this.gridTable) {
			this.gridTable.customUrl = this.transportOrderPosCustomUrl;
			this.gridTable.onPagination(true);
		}
	}

	segmentButtonChange(event: any) {
		this.transportationMode = event.detail.selectedItems[0].id;

		this.page = 1;
		this.isDone = this.transportationMode == "notDone" ? 0 : 1;

		this.transportOrderPosCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.transportOrderPosCustomUrl;

			this.gridTable.onPagination(true);
		}

		this.selectedTransportOrderPos = undefined;
		this.gridTable!.skip = 0;
	}

	onColumnsReorder(event: any) {
		const newColumnList = event.detail.columnsNewOrder.splice(2, 15);
		localStorage.setItem(
			"forkFift-logivisu",
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

	calculateQuantity(parentQuantity: number, prodOrderPosQuantity: number) {
		const result = parentQuantity * prodOrderPosQuantity;
		return !isNaN(result) ? result : "";
	}

	acceptOrder() {
		this.duringButtonClick = true;
		this.isBusy = true;

		const payload = this.allSelectedRows.map((row: any) => {
			return {
				transport_order_pos_id: row?.id,
				user_id: this.authService.loggedInUser.id,
			};
		});

		this.commonService.post("logi-visu/accept-order", { data: payload }, false).subscribe({
			next: value => {
				this.page = 1;
				this.transportOrderPosCustomUrl = this.getUpdatedURL();

				this.isBusy = false;
				this.selectedTransportOrderPos.currentDelivery = {
					...value,
					user: this.authService.loggedInUser,
				};

				const index = this.gridTable?.data.findIndex(
					(transportOrderPos: TransportOrderPos) =>
						transportOrderPos.id == this.selectedTransportOrderPos?.id
				);

				if (index > -1 && this.gridTable?.data?.[index]) {
					this.gridTable!.data[index].currentDelivery = {
						...value,
						user: this.authService.loggedInUser,
					};
				}

				if (this.gridTable) {
					this.gridTable.customUrl = this.transportOrderPosCustomUrl;
					this.gridTable?.onPagination(true);
				}
				this.closeAcceptDialog();
				this.duringButtonClick = false;
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
				this.duringButtonClick = false;
			},
		});
	}

	deliveryDone() {
		this.partialDeliveryDone();
	}

	partialDeliveryDone() {
		const saveButton = document.getElementById("saveButton") as Button;
		const alreadyExistValues: string[] = [];
		saveButton.disabled = true;
		const data: any = [];

		if (!this.quantity) return;

		if (this.scannedStocks.length) {
			this.scannedStocks.forEach((stock: any) => {
				if (stock.isPresent) {
					alreadyExistValues.push(stock.stockable_custom_id);
				} else {
					const payload = {
						transport_order_pos_id: this.selectedTransportOrderPos?.id,
						id: this.selectedTransportOrderPos?.currentDelivery?.id,
						delivered_quantity: stock.quantity,
						transportable_type: stock.stockable_type,
						transportable_id: stock?.stockable_id,
						item_state_id: this.selectedTransportOrderPos?.item_state_id,
						destination_type: this.selectedTransportOrderPos?.destination_type,
						destination_id: this.selectedTransportOrderPos?.destination_id,
						batch: stock?.batch,
						stockId: stock?.id,
					};

					data.push(payload);
				}
			});
		} else {
			const payload = {
				transport_order_pos_id: this.selectedTransportOrderPos?.id,
				id: this.selectedTransportOrderPos?.currentDelivery?.id,
				delivered_quantity: this.quantity,
				transportable_type: this.selectedTransportOrderPos?.transportable_type,
				transportable_id: this.selectedTransportOrderPos?.transportable_id,
				item_state_id: this.selectedTransportOrderPos?.item_state_id,
				destination_type: this.selectedTransportOrderPos?.destination_type,
				destination_id: this.selectedTransportOrderPos?.destination_id,
				batch: null,
				stockId: null,
			};

			data.push(payload);
		}

		this.isBusy = true;

		if (!data.length) {
			this.isBusy = false;
			this.errorMessage = $localize`All scanned HU/Batch exist in the current machine!`;
			this.showErrorDialog = true;
			return;
		}

		this.commonService.post("logi-visu/transport-done", { data }, false).subscribe({
			next: value => {
				this.isBusy = false;

				if (this.isCompleted) {
					this.transportationDone();
				} else this.acceptOrder();

				this.page = 1;
				this.transportOrderPosCustomUrl = this.getUpdatedURL();

				this.selectedBatch = undefined;

				if (value) {
					this.closeDeliveryDialog();

					if (alreadyExistValues.length) {
						this.errorMessage = $localize`Order is Saved. But ${alreadyExistValues.toString()} is already exists in the current machine.`;
						this.showErrorDialog = true;
					}

					this.batchNumber = "";
					saveButton.disabled = false;

					this.scannedStocks = [];
					if (this.gridTable) {
						this.page = 1;
						this.transportOrderPosCustomUrl = this.getUpdatedURL();

						this.gridTable.customUrl = this.transportOrderPosCustomUrl;
						this.gridTable?.onPagination(true);
					}
				} else {
					this.showErrorDialog = true;
					this.errorMessage = $localize`Order is not saved`;
				}

				this.scannedToken = [];
			},
			error: err => {
				this.errorMessage = $localize`Order is not saved`;
				this.isBusy = false;

				this.closeDeliveryDialog();
				this.showErrorDialog = true;
				console.error(err);
				this.batchNumber = "";
				saveButton.disabled = false;
			},
		});
	}

	transportationDone() {
		this.isBusy = true;

		this.commonService
			.patch(`TransportOrderPos(${this.selectedTransportOrderPos?.id})`, {
				is_completed: true,
			})
			.subscribe({
				next: value => {
					this.isCompleted = false;
					this.isBusy = false;
					this.selectedTransportOrderPos = undefined;

					if (this.gridTable) {
						this.page = 1;
						this.transportOrderPosCustomUrl = this.getUpdatedURL();

						this.gridTable.customUrl = this.transportOrderPosCustomUrl;
						this.gridTable?.onPagination(true);
					}
				},
				error: err => {
					this.isBusy = false;
				},
			});
	}

	getUpdatedURL() {
		this.updateTableRowCount().then((count: number) => {
			if (this.gridTable) this.gridTable.filteredDataCount = count;
		});

		const transportOrderTypeFilter = this.selectedTransportOrderType.length
			? `&transportOrderType=${this.selectedTransportOrderType.join(",")}`
			: "";

		return `/logi-visu/all-transport-orders?isDone=${this.isDone}&perPage=${this.perPage}&page=${this.page}&search=${this.globalSearchValue}${transportOrderTypeFilter}`;
	}

	onLoadMoreForForklift() {
		this.page += 1;

		this.transportOrderPosCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.transportOrderPosCustomUrl;

			this.gridTable.onPagination();
		}
	}

	processData(data: any, tableDate: any[]) {
		const gridData: any[] = this.gridTable!.data || [];

		if (this.selectedTransportOrderPos) {
			const index = this.gridTable?.data?.findIndex(
				(data: any) => data.id == this.selectedTransportOrderPos?.id
			);
			if (this.gridTable?.data?.length) {
				this.gridTable!.selectedRowsId = { [index]: true };

				this.selectedTransportOrderPos =
					this.gridTable?.data[index] ?? this.selectedTransportOrderPos;
			}
		}

		this.transportableType = this.selectedTransportOrderPos?.transportable_type || "";
		this.transportableId = this.selectedTransportOrderPos?.transportable_id || -1;

		if (this.selectedTransportOrderPos) {
			if (!this.selectedTransportOrderPos?.currentDelivery) {
				this.selectedTransportOrderPos.currentDelivery = undefined;
			}

			const qtyForOneParent =
				this.selectedTransportOrderPos?.prodOrderPosBomPos?.qty_for_one_parent || 0;
			const prodOrderPosQty =
				this.selectedTransportOrderPos?.prodOrderPosBomPos?.prodOrderPos?.quantity || 0;
			const quantity =
				parseFloat(this.selectedTransportOrderPos?.quantity) ||
				this.calculateQuantity(qtyForOneParent, prodOrderPosQty);

			this.transportableType = this.selectedTransportOrderPos?.transportable_type || "";
			this.transportableId = this.selectedTransportOrderPos?.transportable_id || -1;

			if (this.selectedTransportOrderPos) {
				this.selectedTransportOrderPos.quantity =
					this.selectedTransportOrderPos?.transportable_type ==
					TransportableType.ITEM_PLANT
						? quantity
						: 1;
			}
		}

		this.allSelectedRows = [this.selectedTransportOrderPos];
	}

	onLoadMoreSelectedTypeData() {
		if (!this.isSearchingOn || !this.transportableCustomId) {
			this.loadData();
		}
	}

	changeIsCompleted(event: any) {
		this.isCompleted = event.target.checked;
	}

	onSearchItem() {
		this.searchItemSubject.next(this.selectedItemName);
	}

	getDataForSearch() {
		this.searchItemSubject
			.pipe(
				tap(() => {
					this.loading = true;
				}),
				debounceTime(800),
				switchMap(query => {
					this.skip = 0;

					if (this.transportableType == BackendModelType.ITEMPLANT) {
						return this.commonService.get(
							`${this.url}?$expand=itemPlants&$filter=contains(custom_id,'${this.transportableCustomId}')&$top=500`
						);
					} else {
						return this.commonService.get(
							`${this.url}?$filter=contains(custom_id,'${this.transportableCustomId}')&$top=500`
						);
					}
				})
			)
			.subscribe({
				next: (data: any) => {
					this.allDataForSelectedType = data?.value;
					this.isSearchingOn = true;
					this.loading = false;
					this.loading = false;
				},
				error: err => {
					this.loading = false;
				},
				complete: () => {},
			});
	}

	onSearchForCustomAPI(searchValue: string) {
		this.globalSearchValue = searchValue;

		this.page = 1;

		this.transportOrderPosCustomUrl = this.getUpdatedURL();

		if (this.gridTable) {
			this.gridTable.customUrl = this.transportOrderPosCustomUrl;

			this.gridTable.onPagination(true);
		}
	}

	async updateTableRowCount() {
		return new Promise<number>((resolve, reject) => {
			this.commonService
				.get(
					`logi-visu/all-transport-order-count?isDone=${this.isDone}&perPage=${this.perPage}&page=${this.page}&transportOrderType=${this.selectedTransportOrderType?.toString()}&search=${this.globalSearchValue}`,
					false,
					true
				)
				.subscribe({
					next: (res: any) => {
						resolve(res ?? 0);
					},
					error: err => {
						console.error(err);
						resolve(0);
					},
					complete: () => {
						this.gridTable?.render();
					},
				});
		});
	}

	openCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.codeScannerDialog.elementRef.nativeElement.open = true;
			this.startCodeScanning();
		}
	}

	private async startCodeScanning() {
		const codeReader = new BrowserMultiFormatReader();
		codeReader.possibleFormats = [
			BarcodeFormat.AZTEC,
			BarcodeFormat.CODABAR,
			BarcodeFormat.CODE_39,
			BarcodeFormat.CODE_93,
			BarcodeFormat.CODE_128,
			BarcodeFormat.DATA_MATRIX,
			BarcodeFormat.EAN_8,
			BarcodeFormat.EAN_13,
			BarcodeFormat.ITF,
			BarcodeFormat.MAXICODE,
			BarcodeFormat.PDF_417,
			BarcodeFormat.QR_CODE,
			BarcodeFormat.RSS_14,
			BarcodeFormat.RSS_EXPANDED,
			BarcodeFormat.UPC_A,
			BarcodeFormat.UPC_E,
			BarcodeFormat.UPC_EAN_EXTENSION,
		];

		this.videoInputDevices = await BrowserCodeReader.listVideoInputDevices();

		if (this.videoInputDevices.length === 0) {
			return;
		}

		const backCamera = this.videoInputDevices.find(camera =>
			/back|rear|environment/i.test(camera.label)
		);
		const selectedDeviceId = backCamera
			? backCamera.deviceId
			: this.videoInputDevices[0].deviceId;

		const previewElem: HTMLVideoElement = document.querySelector(
			"#codeScannerClockDialog > video"
		) as HTMLVideoElement;
		this.scannerControls = await codeReader.decodeFromVideoDevice(
			selectedDeviceId,
			previewElem,
			(result, _) => {
				if (result && result.getText()) {
					this.scannedToken.push(result.getText());
					this.getStocksForScannedId();

					this.scannerControls?.stop();
					this.closeCodeScannerDialog();
				}
			}
		);
	}

	closeCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.scannerControls?.stop();
			this.codeScannerDialog.elementRef.nativeElement.open = false;
		}
	}

	getScanText() {
		if (this.scannedToken.length) {
			this.quantity = 0;
			this.scannedStocks = [];
		}
	}

	getStocksForScannedId() {
		if (!this.scannedToken.length) {
			this.quantity = 0;
			this.scannedStocks = [];
		}

		this.isBusy = true;
		this.quantity = 0;

		this.commonService
			.get(
				`stock/scan-stock-for-transport-order?scannedId=${this.scannedToken.toString()}&destinationId=${this.selectedTransportOrderPos?.destination_id}&destinationType=${this.selectedTransportOrderPos?.destination_type}`,
				false
			)
			.subscribe({
				next: async (response: any) => {
					this.scannedStocks = response || [];

					let isNullQuantityAvailable = this.scannedStocks.find(
						(stock: Stock) => (stock?.quantity || 0) <= 0
					);

					if (isNullQuantityAvailable) {
						this.errorMessage = $localize`No stock for scanned code found.`;
						this.showErrorDialog = true;
					} else {
						this.quantity = this.scannedStocks
							.map((item: Stock) => parseFloat(item.quantity?.toString() || "0"))
							.reduce((prev: any, curr: any) => prev + curr, 0);
					}

					if (this.scannedStocks && this.scannedStocks.length) {
						for (const { positionable_type, positionable_id } of this.scannedStocks) {
							if (
								this.selectedTransportOrderPos?.source_type &&
								this.selectedTransportOrderPos?.source_id
							) {
								const { source_type, source_id } =
									this.selectedTransportOrderPos || {};

								if (
									source_type !== positionable_type ||
									source_id !== positionable_id
								) {
									this.errorMessage = $localize`Position of scanned code does not match transport source`;
									this.showErrorDialog = true;
								}
							}
						}
					}

					this.isBusy = false;
				},
				error: (err: any) => {
					console.log(err);
					this.isBusy = false;
				},
			});
	}

	declineClick() {
		this.isDeclineDialogOpen = true;
	}

	declineOrder() {
		this.duringButtonClick = true;
		this.isBusy = true;
		const ids = this.allSelectedRows.map((row: any) => row?.currentDelivery?.id);

		this.commonService.post(`logi-visu/decline-order`, { posIds: ids }, false).subscribe({
			next: value => {
				this.duringButtonClick = false;

				this.page = 1;
				this.transportOrderPosCustomUrl = this.getUpdatedURL();

				this.isBusy = false;
				this.selectedTransportOrderPos.currentDelivery = {};

				const index = this.gridTable?.data.findIndex(
					(transportOrderPos: TransportOrderPos) =>
						transportOrderPos.id == this.selectedTransportOrderPos?.id
				);

				if (index > -1 && this.gridTable?.data?.[index]) {
					this.gridTable.data[index].currentDelivery = {};
				}

				if (this.gridTable) {
					this.gridTable.customUrl = this.transportOrderPosCustomUrl;
					this.gridTable?.onPagination(true);
				}

				this.closeAcceptDialog();
			},
			error: err => {
				this.errorMessage = $localize`Declining Order is not successful!`;

				this.closeAcceptDialog();
				this.showErrorDialog = true;
				this.duringButtonClick = false;
			},
		});
	}

	updateSelectedScannedTextFromMultiInput() {
		const scanText = this.scanMultiInput?.value;
		if (scanText) {
			this.scannedToken.push(scanText);
			this.scanMultiInput!.value = "";

			this.getStocksForScannedId();
		}
	}

	updateSelectedTextFromTokenDeleted($event: MultiInputTokenDeleteEventDetail) {
		this.scannedToken = this.scannedToken.filter(scanText => {
			return !$event.tokens.some(item => item.text === scanText);
		});

		this.getStocksForScannedId();
	}

	formatQuantity = (value?: number) => {
		if (value) return formatNumber(value);
		else return "";
	};

	handleStockClick() {
		this.isShowStockDialogOpen = true;
		this.isBusyForStocks = true;
		this.stocksForItem = [];
		let type = "";

		switch (this.selectedTransportOrderPos.transportable_type) {
			case TransportableType.ITEM_PLANT:
				type = "itemPlant";
				break;
			case TransportableType.HANDLING_UNIT:
				type = "handlingUnit";
				break;
			case TransportableType.EQUIPMENT:
				type = "equipment";
				break;

			default:
				break;
		}

		this.commonService
			.get(
				`stock/${type}/${this.selectedTransportOrderPos.transportable_id}/get-stocks-by-type`,
				false
			)
			.subscribe({
				next: (response: any) => {
					this.isBusyForStocks = false;
					this.stocksForItem = response;
				},

				error: () => {
					this.isBusyForStocks = false;
				},
			});
	}

	closeStocksForItem() {
		this.isShowStockDialogOpen = false;
	}

	stockForItemPlantColumns: any = [
		{
			Header: $localize`Id`,
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
			Header: $localize`Name`,
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
