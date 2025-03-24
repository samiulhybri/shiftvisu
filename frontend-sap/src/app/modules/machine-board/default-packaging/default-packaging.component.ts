import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendModelType } from '@app/shared/enums/BackendModelType';
import { OrderDetails } from '@app/shared/interfaces/OrderDetails';
import { Item } from '@app/shared/models/item.model';
import { Machine } from '@app/shared/models/machine.model';
import PackagingInstructionPos from '@app/shared/models/packaging-instruction-pos.model';
import PackagingInstruction from '@app/shared/models/packaging-instruction.model';
import { CommonService } from '@app/shared/services/common.service';
import { DataService } from '@app/shared/services/data.service';
import { PlantsService } from '@app/shared/services/plants.service';
import { ToastService } from '@app/shared/services/toaster.service';
import Dialog from '@ui5/webcomponents/dist/Dialog';
import Popover from '@ui5/webcomponents/dist/Popover';
import { debounceTime, of, ReplaySubject, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { Localization } from '@app/shared/utils/common-localize';

@Component({
    selector: 'app-default-packaging',
    templateUrl: './default-packaging.component.html',
    styleUrl: './default-packaging.component.css'
})
export class DefaultPackagingComponent {

    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    private searchItemSubject = new Subject<string>();
    private searchInstructionSubject = new Subject<string>();
    @ViewChild("defaultPackagingModalRef") modalRef!: Dialog;
    @ViewChild("itemListPopover") itemListPopover!: Popover;
    @ViewChild("itemsMultiInputRef") itemsMultiInputRef!: any;
    @ViewChild("packagingInstructionPopover") packagingInstructionPopover!: Popover;
    @ViewChild("parentPackagingInstructionPopover") parentPackagingInstructionPopover!: Popover;
    @ViewChild("instructionInputRef") instructionInputRef!: any;
    @ViewChild("parentInstructionInputRef") parentInstructionInputRef!: any;
    dialogTitle: string = $localize`Next Packaging`;
    items: Item[] = [];
    initialItems: Item[] = [];
	parentItems: Item[] = [];
    parentInitialItems: Item[] = [];
    selectedItemName: string = '';
    selectedItem = new Item().deserialize({});
	selectedParentItemName: string = '';
    selectedParentItem = new Item().deserialize({});
    currentMachine: Machine | undefined;
    plantId: number = 0;
    selectedOrderDetails: OrderDetails | null = null;
	selectedItemId: string = '';
    cacheAllParents: PackagingInstructionPos[] = [];
    packagingInstructions: any[] = [];
	initialPackagingInstructions: any[] = [];
    parentPackagingInstructions: any[] = [];
    initialParentPackagingInstructions: any[] = [];
	parentInitialPackagingInstructions: any[] = [];
    selectedPackagingInstruction:any = new PackagingInstruction().deserialize({});
    selectedParentPackagingInstruction = new PackagingInstruction().deserialize({});
    skip: number = 0;
	top: number = 200;
    itemSearch: string = '';
    instructionSearch: string = '';
    parentInstructionSearch: string = '';
    instructionCustomID: string = '';
	toasterMessage: string = '';
    isInstructionLoading: boolean = false;
    loading: boolean = false;
	localization = Localization;
	parentInstructionCustomID: string = '';
	isLoadingParentInstruction: boolean = false;

	@ViewChild("errorDialog", { static: false }) errorDialog: any;

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        private plantsService: PlantsService,
		private toastService: ToastService,
        private commonService: CommonService,
		private dataService: DataService,
		private machineBoardEventService: MachineBoardEventHandleService
    ) { 
        this.getCurrentMachine();
        this.getSelectedOrderDetails();
        this.plantsService.plantId.subscribe((plantId: number | undefined) => {
			if (plantId) {
				this.plantId = plantId;
				this.getItemList();
			}
		});
		this.onSearchPackagingInstruction();
        this.onSearchItemData();
    }

	getSavedNextPackaging() {
		if(this.selectedOrderDetails) {
			this.commonService.get(`MachineProdOrderPosOperationTimes?$filter=machine_id eq ${this.currentMachine?.id} and prod_order_pos_operation_id eq ${this.selectedOrderDetails?.id} and end eq null&$expand=itemPackaging,packagingInstruction,packagingInstructionParent($expand=packagingInstructionPos),itemPackagingParent`)
			.pipe(takeUntil(this.destroyed$))
			.subscribe((res: any)=> {
				const machineOperationTimes = res.value;
				if(machineOperationTimes.length) {
					const nextPackagingInstruction = machineOperationTimes[0].packagingInstruction;
					const nextPackagingInstructionParent = machineOperationTimes[0].packagingInstructionParent;
					const nextPackagingItem = machineOperationTimes[0].itemPackaging;
	
					if(nextPackagingItem) {
						this.selectedItemName = nextPackagingItem.name;
						this.selectedItem = new Item().deserialize({
							id: nextPackagingItem.id,
							name: nextPackagingItem.name,
							custom_id: nextPackagingItem.custom_id,
						});
					}
	
					const savedPackaging = this.packagingInstructions.find(el => el.packaging_instruction_custom_id_child == nextPackagingInstruction?.custom_id && el.packaging_instruction_custom_id_parent == nextPackagingInstructionParent?.custom_id);

					if(savedPackaging) {
						this.instructionCustomID = savedPackaging?.item_custom_id_container + ' - ' +  savedPackaging?.target_quantity;//savedPackaging.custom_id;
						this.selectedPackagingInstruction = new PackagingInstruction().deserialize(savedPackaging);
					}
				}
				this.loading = false;
			})
		}
	}

    getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
		});
	}

    getSelectedOrderDetails() {
        this.loading = true;
		this.dataService.selectedOrderDetails$
		.pipe(
			takeUntil(this.destroyed$),
			switchMap(res=> {
				if(res) {
					this.selectedOrderDetails = res;
					this.selectedItemId = res.itemImageId;
					return this.commonService.get(`machine-board/next-packaging-instruction/${res?.id}`, false);
				}
				return of(null);
			})
		)
		.subscribe({
            next: (res: any) => {
                if(res) {
					this.packagingInstructions = res ?? []

					this.getSavedNextPackaging();
                }else {
					this.loading = false;
				}
            },
            error: (error) => {
                this.loading = false;
            },
            complete: ()=> {}
        })
	}

    getItemList() {
        const url = this.plantId ? `Plants(${this.plantId})\/items?$expand=itemType&$filter=itemType/any(a:a/is_packaging eq true)&$top=${this.top}` : `Items?$expand=itemType&$filter=itemType/any(a:a/is_packaging eq true)&$top=${this.top}`;
        this.commonService.get(url)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: ((res: any) => {
                res.value?.map((item: Item) => {
					const deserializedItem = new Item().deserialize(item);
					this.items.push(deserializedItem);
				});
				this.initialItems = [...this.items];
                this.skip = this.top;
            }),
            error: (err=> {

            }),
            complete: ()=>{

            }
        })
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

    onSearchItem() {
		this.itemSearch = this.selectedItemName;
		this.searchItemSubject.next(this.selectedItemName);
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

    onOpenItemList() {
		this.itemListPopover.opener = this.itemsMultiInputRef.elementRef.nativeElement
		this.itemListPopover.open = true;
	}

    onSearchInstruction() {
		this.instructionSearch = this.instructionCustomID;
		this.searchInstructionSubject.next(this.instructionSearch);
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
				if(this.instructionSearch !== '') {
					this.onOpenInstructions();
				}
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
		const filter = `packable_type=${BackendModelType.ITEM}&packable_id=${this.selectedItemId}&$skip=${skip}&$top=${top}`;
		const filterQuery = query ? `&search=${query}` : ``;
		const url = `packaging-instruction-pos?${filter}${filterQuery}`;

		return this.commonService.get(url, false).pipe(
			tap((res: any) => {
				const packagingInstructionPos = res;
				const uniquePackagingInstPos = Object.values(packagingInstructionPos.reduce((acc: any, item: any) => {
					if (!acc[item.packaging_instruction_id]) {
					  acc[item.packaging_instruction_id] = item;
					}
					return acc;
				}, {})) as PackagingInstructionPos[];
				
				const resData = uniquePackagingInstPos.filter(el=> el.packagingInstruction).map((res) => {
					const packagingInstructionContent = packagingInstructionPos.find((pos: PackagingInstructionPos)=> pos.is_container === false && pos.packaging_instruction_id === res.packagingInstruction.id);
					let targetedQuantity: number = 0;
					if(packagingInstructionContent) {
						targetedQuantity = packagingInstructionContent.target_quantity!;
					}
					return new PackagingInstruction().deserialize({...res.packagingInstruction, targetQuantity: targetedQuantity});
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

    onOpenInstructions() {
		this.packagingInstructionPopover.opener = this.instructionInputRef.elementRef.nativeElement;
		this.packagingInstructionPopover.open = true;
	}

    onInstructionSelect(event: any) {
		this.selectedItemName = '';
		const id = event.item.id;
		const customId = event.item.dataset.customid;
		const childId = event.item.dataset.childid;
		const parentId = event.item.dataset.parentid;
		this.instructionCustomID = customId;
		
		const packagingInstruction = this.packagingInstructions.find(el=> el.packaging_instruction_id_child == childId && el.packaging_instruction_id_parent == parentId);

		this.instructionCustomID = packagingInstruction.item_custom_id_container + ' - ' +  packagingInstruction?.target_quantity;

		if(packagingInstruction) { 
			this.selectedPackagingInstruction = packagingInstruction;

			if(this.selectedPackagingInstruction) {
				this.isInstructionLoading = true;
				this.commonService.get(`Items/${this.selectedPackagingInstruction?.item_id_container_child}`)
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

    saveNextPackaging() {
        this.isInstructionLoading = true;

        const payload = {
			"machine_id": this.currentMachine?.id,
			"prod_order_pos_operation_id": this.selectedOrderDetails?.id ?? null,
			"packaging_instruction_id": this.selectedPackagingInstruction?.packaging_instruction_id_child ?? null,
			"item_id": this.selectedItem?.id ?? null,
			"packaging_instruction_id_parent": this.selectedPackagingInstruction?.packaging_instruction_id_parent ?? null,
			"item_id_parent": this.selectedPackagingInstruction.item_id_container_parent ?? null,
			"isLinkedOrder": this.selectedOrderDetails?.isLinkedOrder ?? null,
			'targetQuantity': this.selectedPackagingInstruction?.target_quantity ?? null,
        }
        
        this.commonService.post('machine-board/next-packaging', payload, false)
        .pipe(
            takeUntil(this.destroyed$),
        )
        .subscribe({
            next: (res) => {
				this.toasterMessage = this.localization.recordSavedSuccessfully;
				this.machineBoardEventService.prodOrderPosOperationChangeEvent();
				this.toastService.showToast(this.toasterMessage, 'success');
                this.isInstructionLoading = false;
                this.closeDialog();
            },
            error: (err)=> {
				this.isInstructionLoading = false;
				this.errorDialog.elementRef.nativeElement.open = true;
            },
            complete: ()=>{}
        })
    }

	removeNextPackaging() {
		this.isInstructionLoading = true;
        const payload = {
			"machine_id": this.currentMachine?.id,
			"prod_order_pos_operation_id": this.selectedOrderDetails?.id,
			"packaging_instruction_id": null,
			"item_id": null,
			"packaging_instruction_id_parent": null,
			"item_id_parent": null,
			"isLinkedOrder": this.selectedOrderDetails?.isLinkedOrder,
			'targetQuantity': null
        }

		this.commonService.post('machine-board/next-packaging?isRemove=true', payload, false)
        .pipe(
            takeUntil(this.destroyed$),
        )
		.subscribe({
            next: (res) => {
				this.toasterMessage = this.localization.recordDeleted;
				this.toastService.showToast(this.toasterMessage, 'success');
				this.machineBoardEventService.prodOrderPosOperationChangeEvent();
				this.isInstructionLoading = false;
				this.closeDialog();
            },
            error: (err)=> {
                this.closeDialog();
            },
            complete: ()=>{}
        })
	}

    closeDialog() {
        this.modalRef.open = false;
        this.router.navigate(["../"], { relativeTo: this.activeRoute });
	}

    ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	getItemFromItemImage(item:Item){
		this.parentPackagingInstructions = this.parentPackagingInstructions.map((packagingInstruction: any)=>{
			if(packagingInstruction?.packagingInstructionPos?.[0]?.packable_id == item?.id && packagingInstruction?.packagingInstructionPos?.[0]?.packable_id){
				packagingInstruction.packagingInstructionPos[0].item = item
			}

			return packagingInstruction;
		})
	}

	closeErrorDialog(){
		this.errorDialog.elementRef.nativeElement.open = false;
	}
}
