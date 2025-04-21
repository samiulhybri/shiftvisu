import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { User } from "@app/shared/models/user.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { BillOfMaterialComponent } from "@app/modules/machine-board/material-consumption/bill-of-material/bill-of-material.component";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Observable, of, ReplaySubject, Subject, takeUntil, tap } from "rxjs";
import Popover from "@ui5/webcomponents/dist/Popover";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { StorageBin } from "@app/shared/models/storage-bin.model";
import { StorageLocation } from "@app/shared/models/storage-location.model";
import {
	Input as UI5Input,
	FlexBox,
	Button,
	ComboBox,
	ComboBoxItem,
} from "@ui5/webcomponents-react";
import React from "react";
import { CustomReactGridTable } from "@app/shared/components/CustomGridTable";
import { Item } from "@app/shared/models/item.model";
import { PlantsService } from "@app/shared/services/plants.service";
import { TransportOrderType } from "@app/shared/models/transport-order-type";
import { TransportableType, TransportableTypeClass } from "@app/shared/enums/TransportableType";
import { Setting } from "@app/shared/models/setting.model";
import { Localization } from "@app/shared/utils/common-localize";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import PackagingInstruction from "@app/shared/models/packaging-instruction.model";
import PackagingInstructionPos from "@app/shared/models/packaging-instruction-pos.model";

@Component({
	selector: "app-material-consumption",
	templateUrl: "./material-consumption.component.html",
	styleUrl: "./material-consumption.component.css",
})
export class MaterialConsumptionComponent {
	@ViewChild("materialConsumptionModalRef") modalRef!: Dialog;
	@ViewChild("billOfMaterialRef") billOfMaterialRef!: BillOfMaterialComponent;
	@ViewChild("statusToastTools", { static: false }) statusToastTools: any;
	@ViewChild("successRecordSav", { static: false }) successRecordSavToast: any;
	@ViewChild("handlingUnitListPopover") handlingUnitListPopover!: any;
	@ViewChild("showPopRefHU") showPopRefHU!: any;
	@ViewChild("storageBinListPopover") storageBinListPopover!: Popover;
	@ViewChild("showPopRefSB") showPopRefSB!: any;
	@ViewChild("storageLocationListPopover") storageLocationListPopover!: Popover;
	@ViewChild("showPopRefSL") showPopRefSL!: any;
	@ViewChild("itemListPopover") itemListPopover!: Popover;
	@ViewChild("showPopRefItem") showPopRefItem!: any;
	@ViewChild("materialChildComponentRef") materialChildComponentRef?: CustomReactGridTable;
	@ViewChild("multipleItemChildComponentRef")
	multipleItemChildComponentRef?: CustomReactGridTable;

	dialogTitle: string = $localize`Material Consumption`;
	selectedTab: string = "Bom";
	orderCreateDialog: boolean = false;
	@Input() fromProductionPlan = false;
	@Input() fromTransportOrder = false;
	@Input() prodOrderPosId!: number;
	@Input() posSelectedRowId!: number;
	@Output() onClickCreateOrderEmitter = new EventEmitter<false>();
	shippingRowData: any;
	isUrgentChecked: boolean = false;
	toasterStatus!: string;
	loading: boolean = false;
	isLoading: boolean = false;
	custom_id: string = "";
	loggedInUser!: User | undefined;
	@Input() machine?: any;
	bomSelectedRowData!: any;
	newMaterialData: any[] = [];
	selectedDialogData: any[] = [];
	isMultiOrder!: boolean;
	dialogSelect!: string;
	handlingUnits: HandlingUnit[] = [];
	items: Item[] = [];
	dynamicSearch: string = "";
	skip: number = 0;
	top: number = 200;
	selectedHUCustomId: string = "";
	selectedSBCustomId: string = "";
	selectedSLCustomId: string = "";
	selectedHandlingUnitId: number | undefined | string = "";
	selectedStorageBinId: number | undefined | string = "";
	selectedStorageLocationId: number | undefined | string = "";
	selectedItemId: number | undefined | string = "";
	initialHandlingUnits: HandlingUnit[] = [];
	initialStorageBins: StorageBin[] = [];
	initialStorageLocations: StorageLocation[] = [];
	initialItems: Item[] = [];
	initialTransportOrderTypes: TransportOrderType[] = [];
	transportOrderTypes: TransportOrderType[] = [];
	initialEquipments: TransportOrderType[] = [];
	equipments: any = [];
	selectedField: string = "";
	popoverIsOpen: boolean = false;
	isMultiItemSelect: boolean = false;
	itemUrl: string = "";
	prodOrderPosOperationData: any = {};
	posCounter: number = 0;
	isDataSaving: boolean = false;
	deliveryDate = new Date();
	transportableTypeArray = TransportableTypeClass.getEnumArray();
	setting: Setting = new Setting().deserialize({});
	filteredTransportOrderColumns: any = [];
	localization = Localization;

