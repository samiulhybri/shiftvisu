import { Component, OnDestroy, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { Item } from "@app/shared/models/item.model";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { BoxPackagingComponent } from "@app/modules/machine-board/packaging/box-packaging/box-packaging.component";
import { CartonPackagingComponent } from "@app/modules/machine-board/packaging/carton-packaging/carton-packaging.component";
import Toast from "@ui5/webcomponents/dist/Toast";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import Stock from "@app/shared/models/stock.models";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import { ItemStateType } from "@app/shared/enums/ItemStateType";
import ItemState from "@app/shared/models/item-state.model";
import { debounceTime, forkJoin, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from "rxjs";
import { DataService } from "@app/shared/services/data.service";
import { Machine } from "@app/shared/models/machine.model";
import Popover from "@ui5/webcomponents/dist/Popover";
import { PlantsService } from "@app/shared/services/plants.service";
import React from "react";
import { Button, FlexBox } from "@ui5/webcomponents-react";
import { ProdOrderPosOperationHandlingUnitType } from "@app/shared/enums/ProdOrderPosOperationHandlingUnitType";
import { ToastService } from "@app/shared/services/toaster.service";
import PackagingInstruction from "@app/shared/models/packaging-instruction.model";
import PackagingInstructionPos from "@app/shared/models/packaging-instruction-pos.model";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { Localization } from "@app/shared/utils/common-localize";

@Component({
	selector: "app-packaging",
	templateUrl: "./packaging.component.html",
	styleUrl: "./packaging.component.css",
})
export class PackagingComponent implements OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@ViewChild("packagingModalRef") modalRef!: Dialog;
	@ViewChild("errorDialog") errorDialog!: Dialog;
	@ViewChild("handlingUnitListPopover") handlingUnitListPopover!: Popover;
	@ViewChild("showPopRef") showPopRef!: any;
	@ViewChild("itemListPopover") itemListPopover!: Popover;
	@ViewChild("itemsMultiInputRef") itemsMultiInputRef!: any;
	loading: boolean = false;
	dialogTitle: string = $localize`KLT/Carton`;
	newHandlingUnitDialogTitle = $localize`Add Handling Unit`;
	isDialogOpen: boolean = true;
	isHandlingUnitDialogOpen: boolean = false;
	isPackagingPositionLength: boolean = true;
	selectedTab: string = "boxTabId";
	tabId!: string;
	disableButtonDuringRequest = false;
	isLoading = false;
	isDataUnSaved: boolean = false;
	isOpenDataUnsavedDialog: boolean = false;
	toasterStatus!: string;
	items: Item[] = [];
	initialItems: Item[] = [];
	currentMachine: Machine | undefined;
	handlingUnits: HandlingUnit[] = [];
	initialHandlingUnits: HandlingUnit[] = [];
	isItemShown: boolean = true;
	selectedItem = new Item().deserialize({});
	selectedStock: Stock = new Stock().deserialize({});
	selectedHandlingUnit = new HandlingUnit().deserialize({});
	selectedHandlingUnitId: number | undefined = undefined;
	selectedHUCustomId: string = '';
	selectedItemName: string = '';
	itemSearch: string = '';
	handlingUnitSearch: string = '';
	quantityAdded: number | string = "";
	stockAmount: number = 0;
	selectedOperationId: number = 0;
	errorStatus: string = "";
	isError: boolean = false;
	skip: number = 0;
	top: number = 200;
	isNewHandlingUnit: boolean = true;
	plantId: number = 0;
	isHandlingUnitUnpack: boolean = false;
	@ViewChild("boxPackagingRef") boxPackagingRef!: BoxPackagingComponent;
	@ViewChild("cartonPackagingRef") cartonPackagingRef!: CartonPackagingComponent;
	@ViewChild("statusToastTools", { static: false }) statusToastTools!: Toast;
	@ViewChild("stockPackagingDialog") stockPackagingDialog!: Dialog;
	@ViewChild("stockDePackagingDialog") stockDePackagingDialog!: Dialog;
	@ViewChild("packagingInstructionPopover") packagingInstructionPopover!: Popover;
	@ViewChild("instructionInputRef") instructionInputRef!: any;

	private searchSubject = new Subject<string>();
	private searchItemSubject = new Subject<string>();
	private searchInstructionSubject = new Subject<string>();
	handlingUnitsData: any[] = [];
	posOperationHU: any = null;
	savedHandlingUnitCustomIds: string[] = [];
	packagingInstructions: PackagingInstruction[] = [];
	initialPackagingInstructions: PackagingInstruction[] = [];
	instructionCustomID: string = '';
	instructionSearch: string = '';
	selectedPackagingInstruction = new PackagingInstruction().deserialize({});
	isInstructionLoading = false;
	selectedOrderDetails: OrderDetails | null = null;
	selectedItemId: string = '';
	selectableHUCustomIds: string[] = [];
	isLoadingHU: boolean = false;
	localization = Localization;

	dePackagingColumn = [
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
            			{!rowData.serial ?
							<Button
								onClick={() => this.onDeleteFromDePackaging(rowData)}
								design="Transparent"
								icon="broken-link">
							</Button> : <></>}
						</FlexBox>
					</React.StrictMode>
				);
			},
		}
	];

	constructor(
		private commonService: CommonService,
		private dataService: DataService,
		private activeRoute: ActivatedRoute,
		private plantsService: PlantsService,
		private router: Router,
		private toastService: ToastService,
		private authService: AuthService
	) {
		this.getCurrentMachine();
		this.getSelectedOrderDetails();
		this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
				this.loadData();
			}
		});
		this.onSearchHandlingUnits();
		this.onSearchItemData();
		this.onSearchPackagingInstruction();

		this.selectedOperationId = parseInt(this.activeRoute?.snapshot.params?.['operationId']);
	}

	getSelectedOrderDetails() {
		this.isLoadingHU = true;
		this.dataService.selectedOrderDetails$
		.pipe(
			takeUntil(this.destroyed$),
			switchMap(res=> {
				if(res) {
					this.selectedOrderDetails = res;
					this.selectedItemId = res.itemImageId;
					const filter = `&$filter=packable_type eq '${BackendModelType.ITEM}' and packable_id eq ${this.selectedItemId}`;

					return forkJoin({
						packagingInstructionPos: this.commonService.get(`PackagingInstructionPos?$expand=packagingInstruction($expand=packagingInstructionPos($filter=is_container eq true;$orderby=created_at desc))${filter}&$top=${this.top}`),
						selectableHU: this.commonService.get(`stock/${this.selectedOrderDetails.id}/stocks/handling-units?itemPlantId=${this.selectedOrderDetails?.itemPlantId}`, false)
					});
				}
				return of(null);
			})
		)
		.subscribe((res: any)=> {
			if(res) {
				const packagingInstructionPos = res.packagingInstructionPos.value as any[];
				this.selectableHUCustomIds = res.selectableHU as string[];
				this.getHandlingUnitForCurrentOperation();
				if(packagingInstructionPos.length) {
					const uniquePackagingInstPos = Object.values(packagingInstructionPos.reduce((acc: any, item: any) => {
						if (!acc[item.packaging_instruction_id]) {
							acc[item.packaging_instruction_id] = item;
						}
						return acc;
					}, {})) as PackagingInstructionPos[];

					this.packagingInstructions = uniquePackagingInstPos.map((res) => {
						return new PackagingInstruction().deserialize(res.packagingInstruction);
					});
					this.initialPackagingInstructions = [...this.packagingInstructions]
				}
			}
		})
	}

	getHandlingUnitForCurrentOperation() {
		const idString = this.selectableHUCustomIds.map(id => `'${id}'`).join(',');
		const url = `HandlingUnits?$expand=item,packagingInstruction($expand=packagingInstructionPos)&$filter=custom_id in (${idString})&$top=${this.top}`;
		this.commonService.get(url)
		.pipe(takeUntil(this.destroyed$))
		.subscribe({
			next: (res: any) => {
				res.value?.map((handlingUnit: HandlingUnit) => {
					const deserializedHandlingUnit = new HandlingUnit().deserialize(handlingUnit);
					this.handlingUnits.push(deserializedHandlingUnit);
				});
				this.initialHandlingUnits = [...this.handlingUnits];
				this.isLoadingHU = false;
			},
			error: (err)=> {
				this.isLoadingHU = false;
			},
			complete: ()=>{}
		})
	}

	onSearchHandlingUnits() {
		this.searchSubject.pipe(
			debounceTime(800),
			switchMap(query => {
				this.skip = 0;
				return this.fetchHandlingUnits(query);
			})
		).subscribe({
			next: () => {
				this.loading = false;
			},
			error: (err) => {
				this.loading = false;
			},
			complete: ()=> {}
		});
	}

	onSearchItemData() {
		this.searchItemSubject.pipe(
			debounceTime(800),
			switchMap(query => {
				this.skip = 0;
				return this.fetchItems(query);
			})
		).subscribe({
			next: () => {
				this.loading = false;
			},
			error: (err) => {
				this.loading = false;
			},
			complete: ()=> {}
		});
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
		});
	}

	loadData() {
		let requests: ODataBatchCall[] = [];
		const filterQuery = `&$filter=machine_id eq ${this.currentMachine?.id} and type eq '${ProdOrderPosOperationHandlingUnitType.CONSUMPTION}'`;
		const apiUrl = `ProdOrderPosOperationHandlingUnits?$expand=handlingUnit${filterQuery}`;
		requests.push(
			this.plantId ? new ODataBatchCall(0, "get", `\/odata\/Plants(${this.plantId})\/items?$expand=itemType&$filter=itemType/any(a:a/is_packaging eq true)&$top=${this.top}`) : new ODataBatchCall(0, "get", `\/odata\/Items?$expand=itemType&$filter=itemType/any(a:a/is_packaging eq true)&$top=${this.top}`),
			new ODataBatchCall(1, "get", `\/odata\/${apiUrl}`)
		);

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.map((item: Item) => {
					const deserializedItem = new Item().deserialize(item);
					this.items.push(deserializedItem);
				});
				this.initialItems = [...this.items];

				if (response.responses[1]?.body?.value) {
					this.handlingUnitsData = response.responses[0]?.body?.value;
					this.cartonPackagingRef.handlingUnitComponent?.render();
				}
				this.skip = this.top;
			},
		});
	}

	onTabSelect(event: any, selectedTabId: any) {
		if (event) event.preventDefault();
		if (selectedTabId) {
			this.tabId = selectedTabId;
		} else {
			this.tabId = event.detail.tab.id;
		}

		if (this.selectedTab !== this.tabId) {
			if (this.isDataUnSaved && (this.selectedHandlingUnit.custom_id && !this.selectedHandlingUnit.id)) {
				this.isOpenDataUnsavedDialog = true;
			} else {
				this.selectedItem = new Item().deserialize({});
				this.selectedHandlingUnit = new HandlingUnit().deserialize({});
				this.isDataUnSaved = false;
				this.selectedTab = this.tabId;
			}
		}
	}

	onSave(e: any = undefined) {
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		if (!this.selectedHandlingUnit.id) {
			this.selectedHandlingUnit.packaging_instruction_id = this.instructionCustomID && this.selectedPackagingInstruction.id ? this.selectedPackagingInstruction.id : null;
			const payload = this.selectedHandlingUnit.toOdata();
			this.commonService.post("HandlingUnits", payload)
			.pipe(switchMap((res: any)=> {
				this.selectedHandlingUnit.id = res?.id;
				this.posOperationHU.handling_unit_id = res?.id;
				this.posOperationHU.prod_order_pos_operation_id = null;
				this.cartonPackagingRef.selectedHandlingUnit = this.selectedHandlingUnit;
				return this.commonService.post("ProdOrderPosOperationHandlingUnits", this.posOperationHU)
			}))
			.subscribe({
				next: (res) => {
					this.cartonPackagingRef.onSave()
					.subscribe({
						next: ()=> {
							this.toasterStatus = $localize`Handling Unit created successfully`;
							this.statusToastTools.open = true;
							this.isDataUnSaved = false;
							this.isOpenDataUnsavedDialog = false;
							this.isLoading = false;
							this.toastService.showToast(this.toasterStatus, 'success');
							this.closeDialog();
							if (e) {
								this.closeDialog();
							} else this.onTabSelect(undefined, this.tabId);
						},
						error: (err)=> {
							this.errorStatus = typeof err === 'string' ? err : this.localization.someThingWentWrong;
							this.isLoading = false;
							this.isDataUnSaved = false;
							this.errorDialog.open = true;
						},
						complete: ()=> {

						}
					})
				},
				error: () => {
					this.isLoading = false;
					this.disableButtonDuringRequest = false;
				},
			});
		} else {
			this.cartonPackagingRef.onSave()
			.subscribe({
				next: (res)=> {
					this.toasterStatus = $localize`Handling Unit updated successfully`;
					this.statusToastTools.open = true;
					this.isDataUnSaved = false;
					this.isOpenDataUnsavedDialog = false;
					this.isLoading = false;
					this.toastService.showToast(this.toasterStatus, 'success');
					this.closeDialog();
					if (e) {
						this.closeDialog();
					} else this.onTabSelect(undefined, this.tabId);
				},
				error: (err)=>{
					this.errorStatus = typeof err === 'string' ? err : this.localization.someThingWentWrong;
					this.isLoading = false;
					this.isDataUnSaved = false;
					this.errorDialog.open = true;
				},
				complete: ()=>{

				}
			})
		}
	}

	onSaveAndPrint(e: any) {
		this.onSave(e);
	}

	closeDialog() {
		if (this.isDataUnSaved && (this.selectedHandlingUnit.custom_id && !this.selectedHandlingUnit.id)) {
			this.isOpenDataUnsavedDialog = true;
		} else {
			this.modalRef.open = false;
			this.router.navigate(["../../"], { relativeTo: this.activeRoute });
		}
	}

	closeHandlingDialog() {
		this.isHandlingUnitDialogOpen = false;
	}

	closeDataUnSavedDialog() {
		this.isDataUnSaved = false;
		this.isOpenDataUnsavedDialog = false;
		this.isPackagingPositionLength = true;
		this.closeDialog();
	}

	onHelpClick() {
		this.savedHandlingUnitCustomIds = this.cartonPackagingRef.savedHandlingUnits.map(el => el.handlingUnit.custom_id);
		this.handlingUnitListPopover.opener = this.showPopRef.elementRef.nativeElement;
		this.handlingUnitListPopover.open = true;
	}

	onOpenItemList() {
		this.itemListPopover.opener = this.itemsMultiInputRef.elementRef.nativeElement
		this.itemListPopover.open = true;
	}

	onLoadMoreItems() {
		if (this.items.length > (this.top - 1)) {
			this.fetchItems(this.itemSearch ? this.itemSearch : '', this.skip, this.top).subscribe({
				next: () => {
					this.loading = false;
				},
				error: (err) => {
					this.loading = false;
				},
				complete: ()=> {}
			});
		}
	}

	fetchItems(query: string = '', skip: number = this.skip, top: number = this.top) {
		this.loading = true;
		const filterQuery = query ? `$filter=(contains(name, '${query}') or contains(custom_id, '${query}')) and itemType/any(a:a/is_packaging eq true)&` : '$filter=itemType/any(a:a/is_packaging eq true)&';
		const url = this.plantId ? `Plants(${this.plantId})/items?$expand=itemType&${filterQuery}$skip=${skip}&$top=${top}` : `Items?$expand=itemType&${filterQuery}$skip=${skip}&$top=${top}`;

		return this.commonService.get(url).pipe(
			tap((res: any) => {
				if (skip === 0) {
					this.items = res.value;
				} else {
					this.items = [...this.items, ...res.value];
				}
				this.skip += top;
			})
		);
	}

	onItemSelect(event: any) {
		const id = event.item.id;
		const itemName = event.item.innerText;
		const itemCustomId = event.item.additionalText;

		this.selectedItemName = itemName;

		this.selectedItem = new Item().deserialize({
			id: id,
			name: itemName,
			custom_id: itemCustomId,
		});
		this.itemListPopover.open = false;
	}

	onLoadMore() {
		if (this.handlingUnits.length > (this.top - 1)) {
			this.fetchHandlingUnits(this.handlingUnitSearch ? this.handlingUnitSearch : '', this.skip, this.top).subscribe({
				next: () => {
					this.loading = false;
				},
				error: (err) => {
					this.loading = false;
				},
				complete: ()=> {}
			});
		}
	}

	fetchHandlingUnits(query: string = '', skip: number = this.skip, top: number = this.top) {
		this.loading = true;
		const idString = this.selectableHUCustomIds.map(id => `'${id}'`).join(',');
		const filterQuery = query ? `$filter=contains(custom_id, '${query}') and custom_id in (${idString})&` : `$filter=custom_id in (${idString})&`;
		const url = `HandlingUnits?$expand=item,packagingInstruction($expand=packagingInstructionPos)&${filterQuery}$skip=${skip}&$top=${top}`;

		return this.commonService.get(url).pipe(
			tap((res: any) => {
				if (skip === 0) {
					this.handlingUnits = res.value;
				} else {
					this.handlingUnits = [...this.handlingUnits, ...res.value];
				}
				this.skip += top;
			})
		);
	}

	onItemClick(event: any) {
		const huCustomId = event.item.innerText;
		const selectedHU = this.handlingUnits.find(el=> el.custom_id === huCustomId);
		if(!this.savedHandlingUnitCustomIds.includes(huCustomId) && this.selectableHUCustomIds.includes(huCustomId) && (selectedHU && !selectedHU.is_complete)) {
			this.selectedHUCustomId = huCustomId;
			this.selectedHandlingUnitId = parseInt(event.item.id);
			this.handlingUnitListPopover.open = false;
		}
	}

	onSearchHandlingUnit() {
		this.handlingUnitSearch = this.selectedHUCustomId
		this.searchSubject.next(this.selectedHUCustomId);
	}

	onSearchItem() {
		this.itemSearch = this.selectedItemName;
		this.searchItemSubject.next(this.selectedItemName);
	}

	onErrorDialogClose() {
		this.errorDialog.open = false;
		this.closeDialog();
	}

	saveUnSavedData() {
		this.isLoading = true;
		this.onSave();
		this.isPackagingPositionLength = true;
	}

	onSaveHandlingUnit() {
		this.cartonPackagingRef.newAddedStock = null;
		this.cartonPackagingRef.newAddedPackagePosData = [];
		this.cartonPackagingRef.depackagingData = [];
		this.cartonPackagingRef.modifiedPosData = [];
		this.isItemShown = this.isNewHandlingUnit;
		this.cartonPackagingRef.handlingUnitComponent!.isBusy = true;
		this.cartonPackagingRef.handlingUnitComponent?.render();
		if (this.isItemShown) {
			this.cartonPackagingRef.childComponent?.onFilterAndSorting();
			this.isDataUnSaved = true;
			this.isLoading = true;

			this.commonService
				.getEntity("HandlingUnit")
				.then(id => {
					this.cartonPackagingRef.childComponent!.isBusy = true;
					this.cartonPackagingRef.childComponent?.render();
					this.selectedHandlingUnit = new HandlingUnit().deserialize({
						item: structuredClone(this.selectedItem),
						custom_id: id,
					});

					const mappedHandlingUnit = {
						handlingUnit: this.selectedHandlingUnit,
						handling_unit_id: null,
						machine_id: this.currentMachine?.id,
						prod_order_pos_operation_id: null,
						type: ProdOrderPosOperationHandlingUnitType.PROD_GOOD
					}

					this.posOperationHU = {
						handling_unit_id: null,
						machine_id: this.currentMachine?.id,
						prod_order_pos_operation_id: null,
						type: ProdOrderPosOperationHandlingUnitType.PROD_GOOD
					}

					this.cartonPackagingRef.prodOrderPosHU = mappedHandlingUnit;
					const filteredSavedHandlingUnits = this.cartonPackagingRef.savedHandlingUnits.filter(el=> el.id);

					// this.cartonPackagingRef.savedHandlingUnits.push(mappedHandlingUnit);
					this.cartonPackagingRef.savedHandlingUnits = [mappedHandlingUnit, ...filteredSavedHandlingUnits];
					this.cartonPackagingRef.updatedSelectedRow();
					this.cartonPackagingRef.handlingUnitComponent!.isBusy = false;
					this.cartonPackagingRef.handlingUnitComponent?.render();

					this.commonService.get(`ItemStates?$filter=item_state_type eq '${ItemStateType.GOOD}'`)
					.pipe(takeUntil(this.destroyed$))
					.subscribe((res: any)=> {
						const data = res.value[0];
						const itemState = new ItemState().deserialize({...data})
						const newStockAdded = new Stock().deserialize({
							item: this.selectedHandlingUnit.item,
							batch: null,
							serial: null,
							quantity: 1,
							stockable_type: BackendModelType.HANDLINGUNIT,
							stockable_id: 0,
							positionable_type: this.currentMachine?.production_supply_area_id ? BackendModelType.PRODUCTIONSUPPLYAREA : BackendModelType.MACHINE,
							positionable_id: this.currentMachine?.production_supply_area_id ? this.currentMachine.production_supply_area_id : this.currentMachine?.id,
							itemState: itemState,
							item_state_id: itemState.id
						});

						this.cartonPackagingRef.newAddedStock = newStockAdded;
						this.cartonPackagingRef.childComponent!.isBusy = false;
						this.cartonPackagingRef.childComponent?.render();
					})
				})
				.catch(() => false);

			this.cartonPackagingRef.packagingPositionData = [];
			this.cartonPackagingRef.childComponent?.render();

			this.isLoading = false;
			this.disableButtonDuringRequest = false;
			this.isHandlingUnitDialogOpen = false;
		} else {
			this.cartonPackagingRef.childComponent?.onFilterAndSorting();
			if (this.cartonPackagingRef.packagingPosComponent) {
				this.cartonPackagingRef.packagingPosComponent.isBusy = true;
				this.cartonPackagingRef.packagingPosComponent.render();
			}
			this.selectedHandlingUnit =
				this.handlingUnits.find(
					handlingUnit => handlingUnit.id === this.selectedHandlingUnitId
				) || new HandlingUnit().deserialize({});


			const mappedHandlingUnit = {
				handlingUnit: this.selectedHandlingUnit,
				handling_unit_id: this.selectedHandlingUnit.id,
				machine_id: this.currentMachine?.id,
				prod_order_pos_operation_id: null,
				type: ProdOrderPosOperationHandlingUnitType.PROD_GOOD
			}

			this.posOperationHU = {
				handling_unit_id: this.selectedHandlingUnit.id,
				machine_id: this.currentMachine?.id,
				prod_order_pos_operation_id: null,
				type: ProdOrderPosOperationHandlingUnitType.PROD_GOOD
			}

			this.cartonPackagingRef.prodOrderPosHU = mappedHandlingUnit;
			this.cartonPackagingRef.savedHandlingUnits = this.cartonPackagingRef.savedHandlingUnits.filter(el=> el.id);
			const savedHuCustomIds = this.cartonPackagingRef.savedHandlingUnits.map(el=> el.handlingUnit.custom_id);
			if(!savedHuCustomIds.includes(mappedHandlingUnit.handlingUnit.custom_id)) {
				this.commonService.post("ProdOrderPosOperationHandlingUnits", this.posOperationHU)
				.pipe(
					takeUntil(this.destroyed$),
					switchMap(res=> {
						const filterQuery = `&$filter=machine_id eq ${this.currentMachine?.id} and type eq '${ProdOrderPosOperationHandlingUnitType.PROD_GOOD}'`;
						const apiUrl = `ProdOrderPosOperationHandlingUnits?$expand=handlingUnit($expand=item)${filterQuery}`;
						this.cartonPackagingRef.handlingUnitComponent!.isBusy = true;
						this.cartonPackagingRef.handlingUnitComponent?.render();
						return this.commonService.get(apiUrl)
					})
				)
				.subscribe({
					next: (res: any) => {
						this.cartonPackagingRef.savedHandlingUnits = res.value;
						this.cartonPackagingRef.updatedSelectedRow();
						this.cartonPackagingRef.handlingUnitComponent!.isBusy = false;
						this.cartonPackagingRef.handlingUnitComponent?.render();
					},
					error: (err)=>{
						this.cartonPackagingRef.handlingUnitComponent!.isBusy = false;
						this.cartonPackagingRef.handlingUnitComponent?.render();
					},
					complete: ()=>{}
				})
			}else {
				this.cartonPackagingRef.handlingUnitComponent!.isBusy = false;
				this.cartonPackagingRef.handlingUnitComponent?.render();
			}

			this.isHandlingUnitDialogOpen = false;
			this.getStockPosData();
			this.cartonPackagingRef.childComponent?.render();
		}
	}

	updateSelectedHandlingUnit(data: any) {
		this.selectedHandlingUnit = data;
	}

	private getStockPosData() {
		this.commonService
		.get(`stock/stocks?positionable_id=${this.selectedHandlingUnit.id}&positionable_type=${BackendModelType.HANDLINGUNIT}`, false)
		.subscribe((res: any) => {
			const mappedStocks = res.map((el: any)=> new Stock().deserialize(el)) as Stock[];
			this.cartonPackagingRef.packagingPositionData = mappedStocks.filter(el=> el.quantity && +el.quantity > 0);

			this.cartonPackagingRef.prevPosData = res;
			if (this.cartonPackagingRef.packagingPosComponent) {
				this.cartonPackagingRef.packagingPosComponent.isBusy = false;
				this.cartonPackagingRef.packagingPosComponent.render();
			}
		});
	}

	onOpenHandlingUnit(isItem: boolean) {
		this.isNewHandlingUnit = isItem;
		if (isItem) {
			this.newHandlingUnitDialogTitle = $localize`Add Handling Unit`;
			this.selectedItemName = '';
			this.selectedItem = new Item().deserialize({});
			this.instructionCustomID = '';
			this.selectedPackagingInstruction = new PackagingInstruction().deserialize({});
			this.itemSearch = '';
			this.items = [...this.initialItems];
			this.packagingInstructions = [...this.initialPackagingInstructions];
		} else {
			this.newHandlingUnitDialogTitle = $localize`Select Handling Unit`;
			this.selectedHUCustomId = '';
			this.handlingUnitSearch = '';
			this.handlingUnits = [...this.initialHandlingUnits];
		}
		this.skip = this.top;
		this.isHandlingUnitDialogOpen = true;
	}

	onPackagingPositionLength(event: number) {
		if (event < 1) {
			this.isPackagingPositionLength = false;
		} else {
			this.isPackagingPositionLength = true;
		}
	}

	onChangeItem(event: any) {
		const id = event.detail.item.id;
		const itemName = event.detail.item.text;
		const itemCustomId = event.detail.item.additionalText;

		this.selectedItem = new Item().deserialize({
			id: id,
			name: itemName,
			custom_id: itemCustomId,
		});
	}

	onChangeHandlingUnits(event: any) {
		this.selectedHandlingUnitId = parseInt(event.detail.item.id);
	}

	onSavePackage() {
		this.isDataUnSaved = true;
		const stockData = this.cartonPackagingRef.childComponent!.data;
		const stockIndex = stockData.findIndex((stock: any) => stock.id === this.selectedStock.id);
		if (stockIndex !== -1) {
			//  Update the quantity in stocksData
			this.cartonPackagingRef.stocksUpdatedData.push(stockData[stockIndex]);
			stockData[stockIndex].quantity = this.stockAmount;

			//  Add selected stock data to packagingPositionData
			const newPosStock = new Stock().deserialize({
				item: this.selectedStock?.item,
				batch: this.selectedStock?.batch,
				serial: this.selectedStock?.serial,
				quantity: this.quantityAdded,
				stockable_type: this.selectedStock?.stockable_type,
				stockable_id: this.selectedStock?.stockable_id,
				positionable_type: this.selectedStock?.positionable_type,
				positionable_id: this.selectedStock?.positionable_id,
				itemState: this.selectedStock?.itemState,
				isNewlyAdded: true
			});

			this.cartonPackagingRef.newAddedPackagePosData.push(newPosStock);

			this.cartonPackagingRef.packagingPositionData.push(newPosStock);

			//  Update the grid to reflect changes
			this.cartonPackagingRef.childComponent?.render();
			this.cartonPackagingRef.packagingPosComponent?.render();

			//  Close the dialog
			this.stockPackagingDialog.open = false;
			this.isPackagingPositionLength = true;
		}
	}

	onSaveUnpack() {
		// this.isDataUnSaved = true;
		const packPosData = this.cartonPackagingRef.packagingPositionData as any[];
		const stockIndex = packPosData.findIndex((stock: any) => stock.id === this.selectedStock.id);
		if (stockIndex !== -1) {
			packPosData[stockIndex].quantity = this.stockAmount;

			const modifiedPackagingIds = this.cartonPackagingRef.modifiedPosData.map(el=> el.id!);
			if(!modifiedPackagingIds.includes(this.selectedStock.id!)) {
				this.cartonPackagingRef.modifiedPosData.push(packPosData[stockIndex]);
			}

			const newDepackData = new Stock().deserialize({
				id: this.selectedStock.id,
				item: this.selectedStock?.item,
				batch: this.selectedStock?.batch,
				serial: this.selectedStock?.serial,
				quantity: +this.quantityAdded,
				stockable_type: this.selectedStock?.stockable_type,
				stockable_id: this.selectedStock?.stockable_id,
				positionable_type: this.selectedStock?.positionable_type,
				positionable_id: this.selectedStock?.positionable_id,
				itemState: this.selectedStock?.itemState,
			});

			const depackagingIds = this.cartonPackagingRef.depackagingData.map(el=> el.id!);
			if(depackagingIds.includes(newDepackData.id!)) {
				this.cartonPackagingRef.depackagingData = this.cartonPackagingRef.depackagingData.map(el=> {
					if(el.id === newDepackData.id) {
						el.quantity = el.quantity! + newDepackData.quantity!
					}
					return el;
				});
			}else {
				this.cartonPackagingRef.depackagingData.push(newDepackData);
			}
		}
		this.cartonPackagingRef.packagingPosComponent?.render();
		this.stockPackagingDialog.open = false;
	}

	openStockPackagingDialog(event: any, isUnpack: boolean) {
		this.isHandlingUnitUnpack = isUnpack;
		this.selectedStock = event;
		this.stockAmount = +this.selectedStock.quantity!;
		this.quantityAdded = "";
		this.isError = false;
		this.errorStatus = "";
		this.stockPackagingDialog.open = true;
	}

	openDePackagingDialog() {
		this.stockDePackagingDialog.open = true;
	}

	onDeleteFromDePackaging(data: any) {
		this.cartonPackagingRef.modifiedPosData = this.cartonPackagingRef.modifiedPosData.filter(el => el.id !== data.id);
		this.cartonPackagingRef.depackagingData = this.cartonPackagingRef.depackagingData.filter(el => el.id !== data.id);
		this.cartonPackagingRef.packagingPositionData = this.cartonPackagingRef.packagingPositionData.map(el => {
			if(el.id === data.id) {
				el.quantity = el.quantity + data.quantity;
			}
			return el;
		})
		this.cartonPackagingRef.packagingPosComponent?.render();
	}

	onSaveDePackagingData() {
		this.stockDePackagingDialog.open = false;
		this.isLoading = true;
		const modifiedPostStocks = this.cartonPackagingRef.depackagingData.map(el=> {
			return {
				batch: el?.batch,
				serial: el?.serial,
				quantity: -el.quantity!,
				stockable_type: el?.stockable_type,
				stockable_id: el?.stockable_id,
				positionable_type: el.positionable_type,
				positionable_id: el.positionable_id,
				item_state_id: el?.itemState?.id
			};
		});
		const depackagingStocks = this.cartonPackagingRef.depackagingData.map(el=> {
			return {
				batch: el?.batch,
				serial: el?.serial,
				quantity: el?.quantity,
				stockable_type: el?.stockable_type,
				stockable_id: el?.stockable_id,
				positionable_type: this.currentMachine?.production_supply_area_id ? BackendModelType.PRODUCTIONSUPPLYAREA : BackendModelType.MACHINE,
				positionable_id: this.currentMachine?.production_supply_area_id ? this.currentMachine?.production_supply_area_id : this.currentMachine?.id,
				item_state_id: el?.itemState?.id
			};
		});
		const allStockReqData = [...modifiedPostStocks, ...depackagingStocks];
		this.cartonPackagingRef.depackagingData = [];

		this.commonService.put('stock/update-stock', allStockReqData, false)
		.pipe(takeUntil(this.destroyed$))
		.subscribe({
			next: (res)=> {
				this.toasterStatus = $localize`De-Packaging Items Successfully`;
				this.statusToastTools.open = true;
				if (this.cartonPackagingRef.packagingPosComponent) {
					this.cartonPackagingRef.packagingPosComponent.isBusy = true;
					this.cartonPackagingRef.packagingPosComponent.render();
				}
				this.cartonPackagingRef.childComponent?.onFilterAndSorting();
				this.getStockPosData();
				this.isLoading = false;
			},
			error: (err) => {
				this.errorStatus = typeof err === 'string' ? err : this.localization.someThingWentWrong;
				this.isLoading = false;
				this.isDataUnSaved = false;
				this.errorDialog.open = true;
			},
			complete: ()=>{}
		})
	}

	onInputChange() {
		this.stockAmount = +this.selectedStock.quantity!;
		this.isError = false;
		this.errorStatus = "";
		if (this.quantityAdded) {
			const quantity = +this.quantityAdded;
			if (isNaN(quantity) || (!isNaN(quantity) && quantity < 1)) {
				this.errorStatus = $localize`Quantity amount must be a number and has to be 1 or greater`;
				this.isError = true;
			} else if (!isNaN(quantity) && quantity > +this.selectedStock.quantity!) {
				this.errorStatus = $localize`Quantity amount is greater than the quantity is in stock`;
				this.isError = true;
			} else {
				this.stockAmount = +this.selectedStock.quantity! - quantity;
			}
		}
	}

	deletedHandlingUnit() {
		this.toasterStatus = $localize`Handling Unit Unassigned Successfully`;
		this.statusToastTools.open = true;
	}

	onSearchPackagingInstruction() {
		this.searchInstructionSubject.pipe(
			debounceTime(800),
			switchMap(query => {
				this.skip = 0;
				return this.fetchPackagingInstructions(query);
			})
		).subscribe({
			next: () => {
				this.loading = false;
			},
			error: (err) => {
				this.loading = false;
			},
			complete: ()=> {}
		});
	}

	fetchPackagingInstructions(query: string = '', skip: number = this.skip, top: number = this.top) {
		this.loading = true;
		const filter = `&$filter=packable_type eq '${BackendModelType.ITEM}' and packable_id eq ${this.selectedItemId}`;
		const filterQuery = query ? `;$filter=contains(custom_id, '${query}')` : ``;
		const url = `PackagingInstructionPos?$expand=packagingInstruction($expand=packagingInstructionPos($filter=is_container eq true;$orderby=created_at desc)${filterQuery})${filter}&$skip=${skip}&$top=${top}`;

		return this.commonService.get(url).pipe(
			tap((res: any) => {
				const packagingInstructionPos = res.value;
				const uniquePackagingInstPos = Object.values(packagingInstructionPos.reduce((acc: any, item: any) => {
					if (!acc[item.packaging_instruction_id]) {
					  acc[item.packaging_instruction_id] = item;
					}
					return acc;
				}, {})) as PackagingInstructionPos[];

				const resData = uniquePackagingInstPos.filter(el=> el.packagingInstruction).map((res) => {
					return new PackagingInstruction().deserialize(res.packagingInstruction);
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

	onInstructionSelect(event: any) {
		const id = event.item.id;
		const customId = event.item.dataset.customid;
		this.instructionCustomID = customId;
		const packagingInstruction = this.packagingInstructions.find(el=> el.custom_id == this.instructionCustomID);
		if(packagingInstruction) {
			this.selectedPackagingInstruction = packagingInstruction;
			const selectablePos = packagingInstruction.packagingInstructionPos.find(el=> el.is_container === true);
			if(selectablePos) {
				this.isInstructionLoading = true;
				this.commonService.get(`Items/${selectablePos.packable_id}`)
				.pipe(takeUntil(this.destroyed$))
				.subscribe({
					next: (res)=> {
						const selectableItem = new Item().deserialize(res);
						this.selectedItemName = selectableItem.name!;
						this.selectedItem = new Item().deserialize({
							id: selectableItem.id,
							name: selectableItem.name,
							custom_id: selectableItem.custom_id,
						});
						this.isInstructionLoading = false;
					},
					error: (err)=> {
						this.isInstructionLoading = false;
					},
					complete: ()=>{}
				})
			}else {
				this.selectedItemName = '';
				this.selectedItem = new Item().deserialize({});
			}
		}else {
			this.instructionCustomID = '';
			this.selectedPackagingInstruction = new PackagingInstruction().deserialize({});
			this.selectedItemName = '';
			this.selectedItem = new Item().deserialize({});
		}

		this.packagingInstructionPopover.open = false;
	}

	onSearchInstruction() {
		this.instructionSearch = this.instructionCustomID;
		this.searchInstructionSubject.next(this.instructionSearch);
	}

	onOpenInstructions() {
		this.packagingInstructionPopover.opener = this.instructionInputRef.elementRef.nativeElement;
		this.packagingInstructionPopover.open = true;
	}

	onLoadMoreInstruction() {
		if (this.packagingInstructions.length > (this.top - 1)) {
			this.fetchPackagingInstructions(this.instructionSearch ? this.instructionSearch : '', this.skip, this.top).subscribe({
				next: () => {
					this.loading = false;
				},
				error: (err) => {
					this.loading = false;
				},
				complete: ()=> {}
			});
		}
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

}
