import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {User} from "@app/shared/models/user.model";
import {AuthService} from "@app/shared/services/auth.service";
import {CommonService} from "@app/shared/services/common.service";
import ItemState from "@app/shared/models/item-state.model";
import {CustomReactGridTable} from "@app/shared/components/CustomGridTable";
import {Item} from "@app/shared/models/item.model";
import {MachineConfirmationType} from "@app/shared/enums/MachineConfirmationType";
import "@ui5/webcomponents/dist/MessageStrip.js";
import {MachineBoardEventHandleService} from "@app/modules/machine-board/services/machine-board-event-handle.service";
import {Button, FlexBox, Input as UI5Input, MultiInput, TextArea} from "@ui5/webcomponents-react";
import React from "react";
import {ItemStateType, ItemStateTypeClass} from "@app/shared/enums/ItemStateType";
import {MachineCycleType} from "../enums/MachineCycleType";
import {PlantsService} from "@app/shared/services/plants.service";
import {ODataBatchCall} from "@app/shared/models/odata-batch-call";
import {ProdOrderPosOperationHandlingUnitType, ProdOrderPosOperationHandlingUnitTypeClass} from "@app/shared/enums/ProdOrderPosOperationHandlingUnitType";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import {ProdOrderPosOperationQuantity} from "@app/shared/models/prod-order-pos-operation-quantity.model";
import {MultiInputComponent, ToastComponent,} from "@ui5/webcomponents-ngx";
import {ProdOrderPosOperationHandlingUnit} from "@app/shared/models/prod-order-pos-operation-handling-unit.model";
import Stock from "@app/shared/models/stock.models";
import {BackendModelType} from "@app/shared/enums/BackendModelType";
import {Localization} from "@app/shared/utils/common-localize";
import {ProdOrderPosOperation} from "@app/shared/models/prod-order-pos-operation.model";
import {MultiComboBoxSelectionChangeEventDetail} from "@ui5/webcomponents/dist/MultiComboBox";
import {MultiInputTokenDeleteEventDetail} from "@ui5/webcomponents/dist/MultiInput";
import {ToastService} from "@app/shared/services/toaster.service";
import "@ui5/webcomponents/dist/features/InputSuggestions.js";
import {QuantityType, QuantityTypeClass} from "@app/shared/enums/QuantityType";
import {BarcodeFormat, BrowserCodeReader, BrowserMultiFormatReader, IScannerControls} from "@zxing/browser";
import { HttpErrorResponse } from "@angular/common/http";
import { OperationControlProfileConfirmationType } from "@app/shared/enums/operation_control_profile_confirmation_type.enum";
import { debounceTime, defer, interval, Subject, Subscription, switchMap } from "rxjs";
import { StagingAreaComponent } from "@app/modules/machine-board/material-consumption/staging-area/staging-area.component";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import MachineUserTime from "@app/shared/models/machine-user-time.model";
import { QuantityErrorType } from "@app/modules/machine-board/enums/QuantityErrorType";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

type EntitySelectionDialogComponentProps = {
    entity: string;
    handlingUnit?: ProdOrderPosOperationHandlingUnit[];
    title: string;
    searchKey: string;
    searchQuery?: string;
    entitySelected: (item: any) => void;
    inputReference?: HTMLElement;
    staticData?: any[];
};

type ConsumptionData = {
    item_plant_id?: number;
    item_state_id?: number;
    quantity: number;
    unit_of_measure_id?: number;
    storage_location_id?: number;
    batch?: string;
    serial?: string;
    handling_unit_id?: number;
    item_id_custom?: string;
    item_name?: string;
    item_is_batch_managed?: boolean;
    item_is_serial_managed?: boolean;
    handling_unit_id_custom?: string;
    storage_location_id_custom?: string;
    unit_of_measure_id_custom?: string;
    note?: string;
};

export type OrderData = {
    order_custom_id: string;
    prod_order_pos_operation_pos: string;
    prod_order_pos_id: number;
    prod_order_pos_operation_id: number;
    prod_order_pos_operation: ProdOrderPosOperation;
    item_id: number;
    item: { id: number; custom_id: string; name: string };
    prod_order_pos_operation_quantities: ProdOrderPosOperationQuantity[];
    batch?: string;
    serials?: string[];
    suspendedSerials?: string[];
    used_serials?: string[];
    proposed_hu_for_quantity: {
        [handling_unit_id: number]: {
            handlingUnit: HandlingUnit;
            stocks: Stock[];
        };
    };
    quantity_input_method: "QUANTITY" | "QUANTITY_WITH_BATCH" | "SERIAL_SINGLE" | "SERIAL_MULTI";
    check_stock: boolean;
};

@Component({
    selector: "app-machine-quantity",
    templateUrl: "./machine-quantity.component.html",
    styleUrl: "./machine-quantity.component.css",
})
export class MachineQuantityComponent implements OnInit, OnDestroy {
    isDialogOpen = true;
    private subscription!: Subscription;
    private clockedInUserSubscription!: Subscription;
    private subscriptionForIOTQuantity!: Subscription;

    loggedInUser: User | undefined;
    clockedInUsers: MachineUserTime[] | undefined;
    selectedClockedInUser: MachineUserTime | undefined;

    @ViewChild("childComponentRef") childComponentRef?: CustomReactGridTable;
    @ViewChild("statusToastTools", { static: false }) statusToastTools!: ToastComponent;
    @ViewChild("consumptionChildComponentRef") consumptionChildComponentRef?: CustomReactGridTable;
    @ViewChild("stagingAreaForUpperTable") stagingAreaForUpperTable?: StagingAreaComponent;
    @ViewChild("stagingAreaForLowerTable") stagingAreaForLowerTable?: StagingAreaComponent;
    @ViewChild("batchesChildComponentRef") batchesChildComponentRef?: CustomReactGridTable;
    @ViewChild("codeScannerDialog", { static: false }) codeScannerDialog: any;
    @ViewChild("handlingUnitChildComponentRef")
    handlingUnitChildComponentRef?: CustomReactGridTable;
    @ViewChild("serialMultiInput") serialMultiInput?: MultiInputComponent;
    @ViewChild("scanMultiInput") scanMultiInput?: MultiInputComponent;

    entitySelectionDialogProps: EntitySelectionDialogComponentProps | null = null;
    localization = Localization;

	MachineCycleType = MachineCycleType;
	allowedEnumForExitType = ["PROD_GOOD", "PROD_GOOD_LEVEL_2", "PROD_REWORK"];
	handlingUnitTypes = ProdOrderPosOperationHandlingUnitTypeClass.getEnumArray().filter(
		(type: any) => this.allowedEnumForExitType.includes(type.value)
	);
	selectedHUType: any = undefined;

    selectedOrderId = parseInt(this.activeRoute.snapshot.params["id"]);
    selectedOrderInDetailsId = parseInt(this.activeRoute.snapshot.params["id"]);
    toggleValue: boolean = false;
    isErrorDialogOpen: boolean = false;
    isUnlinkEntryOpen: boolean = false;
    selectedPSAForUnlink: any = undefined;
    isDialogOpenForScan: boolean = false;
    isClockedDialogOpen: boolean = false;
    isASC: boolean = true;
    errorMessage: string = "";
    inputValue: string = "";
    filterQueryForUpperTable: string = "";
    filterQueryForLowerTable: string = "";
    dialogTitle: string = "";
    tableHeaderEntry: string = $localize`Entry`;
    tableHeaderExit: string = $localize`Exit`;
    selectAllText: string = $localize`Select All`;
    deselectAllText: string = $localize`Deselect All`;
    isEmptySerial: boolean = false;
    disableYesButton: boolean = false;
    isWarningDialogOpenForEntry: boolean = false;
    isInvalidQuantity: boolean = false;
    isSuspendDialogOpen: boolean = false;
    inventoryStatus?: {isPackagingInstruction:string,stock:number, targetQuantity:number};
    constructor(
        private activeRoute: ActivatedRoute,
        private router: Router,
        private commonService: CommonService,
        private plantsService: PlantsService,
        private authService: AuthService,
        private eventEmitter: MachineBoardEventHandleService,
        public _toasterSrv: ToastService,
        private machineboardService: MachineboardService
    ) {
        this.plantsService.plantId.subscribe((plantId: number | undefined) => {
            if (plantId) {
                this.plantId = plantId;
                this.itemUrl = `/Plants(${plantId})/items`;
            }
        });
    }

    ngOnDestroy() {
        this.subscriptionForIOTQuantity?.unsubscribe(); // Prevent memory leaks
    }

    prodOrderPosOperationQuantities: ProdOrderPosOperationQuantity[] = [];
    itemStates: ItemState[] = [];

    batchNumber: string = "";
    searchText: string = "";
    selectedProdOrderCustomId: string = "";
    serialNumbers: string[] = [];
    scannedToken: string[] = [];

    get singleSerialNumber(): string {
        return this.serialNumbers[0] ?? "";
    }

    set singleSerialNumber(value: string) {
        this.serialNumbers = [value];
    }

    availableSerials: string[] = [];

    isBusy = false;
    isLoading = false;
    isBusyQuantity = false;
    isScanFromExit = false;
    machine_id = parseInt(this.activeRoute.parent?.snapshot.params["id"]);
    isEditQuantityRecording: boolean = false;
    isErrorDialog: boolean = false;
    selectedProdOrderPosOperationQuantity: ProdOrderPosOperationQuantity | null = null;
    toasterStatus!: string;
    errorStatus!: string;

