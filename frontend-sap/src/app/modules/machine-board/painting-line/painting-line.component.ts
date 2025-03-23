import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { Localization } from '@app/shared/utils/common-localize';
import { OrderDetails } from '@app/shared/interfaces/OrderDetails';
import { DataService } from '@app/shared/services/data.service';
import { of, ReplaySubject, switchMap, takeUntil } from 'rxjs';
import { ToastService } from '@app/shared/services/toaster.service';
import { CommonService } from '@app/shared/services/common.service';
import { Machine } from '@app/shared/models/machine.model';
import { ProdOrderPosOperationLoadedQuantity } from '@app/shared/models/prod-order-pos-operation-loaded-quantity.model';
import { CustomReactGridTable } from '@app/shared/components/CustomGridTable';
import { ProdOrderPosOperationUnloadedQuantity } from '@app/shared/models/prod-order-pos-operation-unloaded-quantity.model';
import { SegmentedButtonSelectionChangeEventDetail } from '@ui5/webcomponents/dist/SegmentedButton';
import { MachineConfirmationType, MachineConfirmationTypeClass } from '@app/shared/enums/MachineConfirmationType';
import { MachineBoardEventHandleService } from '@app/modules/machine-board/services/machine-board-event-handle.service';

@Component({
    selector: 'app-painting-line',
    templateUrl: './painting-line.component.html',
    styleUrl: './painting-line.component.css'
})
export class PaintingLineComponent implements OnInit {
    protected prodOrderPosOperationLoadedQuantity = ProdOrderPosOperationLoadedQuantity;
    protected prodOrderPosOperationUnloadedQuantity = ProdOrderPosOperationUnloadedQuantity;
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    private timeoutId: any;
    private apiTimeoutId: any;
    @ViewChild("paintingLineDialog") modalRef!: Dialog;
    @ViewChild("paintingLineWarningDialog") warningModalRef!: Dialog;
    @ViewChild('saveButtonRef') saveButtonRef!: ElementRef;
    @ViewChild("gridTableComponentRef", { static: false }) gridTableComponentRef!: CustomReactGridTable;
    localization = Localization;
    selectedTab: string = "uploadTab";
    orderDetails: OrderDetails[] = [];
    filteredOrderDetails: OrderDetails[] = [];
    selectedOperations: OrderDetails | null = null;
    quantityAdded: number | string = "";
    currentMachine: Machine | undefined;
    paintingLineLoadedQuantities: ProdOrderPosOperationLoadedQuantity[] = [];
    unloadedQuantities: ProdOrderPosOperationLoadedQuantity | null = null;
    unloadedOperation: string = '';
    remainingQuantity: number = 0;
    uploadedQuantity: number = 0;
    defaultQuantity: number = 1;
    errorStatus: string = "";
    isError: boolean = false;
    isLoading: boolean = false;
    isNegative: boolean = false;
    warningMessage: string = "";
    gridTableUrl: string = 'ProdOrderPosOperationLoadedQuantities';
    headerTitle: string = $localize`Loaded Quantities`;
    deletedItem: any;
    deletedItemId = "";
    isAutomaticMode: boolean = true;
    disableButtonDuringRequest: boolean = false;

    columns: any = [
        {
            Header: $localize`User`,
            accessor: "user.name",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false
        },
        {
            Header: $localize`Machine`,
            accessor: "machine.name",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true
        },
        {
            Header: $localize`Order Id`,
            accessor: "prodOrderPosOperation.prodOrderPos.prodOrder.custom_id",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false
        },
        {
            Header: $localize`Pos`,
            accessor: "prodOrderPosOperation.pos",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false
        },
        {
            Header: $localize`Date`,
            accessor: "dateTime",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false,
            hAlign: "Right"
        },
        {
            Header: $localize`Quantity`,
            accessor: "quantity",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false,
            hAlign: "Right"
        }
    ]