	dataField: string = "";
	placeholder: string = "";
	headerText: string = "";
	field: string = "";
	customId: string = "";
	largestPos: number = 0;

	// Packaging selection
	@ViewChild("packagingInstructionPopover") packagingInstructionPopover!: Popover;
	@ViewChild("instructionInputRef") instructionInputRef!: any;
	@ViewChild("itemsMultiInputRef") itemsMultiInputRef!: any;
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	selectedItem = new Item().deserialize({});
	selectedPackagingInstruction: any = new PackagingInstruction().deserialize({});
	savedPackagingInstruction: any = new PackagingInstruction().deserialize({});
	isShowPackagingPopup: boolean = false;
	isInstructionLoading: boolean = false;
	packagingInstructions: any[] = [];
	instructionCustomID = "";
	selectedItemName: string = "";
	itemSearch: string = "";
	plantId: number = 0;

	constructor(
		private commonService: CommonService,
		private activeRoute: ActivatedRoute,
		private router: Router,
		private plantsService: PlantsService,
		private authService: AuthService,
		private dataService: DataService
	) {
		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.itemUrl = `/Plants(${plantId})/items`;
			}
		});
	}

	ngOnInit(): void {
		this.loggedInUser = this.authService.getUser();
		this.dataService.machine$.subscribe((value: any) => {
			this.machine = value;
		});
		this.loadData();

		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}

	onOrderCreateDialogChange(orderCreateDialog: boolean) {
		this.orderCreateDialog = orderCreateDialog;
	}

	onMultipleOrderEmitChange(event: { isMultipleOrder: boolean; dialogSelect?: string }) {
		const isMultiOrder = event.isMultipleOrder; // Access the emitted data
		const dialogSelect = event.dialogSelect;

		if (dialogSelect == "multiItemSelectDialog") {
			this.isMultiItemSelect = isMultiOrder;
		} else {
			this.isMultiOrder = isMultiOrder;
		}
	}

	onShippingRowDataChange(shippingRowData: any) {
		this.shippingRowData = shippingRowData;
		this.custom_id = this.shippingRowData.custom_id;
	}

	onIsCustomIdBusyChange(isCustomBusy: boolean) {
		this.loading = isCustomBusy;
	}
	transportOrderNoDataEmitter(event: boolean) {
		if (event) this.onClickCreateOrderEmitter.emit(false);
	}

	urgentCheckbox(event: any) {
		this.isUrgentChecked = event.target.checked;
	}

	onBomSelectedRowsChange(bomSelectedRowData: any) {
		this.custom_id = bomSelectedRowData?.custom_id;

		this.prodOrderPosOperationData = {
			max_bom_pos: bomSelectedRowData?.pos,
			prod_order_pos_id: bomSelectedRowData?.prod_order_pos_id,
			prod_order_pos_quantity: bomSelectedRowData?.prod_order_pos_quantity,
		};
		if (this.isMultiOrder) {
			this.orderCreateDialog = true;
			this.multipleItemChildComponentRef?.render();
		}
		this.bomSelectedRowData = bomSelectedRowData;
	}

	loadData() {
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(0, "get", `\/odata\/HandlingUnits?$top=${this.top}`),
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/${this.itemUrl}?$top=${this.top}&$expand=itemPlants(id,plant_id,item_id),unitOfMeasure`
			),
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/TransportOrderTypes?$filter=is_active eq true&$top=${this.top}`
			),
			new ODataBatchCall(3, "get", `\/odata\/Equipment?$top=${this.top}`),
			new ODataBatchCall(4, "get", `\/odata\/Settings?$top=1`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((handlingUnit: HandlingUnit) => {
					const deserializedHandlingUnit = new HandlingUnit().deserialize(handlingUnit);
					this.handlingUnits.push(deserializedHandlingUnit);
				});
				this.initialHandlingUnits = [...this.handlingUnits];

				this.items = response.responses[1]?.body?.value;
				this.initialItems = [...this.items];

				this.transportOrderTypes = response.responses[2]?.body?.value;
				this.initialTransportOrderTypes = [...this.transportOrderTypes];

				this.equipments = response.responses[3]?.body?.value;
				this.initialEquipments = [...this.equipments];

				this.setting = new Setting().deserialize(response.responses[4]?.body?.value?.[0]);

				if (!this.setting.is_ewm_enabled) {
					this.billOfMaterialRef?.addActionColumn();
				}

				if (this.setting.is_ewm_enabled) {
					this.billOfMaterialRef?.addItemTypeColumn();
				} else if (this.fromTransportOrder) {
					this.getTransportOrderPos();
				}

				this.hideColumns();

				this.isLoading = false;
				this.skip = this.top;
			},
		});
	}

	hideColumns() {
		this.multipleItemColumns[5].isSelected = !this.setting.is_ewm_enabled;
		this.multipleItemColumns[6].isSelected = !this.setting.is_ewm_enabled;

		this.multipleItemColumns[2].isSelected = this.setting.is_ewm_enabled;

		this.filteredTransportOrderColumns = this.multipleItemColumns.filter(
			(column: any) => column.isSelected == true
		);
	}

	onItemClick(event: any, field: string) {
		if (field == "Handling Unit") {
			const huCustomId = event.item.innerText;
			this.selectedHUCustomId = huCustomId;
			this.selectedHandlingUnitId = parseInt(event.item.id);
			this.handlingUnitListPopover.open = false;
		} else {
			const slCustomId = event.item.innerText;
			this.selectedSLCustomId = slCustomId;
			this.selectedStorageLocationId = parseInt(event.item.id);
			this.storageLocationListPopover.open = false;
		}
	}

	deleteMaterialClick(data: any, columnIdentifier?: string) {
		const deletedObject = data;

		if (columnIdentifier == "multipleItemColumns") {
			this.bomSelectedRowData = this.bomSelectedRowData.filter((data: any) => {
				return (
					data.transportable_custom_id != deletedObject.transportable_custom_id ||
					data.transportable_type != deletedObject.transportable_type || data.fromPackaging !== deletedObject.fromPackaging
				);
			});

			this.selectedDialogData = this.bomSelectedRowData.filter((data: any) => {
				return (
					data.transportable_custom_id != deletedObject.transportable_custom_id ||
					data.transportable_type != deletedObject.transportable_type || data.fromPackaging !== deletedObject.fromPackaging
				);
			});

			this.multipleItemChildComponentRef?.render(); // Render the BOM grid
		} else {
			this.newMaterialData = this.newMaterialData.filter((data: any) => {
				return data.id != deletedObject.id;
			});
			this.materialChildComponentRef?.render(); // Render the material grid
		}
	}

	async getBomPosData(prod_order_pos_id: number | undefined): Promise<number> {
		return new Promise((resolve, reject) => {
			this.commonService
				.get(`ProdOrderPosBomPos?$filter=prod_order_pos_id eq ${prod_order_pos_id}`)
				.subscribe({
					next: (response: any) => {
						if (response?.value && response.value.length > 0) {
							const posValues = response.value.map((bomPos: any) => bomPos.pos);
							this.largestPos = Math.max(...posValues);
							resolve(this.largestPos);
						} else {
							this.largestPos = 0;
							resolve(this.largestPos);
						}
					},
					error: (error: any) => {
						reject(error); // Handle errors
					},
				});
		});
	}

	async createTransportOrder() {
		this.loading = true;
		if (this.setting.is_ewm_enabled) {
			const payload: any = [];
			const opeationId =
				this.billOfMaterialRef?.operationSelectedRow?.id ||
				this.billOfMaterialRef?.prodOrderPosOperationId;

			this.bomSelectedRowData.forEach((rowData: any) => {
				payload.push({
					prod_order_pos_bom_pos_id: rowData.original.id,
					quantity: parseFloat(rowData.quantity),
				});
			});

			// Send TransportOrders request after batch request succeeds
			this.commonService
				.post(
					`warehouse/${opeationId}/create-cross-order-tasks`,
					{ warehouse_tasks: payload },
					false
				)
				.subscribe({
					next: () => {
						this.isDataSaving = false;
						if (this.billOfMaterialRef.childComponentRef?.selectedRowsId) {
							this.billOfMaterialRef.childComponentRef.selectedRowsId = {};
							this.billOfMaterialRef.childComponentRef.render();
						}

						this.toasterStatus = $localize`Order Created Successfully`;
						this.successRecordSavToast.elementRef.nativeElement!.show = true;
						this.statusToastTools.elementRef.nativeElement!.show = true;

						this.selectedHandlingUnitId = "";
						this.selectedStorageBinId = "";
						this.selectedStorageLocationId = "";
						this.selectedHUCustomId = "";
						this.selectedSBCustomId = "";
						this.selectedSLCustomId = "";
						this.isMultiItemSelect = false;
						this.isMultiOrder = false;
						this.isUrgentChecked = false;
						this.orderCreateDialog = false;
						this.bomSelectedRowData = [];
						this.selectedDialogData = [];
						this.newMaterialData = [];
						this.custom_id = "";
						this.loading = false;
					},
					error: e => {
						this.loading = false;
						this.isDataSaving = false;
						// Handle TransportOrders error
						console.error("Error creating Transport Orders:", e);
					},
				});
		} else {
			await this.onClickCreateOrder();
		}
	}

	async onClickCreateOrder() {
		let pos =
			(await this.getBomPosData(this.prodOrderPosOperationData?.prod_order_pos_id)) || 0;

		const date = new Date().toISOString();
		let dataToSend: any;
		let prodOrderPosBomPosData: any[] = [];
		let requests: ODataBatchCall[] = [];
		let batchIndex = 0; // Initialize the batch index
		let newRowIndex = 0;
		if (!this.selectedDialogData?.length) this.selectedDialogData = this.bomSelectedRowData;

		dataToSend = {
			custom_id: this.custom_id,
			delivery_date: this.deliveryDate,
			transportOrderPos: this.selectedDialogData.map((rowData: any, index: number) => {
				if (rowData.isNew) {
					// Check if it's a new row
					// Create ProdOrderPosBomPos data for new rows
					prodOrderPosBomPosData.push({
						prod_order_pos_id: this.prodOrderPosOperationData?.prod_order_pos_id,
						pos: ++pos,
						item_id: rowData.item_id,
						qty_for_one_parent: Number(rowData.quantity),
						is_active: 1,
						is_backflush: 1,
						is_quantity_fixed: 0,
						is_bulk: 0,
						unit_of_measure_id: rowData.original?.unitOfMeasure?.id,
						quantity_total:
							rowData.quantity *
							(this.prodOrderPosOperationData?.prod_order_pos_quantity ||
								this.billOfMaterialRef?.operationSelectedRow?.prodOrderPos
									?.quantity ||
								1),
					});

					let transportable_id = -1;
					if (rowData.transportable_type == TransportableType.ITEM_PLANT) {
						const item = this.items.find(
							(item: any) =>
								item.id === rowData?.original?.transportable_id &&
								item.itemPlants.some(
									(plant: any) =>
										plant.plant_id ===
										(
											this.billOfMaterialRef?.operationSelectedRow
												?.prodOrderPos?.prodOrder as any
										)?.plant_id_production
								)
						) as any;
						transportable_id = item?.itemPlants[0]?.id || -1;
					} else transportable_id = rowData?.original?.transportable_id;

					// Add a placeholder for the prod_order_pos_bom_pos_id in transportOrderPos
					return {
						prod_order_pos_bom_pos_id: `placeholder-${newRowIndex++}`, // Unique placeholder
						pos: rowData.pos,
						transport_order_type_id: rowData?.transportOrderType?.id,
						transportable_type: rowData.transportable_type,
						is_accepted: false,
						is_completed: false,
						is_urgent: this.isUrgentChecked,
						responsible_user_id: this.loggedInUser?.id,
						entry_date: date,
						quantity: rowData.quantity,
						transportable_id,
					};
				} else {
					const itemPlant = rowData?.original?.item?.itemPlants?.find(
						(itemPlant: any) =>
							itemPlant?.plant_id ==
							(
								this.billOfMaterialRef?.operationSelectedRow?.prodOrderPos
									?.prodOrder as any
							)?.plant_id_production
					);

					// For existing rows, use the existing prod_order_pos_bom_pos_id
					return {
						prod_order_pos_bom_pos_id: rowData.original.id,
						pos: index * 10,
						transport_order_type_id: rowData?.transportOrderType?.id,
						transportable_type:
							rowData?.original?.transportable_type ?? rowData.transportable_type,
						transportable_id: rowData?.original?.transportable_id ?? itemPlant?.id,
						source_type: rowData?.original?.source_type,
						source_id: rowData?.original?.source_id,
						destination_type:
							rowData?.original?.destination_type ?? BackendModelType.MACHINE,
						item_state_id:
							rowData?.original?.item_state_id ??
							rowData?.original?.prodOrderPosOperation?.machine?.plant
								?.item_state_id_default,
						destination_id:
							rowData?.original?.destination_id ??
							rowData?.original?.prodOrderPosOperation?.machine?.id,
						is_accepted: false,
						is_completed: false,
						is_urgent: this.isUrgentChecked,
						responsible_user_id: this.loggedInUser?.id,
						entry_date: date,
						quantity:
							rowData?.original?.totalQuantity ??
							(rowData.original.prodOrderPos.quantity *
								rowData.original.qty_for_one_parent ||
								0),
					};
				}
			}),
		};

		// Create batch requests for ProdOrderPosBomPos only if there are new rows
		if (prodOrderPosBomPosData.length > 0) {
			prodOrderPosBomPosData.forEach((data: any) => {
				requests.push({
					id: batchIndex++,
					method: "POST",
					url: `\/odata\/ProdOrderPosBomPos`,
					headers: { "Content-Type": "application/json" },
					body: data,
				});
			});
		}

		const batchPayload = {
			requests: requests,
		};

		if (this.isMultiOrder || (this.isMultiItemSelect && prodOrderPosBomPosData.length > 0)) {
			this.isDataSaving = true;

			// Send batch request if there are ProdOrderPosBomPos requests
			if (requests.length > 0) {
				this.commonService.post("$batch", batchPayload).subscribe({
					next: (response: any) => {
						if (response && response.responses) {
							response.responses.forEach((batchResponse: any, index: number) => {
								if (batchResponse.body && batchResponse.body.id) {
									// Find the corresponding transportOrderPos item by placeholder and update its id
									const placeholder = `placeholder-${index}`;
									const transportOrderPosIndex =
										dataToSend.transportOrderPos.findIndex(
											(item: any) =>
												item.prod_order_pos_bom_pos_id == placeholder
										);
									if (transportOrderPosIndex !== -1) {
										dataToSend.transportOrderPos[
											transportOrderPosIndex
										].prod_order_pos_bom_pos_id = batchResponse.body.id;
									}
								}
							});
						}
						// Send TransportOrders request after batch request succeeds
						this.commonService.post(`TransportOrders`, dataToSend).subscribe({
							next: () => {
								this.isDataSaving = false;
								if (this.billOfMaterialRef.childComponentRef?.selectedRowsId) {
									this.billOfMaterialRef.childComponentRef.selectedRowsId = {};
									this.billOfMaterialRef.clonedBomSelectedRows = [];

									this.billOfMaterialRef.childComponentRef.render();
								}

								this.toasterStatus = $localize`Order Created Successfully`;
								this.successRecordSavToast.elementRef.nativeElement!.show = true;
								this.statusToastTools.elementRef.nativeElement!.show = true;

								this.selectedHandlingUnitId = "";
								this.selectedStorageBinId = "";
								this.selectedStorageLocationId = "";
								this.selectedHUCustomId = "";
								this.selectedSBCustomId = "";
								this.selectedSLCustomId = "";
								this.isMultiItemSelect = false;
								this.isMultiOrder = false;
								this.isUrgentChecked = false;
								this.orderCreateDialog = false;
								this.bomSelectedRowData = [];
								this.selectedDialogData = [];
								this.newMaterialData = [];
								this.custom_id = "";

								this.onClickCreateOrderEmitter.emit(false);
							},
							error: e => {
								this.isDataSaving = false;
								// Handle TransportOrders error
								console.error("Error creating Transport Orders:", e);
							},
						});
					},
					error: e => {
						this.isDataSaving = false;
						console.error("Error creating ProdOrderPosBomPos:", e);
					},
				});
			} else {
				this.isDataSaving = true;
				// Send TransportOrders request directly if not isMultiItemSelect
				this.commonService.post(`TransportOrders`, dataToSend).subscribe({
					next: () => {
						this.isDataSaving = false;
						if (this.billOfMaterialRef.childComponentRef?.selectedRowsId) {
							this.billOfMaterialRef.clonedBomSelectedRows = [];
							this.billOfMaterialRef.childComponentRef.selectedRowsId = {};
							this.billOfMaterialRef.childComponentRef.render();
						}

						this.toasterStatus = $localize`Order Created Successfully`;
						this.successRecordSavToast.elementRef.nativeElement!.open = true;
						this.statusToastTools.elementRef.nativeElement!.show = true;

						this.selectedHandlingUnitId = "";
						this.selectedStorageBinId = "";
						this.selectedStorageLocationId = "";
						this.selectedHUCustomId = "";
						this.selectedSBCustomId = "";
						this.selectedSLCustomId = "";
						this.isMultiItemSelect = false;
						this.isMultiOrder = false;
						this.isUrgentChecked = false;
						this.orderCreateDialog = false;
						this.bomSelectedRowData = [];
						this.selectedDialogData = [];
						this.newMaterialData = [];
						this.custom_id = "";
						this.onClickCreateOrderEmitter.emit(false);
					},
					error: e => {
						this.isDataSaving = false;
						// Handle TransportOrders error
						console.error("Error creating Transport Orders:", e);
					},
				});
			}
		}
	}

	closeOrderCreateDialog() {
		this.handlingUnits = this.initialHandlingUnits;
		this.items = this.initialItems;
		this.equipments = this.initialEquipments;
		this.newMaterialData = [];
		this.selectedDialogData = [];
		this.isMultiItemSelect = false;
		this.isMultiOrder = false;
		this.selectedHUCustomId = "";
		this.selectedSBCustomId = "";
		this.selectedSLCustomId = "";
		this.selectedHandlingUnitId = "";
		this.selectedStorageBinId = "";
		this.selectedStorageLocationId = "";
		this.isUrgentChecked = false;
		this.orderCreateDialog = false;
		this.custom_id = "";
		// Clear new added rows from bomSelectedRowData:
		this.bomSelectedRowData = this.bomSelectedRowData.filter((rowData: any) => !rowData.isNew);

		if (this.fromTransportOrder) this.onClickCreateOrderEmitter.emit(false);
	}

	closeMaterialConsumptionDialog() {
		this.modalRef.open = false;

		this.onClickCreateOrderEmitter.emit(false);
		if (!this.fromProductionPlan) {
			this.router.navigate(["../"], { relativeTo: this.activeRoute });
		}
	}

	isCreateOrderButtonDisabled(): boolean {
		if (this.isMultiOrder || this.isMultiItemSelect) {
			// Check if there are new rows in bomSelectedRowData
			const hasNewRows = this.bomSelectedRowData.some((rowData: any) => rowData.isNew);

			if (hasNewRows) {
				// Check if any required fields in new rows are missing
				return this.bomSelectedRowData.some(
					(rowData: any) =>
						rowData.isNew &&
						(!rowData.transportable_type ||
							!rowData?.original?.transportable_id ||
							!rowData.quantity ||
							rowData.quantity <= 0)
				);
			} else if (this.setting?.is_ewm_enabled) {
				// Check if any required fields in new rows are missing
				return this.bomSelectedRowData.some(
					(rowData: any) => !rowData.quantity || rowData.quantity <= 0
				);
			} else if (this.isMultiItemSelect) {
				return (
					!this.newMaterialData ||
					this.newMaterialData.length === 0 ||
					this.newMaterialData.some(
						rowData => !rowData.item_id || !rowData.quantity || rowData.quantity <= 0
					)
				);
			}
		}

		if (this.fromTransportOrder) {
			const hasNullRows = this.bomSelectedRowData.some(
				(rowData: any) => parseFloat(rowData.quantity || "0") <= 0
			);

			return hasNullRows;
		}

		return false; // Return false if no new rows or conditions are met
	}

	onAddMaterial(columnIdentifier?: string) {
		this.posCounter++;
		const newMaterial = {
			id: this.generateUniqueId(),
			pos: Number(this.prodOrderPosOperationData.max_bom_pos) + this.posCounter,
			isNew: true, // Flag indicating a new row
		};
		if (columnIdentifier == "multipleItemColumns") {
			this.bomSelectedRowData.push(newMaterial);
			this.multipleItemChildComponentRef?.render(); // Render the BOM grid
		} else {
			this.newMaterialData.push(newMaterial);
			this.materialChildComponentRef?.render(); // Render the material grid
		}
	}

	generateUniqueId() {
		return Math.random().toString(36).substr(2, 9);
	}

	onTabSelect(event: any) {
		const tabId = event.detail.tab.id;
		this.selectedTab = tabId;

		setTimeout(() => {
			if (this.selectedTab == "Bom" && !this.setting.is_ewm_enabled) {
				this.billOfMaterialRef?.addActionColumn(); // Add action column after tab is rendered
			}
		}, 500);
	}

	onAddPackagingMaterial() {
		this.isShowPackagingPopup = true;
	}

	onOpenInstructions() {
		this.packagingInstructionPopover.opener = this.instructionInputRef.elementRef.nativeElement;
		this.packagingInstructionPopover.open = true;
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	saveNextPackaging() {
		this.isInstructionLoading = true;
		this.savedPackagingInstruction = this.selectedPackagingInstruction;

		this.commonService
			.get(
				`machine/${this.machine.id}/${this.prodOrderPosId}/${this.savedPackagingInstruction?.packaging_instruction_id_parent ?? this.savedPackagingInstruction?.packaging_instruction_id_child}/transport-order-pos-for-packaging`,
				false
			)
			.subscribe({
				next: (response: any = []) => {
					this.isInstructionLoading = false;
					this.bomSelectedRowData = this.bomSelectedRowData.filter((row:any)=> !row.fromPackaging);
					this.selectedDialogData = this.selectedDialogData.filter((row:any)=> !row.fromPackaging);

					const processData = response.map((data:any)=>{
						return {
							original: data,
							quantity: data.totalQuantity,
							transportable_custom_id: data.transportable_custom_id,
							transportable_id: data.transportable_id,
							transportable_type: data.transportable_type,
							fromPackaging: true
						}
					});
					this.bomSelectedRowData = [...this.bomSelectedRowData, ...processData];
					this.selectedDialogData = this.bomSelectedRowData;

					this.multipleItemChildComponentRef?.render();
					this.closeDialog();
				},

				error: () => {
					this.isInstructionLoading = false;
				},
			});
	}

	closeDialog() {
		this.isShowPackagingPopup = false;

		if (!this.savedPackagingInstruction?.packaging_instruction_id_child) {
			this.instructionCustomID = "";
			this.selectedItemName = "";
			this.selectedItem = new Item().deserialize({});
		}
	}

	getTransportOrderPos() {
		try {
			this.isLoading = true;
			this.commonService
				.get(`machine-board/next-packaging-instruction/${this.prodOrderPosId}`, false)
				.subscribe({
					next: (res: any) => {
						this.isLoading = false;
						this.packagingInstructions = res;
					},
					error: () => {
						this.packagingInstructions = [];
						this.isLoading = false;
					},
					complete: () => {
						this.isLoading = false;
					},
				});
		} catch (error) {
			console.log(error);
		}
	}

	onInstructionSelect(event: any) {
		this.selectedItemName = "";
		const customId = event.item.dataset.customid;
		const childId = event.item.dataset.childid;
		const parentId = event.item.dataset.parentid;
		this.instructionCustomID = customId;

		const packagingInstruction = this.packagingInstructions.find(
			el =>
				el.packaging_instruction_id_child == childId &&
				el.packaging_instruction_id_parent == parentId
		);

		this.instructionCustomID =
			packagingInstruction.item_custom_id_container +
			" - " +
			packagingInstruction?.target_quantity;

		if (packagingInstruction) {
			this.selectedPackagingInstruction = packagingInstruction;

			if (this.selectedPackagingInstruction) {
				this.isInstructionLoading = true;
				this.commonService
					.get(`Items/${this.selectedPackagingInstruction?.item_id_container_child}`)
					.pipe(takeUntil(this.destroyed$))
					.subscribe({
						next: res => {
							const selectableItem = new Item().deserialize(res);
							this.selectedItemName = selectableItem.name!;
							this.selectedItem = new Item().deserialize({
								id: selectableItem.id,
								name: selectableItem.name,
								custom_id: selectableItem.custom_id,
							});
							this.isInstructionLoading = false;
						},
						error: () => {
							this.isInstructionLoading = false;
						},
						complete: () => {},
					});
			} else {
				this.selectedItemName = "";
				this.selectedItem = new Item().deserialize({});
			}
		} else {
			this.instructionCustomID = "";
			this.selectedPackagingInstruction = new PackagingInstruction().deserialize({});
			this.selectedItemName = "";
			this.selectedItem = new Item().deserialize({});
		}

		this.packagingInstructionPopover.open = false;
	}

	fetchPackagingInstructions(
		query: string = "",
		skip: number = this.skip,
		top: number = this.top
	) {
		this.loading = true;
		const filter = `packable_type=${BackendModelType.ITEM}&packable_id=${this.selectedItemId}&$skip=${skip}&$top=${top}`;
		const filterQuery = query ? `&search=${query}` : ``;
		const url = `packaging-instruction-pos?${filter}${filterQuery}`;

		return this.commonService.get(url, false).pipe(
			tap((res: any) => {
				const packagingInstructionPos = res;
				const uniquePackagingInstPos = Object.values(
					packagingInstructionPos.reduce((acc: any, item: any) => {
						if (!acc[item.packaging_instruction_id]) {
							acc[item.packaging_instruction_id] = item;
						}
						return acc;
					}, {})
				) as PackagingInstructionPos[];

				const resData = uniquePackagingInstPos
					.filter(el => el.packagingInstruction)
					.map(res => {
						const packagingInstructionContent = packagingInstructionPos.find(
							(pos: PackagingInstructionPos) =>
								pos.is_container === false &&
								pos.packaging_instruction_id === res.packagingInstruction.id
						);
						let targetedQuantity: number = 0;
						if (packagingInstructionContent) {
							targetedQuantity = packagingInstructionContent.target_quantity!;
						}
						return new PackagingInstruction().deserialize({
							...res.packagingInstruction,
							targetQuantity: targetedQuantity,
						});
					});

				if (skip === 0) {
					this.packagingInstructions = resData;
				} else {
					this.packagingInstructions = [...this.packagingInstructions, ...resData];
				}
				this.skip += top;
			})
		);
	}

	multipleItemColumns: any = [
		{
			Header: $localize`Id`,
			accessor: "transportable_custom_id",
			hAlign: "Left",
			disableFilters: true,
			disableSortBy: true,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row.original;

				return rowData.transportable_custom_id;
			},
		},
		{
			Header: $localize`Name`,
			accessor: "original.item.name",
			hAlign: "Left",
			disableFilters: true,
			disableSortBy: true,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: any) => {
				const { row } = instance;
				const rowData = row?.original;

				return rowData?.original?.transportable_name || rowData?.original?.item?.name;
			},
		},
		{
			Header: $localize`Item Name`,
			accessor: "name",
			hAlign: "Left",
			disableFilters: true,
			disableSortBy: true,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: false,
		},
		{
			Header: () => (
				<>
					{$localize`Quantity`}
					<span style={{ color: "red" }}>*</span> {/* Red asterisk */}
				</>
			),
			accessor: "quantity",
			hAlign: "Right",
			disableFilters: true,
			disableSortBy: true,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				rowData.quantity = this.setting?.is_ewm_enabled
					? rowData.original.qty_for_one_parent
					: rowData.original?.prodOrderPos?.quantity *
						rowData?.original?.qty_for_one_parent;

				if (this.fromTransportOrder && !this.setting?.is_ewm_enabled) {
					rowData.quantity = parseFloat(rowData?.original?.totalQuantity)
						.toFixed(3)
						.replace(/\.?0+$/, "");
				}

				return (
					<React.StrictMode>
						<FlexBox>
							{rowData.isNew ||
							this.setting.is_ewm_enabled ||
							this.fromTransportOrder ? (
								<UI5Input
									style={{ width: "100%" }}
									show-value-help-icon
									disabled={
										this.bomSelectedRowData[row.index].transportable_type !=
										TransportableType.ITEM_PLANT
									}
									value={rowData.quantity}
									onInput={(e: any) => {
										rowData.quantity = e.target.value; // Get the value from the event target

										if (rowData?.original?.totalQuantity > -1) {
											rowData.original.totalQuantity = e.target.value; // Get the value from the event target
										}

										if (this.isMultiOrder && rowData.isNew) {
											// Find the corresponding row in selectedDialogData
											const index = this.selectedDialogData.findIndex(
												(data: any) => data.id == rowData.id
											);

											if (index !== -1) {
												this.selectedDialogData[index].quantity =
													rowData.quantity; // Update the quantity
											}
										}
									}}
									placeholder="Insert Quantity" // Add a placeholder
									type="Number"></UI5Input>
							) : (
								<div>{rowData.quantity}</div> // Display existing quantity or empty string
							)}
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`UoM`,
			accessor: "original.unitOfMeasure.custom_id",
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
			Header: $localize`Transport Order Type`,
			accessor: "original.transportOrderType.custom_id",
			hAlign: "Left",
			disableFilters: false,
			disableSortBy: false,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			isSelected: !this.setting.is_ewm_enabled,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<ComboBox
							value={rowData?.transportOrderType?.custom_id || ""}
							onInput={(e: any) => {
								const value = e.target.value;
								const selectedType = this.transportOrderTypes.find(
									(type: any) => type.custom_id == value
								);

								this.bomSelectedRowData[row.index].transportOrderType =
									selectedType;
							}}
							onSelectionChange={(e: any) => {
								const selectedItem = e.detail.item;

								this.bomSelectedRowData[row.index].transportOrderType = {
									id: selectedItem.id,
									custom_id: selectedItem.text,
								};
							}}
							valueState="None">
							{this.transportOrderTypes.map(
								(transportOrderType: any, index: number) => (
									<ComboBoxItem
										key={index}
										text={transportOrderType.custom_id}
										id={transportOrderType.id}
									/>
								)
							)}
						</ComboBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Action`,
			accessor: "action",
			hAlign: "Center",
			disableFilters: true,
			disableSortBy: true,
			disableResizing: false,
			disableGroupBy: true,
			canReorder: false,
			width: 80,
			isSelected: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;

				return (
					<React.StrictMode>
						<FlexBox style={{ gap: "5px" }}>
							{rowData.isNew || this.fromTransportOrder ? ( // Only show delete button for new rows
								<Button
									id="deleteButton"
									onClick={() =>
										this.deleteMaterialClick(rowData, "multipleItemColumns")
									} // Pass the column identifier
									icon="delete"
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