    valueState: "None" | "Error" = "None";
    selectedOrder: OrderData | undefined;
    allOrders: OrderData[] = [];
    filteredOrders: OrderData[] = [];
    selectedItemStateType: string = ItemStateType.GOOD;
    selectedItemState?: ItemState;
    selectedQuantity: string | number = "";
    editDialogSelectedItemState?: ItemState;
    editDialogSelectedQuantity: string | number = "";
    confirmationType!: MachineConfirmationType;
    isDeleteDialog!: boolean;
    rowDeleteId!: number;
    editingConsumption: any;
    invalidInput: boolean = false;
    isFinalQuantity: boolean = false;
    editDialogIsFinalQuantity: boolean = false;
    doYouWantToDeleteThisRecord: string = Localization.doYouWantToDeleteThisRecord;
    consumptionData: ConsumptionData[] = [];
    isBusyConsumption: boolean = false;
    isConsumptionDelete: boolean = false;
    itemStateType = ItemStateType;
    loading: boolean = false;
    loadingHandlingUnits = false;
    loadingBatches = false;
    items: Item[] = [];
    skip: number = 0;
    top: number = 200;
    plantId: number = 0;
    itemUrl: string = "/Items?$expand=prodOrderPos($expand=prodOrderPosOperations)";
    closeDialogAfterSave: boolean = false;
    selectedTab: number = 0; // Default selected tab
    handlingUnitsData: ProdOrderPosOperationHandlingUnit[] = [];
    allHandlingUnitData: HandlingUnit[] = [];
    batchData: any[] = [];
    hasProposedConsumptions = false;
    isWarningQuantityOpen = false;
    isUnlinkFromEntry = false;
    quantityType: QuantityType = QuantityType.TYPE_1;
    scanText: string = "";
    scannerControls: IScannerControls | undefined;
	videoInputDevices: MediaDeviceInfo[] = [];
    operationsWithQuantities: ProdOrderPosOperation[] = [];
    quantityWarningOperation: ProdOrderPosOperation | undefined;
    remainingQuantity: number = 0;
    showLoadingPage: boolean = true;
    isValueHelpDialog: boolean = false;
    isIOT: boolean = false;
    private searchSubject = new Subject<string>();

    //For PSA
    handlingUnitsForPSAUpperFilter: number[] = [];
    handlingUnitsForPSALowerFilter: number[] = [];
    batchesForPSAFilter: string[] = [];

    proposedQuantitiesForMachine: {
        type: MachineCycleType;
        sum: number;
        last_id: number;
        prod_order_pos_operation_id: number;
        serial?: string;
    }[] = [];

    get proposedQuantitiesForOperation() {
        return this.proposedQuantitiesForMachine.filter(
            proposal =>
                proposal.prod_order_pos_operation_id ==
                this.selectedOrder?.prod_order_pos_operation_id
        );
    }

    handleTabChange(event: any) {
        if(this.quantityType == QuantityType.TYPE_1){
            this.selectedTab = event.detail.tabIndex;
            if (this.selectedTab == 1) {
                setTimeout(() => {
                    this.getHandlingUnits();
                }, 1);
            }
            if (this.selectedTab == 2) {
                setTimeout(() => {
                    this.getBatches();
                }, 1);
            }
        }
    }

    onSortChange(){
        this.isASC = !this.isASC

        if(this.isASC){
            const serials = this.selectedOrder?.serials?.sort((a, b) => parseInt(a) - parseInt(b)) || [];
            const suspendedSerials = this.selectedOrder?.suspendedSerials?.sort((a, b) => parseInt(a) - parseInt(b)) || [];

            this.availableSerials = [...serials, ...suspendedSerials];
        } else {
            const serials = this.selectedOrder?.serials?.sort((a, b) => parseInt(b) - parseInt(a)) || [];
            const suspendedSerials = this.selectedOrder?.suspendedSerials?.sort((a, b) => parseInt(b) - parseInt(a)) || [];

            this.availableSerials = [...serials, ...suspendedSerials];
        }
    }

    getAvailableItemStateTypes(): { value: ItemStateType; text: string }[] {
        return ItemStateTypeClass.getEnumArray().filter((state: any) => {
            return this.itemStates.some((itemState: ItemState) => {
                return itemState.item_state_type === state.value;
            });
        });
    }

    onItemStateTypeSelected(event: any) {
        const selectedElement = event.detail.selectedItems[0];

        this.selectedItemStateType = selectedElement.getAttribute("value");

        if (this.selectedItemState?.item_state_type !== this.selectedItemStateType) {
            this.selectedItemState = this.itemStates.find(
                state => state.item_state_type === this.selectedItemStateType
            );
            this.updateProposedQuantitiesAndSerials();
        }
    }

    onItemStateSelected(event: any) {
        const itemStateId = event.detail.selectedOption.value;
        this.selectedItemState = this.itemStates.find(state => state.id == itemStateId);
    }

    getItemStatesForSelectedType(): ItemState[] {
        return this.itemStates.filter(
            state => state.item_state_type === this.selectedItemStateType
        );
    }

    updateSelectedSerialsFromMultiComboBox($event: MultiComboBoxSelectionChangeEventDetail) {
        this.serialNumbers = $event.items.map(item => item.text!);
    }

    updateSelectedSerialsFromTokenDeleted($event: MultiInputTokenDeleteEventDetail) {
        this.serialNumbers = this.serialNumbers.filter(serial => {
            return !$event.tokens.some(item => item.text === serial);
        });

        this.onProposeConsumption();
    }

    canProposeQuantityFromHu(): boolean {
        return (
            this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" &&
            this.selectedOrder?.proposed_hu_for_quantity &&
            Object.values(this.selectedOrder?.proposed_hu_for_quantity).length > 0
        );
    }

    proposeQuantityFromHu() {
        this.entitySelectionDialogProps = {
            entity: "HandlingUnits",
            staticData: Object.values(this.selectedOrder?.proposed_hu_for_quantity || []).map(
                (proposal: any) => {
                    return proposal.handlingUnit;
                }
            ),
            title: $localize`Select Handling Unit`,
            searchKey: "custom_id",
            inputReference: this.serialMultiInput?.element,
            entitySelected: (item: HandlingUnit) => {
                this.entitySelectionDialogProps = null;
                if (this.selectedOrder) {
                    this.serialNumbers = this.selectedOrder.proposed_hu_for_quantity[item.id!].stocks
                        .map((stock: Stock) => stock.serial)
                        .filter((serial): serial is string => serial != null);

                    this.serialNumbers = this.serialNumbers?.filter(
                        serial => !this.selectedOrder?.used_serials?.includes(serial)
                    )
                }

                //TODO: Add check if serial was already used

                this.onProposeConsumption();

                // add the selected serials to the available serials so they are displayed in the multi-combobox
                if (this.availableSerials.length) {
                    this.availableSerials = [...this.availableSerials, ...this.serialNumbers];
                }
            },
        };
    }

    reusedSerialsToWarnAbout() {
        if (!this.selectedOrder?.check_stock) {
            return [];
        }

        return this.serialNumbers.filter(serial => {
            return this.selectedOrder?.used_serials?.includes(serial) ?? false;
        });
    }

    remainingSerialsToPropose() {
        this.availableSerials = this.availableSerials.filter((serial:string) => serial != this.selectAllText || serial != this.deselectAllText)

        return this.availableSerials.filter(serial => {
            return !this.serialNumbers.includes(serial);
        });
    }

    updateSelectedSerialsFromMultiInput() {
        const serial = this.serialMultiInput?.value;
        if (serial) {
            if (this.selectedOrder?.quantity_input_method == "SERIAL_SINGLE") {
                this.serialNumbers = [serial];
            } else {
                this.serialNumbers.push(serial);
            }
            this.onProposeConsumption();
            this.serialMultiInput!.value = "";

            if (
                this.selectedOrder?.quantity_input_method == "SERIAL_MULTI" &&
                this.remainingSerialsToPropose().length
            ) {
                // execute with delay, otherwise this has no effect
                setTimeout(() => {
                    this.serialMultiInput!.open = true;
                }, 0);
            }
        }
    }

    onSerialMultiInputFocus() {
        this.serialMultiInput!.open = true;
    }

    closeDialog() {
        this.ngOnDestroy();
        this.isDialogOpen = false;
        this.router.navigate(["../../"], {relativeTo: this.activeRoute});
    }

    onSelectAll(){
        this.availableSerials = this.availableSerials.filter((serial:string) => serial != this.selectAllText || serial != this.deselectAllText)
        this.serialNumbers = this.availableSerials;

        this.onProposeConsumption();
    }

    onDeselectAll(){
        this.serialNumbers = [];

        this.onProposeConsumption();

        // execute with delay, otherwise this has no effect
        setTimeout(() => {
            this.serialMultiInput!.open = true;
        }, 0);
    }

    closeLoadingDialog() {
        this.ngOnDestroy();
        this.router.navigate(["../../"], {relativeTo: this.activeRoute});
    }

    ngOnInit(): void {
        this.getQuantityData(true);
        this.getUserId();
        this.onProposeConsumptionAPICall();
        if(this.selectedOrder?.item?.id) this.getMaximum(this.selectedOrderId,this.selectedOrder.item.id);
        if(this.machine_id){
            this.generateFilterQuery();
        }

        this.subscriptionForIOTQuantity = interval(30000)
            .pipe(switchMap(() => defer(() => {
                if(this.isIOT){
                    this.getQuantityData(false, false);
                }
                return [];
            })))
            .subscribe();

        this.clockedInUsers = this.machineboardService.clockedInUser || [];

        if(this.clockedInUsers.length == 1) this.selectedClockedInUser = this.clockedInUsers[0];
    }