    constructor(
        private router: Router,
        private activeRoute: ActivatedRoute,
        private dataService: DataService,
        private commonService: CommonService,
        private toastService: ToastService,
         private eventEmitter: MachineBoardEventHandleService
    ) {}

    ngOnInit(): void {
        this.getCurrentMachine();
        this.getOrderDetails();
    }

    focusButton() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
		this.timeoutId = setTimeout(() => {
			if (this.saveButtonRef && (this.saveButtonRef as any).elementRef.nativeElement) {
				(this.saveButtonRef as any).elementRef.nativeElement.focus();
			}
		}, 100);
	}

    getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;
		});
	}

    getOrderDetails() {
        this.isLoading = true;
        this.dataService.orderDetails$
        .pipe(   
            takeUntil(this.destroyed$),
            switchMap(res=> {
                this.orderDetails = res;
                if(this.selectedTab === 'uploadTab') {
                    this.filteredOrderDetails = this.orderDetails.filter(el=> +el.orderQuantity > el.loadedQuantities);
                }else {
                    this.filteredOrderDetails = [...this.orderDetails];
                }
                if(this.filteredOrderDetails.length) {
                    this.quantityAdded = this.defaultQuantity.toString();
                    if(this.selectedOperations && this.selectedOperations.id) {
                        const preSelectedOrder = this.filteredOrderDetails.find(el=> el.id === this.selectedOperations?.id);
                        if(preSelectedOrder) {
                            this.selectedOperations = preSelectedOrder;
                        }else {
                            this.selectedOperations = this.filteredOrderDetails[0];
                        }
                    }else {
                        this.selectedOperations = this.filteredOrderDetails[0];
                    }
                    return this.paintingLineForLoadedQuantity$;
                }
                this.selectedOperations = null;
                this.quantityAdded = '';
                return of(null);
            })
        )
        .subscribe({
            next: (res: any)=> {
                if(res && res.length) {
                    this.paintingLineLoadedQuantities = res.map((el: any)=> new ProdOrderPosOperationLoadedQuantity().deserialize(el));
                }else {
                    this.paintingLineLoadedQuantities = [];
                }
                this.updateRemainingQuantity();
                this.onInputChange();
                this.isLoading = false;
                this.focusButton();
            },
            error: (err) => {
                this.isLoading = false;
            },
            complete: ()=> {}
        })
    }

    get paintingLineForLoadedQuantity$() {
        const url = `painting-line-loaded-quantity/${this.currentMachine?.id}/${this.selectedOperations?.id}`;
        return this.commonService.get(url, false);
    }

    tabNavChanged(event: any) {
        this.selectedTab = event.detail.tab.id;
        this.isAutomaticMode = true;
        if(this.selectedTab === 'downloadTab') {
            this.filteredOrderDetails = [...this.orderDetails];
            this.getUnloadedQuantityForCurrentMachine();
            this.gridTableUrl = `ProdOrderPosOperationUnloadedQuantities`;
            this.headerTitle = $localize`Unloaded Quantities`;
           
            if(this.apiTimeoutId) {
                clearTimeout(this.apiTimeoutId)
            }
            setTimeout(()=> {
                this.apiTimeoutId = this.gridTableComponentRef.onFilterAndSorting();
            }, 200)
        } else {
            this.selectedOperations = null;
            this.getOrderDetails();
            this.gridTableUrl = `ProdOrderPosOperationLoadedQuantities`;
            this.headerTitle = $localize`Loaded Quantities`;

            if(this.apiTimeoutId) {
                clearTimeout(this.apiTimeoutId)
            }
            setTimeout(()=> {
                this.apiTimeoutId = this.gridTableComponentRef.onFilterAndSorting();
            }, 200)
        }
	}

    getUnloadedQuantityForCurrentMachine() {
        this.isLoading = true;
        this.commonService.get(`unloaded-quantity/${this.currentMachine?.id}`, false)
        .pipe(
            takeUntil(this.destroyed$),
            switchMap((res: any)=> {
                const machineLoadedQuantity = res.unloading_quantity;
                this.unloadedQuantities = machineLoadedQuantity ? new ProdOrderPosOperationLoadedQuantity().deserialize(machineLoadedQuantity) : null;
                if(this.unloadedQuantities) {
                    this.unloadedOperation = this.unloadedQuantities ? this.unloadedQuantities.prodOrderPosOperation?.prodOrderPos?.prodOrder?.custom_id + ' - ' + this.unloadedQuantities.prodOrderPosOperation?.pos + ' - ' + this.unloadedQuantities.prodOrderPosOperation?.prodOrderPos?.item?.custom_id : '';
                    this.quantityAdded = this.unloadedQuantities.quantity.toString();
                    if(res.loaded_quantities.length) {
                        const machineAllLoadedQuantities = res.loaded_quantities.map((el: any)=> new ProdOrderPosOperationLoadedQuantity().deserialize(el));
                        this.paintingLineLoadedQuantities = machineAllLoadedQuantities;
                    }else {
                        this.paintingLineLoadedQuantities = [];
                    }
                    const payload = { prodOrderPosOperationIds: [this.unloadedQuantities.prod_order_pos_operation_id] };
                    return this.commonService.post("machine-board/operation-details", payload, false)
                }
                this.paintingLineLoadedQuantities = [];
                return of(null)
            })
        )
        .subscribe({
            next: (res: any)=> {
                if(res && res.length) {
                    this.selectedOperations = res[0];
                }else {
                    this.selectedOperations = null;
                    this.quantityAdded = '';
                }
                this.updateRemainingQuantity();
                this.focusButton();
            },
            error: (err)=> {
                this.isLoading = false;
            },
            complete: ()=> {
                this.isLoading = false;
            }
        })
    }

    changeOrder(event: any) {
        this.isLoading = true;
		const operationId = +event.selectedOption.attributes["value"].value;
		const orderDetail = this.filteredOrderDetails?.find(
            (operation: OrderDetails) => operation.id === operationId
        );
        this.selectedOperations = orderDetail ? orderDetail : null;
        this.getQuantityAndRecalculateData()
	}

    closeDialog() {
        this.modalRef.open = false;
		this.router.navigate(["../"], { relativeTo: this.activeRoute });
    }

    onInputChange() {
		this.isError = false;
        this.isNegative = false;
		this.errorStatus = "";
        this.warningMessage = "";
		if (this.quantityAdded) {
			const quantity = +this.quantityAdded;
			if (isNaN(quantity) || (!isNaN(quantity) && quantity < 1)) {
				this.errorStatus = $localize`Quantity amount must be a number and has to be 1 or greater`;
				this.isError = true;
			}else {
                this.isNegative = (this.remainingQuantity - quantity) < 0 ? true : false;
                if(this.isNegative) {
                    this.warningMessage = this.selectedTab === 'uploadTab' ? $localize`Loaded quantity is exceeding the operation quantity` : $localize`Unloaded quantity is exceeding the operation quantity`;
                }
            }
		}
	}

    onKeyDown(event: KeyboardEvent) {
        if (event && event.key === 'Enter' && !this.isError) {
            event.preventDefault();
            if (this.selectedTab === 'uploadTab'){
                this.onSave();
            }
            else {
                this.onUnloading();
            }
        }
    }

    onSave() {
        if(this.isNegative) {
            this.warningModalRef.open = true;
            return;
        }
        this.isLoading = true;
        const payload = {
            'prod_order_pos_operation_id': this.selectedOperations?.id,
            'machine_id': this.currentMachine?.id,
            'quantity': +this.quantityAdded
        }
        this.commonService.post('painting-line-loaded-quantity', payload, false)
        .pipe(
            takeUntil(this.destroyed$),
            switchMap(res=>{
                return this.paintingLineForLoadedQuantity$;
            })
        )
        .subscribe({
            next: (res: any)=> {
                if(res && res.length) {
                    this.paintingLineLoadedQuantities = res.map((el: any)=> new ProdOrderPosOperationLoadedQuantity().deserialize(el));
                }else {
                    this.paintingLineLoadedQuantities = [];
                }
                this.updateRemainingQuantity();
                this.quantityAdded = this.defaultQuantity.toString();
                this.toastService.showToast(this.localization.recordSavedSuccessfully, 'success');
                this.eventEmitter.prodOrderPosOperationChangeEvent();
                this.gridTableComponentRef?.onFilterAndSorting();
            },
            error: (err)=>{
                this.isLoading = false;
            },
            complete: ()=>{
                this.isLoading = false;
                this.onInputChange();
                this.focusButton();
            }
        })
    }

    onUnloading() {
        if(this.isNegative) {
            this.warningModalRef.open = true;
            return;
        }
        this.isLoading = true;
        const payload = {
            'prod_order_pos_operation_id': this.selectedOperations?.id,
            'machine_id': this.currentMachine?.id,
            'prod_order_pos_operation_loaded_quantity_id': this.unloadedQuantities ? this.unloadedQuantities.id : '',
            'quantity': +this.quantityAdded
        }
        if (!this.isAutomaticMode){
            delete payload['prod_order_pos_operation_loaded_quantity_id'];
        }

        this.commonService.post('painting-line-unload-quantity', payload, false)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (res)=>{
                if (this.isAutomaticMode){
                    this.getUnloadedQuantityForCurrentMachine();
                }
                else {
                    this.getQuantityAndRecalculateData();
                }
                this.gridTableComponentRef?.onFilterAndSorting();
                if(MachineConfirmationTypeClass.getStateValue(this.currentMachine?.confirmation_type) === MachineConfirmationType.AUTOMATIC) {
                    this.eventEmitter.machineKPI1ChangeEvent();
                    this.eventEmitter.machineKPI2ChangeEvent();
                    this.eventEmitter.quantityChartChangeEvent();
                    this.eventEmitter.prodOrderPosOperationChangeEvent();
                }
            },
            error: (err)=>{
                this.isLoading = false;
            },
            complete: ()=>{}
        })
    }

    updateRemainingQuantity() {
        if(this.paintingLineLoadedQuantities) {
            this.uploadedQuantity = this.paintingLineLoadedQuantities.reduce((sum, item) => sum + item.quantity, 0);
            if(this.selectedTab === 'uploadTab') {
                this.remainingQuantity = this.selectedOperations ? +this.selectedOperations!.orderQuantity - this.uploadedQuantity : 0;
            }else {
                const totalQuantity = this.paintingLineLoadedQuantities.filter(el=> !el.is_unloaded).reduce((sum, item) => sum + item.quantity, 0);
                this.remainingQuantity = totalQuantity;
            }
        }else {
            this.uploadedQuantity = 0;
            this.remainingQuantity = this.selectedOperations ? +this.selectedOperations!.orderQuantity : 0;
        }
    }

    confirmSave() {
        this.isNegative = false;
        this.closeWarning();
        if (this.selectedTab === 'uploadTab'){
            this.onSave();
        }
        else {
            this.onUnloading();
        }
    }

    closeWarning() {
        this.warningModalRef.open = false;
    }

    deleteClick(value: any): void {
        this.deletedItem = value;
        this.deletedItemId = value.id;
        const dialog = document.getElementById("deleteDialog") as Dialog;
        dialog.open = true;
	}

    deleteSubmit() {
        const { recordDeleted } = Localization;
        this.isLoading = true;
        if(this.selectedTab === 'downloadTab') {
            this.commonService.delete(`${this.gridTableUrl}(${this.deletedItemId})`)
            .pipe(
                takeUntil(this.destroyed$),
                switchMap(res=> {
                    if (!this.deletedItem.prod_order_pos_operation_loaded_quantity_id) {
                        return of(null);
                    }
                    return this.commonService.put(`ProdOrderPosOperationLoadedQuantities/${this.deletedItem.prod_order_pos_operation_loaded_quantity_id}`, {'is_unloaded': false})
                })
            )
            .subscribe({
                next: () => {
                    this.isLoading = false;
                    this.closeDialogDelete();
                    this.gridTableComponentRef?.onFilterAndSorting();
                    this.toastService.showToast(recordDeleted, "success");
                    if (this.isAutomaticMode){
                        this.getUnloadedQuantityForCurrentMachine();
                    }
                    else {
                        this.getQuantityAndRecalculateData()
                    }
                },
                error: () => {
                    this.isLoading = false;
                },
            });
        }else {
            this.commonService.delete(`${this.gridTableUrl}(${this.deletedItemId})`)
            .pipe(takeUntil(this.destroyed$))
            .subscribe({
                next: () => {
                    this.isLoading = false;
                    this.closeDialogDelete();
                    this.gridTableComponentRef?.onFilterAndSorting();
                    this.toastService.showToast(recordDeleted, "success");
                    this.getOrderDetails();
                },
                error: () => {
                    this.isLoading = false;
                },
            });
        }
	}

	closeDialogDelete() {
		const dialog = document.getElementById("deleteDialog") as Dialog;
		dialog.open = false;
	}

    toggleModeButton(event: SegmentedButtonSelectionChangeEventDetail) {
        const selectedModeId = event.selectedItems[0].id;
        this.isAutomaticMode = selectedModeId === "automatic-mode" ? true : false;

        this.isLoading = true;
        if (this.isAutomaticMode) {
            this.getUnloadedQuantityForCurrentMachine();
        }
        else {
            this.selectedOperations = this.filteredOrderDetails[0];
            this.paintingLineForLoadedQuantity$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any)=> {
                if(res && res.length) {
                    this.paintingLineLoadedQuantities = res.map((el: any)=> new ProdOrderPosOperationLoadedQuantity().deserialize(el));
                }else {
                    this.paintingLineLoadedQuantities = [];
                }
                this.updateRemainingQuantity();
                this.quantityAdded = this.defaultQuantity.toString();
                this.onInputChange();
                this.isLoading = false;
            })
        }
    }

    ngOnDestroy(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.apiTimeoutId) {
            clearTimeout(this.apiTimeoutId);
        }
        this.destroyed$.next(true);
        this.destroyed$.complete();
	}

    unloadWithoutUnloading() {
        this.disableButtonDuringRequest = true;
        this.isLoading = true;
        const payload = {
            'prod_order_pos_operation_loaded_quantity_id': this.unloadedQuantities ? this.unloadedQuantities.id : '',
            'is_unloaded': true
        }

        this.commonService.put(`painting-line-unload-quantity-manual/machine/${this.currentMachine?.id}/operation/${this.selectedOperations?.id}`, payload, false)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
            next: (res)=>{
                this.getUnloadedQuantityForCurrentMachine();
                this.gridTableComponentRef?.onFilterAndSorting();
                this.disableButtonDuringRequest = false;
            },
            error: (err)=>{
                this.isLoading = false;
                this.disableButtonDuringRequest = false;
            },
            complete: ()=>{}
        })
    }

    getQuantityAndRecalculateData() {
        this.paintingLineForLoadedQuantity$
            .pipe(takeUntil(this.destroyed$))
            .subscribe((res: any) => {
                if (res && res.length) {
                    this.paintingLineLoadedQuantities = res.map((el: any) => new ProdOrderPosOperationLoadedQuantity().deserialize(el));
                } else {
                    this.paintingLineLoadedQuantities = [];
                }
                this.updateRemainingQuantity();
                this.quantityAdded = this.defaultQuantity.toString();
                this.onInputChange();
                this.isLoading = false;
            })
    }
}