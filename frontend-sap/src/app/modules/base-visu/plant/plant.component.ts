import { Component, Output, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import Toast from "@ui5/webcomponents/dist/Toast";
import { AuthService } from "@app/shared/services/auth.service";
import { NgForm } from "@angular/forms";

import {
	ProductionPlanningPageName,
	ProductionPlanningPageNameClass,
} from "@app/shared/enums/ProductionPlanningPageName";
import { ConfigService } from "@app/shared/services/config.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Plant } from "@app/shared/models/plant.model";
import { PlantsService } from "@app/shared/services/plants.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import { Item } from "@app/shared/models/item.model";
import { debounceTime, Subject, switchMap } from "rxjs";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { StorageLocation } from "@app/shared/models/storage-location.model";
import { HandleRowClickService } from "@app/shared/services/handle-row-click.service";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { ProdOrderPosOperationStatus } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";

@Component({
	selector: "app-plant",
	templateUrl: "./plant.component.html",
	styleUrl: "./plant.component.css",
})
export class PlantComponent {
	private searchItemSubject = new Subject<string>();
	private searchProdOrderSubject = new Subject<string>();
	selectedProdOrder = new ProdOrder().deserialize({});
	isDialogOpen: boolean = false;
	isUpdateDialog?: boolean;
	deletItemId = "";
	value!: string;
	autoIncrementId!: string;
	isLoading: boolean = false;
	itemComboboxLoading: boolean = false;
	dialogTitle: string = "";
	isUpdate?: boolean;
	customId?: string;
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	localization = Localization;
	isLoadingCustomId: boolean = false;
	cachedCustomId?: string = "";
	selectedPlant: Plant = new Plant().deserialize({});
	@ViewChild("errorDialogPlants", { static: false }) errorDialogPlants: any;
	@ViewChild("create0rUpdateForm") form?: NgForm;
	disableButtonDuringRequest: boolean = false;
	@ViewChild("deleteErrorDialogPlant", { static: false })
	deleteErrorDialogPlant: any;
	public selectedTab: string = "core_data";
	topValue = 200;
	items?: Item[] = [];
	storageLocations?: StorageLocation[] = [];
	initialItems?: Item[] = [];
	plantId?: number;
	selectedProdOrderCustomId = "";
	isValueHelpDialog = false;
	prodOrders: ProdOrder[] = [];
	initialProdOrders: ProdOrder[] = [];
	operations: ProdOrderPosOperation[] = [];
	selectedOperation: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({});
	prodOrderComboboxLoading = false;
	isLoadingOperation = false;

	columns: any = [
		{
			Header: this.localization.active,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			maxWidth: 72,
			autoResizable: true,
		},
		{
			Header: this.localization.id,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: this.localization.name,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			autoResizable: true,
		},
		{
			Header: $localize`Shift for ClockIn Required`,
			accessor: "is_shift_for_clockin_required",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			width: 120,
			autoResizable: true,
		},
		{
			Header: $localize`Auto Post Goods Receipt Scrap`,
			accessor: "auto_post_goods_receipt_scrap",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Item Packaging Rework`,
			accessor: "itemPackagingRework.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["itemPackagingRework.name", "itemPackagingRework.custom_id"],
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Item Packaging Scrap`,
			accessor: "itemPackagingScrap.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["itemPackagingScrap.name", "itemPackagingScrap.custom_id"],
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Storage Location Rework`,
			accessor: "storageLocationRework.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["storageLocationRework.name", "storageLocationRework.custom_id"],
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Storage Location Scrap`,
			accessor: "storageLocationScrap.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: ["storageLocationScrap.name", "storageLocationScrap.custom_id"],
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Operation for indirect times`,
			accessor: "prodOrderPosOperationIndirect.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			accessorArray: [
				"prodOrderPosOperationIndirect.name",
				"prodOrderPosOperationIndirect.pos",
			],
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Block QualiVisu for Inspection Point after`,
			accessor: "qualivisu_block_threshold",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			minWidth: 50,
			hAlign: "End",
			autoResizable: true,
		},
		{
			Header: $localize`QualiVisu Shift Check offset`,
			accessor: "qualivisu_shift_check_offset",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.Number,
			isSelected: false,
			minWidth: 50,
			hAlign: "End",
			autoResizable: true,
		},
	];

	plantClass = new Plant();

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		private plantsService: PlantsService,
		public _toasterSrv: ToastService
	) {
		this.selectedPlant = new Plant().deserialize({});

		plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
			}
		});
	}

	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;

	ngOnInit() {
		this.getCustomId();
		this.searchItemAPICall();
		this.batchCall();
		this.searchProdOrderAPICall();
	}

	getPageName(value: ProductionPlanningPageName) {
		return ProductionPlanningPageNameClass.getStateTranslate(value);
	}

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Items?$filter=is_active eq true&$select=id,name,custom_id&$top=${this.topValue}`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/StorageLocations?$filter=is_active eq true and plant_id eq ${this.plantId}&$top=${this.topValue}`
			)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.items = response.responses[0].body.value.map((data: Item) =>
					new Item().deserialize(data)
				);

				this.initialItems = this.items;

				this.storageLocations = response.responses?.[1]?.body?.value || [];
			},
			error: e => {},
		});
	}

	getProdOrder() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/ProdOrders?$filter=plant_id eq ${this.selectedPlant?.id}&$top=300`
			)
		);

		this.prodOrderComboboxLoading = true;
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.prodOrders = response.responses[0].body.value.map((data: ProdOrder) =>
					new ProdOrder().deserialize(data)
				);
				this.initialProdOrders = this.prodOrders;
				this.prodOrderComboboxLoading = false;
			},
			error: e => {},
		});
	}

	newButtonClick() {
		this.isUpdate = false;
		this.dialogTitle = this.localization.add;
		this.selectedPlant = new Plant().deserialize({});
		this.selectedPlant.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
		if (!this.customId) {
			this.selectedPlant.custom_id = "";
			this.getCustomId();
		}
		this.isDialogOpen = true;
	}

	async onSave() {
		this.disableButtonDuringRequest = true;
		(this.form as any).onSubmit(undefined);
	}

	checkCustomId() {
		const result = this.commonService.customIdValidation(
			this.customId || "",
			this.selectedPlant.custom_id || ""
		);
		const urlString = `Plants?$filter=custom_id eq '${this.selectedPlant.custom_id}'&$select=custom_id`;
		if (result.success) {
			this.commonService.get(urlString).subscribe({
				next: (response: any) => {
					if (response.value.length === 0) this.onCreateOrUpdate();
					else {
						const { idIsAlreadyTaken } = Localization;
						this.disableButtonDuringRequest = false;
						this.customIdState = "Negative";
						this.customIdValueStateText = idIsAlreadyTaken;
					}
				},
				error: () => {
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.disableButtonDuringRequest = false;
			this.customIdState = "Negative";
			this.customIdValueStateText = result.msg;
		}
	}

	async onCreateOrUpdate() {
		this.isLoading = true;
		const payload = this.selectedPlant?.toOdata();
		const method = this.isUpdate ? "put" : "post";
		const urlString = this.isUpdate ? `Plants(${this.selectedPlant?.id})` : `Plants`;
		this.commonService[method](urlString, payload).subscribe({
			next: () => {
				const { recordSavedSuccessfully } = Localization;
				this._toasterSrv.showToast(recordSavedSuccessfully, "success");
				if (!this.isUpdate) {
					this.filterHandler();
				} else {
					this.refreshEditData();
				}
				this.isLoading = false;
				this.isDialogOpen = false;
				(this.form as any).onReset();
				this.disableButtonDuringRequest = false;
				this.plantsService.refreshPlants();
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.errorDialogPlants.elementRef.nativeElement.open = true;
			},
		});
	}

	editClick(value: any): void {
		this.selectedPlant = new Plant().deserialize(value);

		this.selectedOperation = this.selectedPlant.prodOrderPosOperationIndirect;
		this.selectedProdOrder =
			this.selectedOperation?.prodOrderPos?.prodOrder || new ProdOrder().deserialize({});

		this.getProdOrder();

		this.isDialogOpen = true;
		this.isUpdate = true;
		this.dialogTitle = this.localization.edit;
		this.cachedCustomId = this.selectedPlant.custom_id;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	async getCustomId() {
		this.isLoadingCustomId = true;
		this.customId = await this.commonService.getEntity("Plant").catch(() => false);
		this.selectedPlant.custom_id = this.customId;
		if (typeof this.customId === "boolean") this.selectedPlant.custom_id = "";
		this.isLoadingCustomId = false;
	}

	async getDbAutoIncrementId() {
		this.commonService.getAutoIncrementId("Plants").subscribe(res => {
			this.autoIncrementId = res.value[0].id + 1;
		});
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
		this.getCustomId();
	}

	refreshEditData() {
		const url = `Plants?$filter=id eq ${this.selectedPlant?.id}&$orderby=custom_id asc&$expand=itemPackagingRework,itemPackagingScrap,storageLocationRework,storageLocationScrap,prodOrderPosOperationIndirect($expand=prodOrderPos($expand=prodOrder))`;
		this.commonService.get(url).subscribe({
			next: (response: any) => {
				this.childComponent?.onFilterAndSortingForEdit(null, response?.value[0]);
			},
		});
	}
	deleteClick(value: any): void {
		this.deletItemId = value.id;
		const dialog = document.getElementById("deleteDialogPlant") as Dialog;
		dialog.open = true;
	}

	deleteSubmit() {
		const { recordDeleted } = Localization;
		this.disableButtonDuringRequest = true;
		this.isLoading = true;

		this.commonService.delete(`/Plants(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.childComponent?.onFilterAndSortingForEdit(this.deletItemId, null);
				this.disableButtonDuringRequest = false;
				this.plantsService.refreshPlants();
				this._toasterSrv.showToast(recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.deleteErrorDialogPlant.elementRef.nativeElement.open = true;
				this.isLoading = false;
			},
		});
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialogPlant") as Dialog;
		dialog.open = false;
	}

	closeDeleteErrorDialog() {
		this.deleteErrorDialogPlant.elementRef.nativeElement.open = false;
		this.closeDialogDelete();
	}

	closeErrorDialog() {
		this.errorDialogPlants.elementRef.nativeElement.open = false;
	}

	onChangeIsActive(event: any) {
		if (this.selectedPlant) this.selectedPlant.is_active = event.target.checked;
	}

	onChangeName(event: any) {
		if (this.selectedPlant) this.selectedPlant.name = (event.target as any).value;
	}

	closeDialog() {
		this.isDialogOpen = false;
		(this.form as any).onReset();
		this.selectedTab = "core_data";
	}

	onChangeCustomId() {
		this.customIdState = "None";
	}

	onSubmit(form: NgForm) {
		if (!form.valid) {
			this.disableButtonDuringRequest = false;
			return;
		}
		const customId = this.selectedPlant.custom_id?.trim();
		this.selectedPlant.custom_id = customId;
		if (this.isUpdate) {
			this.cachedCustomId === customId ? this.onCreateOrUpdate() : this.checkCustomId();
		} else this.checkCustomId();
	}

	tabNavChanged(event: any) {
		this.selectedTab = event.detail.tab.id;
	}

	inputInvalidEntryRestrict(event: any, value: any) {
		if (!event.target.value) {
			value = "";
		} else if (event.target.value != value) {
			event.target.value = value;
		}
	}

	onChangeItem(event: any, isScrap = false) {
		if (isScrap) {
			if (this.selectedPlant)
				this.selectedPlant.itemPackagingScrap = new Item().deserialize({
					name: (event.target as any).value || "",
					id: parseInt((event.detail as any).item.id) || 0,
				});
		} else {
			if (this.selectedPlant)
				this.selectedPlant.itemPackagingRework = new Item().deserialize({
					name: (event.target as any).value || "",
					id: parseInt((event.detail as any).item.id) || 0,
				});
		}
	}

	onItemInputChange(event: any, isScrap = false) {
		const value = event.target.value;

		if (value) {
			this.searchItemSubject.next(value);
		} else {
			this.items = this.initialItems;

			if (isScrap) {
				if (this.selectedPlant) {
					this.selectedPlant.itemPackagingScrap = new Item().deserialize({
						id: null,
						name: "",
					});
				}
			} else {
				if (this.selectedPlant) {
					this.selectedPlant.itemPackagingRework = new Item().deserialize({
						id: null,
						name: "",
					});
				}
			}
		}
	}

	searchItemAPICall() {
		this.searchItemSubject
			.pipe(
				debounceTime(800),
				switchMap(value => {
					this.itemComboboxLoading = true;

					return this.commonService.get(
						`Items?$filter=contains(tolower(name), '${value?.toLowerCase()}') or contains(tolower(custom_id), '${value?.toLowerCase()}')`
					);
				})
			)
			.subscribe({
				next: (response: any) => {
					this.itemComboboxLoading = false;
					this.items = response?.value || [];
				},
				error: err => {
					this.items = this.initialItems;
				},
				complete: () => {},
			});
	}

	onChangeStorageLocationRework(event: any) {
		if (this.selectedPlant)
			this.selectedPlant.storageLocationRework = new StorageLocation().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onStorageLocationReworkInputChange(event: any) {
		const inputValue = event.target.value;
		const matchReworkData = this.storageLocations?.find(
			location => location.name === inputValue
		);

		if (!matchReworkData && this.selectedPlant) {
			this.selectedPlant.storageLocationRework = new StorageLocation().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onChangeStorageLocationScrap(event: any) {
		if (this.selectedPlant)
			this.selectedPlant.storageLocationScrap = new StorageLocation().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
				custom_id: event.detail.item.additionalText || "",
			});
	}

	onStorageLocationScrapInputChange(event: any) {
		const inputValue = event.target.value;
		const matchReworkData = this.storageLocations?.find(
			location => location.name === inputValue
		);

		if (!matchReworkData && this.selectedPlant) {
			this.selectedPlant.storageLocationScrap = new StorageLocation().deserialize({
				id: null,
				name: "",
			});
		}
	}

	openDropdown() {
		this.isValueHelpDialog = true;
	}

	closeDropdown() {
		this.isValueHelpDialog = false;
	}

	onChangeProdOrder(e: any) {
		this.selectedProdOrder = new ProdOrder().deserialize({
			custom_id: (e.target as any).value || "",
			id: parseInt((e.detail as any).item.id) || 0,
		});

		if (this.selectedProdOrder?.id) {
			this.loadProdOrderPosOperations();
		}
	}

	loadProdOrderPosOperations() {
		this.isLoadingOperation = true;

		this.commonService
			.get(
				`ProdOrderPos?$expand=item($select=id,custom_id,name),prodOrderPosOperations($select=id,prod_order_pos_id,machine_id,pos,name,start,end,status;$expand=machine($select=id,custom_id,name);$filter=status ne '${ProdOrderPosOperationStatus.DELETED}' and status ne '${ProdOrderPosOperationStatus.CLOSED}')&$filter=prod_order_id eq ${this.selectedProdOrder?.id}&$select=id,prod_order_id,item_id,pos,start,end`
			)
			.subscribe({
				next: (response: any) => {
					this.isLoadingOperation = false;
					this.operations = [];

					response.value.forEach((prodOrderPos: ProdOrderPos) => {
						this.operations = [
							...this.operations,
							...prodOrderPos.prodOrderPosOperations,
						];
					});

					if (this.operations.length) {
						const isExist = this.operations.find(
							(operation: ProdOrderPosOperation) =>
								operation.id == this.selectedOperation?.id
						);

						this.selectedOperation = isExist
							? this.selectedOperation
							: new ProdOrderPosOperation().deserialize({});
					} else {
						this.selectedOperation = new ProdOrderPosOperation().deserialize({});
					}
				},
				error: e => {
					this.isLoadingOperation = false;
				},
			});
	}

	onAfterChangeProdOrder(e: any) {
		const value = (e.target as any).value;

		if (value) {
			const existedData = this.prodOrders.find(prodOrder =>
				prodOrder.custom_id?.includes(value)
			);

			if (existedData) this.selectedProdOrder = existedData;
		}

		if (this.selectedProdOrder?.id) {
			this.loadProdOrderPosOperations();
		}
	}

	onProdOrderInputChange(e: any) {
		const value = e.target.value;

		if (value) {
			this.searchProdOrderSubject.next(value);
		} else {
			this.prodOrders = this.initialProdOrders;

			this.selectedProdOrder = new ProdOrder().deserialize({
				id: null,
				name: "",
			});
			this.selectedOperation = new ProdOrderPosOperation().deserialize({});
		}
	}

	searchProdOrderAPICall() {
		this.searchProdOrderSubject
			.pipe(
				debounceTime(800),
				switchMap(value => {
					this.prodOrderComboboxLoading = true;

					return this.commonService.get(
						`ProdOrders?$filter=plant_id eq ${this.selectedPlant?.id} and contains(tolower(custom_id), '${value?.toLowerCase()}')`
					);
				})
			)
			.subscribe({
				next: (response: any) => {
					this.prodOrderComboboxLoading = false;
					this.prodOrders = response?.value || [];

					if (response?.value?.length == 1) {
						this.selectedProdOrder = response?.value[0];

						this.loadProdOrderPosOperations();
					}
				},
				error: err => {
					this.prodOrders = this.initialProdOrders;
				},
				complete: () => {},
			});
	}

	onChangeOperation(event: any) {
		if (this.selectedOperation)
			this.selectedOperation = new ProdOrderPosOperation().deserialize({
				id: parseInt(event.detail.item.id) || 0,
				name: event.detail.item.text || "",
			});
	}

	onOperationInputChange(event: any) {
		const inputValue = event.target.value;
		const matchHallData = this.operations.find(operation => operation.name === inputValue);
		if (!matchHallData && this.selectedOperation) {
			this.selectedOperation = new ProdOrderPosOperation().deserialize({
				id: null,
				name: "",
			});
		}
	}

	onSaveOperation() {
		this.selectedPlant.prodOrderPosOperationIndirect = this.selectedOperation;

		this.isValueHelpDialog = false;
	}
}