    validateInput() {
        if (
            (this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" ||
                this.selectedOrder?.quantity_input_method === "SERIAL_SINGLE") &&
            this.serialNumbers.length == 0
        ) {
            this.invalidInput = true;
        } else if (
            this.selectedOrder?.quantity_input_method === "QUANTITY_WITH_BATCH" &&
            !this.batchNumber
        ) {
            this.invalidInput = true;
        } else {
            this.invalidInput = false;
        }
        return this.invalidInput;
    }

    getUserId() {
        this.loggedInUser = this.authService.getUser();
    }

    changeOrder(operationId: any) {
        if (operationId == this.selectedOrder?.prod_order_pos_operation_id) {
            return;
        }

        this.selectedQuantity = 0;

        this.selectedOrderId = operationId;
        this.selectedOrder = this.allOrders.find(
            (order: OrderData) => order.prod_order_pos_operation_id == operationId
        )!;
        this.hasProposedConsumptions = false;
        this.router.navigate([`../${operationId}`], {
            relativeTo: this.activeRoute,
            replaceUrl: true,
        });

        this.serialNumbers = [];
        this.generateFilterQuery();

        this.getQuantityData();
        this.consumptionData = [];
        this.getHandlingUnits();
        this.getBatches();
        this.getMaximum(operationId,this.selectedOrder.item.id);
    }

    getMaximum(operationId:number,itemId:number){
        this.inventoryStatus;
         this.commonService.get(`quantity/maximum-quantity/${operationId}/${itemId}`, false)
         .subscribe({
            next:(response:any)=>{
               this.inventoryStatus = response;
            },
            error:(e:any)=>{
                this.inventoryStatus = undefined;
            }
         })
    }

    /**
     * This function is responsible for updating the Quantity Recording history Table.
     *
     * Functionality:
     * - Updates the Quantity Recording history Table based on the latest data.
     *
     * @returns {void}
     */
    getQuantityData_v2(prod_order_pos_operation_id: number) {
        this.isBusyQuantity = true;
        setTimeout(() => {
            this.childComponentRef?.render();
        }, 1);

        const urlString =
            `ProdOrderPosOperationQuantities?` +
            `$filter=prod_order_pos_operation_id eq ${prod_order_pos_operation_id} and machine_id eq ${this.machine_id}` +
            `&$expand=itemState,user,prodOrderPosOperation($expand=prodOrderPos($expand=item)),canceledBy,cancellationFor` +
            `&$orderby=confirmed_datetime desc`;
        this.commonService.get(urlString).subscribe({
            next: (response: any) => {
                this.isBusyQuantity = false;
                this.prodOrderPosOperationQuantities = response.value.map((quantity: any) => {
                    return new ProdOrderPosOperationQuantity().deserialize(quantity);
                });
            },
            error: e => {
            },
        });
    }

    getQuantityData(isOnInit = false, needToShowLoading = true) {

        if(needToShowLoading) this.isBusy = true;

        const urlString = `quantity/${this.machine_id}`;
        this.commonService.get(urlString, false).subscribe({
            next: (response: any) => {
                this.isBusy = false;
                this.proposedQuantitiesForMachine = response.proposed_quantities ?? [];
                this.allOrders = response.production_orders;
                this.filteredOrders = response.production_orders;

                const order = response.production_orders.find(
                    (order: OrderData) => order.prod_order_pos_operation_id == this.selectedOrderId
                );

                if (!order) {
                    this._toasterSrv.showToast(
                        $localize`Operation not in Production yet!`,
                        "success"
                    );
                    this.closeDialog();

                    return;
                }

                this.quantityType = order.prod_order_pos_operation.machine.quantity_type;
                this.isIOT = order?.prod_order_pos_operation?.machine?.confirmation_type === MachineConfirmationType.PROPOSE_IIOT;

                if (this.allOrders.length == 1) {
                    this.selectedOrder = order;
                    this.selectedProdOrderCustomId = this.quantityType == QuantityType.TYPE_1 ? order.order_custom_id + ' - ' + order.prod_order_pos_operation_pos : order.order_custom_id + ' - ' + order?.item?.custom_id;
                }

                if (!isOnInit && this.selectedOrder) this.selectedOrder = order;

                if(needToShowLoading) this.hasProposedConsumptions = false;

                if(this.selectedOrder?.prod_order_pos_id){
                    this.getAllProdOrdersWithQuantity(this.selectedOrder?.prod_order_pos_id);
                }

                this.showLoadingPage = false;

                if (this.selectedOrder) {
                    this.prodOrderPosOperationQuantities =
                    this.selectedOrder?.prod_order_pos_operation_quantities?.map((quantity: any) => {
                        return new ProdOrderPosOperationQuantity().deserialize(quantity);
                    });
                }

                const operationLocalize = $localize`Operation`,
                itemLocalize = $localize`Item`,
                addQuantityLocalize = $localize`Add Quantity`
                this.dialogTitle = this.selectedOrder?.order_custom_id ? `${addQuantityLocalize} (${operationLocalize} ${this.selectedOrder?.order_custom_id || ''} - ${this.selectedOrder?.prod_order_pos_operation_pos || ''}, ${itemLocalize} ${this.selectedOrder?.item?.custom_id || ''} - ${this.selectedOrder?.item?.name || ''})` : addQuantityLocalize;

                this.itemStates = response.item_state;
                this.confirmationType = response.confirmation_type;
                this.batchNumber = this.selectedOrder?.batch ?? "";

                if(this.isASC){
                    const serials = this.selectedOrder?.serials?.sort((a, b) => parseInt(a) - parseInt(b)) || [];
                    const suspendedSerials = this.selectedOrder?.suspendedSerials?.sort((a, b) => parseInt(a) - parseInt(b)) || [];

                    this.availableSerials = [...serials, ...suspendedSerials];
                } else {
                    const serials = this.selectedOrder?.serials?.sort((a, b) => parseInt(b) - parseInt(a)) || [];
                    const suspendedSerials = this.selectedOrder?.suspendedSerials?.sort((a, b) => parseInt(b) - parseInt(a)) || [];

                    this.availableSerials = [...serials, ...suspendedSerials];
                }

                this.selectedItemState ??= this.itemStates.find(
                    state => state.item_state_type === ItemStateType.GOOD
                );

                if(this.selectedOrder?.prod_order_pos_id){
                    this.updateProposedQuantitiesAndSerials();
                }
            },
            error: e => {
                this._toasterSrv.showToast(
                    $localize`Failed to fetch quantity data`,
                    "error"
                )
                this.closeLoadingDialog()
            },
        });
    }

    getAllProdOrdersWithQuantity(prodOrderPosId: number){
        this.commonService.get(`ProdOrderPosOperations?$filter=prod_order_pos_id eq ${prodOrderPosId}&$expand=prodOrderPosOperationQuantities($select=id,confirmed_datetime,item_state_id,quantity;$expand=itemState),operationControlProfile&$select=id,machine_id,name,operation_control_profile_id,pos,prod_order_pos_id,quantity,status,status_erp,status_plan,te,tr,unit_of_measure_id`).subscribe({
            next: (res: any) => {
                this.operationsWithQuantities = res?.value?.sort((a:ProdOrderPosOperation, b:ProdOrderPosOperation) => {
                    const posA = a?.pos?.padStart(10, "0") || '';
                    const posB = b?.pos?.padStart(10, "0") || '';
                    return posA.localeCompare(posB);
                  });

                this.getRemainingQuantity();
            },
            error: (error: any) => {
                this.loadingBatches = false;
                console.error("Error fetching Batches:", error);
            },
        });
    }

    getRemainingQuantity(){
        this.commonService.get(`machine-board/${this.machine_id}/${this.selectedOrder?.prod_order_pos_operation_id}/remaining-quantity`, false).subscribe({
            next: (res: any) => {
                const data = res.data;
                this.remainingQuantity = (data.quantityPerHU ?? 0) - (data.quantityInHU ?? 0);
            },
            error: (error: any) => {
                this.remainingQuantity = 0;
            },
        });
    }

    consumptionDeleteClick(value: any, index: number) {
        this.isConsumptionDelete = true;
        this.editingConsumption = value;
        this.isDeleteDialog = true;
    }

    getBatches() {
        this.loadingBatches = true;

        const url = "/ProdOrderPosOperationBatches";
        this.commonService.get(url).subscribe({
            next: (res: any) => {
                this.loadingBatches = false;
                this.batchData = res.value;
                this.batchesChildComponentRef?.render();
            },
            error: (error: any) => {
                this.loadingBatches = false;
                console.error("Error fetching Batches:", error);
            },
        });
    }

    getHandlingUnits() {
        this.loadingHandlingUnits = true;

        const filterQuery = `&$filter=machine_id eq ${this.machine_id} and prod_order_pos_operation_id eq ${this.selectedOrder?.prod_order_pos_operation_id} and type eq '${ProdOrderPosOperationHandlingUnitType.CONSUMPTION}'`;
        const apiUrl = `ProdOrderPosOperationHandlingUnits?$expand=handlingUnit${filterQuery}`;
        const handlingUnitUrl = "/HandlingUnits";
        let requests: ODataBatchCall[] = [];
        requests.push(
            new ODataBatchCall(0, "get", `\/odata\/${apiUrl}`),
            new ODataBatchCall(1, "get", `\/odata\/${handlingUnitUrl}?$top=${this.top}`)
        );

        this.commonService.post("$batch", {requests}).subscribe({
            next: (response: any) => {
                this.loadingHandlingUnits = false;

                if (response.responses[0]?.body?.value) {
                    this.handlingUnitsData = response.responses[0]?.body?.value?.map(
                        (handlingUnit: any) => {
                            return new ProdOrderPosOperationHandlingUnit().deserialize(
                                handlingUnit
                            );
                        }
                    );

                    // Render only once after data assignment
                    this.handlingUnitChildComponentRef?.render();
                }

                response.responses[1]?.body?.value?.map((handlingUnit: HandlingUnit) => {
                    const deserializedHandlingUnit = new HandlingUnit().deserialize(handlingUnit);
                    this.allHandlingUnitData.push(deserializedHandlingUnit);
                });
                this.handlingUnitChildComponentRef?.render();
                this.skip += this.top;
            },
        });
    }

    deleteBatchClick(event: any) {
        const deleteBatchId = event?.id;
        this.batchData = this.batchData.filter((data: any) => {
            return data != event;
        });
        if (deleteBatchId) {
            this.commonService.delete(`/ProdOrderPosOperationBatches(${deleteBatchId})`).subscribe({
                next: () => {
                    this.toasterStatus = $localize`Batch Deleted Successfully`;
                    this.statusToastTools.open = true;
                },
            });
        }
        this.batchesChildComponentRef?.render();
    }

    deleteHUClick(hu: ProdOrderPosOperationHandlingUnit) {
        this.handlingUnitsData = this.handlingUnitsData.filter((data: any) => {
            return data != hu;
        });

        this.commonService.delete(`/ProdOrderPosOperationHandlingUnits(${hu.id})`).subscribe({
            next: () => {
                this.toasterStatus = $localize`Successfully Deleted Handling Unit`;
                this.statusToastTools.open = true;
            },
        });
        this.handlingUnitChildComponentRef?.render();
    }

    printLabelHUClick(hu: ProdOrderPosOperationHandlingUnit) {
        this.commonService.get(`warehouse/${this.selectedOrder?.prod_order_pos_operation_id}/${hu.id}/print`, false).subscribe({
            next: () => {
                this.toasterStatus = $localize`Successfully Printed Label`;
                this.statusToastTools.open = true;
            },
            error: () => {
                this.toasterStatus = $localize`Something Went Wrong`;
                this.statusToastTools.open = true;
            },
        });
    }

    saveHU(prodOrderPosOperationHandlingUnit: ProdOrderPosOperationHandlingUnit) {
        this.handlingUnitChildComponentRef!.isBusy = true;
        const dataToSend: any = {
            prod_order_pos_operation_id: this.selectedOrder?.prod_order_pos_operation_id,
            handling_unit_id: prodOrderPosOperationHandlingUnit.handlingUnit?.id,
            machine_id: this.machine_id,
            type: ProdOrderPosOperationHandlingUnitType.CONSUMPTION,
        };
        this.commonService.post("ProdOrderPosOperationHandlingUnits", dataToSend).subscribe({
            next: async (response: any) => {
                prodOrderPosOperationHandlingUnit.id = response.id;
                this.handlingUnitChildComponentRef!.isBusy = false;
                setTimeout(() => {
                    this.handlingUnitChildComponentRef?.render();
                }, 1);
            },
            error: (err: any) => {
                this.handlingUnitChildComponentRef!.isBusy = false;
            },
        });
    }

    onAddHU() {
        // this.isAddHU = true;
        // Add a new row with default values
        const newHU = new ProdOrderPosOperationHandlingUnit();

        // Push the new row to the handlingUnitsData array
        this.handlingUnitsData.push(newHU);

        // Render the grid table to show the new row
        this.handlingUnitChildComponentRef?.render();
    }

    onAddRow() {
        // Create a new row object with default values and mark it as new
        const newRow = {
            item: null,
            item_id: null,
            quantity: 1,
        };
        // Add the new row to your consumptionData array
        this.consumptionData.push(newRow);
        // Refresh the table to display the new row
        this.consumptionChildComponentRef?.render();
    }

    onAddBatchRow() {
        const newBatch = {
            batch: null,
            isNew: true, // Flag indicating a new row
        };

        this.batchData.push(newBatch);

        // Render the grid table to show the new row
        this.batchesChildComponentRef?.render();
    }
    onProposeConsumption(){
        this.isBusyConsumption = true;
        const quantity:any =
            this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" ||
            this.selectedOrder?.quantity_input_method === "SERIAL_SINGLE"
                ? this.serialNumbers.length
                : this.selectedQuantity;

        if (!quantity) {
            this.isBusyConsumption = false;
            return;
        }

        this.searchSubject.next(quantity)
    }

    onProposeConsumptionAPICall() {
            this.searchSubject.pipe(
                        debounceTime(800),
                        switchMap(quantity => {
                            this.skip = 0;
                            return this.commonService
                            .post(
                                `quantity/propose_consumptions/${this.machine_id}/${this.selectedOrder?.prod_order_pos_operation_id}`,
                                {
                                    quantity: quantity,
                                },
                                false
                            );
                        })
                    ).subscribe({
                        next: (consumptions: any) => {
                            this.consumptionData = consumptions.map((element: any) => {
                                return {
                                    ...element,
                                    quantity: parseFloat(parseFloat(element.quantity).toFixed(3)),
                                    batch: element.batch || "",
                                };
                            });

                            this.checkSerialFieldValidation();
                            this.checkQuantityFieldValidation();

                            this.hasProposedConsumptions = true;
                            this.isBusyConsumption = false;
                        },
                        error: (err) => {
                            this.loading = false;
                            this.onProposeConsumptionAPICall();
                        },
                        complete: ()=> {
                            this.loading = false;
                        }
                    });
    }

    validateStorageHierarchy(consumption: any, overwrite: "HandlingUnit" | "StorageLocation") {
        if (!consumption.handling_unit_id || !consumption.storage_location_id) {
            return;
        }

        this.commonService
            .get(`stock/get-handling-unit-hierarchy/${consumption.handling_unit_id}`, false)
            .subscribe((data: any) => {
                for (const parent of data) {
                    const stock = new Stock().deserialize(parent);
                    if (
                        stock.positionable_type == BackendModelType.STORAGE_LOCATION &&
                        stock.positionable_id != consumption.storage_location_id
                    ) {
                        switch (overwrite) {
                            case "HandlingUnit":
                                consumption.handling_unit_id = null;
                                consumption.handling_unit_id_custom = null;
                                break;
                            case "StorageLocation":
                                consumption.storage_location_id = stock.positionable_id;
                                consumption.storage_location_id_custom =
                                    stock.positionable.custom_id;
                                break;
                        }
                        this.consumptionChildComponentRef?.render();
                    }
                }
            });
    }

    validateAmount(amount: any): boolean {
        if (amount == "" || amount == null) {
            return false;
        }

        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount < 1 || !Number.isInteger(numAmount)) {
            return false;
        } else {
            return true;
        }
    }

    validateEditInputs(): boolean {
        if (this.isEditQuantityRecording) {
            if (Number(this.editDialogSelectedQuantity) > 0) {
                return true;
            } else {
                this.errorStatus = $localize`Edited quantity must be a number and has to be positive`;
                this.valueState = "Error";
                return false;
            }
        }
        this.valueState = "None";
        return true;
    }

    validateAllInputs(): boolean {
        if (!this.hasProposedConsumptions || this.isBusyConsumption) {
            return false;
        }

        if (
			!this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_QUANTITY_SAVE) &&
			!this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_QUANTITY_SAVE_IF_QUALIFIED)
		) {
			return false;
		}

        if (
            this.selectedOrder?.quantity_input_method === "QUANTITY" ||
            this.selectedOrder?.quantity_input_method === "QUANTITY_WITH_BATCH"
        ) {
            return this.validateAmount(this.selectedQuantity);
        } else {
            return this.serialNumbers.length != 0;
        }
    }

    enableProposeAssemblyButton(): boolean {
        if (this.selectedOrder?.quantity_input_method === "SERIAL_MULTI") {
            return this.serialNumbers.length > 0;
        } else {
            return false;
        }
    }

    getItemStateForCycleType(type: MachineCycleType): ItemState | undefined {
        switch (type) {
            case MachineCycleType.OK:
                return this.itemStates.find(state => state.item_state_type === ItemStateType.GOOD);
            case MachineCycleType.NOT_OK:
                return this.itemStates.find(state => state.item_state_type === ItemStateType.SCRAP);
        }
    }

    closeDeleteDialog() {
        this.isDeleteDialog = false;
    }

    deleteRecord() {
        if (!this.isConsumptionDelete) {
            this.childComponentRef!.isBusy = true;
            const urlString = `quantity/${this.rowDeleteId}`;

            this.commonService.delete(urlString, false).subscribe({
                next: () => {
                    setTimeout(() => {
                        if(this.childComponentRef){
                            this.childComponentRef.isBusy = false;
                            this.childComponentRef.render();
                        }
                    }, 1);
                    // this.getQuantityData();

                    if (this.selectedOrder) this.getQuantityData_v2(this.selectedOrder.prod_order_pos_operation_id);

                    this.isDeleteDialog = false;
                    this.toasterStatus = $localize`Successfully Deleted`;
                    this.statusToastTools.open = true;

                    this.eventEmitter.machineKPI1ChangeEvent();
                    this.eventEmitter.machineKPI2ChangeEvent();
                    this.eventEmitter.quantityChartChangeEvent();
                    this.eventEmitter.prodOrderPosOperationChangeEvent();
                },
                error: e => {
                    this.errorStatus = $localize`Something Went Wrong`;
                    this.isErrorDialog = true;
                    setTimeout(() => {
                        if(this.childComponentRef){
                            this.childComponentRef.isBusy = false;
                            this.childComponentRef.render();
                        }
                    }, 1);
                },
            });
        } else {
            this.consumptionData = this.consumptionData.filter((data: any) => {
                return data != this.editingConsumption;
            });
            this.isDeleteDialog = false;
            this.isConsumptionDelete = false;
        }
    }

    deleteClick(value: any) {
        this.isDeleteDialog = true;
        this.rowDeleteId = value.id;
    }

    handleEditClick(value: object) {
        this.editClick(value);
        this.childComponentRef?.render();
    }

    handleDeleteClick(value: object) {
        this.deleteClick(value);
        this.childComponentRef?.render();
    }

    editClick(event: any) {
        this.isEditQuantityRecording = true;
        this.selectedProdOrderPosOperationQuantity = event;
        this.editDialogSelectedQuantity =
            this.selectedProdOrderPosOperationQuantity?.quantity ?? "";
        this.editDialogSelectedItemState = this.selectedProdOrderPosOperationQuantity?.itemState;
        this.editDialogIsFinalQuantity =
            this.selectedProdOrderPosOperationQuantity?.is_final_quantity ?? false;
    }

    saveEdit() {
        this.selectedItemState = this.editDialogSelectedItemState;
        this.selectedItemStateType = this.selectedItemState?.item_state_type ?? ItemStateType.GOOD;
        this.isFinalQuantity = this.editDialogIsFinalQuantity;
        this.selectedQuantity = this.editDialogSelectedQuantity;
        this.batchNumber = this.selectedProdOrderPosOperationQuantity?.batch ?? "";
        if (this.validateEditInputs()) {
            this.commonService
                .delete(`quantity/${this.selectedProdOrderPosOperationQuantity?.id}`, false)
                .subscribe({
                    next: (response: any) => {
                        setTimeout(() => {
                            this.childComponentRef?.render();
                        }, 1);
                        if (this.selectedOrder) this.getQuantityData_v2(this.selectedOrder.prod_order_pos_operation_id);
                        this.isEditQuantityRecording = false;
                        this.selectedProdOrderPosOperationQuantity = null;
                        this.eventEmitter.machineKPI1ChangeEvent();
                        this.eventEmitter.machineKPI2ChangeEvent();
                        this.eventEmitter.quantityChartChangeEvent();
                        this.eventEmitter.prodOrderPosOperationChangeEvent();
                    },
                    error: (error: any) => {
                        this.errorStatus = $localize`Something Went Wrong`;
                        this.isErrorDialog = true;
                        console.error("API Error:", error);
                        // Handle any errors from the API call
                    },
                });
        } else {
            this.isErrorDialog = true;
        }
    }

    closeEditDialog() {
        this.isEditQuantityRecording = false;
    }

    closeErrorDialog() {
        this.isErrorDialog = false;
        this.isEditQuantityRecording = false;
        this.isDeleteDialog = false;
    }

    checkForQuantityWaring(){
        this.quantityWarningOperation = undefined;

        let currentOperationQuantitySum = parseInt(this.selectedQuantity as any);
        const currentOperationIndex = this.operationsWithQuantities.findIndex((operation:any)=> operation.id == this.selectedOrder?.prod_order_pos_operation_id);
        const currentOperation = this.operationsWithQuantities.find((operation:any)=> operation.id == this.selectedOrder?.prod_order_pos_operation_id) as any;

        if(currentOperation?.prodOrderPosOperationQuantities?.length){
            currentOperation?.prodOrderPosOperationQuantities?.forEach((operation:any)=>{
                currentOperationQuantitySum += parseInt(operation?.quantity) || 0;
            })
        }

        if(currentOperation?.operationControlProfile?.confirmation_type == OperationControlProfileConfirmationType.REQUIRED){
            this.operationsWithQuantities.forEach((operation:any, index: number)=>{
              if((operation?.operationControlProfile?.confirmation_type == OperationControlProfileConfirmationType.MILESTONE
                || operation?.operationControlProfile?.confirmation_type == OperationControlProfileConfirmationType.REQUIRED)
                && currentOperationIndex > index) {

                let lastMileStoneOrRequiredOperationQuantity = 0;

                operation?.prodOrderPosOperationQuantities?.forEach((operationQuantity:any)=>{
                    lastMileStoneOrRequiredOperationQuantity += parseInt(operationQuantity?.quantity) || 0;
                })

                if(lastMileStoneOrRequiredOperationQuantity < currentOperationQuantitySum){
                    this.quantityWarningOperation = operation;
                }
              }
            });
        } else if(currentOperation?.operationControlProfile?.confirmation_type == OperationControlProfileConfirmationType.MILESTONE){

            this.operationsWithQuantities.forEach((operation:any, index: number)=>{
                if((operation?.operationControlProfile?.confirmation_type == OperationControlProfileConfirmationType.MILESTONE)
                    && currentOperationIndex > index){

                    let lastMileStoneOperationQuantity = 0;

                    operation?.prodOrderPosOperationQuantities?.forEach((operationQuantity:any)=>{
                        lastMileStoneOperationQuantity += parseInt(operationQuantity?.quantity) || 0;
                    })

                    if(lastMileStoneOperationQuantity < currentOperationQuantitySum){
                        this.quantityWarningOperation = operation;
                    }
                }
            });
        }

        return !!this.quantityWarningOperation;
    }

    onSaveQuantity(isSaveAndClose: boolean = false, fromWarningModal = false){
        this.closeDialogAfterSave = isSaveAndClose;


        if(this.clockedInUsers?.length && !this.selectedClockedInUser){
           this.isClockedDialogOpen = true;
           return;
        }

        const selectedQuantity =  Number(this.selectedQuantity) ?? 0;
        const maxQuantity  = ((this.inventoryStatus?.targetQuantity ?? 0) - ((this.inventoryStatus?.stock ?? 0) + selectedQuantity)) < 0
        if((!fromWarningModal && this.inventoryStatus?.isPackagingInstruction &&  maxQuantity)){
            const dialog = document.getElementById('maximum-wanting-modal') as Dialog;
            dialog.open = true;
        }else{
            if (
                this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" ||
                this.selectedOrder?.quantity_input_method === "SERIAL_SINGLE"
            ) {
                isSaveAndClose == true ? this.onSaveAndClose() : this.onSave();
            } else {
                if(this.checkForQuantityWaring()){
                   this.isWarningQuantityOpen = true
                }else {
                    isSaveAndClose == true ? this.onSaveAndClose() : this.onSave();
                }
            }
            this.maximumQuantityClosed();
        }
    }

    onSaveAndClose() {
        this.closeDialogAfterSave = true;
        this.onSave();
    }

    closeQuantityWaringDialog(){
        this.isWarningQuantityOpen = false;
    }

    onSave() {
        this.isWarningQuantityOpen = false;
        this.isLoading = true;
        if (this.validateAllInputs()) {
            let cachedQuantity = '0';

            if (
                (this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" ||
                this.selectedOrder?.quantity_input_method === "SERIAL_SINGLE") && this.selectedItemStateType === ItemStateType.GOOD
            ) {
                cachedQuantity = this.serialNumbers?.length?.toString() || '0';
            } else if(this.selectedItemStateType === ItemStateType.GOOD){
                cachedQuantity = structuredClone(this.selectedQuantity.toString())
            }

            // Prepare data to be sent to the API
            const dataToSend = this.buildDataToSend();

            // Send the data to your API endpoint
            this.commonService.post(`quantity/${this.machine_id}/insert-quantity`, dataToSend, false).subscribe({
                next: (response: any) => {
                    this.isLoading = false;
                    if(this.selectedOrder?.prod_order_pos_operation?.machine?.auto_close_operation){
                        this.checkAndCloseOperation(cachedQuantity);
                    } else {
                        if (this.selectedOrder) this.getQuantityData_v2(this.selectedOrder.prod_order_pos_operation_id);
                    }

                    if (
                        this.selectedOrder?.quantity_input_method === "SERIAL_MULTI" ||
                        this.selectedOrder?.quantity_input_method === "SERIAL_SINGLE"
                    ) {
                        this.availableSerials = this.availableSerials.filter(
                            serial => !this.serialNumbers.includes(serial)
                        );

                        this.selectedOrder.suspendedSerials = this.selectedOrder?.suspendedSerials?.filter(
                            serial => !this.serialNumbers.includes(serial)
                        );

                        this.selectedOrder.serials = this.selectedOrder?.serials?.filter(
                            serial => !this.serialNumbers.includes(serial)
                        );

                        if(this.selectedOrder.used_serials) this.selectedOrder.used_serials = [...this.selectedOrder.used_serials , ...this.serialNumbers];
                    }

                    this.selectedQuantity = "";
                    let remainingSerialsToPropose = this.remainingSerialsToPropose();
                    this.serialNumbers =
						remainingSerialsToPropose.length > 0
							? [this.remainingSerialsToPropose()[0]]
							: [];

                    this.serialNumbers = this.serialNumbers?.filter(
                        serial => !this.selectedOrder?.used_serials?.includes(serial)
                    )

                    this.isFinalQuantity = false;
                    this.toasterStatus = $localize`Successfully Saved`;
                    this.statusToastTools.open = true;
                    this.onProposeConsumption();
                    this.eventEmitter.machineKPI1ChangeEvent();
                    this.eventEmitter.machineKPI2ChangeEvent();
                    this.eventEmitter.quantityChartChangeEvent();
                    this.eventEmitter.prodOrderPosOperationChangeEvent();

                    this.generateFilterQuery();

                    if (this.selectedOrder) this.getAllProdOrdersWithQuantity(this.selectedOrder?.prod_order_pos_id);

                    // Close the dialog if the flag is set
                    if (this.closeDialogAfterSave) {
                        this.isDialogOpen = false;
                        this.closeDialogAfterSave = false; // Reset the flag

                        this._toasterSrv.showToast($localize`Successfully Saved`, "success");
                    }
                    this.isEmptySerial = false;
                    this.isInvalidQuantity = false;
                },
                error: (httpError: HttpErrorResponse) => {
                    this.errorStatus = $localize`Something Went Wrong`;
                    
                    this.isLoading = false;
                    this.isEmptySerial = false;
                    this.isInvalidQuantity = false;

                    if(httpError?.error?.message){
                        const throwableError = JSON.parse(httpError.error.message || '');

                        switch (throwableError?.type) {
                            case QuantityErrorType.DUPLICATE_SERIAL:
                                this.errorStatus = $localize`Duplicate Serial numbers: ${throwableError?.values?.toString()}`;
                                break;

                            case QuantityErrorType.SERIAL_REQUIRED_FOR_FINAL_ITEM:
                                this.errorStatus = $localize`Serial required for final item: ${throwableError?.values?.toString()}`;
                                break;
                            
                            case QuantityErrorType.BATCH_REQUIRED_FOR_FINAL_ITEM:
                                this.errorStatus = $localize`Batch required for final item: ${throwableError?.values?.toString()}`;
                                break;

                            case QuantityErrorType.SERIAL_REQUIRED_FOR_COMPONENT:
                                this.errorStatus = $localize`Serial required for component: ${throwableError?.values?.toString()}`;
                                break;

                            case QuantityErrorType.BATCH_REQUIRED_FOR_COMPONENT:
                                this.errorStatus = $localize`Batch required for component ${throwableError?.values?.toString()} with quantity ${throwableError?.quantity}`;
                                break;
                            
                            case QuantityErrorType.PACKAGING_INSTRUCTION_FOR_HU:
                                this.errorStatus = $localize`Packaging instruction necessary for Handling Unit`;
                                break;
                            
                            case QuantityErrorType.QUANTITY_IN_HU_EXCEEDS_FOR_PI:
                                this.errorStatus = $localize`Quantity in HU exceeds Quantity to be packed according to Packaging Instruction`;
                                break;
                        
                            default:
                                this.errorStatus = $localize`Something Went Wrong`;
                                break;
                        }
                    }
                    this.isErrorDialog = true;
                }
            });
        } else {
            this.isErrorDialog = true;
            this.isLoading = false;
        }
    }

    checkAndCloseOperation(quantity: string){
        let totalQuantity = parseInt(quantity);
        const currentOperation = this.operationsWithQuantities.find((operation:any)=> operation.id == this.selectedOrder?.prod_order_pos_operation_id) as any;

        currentOperation?.prodOrderPosOperationQuantities?.forEach((OPQuantity: any) =>{
            if(OPQuantity?.itemState?.item_state_type == ItemStateType.GOOD){
                totalQuantity += OPQuantity.quantity
            }
        });

        if((this.selectedOrder?.prod_order_pos_operation?.quantity || 0) <= totalQuantity){
            this.commonService.patch(`machine-board/close-operation/${currentOperation?.id}`, {}, false).subscribe({
                next: (response: any) => {
                    this.getQuantityData(true);
                },
                error: e => {
                    console.log(e);
                },
            });
        } else {
            if (this.selectedOrder) this.getQuantityData_v2(this.selectedOrder.prod_order_pos_operation_id);
        }
    }

    // Helper function to build the data for the API
    buildDataToSend(): { quantity: Object; consumptions: any[]; last_proposed_id?: number } {
        const quantityData = {
            prod_order_pos_operation_id: this.selectedOrder?.prod_order_pos_operation_id,
            item_state_id: this.selectedItemState?.id,
            quantity: (this.selectedOrder?.quantity_input_method == "SERIAL_SINGLE" || this.selectedOrder?.quantity_input_method == "SERIAL_MULTI") ? this.serialNumbers.length : Number(this.selectedQuantity),
            batch: this.batchNumber,
            serials: (this.selectedOrder?.quantity_input_method == "SERIAL_SINGLE" || this.selectedOrder?.quantity_input_method == "SERIAL_MULTI") ? this.serialNumbers : [],
            is_final_quantity: this.isFinalQuantity,
            clocked_in_user: this.selectedClockedInUser?.user_id
        };

        this.selectedQuantity = "";

        const lastProposedId = this.lastProposedId();
        return {
            quantity: quantityData,
            consumptions: this.consumptionData,
            last_proposed_id: lastProposedId > 0 ? lastProposedId : undefined,
        };
    }

    resetProposedQuantities() {
        const payload = {
            operation_id: this.selectedOrder?.prod_order_pos_operation_id,
            last_proposed_id: this.lastProposedId(),
        };

        this.commonService
            .post(`quantity/reset_machine_cycles/${this.machine_id}`, payload, false)
            .subscribe({
                next: (response: any) => {
                    this.selectedQuantity = "";
                    this.serialNumbers = [];
                    this.proposedQuantitiesForMachine = this.proposedQuantitiesForMachine.filter(
                        proposal =>
                            proposal.prod_order_pos_operation_id !=
                            this.selectedOrder?.prod_order_pos_operation_id
                    );
                },
            });
    }

    batchChange(event: any, rowIndex: any) {
        const name = event.target.value;
        if (name != null) {
            this.batchData[rowIndex].batch = name;
        }
        this.batchesChildComponentRef?.render();
    }

    noteChange(event: any, rowIndex: any) {
        const note = event.target.value;
        if (note != null) {
            this.consumptionData[rowIndex].note = note;
        }
    }

    onSerialChange(event: any, rowData: any) {
        rowData.serial = event.target.value;
        this.checkSerialFieldValidation();
    }

    private checkSerialFieldValidation() {
        const consumptionsWithEmptySerial = this.consumptionData.filter(el=> el.item_is_serial_managed && (!el.serial || el.serial === ''));
        this.isEmptySerial = consumptionsWithEmptySerial.length ? true : false;
    }

    onQuantityChange(event: any, rowData: any) {
        rowData.quantity = +event.target.value;
        this.checkQuantityFieldValidation();
    }

    private checkQuantityFieldValidation() {
        const consumptionsWithInvalidQuantity = this.consumptionData.filter(el=> !el.quantity || el.quantity <= 0);
        this.isInvalidQuantity = consumptionsWithInvalidQuantity.length ? true : false;
    }

    isSaveBatchDisabled(): boolean {
        const newBatches = this.batchData.filter((data: any) => data.isNew);
        // Disabled if there are no new batches OR if any new batch has an empty batch value
        return newBatches.length === 0 || newBatches.some((data: any) => !data.batch);
    }

    saveBatch() {
        // Filter the data to only include items with isNew: true
        const newBatches = this.batchData.filter((data: any) => data.isNew == true);

        // Send requests for each new batch
        newBatches.forEach((data: any) => {
            const dataToSend: any = {
                batch: data.batch, // Include the batch information
                prod_order_pos_operation_id: this.selectedOrder?.prod_order_pos_operation_id,
                machine_id: this.machine_id,
                type: ProdOrderPosOperationHandlingUnitType.CONSUMPTION,
            };
            this.commonService.post("/ProdOrderPosOperationBatches", dataToSend).subscribe({
                next: (res: any) => {
                    this.getBatches();
                    this.toasterStatus = $localize`Successfully Saved`;
                    this.statusToastTools.open = true;
                },
                error: (err: any) => {
                },
            });
        });
    }

    lastProposedId(): number {
        let last_id = 0;
        for (const proposed of this.proposedQuantitiesForOperation) {
            last_id = Math.max(proposed.last_id, last_id);
        }
        return last_id;
    }

    updateProposedQuantitiesAndSerials() {
        let quantity = 0;
        let proposedSerials = [];
        for (const proposal of this.proposedQuantitiesForOperation) {
            if (
                (proposal.type == MachineCycleType.OK &&
                    this.selectedItemStateType == ItemStateType.GOOD) ||
                (proposal.type == MachineCycleType.NOT_OK &&
                    this.selectedItemStateType == ItemStateType.SCRAP)
            ) {
                quantity += proposal.sum;
                if (proposal.serial) {
                    proposedSerials.push(proposal.serial);
                }
            }
        }
        if (quantity > 0 && !this.selectedQuantity) {
            this.selectedQuantity = quantity;
        }

        if(this.serialNumbers.length) return ;

        if (proposedSerials.length == 0 && this.availableSerials.length > 0) {
            // Propose only the first available serial number.
            proposedSerials = [this.availableSerials[0]];
        }
        if (this.selectedOrder?.quantity_input_method === "SERIAL_MULTI") {
            this.serialNumbers = proposedSerials;

            this.serialNumbers = this.serialNumbers?.filter(
                serial => !this.selectedOrder?.used_serials?.includes(serial)
            )
        } else if (proposedSerials.length > 0) {
            this.serialNumbers = [proposedSerials[0]];
        } else {
            this.serialNumbers = [];
        }

        if (proposedSerials.length || quantity > 0) {
            this.onProposeConsumption();
        }
    }

    onItemStateChange(event: any) {
        const itemStateId = event.detail.item.id;

        this.selectedItemState = this.itemStates.find(state => state.id == itemStateId);
        this.selectedItemStateType = this.selectedItemState?.item_state_type ?? ItemStateType.GOOD;
    }

    onEditDialogItemStateChange(event: any) {
        const itemStateId = event.detail.item.id;

        this.editDialogSelectedItemState = this.itemStates.find(state => state.id == itemStateId);
    }

	clickOnScanButton() {
		this.isScanFromExit = false;
		this.isDialogOpenForScan = true;
	}

	clickOnExitScanButton() {
		this.isScanFromExit = true;
		this.isDialogOpenForScan = true;
	}

	clickOnScanButtonClose() {
		this.scannedToken = [];
        this.selectedHUType= '';
		this.isDialogOpenForScan = false;
	}

	onChangeHUType(event: any) {
		this.selectedHUType = event.detail.item.text || this.handlingUnitTypes[0].value;
	}

	inputValueRestrict(event: any, value: any) {
		if (event.target.value != value) {
			event.target.value = value;
		}
	}

	saveAndCloseScanDialog() {
        if(this.isScanFromExit){
            this.saveAndCloseScanForExitDialog();
        } else {
            const payload = {
                prodOrderPosOperation_id: this.selectedOrder?.prod_order_pos_operation_id,
                custom_id: this.scannedToken,
                machine_id: this.machine_id,
            };
    
            this.commonService.post(`quantity/scan/handling-unit`, payload, false).subscribe({
                next: async (response: any) => {
                    this.generateFilterQuery();
                    this.scannedToken = [];
                    this.selectedHUType= '';

                    this.isDialogOpenForScan = false;
                    this.isWarningDialogOpenForEntry = false;
                },
                error: (err: any) => {
                    this.selectedHUType= '';
                    this.errorStatus = err?.status == 409 ? $localize`Batch/HU is already associated!` : $localize`Something went wrong!`;
                    this.isErrorDialog = true;
                },
            });
        }
	}

	checkIsAvailableInBom() {
		if (!this.isScanFromExit) {
			this.disableYesButton = true;
			this.commonService
				.get(
					`stock/${this.machine_id}/check-bom-for-scanned-text?scannedText=${this.scannedToken[this.scannedToken.length - 1]}`,
					false
				)
				.subscribe({
					next: async (response: any) => {
						this.disableYesButton = false;
						if (!response.isAvailable) {
							this.isWarningDialogOpenForEntry = true;
                            this.scannedToken.pop();
						}
					},
					error: (err: any) => {
						console.log(err);
					},
				});
		}
	}

    saveAndCloseScanForExitDialog(){
        this.disableYesButton = true;
        const payload = {
            scannedIds: this.scannedToken,
            type: ProdOrderPosOperationHandlingUnitTypeClass.getStateValue(this.selectedHUType)
        }

        this.commonService
				.post(
					`stock/${this.machine_id}/${this.selectedOrder?.prod_order_pos_operation_id}/scanned-handling-unit-for-exit`, payload, false)
				.subscribe({
					next: async (response: any) => {
                        this.selectedHUType= '';
                        this.disableYesButton = false;
						this.generateFilterQuery();
                        this.scannedToken = [];
                        this.isDialogOpenForScan = false;
					},
					error: (err: any) => {
                        this.disableYesButton = false;
                        this.isErrorDialogOpen = true;
                        this.errorMessage = err?.status == 409 ? $localize`HU is already associated!` : this.localization.someThingWentWrong;
					},
				});
    }

    closeHUErrorDialog(){
        this.isErrorDialogOpen = false
    }

	closeIsWarningDialogOpenForEntry() {
		this.isWarningDialogOpenForEntry = false;
	}

	openCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.codeScannerDialog.elementRef.nativeElement.open = true;
			this.startCodeScanning();
		}
	}
	closeCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.scannerControls?.stop();
			this.codeScannerDialog.elementRef.nativeElement.open = false;
		}
	}

    clickTransportOrderFromEntry(data:any){
        this.selectedPSAForUnlink = data;

        this.onUnlinkPSAFromEntry();
    }

    clickOnUnlinkEntryButton(data:any){
        this.isUnlinkFromEntry = true;
        this.selectedPSAForUnlink = data;
        this.isUnlinkEntryOpen = true;
    }

    clickOnUnlinkExitButton(data:any){
        this.isUnlinkFromEntry = false;
        this.selectedPSAForUnlink = data;
        this.isUnlinkEntryOpen = true;
    }

    clickTransportOrderFromExit(data:any){
        this.selectedPSAForUnlink = data;

        this.onUnlinkPSAFromExit();
    }

    closeUnlinkPSAWaringDialog(){
        this.isUnlinkEntryOpen = false;
    }

    onSuspendSelectedSerialsClick(){
        this.isSuspendDialogOpen = true;
    }

    closeSuspendDialog(){
        this.isSuspendDialogOpen = false;
    }

    suspendSelectedSerials(){
        this.isLoading = true;

        const payload = {
            prodOrderPosId: this.selectedOrder?.prod_order_pos_id,
            serials: this.serialNumbers
        }

		this.commonService.post("quantity/suspend-serials", payload, false).subscribe({
			next: () => {
				this.serialNumbers = [];
				this.isLoading = false;
				this.getQuantityData();
				this.closeSuspendDialog();
			},
			error: err => {
				console.log(err);
				this.isLoading = false;
			},
		});
	}

	onUnlinkPSAFromEntry() {
		this.disableYesButton = true;
		this.commonService
			.post(
				`stock/${this.machine_id}/${this.selectedOrderId}/${this.selectedPSAForUnlink?.id}/unlink-production-supply-area-for-entry`, {}, false
			)
			.subscribe({
				next: async (response: any) => {
					this.disableYesButton = false;
					this.generateFilterQuery();
					this.isUnlinkEntryOpen = false;
				},
				error: (err: any) => {
					this.disableYesButton = false;
				},
			});
	}

    onUnlinkPSAFromExit() {
		this.disableYesButton = true;
		this.commonService
			.post(
				`stock/${this.machine_id}/${this.selectedOrderId}/${this.selectedPSAForUnlink?.id}/unlink-production-supply-area-for-exit`,{},
				false
			)
			.subscribe({
				next: async (response: any) => {
					this.disableYesButton = false;
					this.generateFilterQuery();
					this.isUnlinkEntryOpen = false;
				},
				error: (err: any) => {
					this.disableYesButton = false;
				},
			});
	}

	onSearch(e: any) {
		this.searchText = e.target.value;

		this.filteredOrders = this.allOrders.filter((order: any) =>
			order.order_custom_id.includes(this.searchText)
		);
	}

	openDropdown() {
		this.isValueHelpDialog = true;
	}

	closeDropdown() {
		this.isValueHelpDialog = false;
	}

	onChangeOrder(e: any) {
		const selectedOrderId = e.detail.item.id;
		const selectedOrderCustomId = e.detail.item.innerText;
		this.selectedProdOrderCustomId =
			selectedOrderCustomId + " - " + e.detail.item.additionalText;

		this.searchText = "";

		this.changeOrder(selectedOrderId);
		this.closeDropdown();
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
					this.scanText = result.getText();

					this.scannerControls?.stop();
					this.closeCodeScannerDialog();
				}
			}
		);
	}

	generateFilterQuery() {
		this.handlingUnitsForPSAUpperFilter = [];
		this.batchesForPSAFilter = [];
		this.handlingUnitsForPSALowerFilter = [];
		const orderByValue: any = [];

		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/ProdOrderPosOperationHandlingUnits?$filter=machine_id eq ${this.machine_id}&$orderby=created_at asc`
			),
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/ProdOrderPosOperationBatches?$filter=machine_id eq ${this.machine_id} and type eq '${ProdOrderPosOperationHandlingUnitType.CONSUMPTION}'&$orderby=created_at asc`
			)
		);
		this.filterQueryForUpperTable = "";
		this.filterQueryForLowerTable = "";

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				response.responses[0]?.body?.value?.forEach(
					(prodOrderPosOperationHandlingUnit: any) => {
						if (
							prodOrderPosOperationHandlingUnit.type ==
							ProdOrderPosOperationHandlingUnitType.CONSUMPTION
						) {
							this.handlingUnitsForPSAUpperFilter.push(
								prodOrderPosOperationHandlingUnit.handling_unit_id
							);
							orderByValue.push({
								value: prodOrderPosOperationHandlingUnit.handling_unit_id,
								created_at: prodOrderPosOperationHandlingUnit.created_at,
							});
						} else if(prodOrderPosOperationHandlingUnit.prod_order_pos_operation_id == this.selectedOrder?.prod_order_pos_operation_id){
                            this.handlingUnitsForPSALowerFilter.push(
								prodOrderPosOperationHandlingUnit.handling_unit_id
							);
                        }
					}
				);

				response.responses[1]?.body?.value?.forEach((prodOrderPosOperationBatch: any) => {
					this.batchesForPSAFilter.push(prodOrderPosOperationBatch.batch);
					orderByValue.push({
						value: prodOrderPosOperationBatch.batch,
						created_at: prodOrderPosOperationBatch.created_at,
					});
				});

				orderByValue.sort((a: any, b: any) => (a.created_at > b.created_at ? 1 : -1));
				const ids = orderByValue.map((item: any) => item.value) || []; // For orderBy Value

				if (
					this.batchesForPSAFilter?.length ||
					this.handlingUnitsForPSAUpperFilter?.length
				) {
					this.filterQueryForUpperTable = `batch=${this.batchesForPSAFilter.toString()}&stockable_id=${this.handlingUnitsForPSAUpperFilter}&combined=${ids.toString()}&isFromEntry=true`;
				} else {
					if (this.stagingAreaForUpperTable?.stagingAreaTable?.data) {
						this.stagingAreaForUpperTable.stagingAreaTable.data = [];
						this.stagingAreaForUpperTable.stagingAreaTable.render();
					}
				}

				if (this.handlingUnitsForPSALowerFilter?.length) {
					this.filterQueryForLowerTable = `stockable_id=${this.handlingUnitsForPSALowerFilter}&checkPositionable=0&removeDuplicateHU=1`;
				} else {
					if (this.stagingAreaForLowerTable?.stagingAreaTable?.data) {
						this.stagingAreaForLowerTable.stagingAreaTable.data = [];
						this.stagingAreaForLowerTable.stagingAreaTable.render();
					}
				}
			},
			error: err => {
				console.log(err);
			},
		});
	}

    consumptionColumn: any = [
        {
            Header: $localize`Item Id`,
            accessor: "item_id_custom",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
        },
        {
            Header: $localize`Item Name`,
            accessor: "item_name",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
        },
        {
            Header: $localize`Note`,
            accessor: "note",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                const rowIndex = row.index;
                    return (
                        <React.StrictMode>
                            <TextArea
                                style={{width: "100%"}}
                                value={rowData?.note ?? ""}
                                onKeyDown={(e: any) => e.stopPropagation()}
                                onInput={(e: any) => this.noteChange(e, rowIndex)}
                                i18n-placeholder
                                rows={1}
                                placeholder="Insert Note" // Add a placeholder
                            ></TextArea>
                        </React.StrictMode>
                    );
            },
        },
        {
            Header: $localize`Serial`,
            accessor: "serial",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox>
                            <UI5Input
                                style={{width: "100%"}}
                                show-value-help-icon
                                value={rowData.serial}
                                onInput={(e: any) => this.onSerialChange(e, rowData)}
                                placeholder="Insert Serial" // Add a placeholder
                                readonly={
                                    !rowData?.item_is_serial_managed
                                }></UI5Input>
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Quantity`,
            accessor: "quantity",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox>
                            <UI5Input
                                style={{width: "100%"}}
                                show-value-help-icon
                                value={rowData.quantity}
                                onInput={(e: any) => this.onQuantityChange(e, rowData)}
                                placeholder="Insert Quantity" // Add a placeholder
                                readonly={
                                    rowData?.item_is_serial_managed
                                }
                                type="Number"></UI5Input>
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`UoM`,
            accessor: "unit_of_measure_id_custom",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: true,
            hAlign: "Left",
            width: 100,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                const inputRef = React.useRef<any>(null);

                return (
                    <React.StrictMode>
                        <FlexBox>
                            <MultiInput
                                ref={inputRef}
                                style={{width: "100%"}}
                                show-value-help-icon
                                value={rowData.unit_of_measure_id_custom}
                                onInput={(event: any) => {
                                    this.inputValue = event.target.value;
                                    this.entitySelectionDialogProps = {
                                        title: $localize`Select Unit of Measure`,
                                        entity: "UnitOfMeasures",
                                        searchKey: "name",
                                        searchQuery: this.inputValue,
                                        inputReference: inputRef.current,
                                        entitySelected: (item: any) => {
                                            if (item) {
                                                rowData.unit_of_measure_id = item.id;
                                                rowData.unit_of_measure_id_custom = item.custom_id;
                                            }
                                            this.entitySelectionDialogProps = null;
                                            this.consumptionChildComponentRef?.render();
                                        },
                                    };
                                }}
                                onClick={() => {
                                    this.toggleValue = !this.toggleValue;
                                    this.entitySelectionDialogProps = {
                                        title: $localize`Select Unit of Measure`,
                                        entity: "UnitOfMeasures",
                                        searchKey: "name",
                                        searchQuery: this.inputValue,
                                        inputReference: inputRef.current,
                                        entitySelected: (item: any) => {
                                            if (item) {
                                                rowData.unit_of_measure_id = item.id;
                                                rowData.unit_of_measure_id_custom = item.custom_id;
                                            }
                                            this.entitySelectionDialogProps = null;
                                            this.consumptionChildComponentRef?.render();
                                        },
                                    };
                                }}
                                placeholder="Select"></MultiInput>
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Storage Location`,
            accessor: "storage_location_id_custom",
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: true,
            hAlign: "Left",
        }
    ];

    handlingUnitColumn: any = [
        {
            Header: $localize`Handling Unit Id`,
            accessor: "handlingUnit.custom_id",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                const inputRef = React.useRef<any>(null);
                if (!rowData.handlingUnit) {
                    // Render ComboBox for new rows
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <MultiInput
                                    ref={inputRef}
                                    style={{width: "100%"}}
                                    show-value-help-icon
                                    value={""}
                                    onInput={(event: any) => {
                                        this.inputValue = event.target.value;
                                        this.entitySelectionDialogProps = {
                                            title: $localize`Select Handling Unit`,
                                            entity: "HandlingUnits",
                                            searchKey: "custom_id",
                                            searchQuery: this.inputValue,
                                            inputReference: inputRef.current,
                                            entitySelected: (item: any) => {
                                                //Open Popover here
                                                if (item) {
                                                    rowData.handlingUnit = item;
                                                    this.handlingUnitChildComponentRef?.render();
                                                    this.saveHU(rowData);
                                                }
                                                this.entitySelectionDialogProps = null;
                                            },
                                        };
                                    }}
                                    onClick={() => {
                                        this.toggleValue = !this.toggleValue;
                                        this.entitySelectionDialogProps = {
                                            title: $localize`Select Handling Unit`,
                                            handlingUnit: this.handlingUnitsData,
                                            entity: "HandlingUnits",
                                            searchKey: "custom_id",
                                            searchQuery: this.inputValue,
                                            inputReference: inputRef.current,
                                            entitySelected: (item: any) => {
                                                //Open Popover here
                                                if (item) {
                                                    rowData.handlingUnit = item;
                                                    this.handlingUnitChildComponentRef?.render();
                                                    this.saveHU(rowData);
                                                }
                                                this.entitySelectionDialogProps = null;
                                            },
                                        };
                                    }}
                                    placeholder="Select HU" // Add a placeholder
                                ></MultiInput>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    // Render read-only input for existing rows
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    readonly
                                    style={{width: "100%"}}
                                    value={rowData.handlingUnit?.custom_id}
                                    type="Text"
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                }
            },
        },
        {
            Header: $localize`Action`,
            accessor: "action",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            hAlign: "Center",
            width: 100,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;

                return (
                    <React.StrictMode>
                        <FlexBox style={{gap: "5px"}}>
                            {
                                <Button
                                    id="printLabelBtn"
                                    onClick={() => this.printLabelHUClick(rowData)}
                                    icon="print"
                                />
                            }
                            {
                                <Button
                                    id="deleteButton"
                                    onClick={() => this.deleteHUClick(rowData)}
                                    icon="delete"
                                />
                            }
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
    ];
    batchesColumn: any = [
        {
            Header: $localize`Batch`,
            accessor: "batch",
            hAlign: "Left",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            disableResizing: false,
            canReorder: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                const rowIndex = row.index;

                if (rowData.isNew) {
                    // Render ComboBox for new rows
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    style={{width: "100%"}}
                                    show-value-help-icon
                                    value={""}
                                    onInput={(e: any) => this.batchChange(e, rowIndex)}
                                    placeholder="Insert Batch" // Add a placeholder
                                ></UI5Input>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    // Render read-only input for existing rows
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    readonly
                                    style={{width: "100%"}}
                                    value={rowData?.batch}
                                    type="Text"
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                }
            },
        },
        {
            Header: $localize`Action`,
            accessor: "action",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            hAlign: "Center",
            width: 100,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox style={{gap: "5px"}}>
                            {
                                <Button
                                    id="deleteButton"
                                    onClick={() => this.deleteBatchClick(rowData)}
                                    icon="delete"
                                />
                            }
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
    ];
	protected readonly QuantityType = QuantityType;
	protected readonly QuantityTypeClass = QuantityTypeClass;

	maximumQuantityOk() {
		this.onSaveQuantity(this.closeDialogAfterSave, true);
	}
	maximumQuantityClosed() {
		const dialog = document.getElementById("maximum-wanting-modal") as Dialog;
		dialog.open = false;
	}

    updateSelectedScannedTextFromMultiInput() {
		const scanText = this.scanMultiInput?.value;
		if (scanText) {
			this.scannedToken.push(scanText);
			this.scanMultiInput!.value = "";

			this.checkIsAvailableInBom();			
		}
	}

    updateSelectedTextFromTokenDeleted($event: MultiInputTokenDeleteEventDetail) {
        this.scannedToken = this.scannedToken.filter(scanText => {
            return !$event.tokens.some(item => item.text === scanText);
        });

        if(this.scannedToken.length){
            this.checkIsAvailableInBom();
        }
    }
}
