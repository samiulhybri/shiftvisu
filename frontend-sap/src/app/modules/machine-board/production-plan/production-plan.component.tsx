import {Component, Renderer2, ViewChild } from "@angular/core";
import {AuthService} from "@app/shared/services/auth.service";
import {CommonService} from "@app/shared/services/common.service";
import {Machine} from "@app/shared/models/machine.model";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductionPlanType} from "@app/shared/enums/ProductionPlanType";
import {
    ProdOrderPosOperationStatus,
    ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";
import {CustomReactGridTable} from "@app/shared/components/CustomGridTable";
import {ProdOrderPosOperation} from "@app/shared/models/prod-order-pos-operation.model";
import Dialog from "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Dialog";
import "@ui5/webcomponents/dist/Toast.js";
import {Item} from "@app/shared/models/item.model";
import React from "react";
import {Button, FlexBox, Icon, ObjectStatus, Text} from "@ui5/webcomponents-react";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import "@ui5/webcomponents/dist/RadioButton.js";
import {MachineBoardEventHandleService} from "@app/modules/machine-board/services/machine-board-event-handle.service";
import {PermissionEnum} from "@app/shared/enums/PermissionEnum";
import {OrderDetails} from "@app/shared/interfaces/OrderDetails";
import {ButtonConfig} from "@app/shared/interfaces/ButtonConfig";
import {ToastService} from "@app/shared/services/toaster.service";
import {
    OperationControlProfileConfirmationType
} from "@app/shared/enums/operation_control_profile_confirmation_type.enum";
import { ComponentAvailability } from "@app/shared/enums/ComponentAvailability";
import { ComponentPreparationState, ComponentPreparationStateClass } from "@app/shared/enums/ComponentPreparationState";
import { formatDate } from "@app/shared/utils/date-time-formatter";
import { formatNumber } from "@app/shared/utils/number-formatter";


interface CountOperations {
    IN_PRODUCTION?: number;
    IN_SETUP?: number;
    IN_PREPARATION?: number;
    PLANNED?: number;
}

@Component({
    selector: "app-production-plan",
    templateUrl: "./production-plan.component.html",
    styleUrl: "./production-plan.component.css",
})
export class ProductionPlanComponent {
    isLoading: boolean = false;
    isLoadUrl: boolean = false;
    customUrl: string = "";
    prodOrderPosOperation = ProdOrderPosOperation;
    selectedOperations: any = [];
    isDialogOpen = true;
    machine?: Machine;
    productionPlanDefaultButtonText: string = "";
    headerTitle: string = $localize`Planned`;
    url: string = "";
    productionPlanType = ProductionPlanType;
    prodOrderPosOperationStatus = ProdOrderPosOperationStatus;
    operationControlProfileConfirmationType = OperationControlProfileConfirmationType
    prodOrderPosOperationsIds: number[] = [];
    operationSelectedRowId?: number;
    posSelectedRowId!: number;
    planSuspendStatus?: ProdOrderPosOperationStatus;
    machItem?: Item;
    checkStateStatus?:ProdOrderPosOperationStatus = ProdOrderPosOperationStatus.SUSPENDED;
    currentProdOrderPosOperationStatus = ProdOrderPosOperationStatus.PLANNED;
    linkOperations: string[] = [];
    inProductionOperations: string[] = [];
    inSetupOperations = [];
    operationControlProfiles:any = [];
    selectedOperationControlProfile!:any;
    countOperations: CountOperations = {};
    toolbarId?: number;
    previousData: any = [];
    @ViewChild("gridTable") gridTable!: CustomReactGridTable;
    @ViewChild("toastForPrint") toastForPrint!: any;
    isDisabledTab = false
    fromTransportOrder = false
    isEwmEnabled  = false
    isProductionBtnClick = false;
    warehouseQuantity!: number;
    showWarehouseQuantity = false;
    isButtonDisabled = false;
    isProductionOrderCached = false;
    isShowSetUpOrder = false;
    isWarningForExitOpen = false;
    isWarningForInspectionPointOpen = false;
    airTankText = $localize`Air Tank`;
    groupText = $localize`Group`;

    private machineBoardProductionPlanEdit: boolean = this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT) 
                                                    || this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT_IF_QUALIFIED);

    multipleButtons:ButtonConfig[] =[
        {
            title: $localize`Start Production`,
            design: 'Default',
            display: false,
            disabled: !this.machineBoardProductionPlanEdit,
            callback: ()=> this.productionBtnClick(),
        },
        {
            title: $localize`Plan`,
            design: 'Default',
            display: false,
            disabled: !this.machineBoardProductionPlanEdit,
            callback: ()=> this.pannedButtonClick(),
        },
        {
            title: $localize`Suspend`,
            design: 'Default',
            display: false,
            disabled: !this.machineBoardProductionPlanEdit,
            callback: ()=> this.suspendButtonClick(),
        },
        {
            title: $localize`Close`,
            design: 'Negative',
            display: false,
            disabled: !this.machineBoardProductionPlanEdit,
            callback: ()=> this.closedBtnClick(),
        },
        {
            title: $localize`Teardown`,
            design: 'Negative',
            display: false,
            disabled: !this.machineBoardProductionPlanEdit,
            callback: ()=> this.TeardownBtnClick(),
        }
    ];

    constructor(
        public commonService: CommonService,
        public authService: AuthService,
        private activeRoute: ActivatedRoute,
        private router: Router,
        private _toastService: ToastService,
        private renderer: Renderer2,
        private machineBoardEventService: MachineBoardEventHandleService
    ) {
        this.getSettingData();
    }

    productionBtnClick(){
        this.isProductionBtnClick = true;
        this.setUpButtonClick();
    }
    closedBtnClick(){
        this.isProductionBtnClick = false
        this.planSuspendStatus = ProdOrderPosOperationStatus.CLOSED;
        this.setUpButtonClick();
    }
    TeardownBtnClick(){
        this.isProductionBtnClick = false
        this.planSuspendStatus = ProdOrderPosOperationStatus.IN_TEARDOWN;
        this.setUpButtonClick();
    }

    ngOnInit(): void {
        this.machineBoardProductionPlanEdit = this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT)
                                             || this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_EDIT_IF_QUALIFIED);
        this.isButtonDisabled = !this.machineBoardProductionPlanEdit;
        const MachineId = this.activeRoute.parent?.snapshot.params["id"];
        this.getMachine(MachineId);
        this.buttonDisable();
    }

    changeStage(event: any) {
        this.buttonEnable();
        const tabId = event.detail.tab.id;
        this.selectedOperations = [];
        this.isLoadUrl = false;
        this.previousData = [];
        this.customUrl = '';
        this.buttonDisable();
        this.multipleButtons.map((value, index  )=>   this.multipleButtons[index].display = false)
        switch (tabId) {
            case "Planned":
                this.currentProdOrderPosOperationStatus = ProdOrderPosOperationStatus.PLANNED;
                this.customUrl = `/production-plan/get-production-plan/${this.machine?.id}?from=PLANNED`
                this.productionPlanDefaultButtonText = this.getAddButton();
                this.setProductionPlan(tabId, "Planned");
                break;
            case "Preparation":
                this.currentProdOrderPosOperationStatus = ProdOrderPosOperationStatus.IN_PREPARATION;
                this.productionPlanDefaultButtonText = $localize`Start Setup`;
                this.customUrl = `/production-plan/get-production-plan/${this.machine?.id}?from=IN_PREPARATION`
                this.setProductionPlan(tabId, "Preparation");
                break;
            case "Setup":
                this.currentProdOrderPosOperationStatus = ProdOrderPosOperationStatus.IN_SETUP;
                this.customUrl = `/production-plan/get-production-plan/${this.machine?.id}?from=IN_SETUP`
                this.productionPlanDefaultButtonText = $localize`Start Setup`;
                if (this.machine?.production_plan_type == this.productionPlanType.SETUP_2) {
                    this.productionPlanDefaultButtonText = $localize`Start Production`;
                }
                this.multipleButtons[3].display = true;
                this.multipleButtons[3].disabled = !this.machineBoardProductionPlanEdit;
                this.setProductionPlan(tabId, "Setup");
                break;
            case "Production":
                this.productionPlanDefaultButtonText = $localize`Close`;
                this.multipleButtons[2].display = true;
                this.multipleButtons[2].disabled = !this.machineBoardProductionPlanEdit;
                this.currentProdOrderPosOperationStatus = ProdOrderPosOperationStatus.IN_PRODUCTION;
                this.customUrl = `/production-plan/get-production-plan/${this.machine?.id}?from=IN_PRODUCTION`
                this.setProductionPlan(tabId, "Setup");
                if (this.machine?.production_plan_type == this.productionPlanType.SETUP_1 ||  this.machine?.production_plan_type == this.productionPlanType.SETUP_2) {
                    this.multipleButtons[4].display = true;
                    this.multipleButtons[4].disabled = !this.machineBoardProductionPlanEdit;
                }
                break;
            default:
                // Handle any other cases
                break;
        }

        if([ProdOrderPosOperationStatus.IN_SETUP, ProdOrderPosOperationStatus.IN_PREPARATION].includes(this.currentProdOrderPosOperationStatus)){
            this.multipleButtons[1].display = true;
            this.multipleButtons[1].disabled = !this.machineBoardProductionPlanEdit;
            this.multipleButtons[2].display = true;
            this.multipleButtons[2].disabled = !this.machineBoardProductionPlanEdit;
        }

        this.isDisabledTab = true
    }

    /**
     * Click event when row selected
     * @param event
     */
    rowClick(event: any): void {
        //single row click data
        const rowData: ProdOrderPosOperation = event?.detail?.row?.original;
        // all row  data
        this.selectedOperations = event.detail.selectedFlatRows;
        if (rowData) {
            if (this.selectedOperations?.length
                && (this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_SETUP
                    || this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.WAITING_FOR_SETUP
                    || this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_TEARDOWN
                )) {
                this.selectedOperations.filter((operation: any, index: number) => {
                    if (this.currentProdOrderPosOperationStatus !== operation.original.status
                        && this.selectedOperations?.length != 1) {
                        delete event.detail.selectedRowIds[operation.id];
                        this.selectedOperations?.splice(index, 1);
                    }
                });
            }
        } else {
            this.checkSelectForSetUp(rowData, event.detail.selectedRowIds);
        }
        // set current status according to first select
        if (this.selectedOperations?.length
            && (this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_SETUP
                || this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.WAITING_FOR_SETUP
                || this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_TEARDOWN
            )) {
            this.currentProdOrderPosOperationStatus = (this.selectedOperations[0] as any).original.status;
        }
        if (this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_SETUP && rowData) {
            this.productionPlanDefaultButtonText = $localize`Start Production`;
        }else if (this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.IN_TEARDOWN && rowData) {
            this.productionPlanDefaultButtonText = $localize`Start Production`;
        }
        else if (this.currentProdOrderPosOperationStatus === ProdOrderPosOperationStatus.WAITING_FOR_SETUP && rowData) {
            this.productionPlanDefaultButtonText = $localize`Start Setup`;
        }

      if(this.gridTable.data.length !== 1 && this.selectedOperations.length !== 0 && this.selectedOperations.length !==1) {
          this.parallelOperationCheck(rowData,event)
      }else if(rowData==undefined && this.gridTable.data.length !== 1){
          this.parallelOperationCheck(rowData,event)
      }
        this.previousData = {...this.selectedOperations}

      if(this.selectedOperations.length) this.buttonEnable();
      else this.buttonDisable();
    }

    /**
     * check Parallel
     * @param rowData
     *
     * @param event
     */
    parallelOperationCheck(rowData:any, event: any) {

        let isAllSelect = false;
        if(rowData == undefined){
            isAllSelect = true;
        }else if(this.selectedOperations.length == 2 && this.gridTable.data.length ==2) {
            isAllSelect = false;
        } else if(this.selectedOperations.length == this.gridTable.data.length){
            isAllSelect = true;
        }
       if(!this.machine?.supports_parallel_operations) this.checkEventData(isAllSelect, event);
    }

    checkEventData(isAllSelect: boolean, event: any) {
        let opLength = this.selectedOperations?.length;
        let selectRow = {...event.detail.selectedRowIds};
        if (isAllSelect) {
            for (let i = 0; i < opLength; i++) {
                delete selectRow[this.selectedOperations[0].id];
                this.selectedOperations?.splice(0, 1);
            }
        } else {
            this.selectedOperations.filter((operation: any, index: number) => {
                if (this.previousData[0]?.original?.operation_id == this.selectedOperations[index]?.original?.operation_id) {
                    delete selectRow[operation.id];
                    this.selectedOperations?.splice(index, 1);

                }
            });
        }
        this.gridTable!.selectedRowsId = selectRow;
        event.detail.selectedRowIds = {};
        this.gridTable.render();
    }

    setProductionPlan(headerTitle: string, plan: any) {
        this.headerTitle = headerTitle;
        this.gridTable.skip = 0;
        this.gridTable!.customUrl = this.customUrl;
        this.gridTable.isBusy = true;
        this.gridTable.data = [];
        this.gridTable.globalFilterValue = '';
        this.gridTable.globalSearchFieldValue = '';
        this.gridTable.render();
        this.gridTable.onFilterAndSorting();

        this.getStatusWithCount();
    }

    checkSelectForSetUp(rowData: any, selectedRowIds: any) {
        let status: string = "";
        if (
            !rowData &&
            [
                ProdOrderPosOperationStatus.WAITING_FOR_SETUP,
                ProdOrderPosOperationStatus.IN_SETUP,
                ProdOrderPosOperationStatus.IN_TEARDOWN,
            ].includes(this.currentProdOrderPosOperationStatus)
        ) {
            if (this.selectedOperations?.length) {
                for (let i = 0; i < this.selectedOperations.length; i++) {
                    const operation: any = this.selectedOperations[i];
                    if (i === 0) {
                        status = operation.original.status;
                    }
                    if (status !== operation.original.status) {
                        delete selectedRowIds[operation.id];
                        this.selectedOperations.splice(i, 1);
                        i--;
                        this.gridTable.selectedRowsId = selectedRowIds;
                    }
                }
            }
            this.gridTable.render();
            if (status == ProdOrderPosOperationStatus.WAITING_FOR_SETUP) {
                this.productionPlanDefaultButtonText = $localize`Start Setup`;
            } else if (status == ProdOrderPosOperationStatus.IN_SETUP || status == ProdOrderPosOperationStatus.IN_TEARDOWN) {
                this.productionPlanDefaultButtonText = $localize`Start Production`;
            } else {
                this.productionPlanDefaultButtonText = $localize`Setup`;
            }
        }
    }

    columns: any = [
        {
            Header: $localize`Order Id`,
            accessor: "prod_order_custom_id",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
        },
        {
            Header: $localize`Operation`,
            accessor: "operation_name",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Center",
        },
        {
            Header: $localize`Item Id`,
            accessor: "item_custom_id",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
        },
        {
            Header: $localize`Item Name`,
            accessor: "item_name",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
        },
        {
            Header: $localize`Start`,
            accessor: "operation_start_date",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Right",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = formatDate(row.original.operation_start_date, false);
				return (
					<React.StrictMode>
						<Text>{rowData}</Text>
					</React.StrictMode>
				);
			},
        },
        {
            Header: $localize`Remaining Quantity`,
            accessor: "remain_quantity",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Right",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const quantity = formatNumber(row.original.remain_quantity);
				return quantity;
			},
        }, {
            Header: $localize`Confirmed Quantity`,
            accessor: "confirm_quantity",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Right",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const quantity = formatNumber(row.original.confirm_quantity);
				return quantity;
			},
        },
        {
            Header: $localize`Order Link`,
            accessor: "prod_lot",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
        },
        {
            Header: $localize`Status`,
            accessor: ".",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
            width: 180,
            Cell: (instance: any) => {
                const {row, webComponentsReactProperties} = instance;
                const data = row?.original;
                const status = data.status;

                const iconName = this.getIconName(status);
                const styles = this.getStyle(status);

                return (
                    <React.StrictMode>
                        <ObjectStatus
                            icon={<Icon name={iconName}/>}
                            style={styles}
                            state={this.getState(status)
                            }>
                            {ProdOrderPosOperationStatusClass.getStateTranslate(status)}
                        </ObjectStatus>
                    </React.StrictMode>
                );
            },
        },

        {
            Header: $localize`Status Staging`,
            accessor: "....",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
            width: 200,
            Cell: (instance: any) => {
                const {row, webComponentsReactProperties} = instance;
                const data = row?.original;
                const status = data.component_preparation_state;

                const iconName = this.getIconName(status);
                const styles = this.getStyle(status);

                return (
                    <React.StrictMode>

                        {ComponentPreparationStateClass.getStateTranslate(status)}

                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Action`,
            accessor: "..",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Center",
            width: 150,
            Cell: (instance: any) => {
                const {row, webComponentsReactProperties} = instance;
                const data = row?.original;
                const styles = this.getTransportButtonDesign(data.component_availability);
                return (
                    <React.StrictMode>
						<FlexBox>
                            <Button
                                onClick={() => this.showOderInfo(data)}
                                design="Transparent"
                                icon="message-information">
							</Button>
						</FlexBox>
                        <FlexBox>
                            {(
                                <Button 
                                onClick={() => this.bomInfo(data)}  
                                design="Transparent"
                                disabled={!this.machineBoardProductionPlanEdit} 
                                icon="survey">
                                </Button>
                            )}
                        </FlexBox>
                        <FlexBox>
                             {(
                                <Button onClick={() => this.transportInfo(data)}
                                    design="Transparent"
                                    disabled={!this.machineBoardProductionPlanEdit || this.isEwmEnabled ? data.is_prepared ? false : true : false}
                                    icon="shipping-status"
                                    style={styles}
                                >
                                </Button>
                             )}
                        </FlexBox>
                        {this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_PRINT) ? (
                            <FlexBox >
                                {(
                                    <Button 
                                        onClick={() => this.printProductionPlan(data)} 
                                        design="Transparent"
                                        icon="print">
                                    </Button>
                                )}
                            </FlexBox>
                        ) : null}
					</React.StrictMode>
                );
            },
        },
    ];
    getTransportButtonDesign(componentAvailability: string) {
        if (componentAvailability == ComponentAvailability.FULL)
            return {color: "green" };
        else if (componentAvailability == ComponentAvailability.PLANNED)
            return {color: "#CF5B2E" };
        else
            return;
    }
    showOderInfo(rowData: any) {
        this.toolbarId = rowData.tool_id;
        this.prodOrderPosOperationsIds = [rowData.operation_id];
        this.machItem = rowData.item
        const dialog = document.getElementById("orderDetails") as Dialog;
        dialog.open = true;
    }

    bomInfo(rowData: any) {
        this.operationSelectedRowId = rowData.operation_id;
        this.posSelectedRowId = rowData.prod_order_pos_id;
    }
    transportInfo(rowData: any) {
        if(!this.isEwmEnabled){
            this.operationSelectedRowId = rowData.operation_id;
            this.posSelectedRowId = rowData.prod_order_pos_id;
            this.fromTransportOrder = true
        }else{
            this.createTasks(rowData.operation_id)
        }

    }
    printProductionPlan(rowData: any) {
        this.commonService.post(`production-plan/${rowData.machine_id}/${rowData.operation_id}/print`,{},false).subscribe({
            next: (response: any) => {
                this.toastForPrint.elementRef.nativeElement.open = true;
            },error: ()=>{
                this._toastService.showToast($localize`Print Failed!`, "error");
            }
    })

    }
    onClickCreateOrderEmitter(){
        this.operationSelectedRowId = undefined
        this.fromTransportOrder = false
    }

    closedBomInfo() {
        const dialog = document.getElementById("bomDetails") as Dialog;
        dialog.open = false;
    }

    closeOrderDetails() {
        const dialog = document.getElementById("orderDetails") as Dialog;
        dialog.open = false;
    }

    getStyle(status: string) {
        switch (status) {
            case ProdOrderPosOperationStatus.PLANNED:
                return {
                    backgroundColor: "var(--production-status-planned--bg)",
                    color: "var(--production-status-planned--color)",
                    border: "1px solid var(--production-status-planned-border--color)",
                    width: "180px",
                    height: "18px",
                    padding: "5px 8px",
                    borderRadius: "8px",
                    fontWeight: 700,
                };
            case ProdOrderPosOperationStatus.SUSPENDED:
                return {
                    backgroundColor: "var(--div-border-color)",
                    color: "var(--blackBorderColor)",
                    border: "1px solid var(--badPartColor)",
                    width: "180px",
                    height: "18px",
                    padding: "5px 8px",
                    borderRadius: "8px",
                    fontWeight: 700,
                };
            case ProdOrderPosOperationStatus.IN_PRODUCTION:
            case ProdOrderPosOperationStatus.IN_PREPARATION:
                return {
                    backgroundColor: "var(--production-lite-color)",
                    color: "var(--status-true-text-color)",
                    border: "1px solid var(--status-border-color)",
                    width: "180px",
                    height: "18px",
                    padding: "5px 8px",
                    borderRadius: "8px",
                    fontWeight: 700,
                };
            case ProdOrderPosOperationStatus.IN_SETUP:
            case ProdOrderPosOperationStatus.IN_TEARDOWN:
            case ProdOrderPosOperationStatus.WAITING_FOR_SETUP:
                return {
                    backgroundColor: "var(--bom-status-warning-bgcolor)",
                    color: "var(--bom-status-warning-color)",
                    border: "1px solid var(--bom-status-warning-border-color)",
                    width: "180px",
                    height: "18px",
                    padding: "5px 8px",
                    borderRadius: "8px",
                    fontWeight: 700,
                };
            default:
                return;
        }

    }

    getIconName(status: string) {
        switch (status) {
            case ProdOrderPosOperationStatus.PLANNED:
                return "action-settings";
            case ProdOrderPosOperationStatus.SUSPENDED:
                return "sys-cancel-2";
            case ProdOrderPosOperationStatus.IN_SETUP:

            case ProdOrderPosOperationStatus.IN_TEARDOWN:
            case ProdOrderPosOperationStatus.WAITING_FOR_SETUP:
                return "lateness";
            case ProdOrderPosOperationStatus.IN_PRODUCTION:
            case ProdOrderPosOperationStatus.IN_PREPARATION:
                return "sys-enter-2";
            default:
                return;
        }
    }

    getState(status: string) {
        switch (status) {
            case ProdOrderPosOperationStatus.PLANNED:
                return ValueState.Information;
            case ProdOrderPosOperationStatus.SUSPENDED:
                return ValueState.None;
            case ProdOrderPosOperationStatus.IN_PRODUCTION:
            case ProdOrderPosOperationStatus.IN_PREPARATION:
                return ValueState.Positive;
            case ProdOrderPosOperationStatus.WAITING_FOR_SETUP:
            case ProdOrderPosOperationStatus.IN_SETUP:
                return ValueState.Critical;
            default:
                return;
        }
    }

    getMachine(machineId: string) {
        this.isDisabledTab = true
        this.commonService
            .get(`Machines(${machineId})`)
            .subscribe({
                next: (response: any) => {
                    this.machine = response;
                    this.customUrl = `/production-plan/get-production-plan/${this.machine?.id}?from=PLANNED`
                    this.getStatusWithCount();
                    this.productionPlanDefaultButtonText = this.getAddButton();
                },error: ()=>{
                    this.isDisabledTab = false
                }
            });
    }

    getStatusWithCount() {

        this.commonService.get(`production-plan/get-production-count/${this.machine?.id}`, false).subscribe({
            next: (response: any) => {
                if (response) {
                    this.countOperations.IN_SETUP = (response.IN_SETUP ?? 0) + (response.WAITING_FOR_SETUP ?? 0) + (response.IN_TEARDOWN ?? 0);
                    this.countOperations.IN_PREPARATION = response.IN_PREPARATION ?? 0;
                    this.countOperations.IN_PRODUCTION = response.IN_PRODUCTION ?? 0;
                }
            },
        });
    }

    suspendButtonClick() {
        this.isProductionBtnClick = false
        this.planSuspendStatus = ProdOrderPosOperationStatus.SUSPENDED;
        this.setUpButtonClick();
    }

    pannedButtonClick() {
        this.isProductionBtnClick = false
        this.planSuspendStatus = ProdOrderPosOperationStatus.PLANNED;
        this.setUpButtonClick();
    }

    checkIsThereHaveAnyExitValues(operationIds: number[]){
        this.commonService.get(`stock/${this.machine?.id}/check-exit-for-operations?operationIds=${operationIds.toString()}`, false).subscribe({
            next: (response: any) => {
                if (response?.availableExits) {
                    this.isWarningForExitOpen = true;
                } else {
                    this.setUpButtonClick(false, false);
                }
            },
        });
    }

    closedExitWarningPopup(){
        this.isWarningForExitOpen = false;
        this.isWarningForInspectionPointOpen = false;
        this.planSuspendStatus = undefined;
    }

    setUpButtonClick(formCloseWorning = false, isProductionCheck= true, isCanStatusChangeCheck = true) {
        const operationIds = this.selectedOperations.map(
            (operation: any) => operation.original.operation_id,
        );

        let changeStatus = this.planSuspendStatus ?? this.getStatus();

        if (
            isProductionCheck &&
            !this.isEwmEnabled &&
            (
                this.currentProdOrderPosOperationStatus === this.prodOrderPosOperationStatus.IN_PRODUCTION ||
                changeStatus === this.prodOrderPosOperationStatus.CLOSED ||
                changeStatus === this.prodOrderPosOperationStatus.SUSPENDED
            )
        ) {
            this.checkIsThereHaveAnyExitValues(operationIds);
            return;
        }

        this.isWarningForExitOpen = false;

        if(!formCloseWorning && changeStatus == this.prodOrderPosOperationStatus.CLOSED){
            this.closedWarning(true);
            return;
        }

        if(isCanStatusChangeCheck){
            this.checkIsStatusOfOperationCanBeChangd();

            return;
        }

        this.buttonDisable();
        if (!this.selectedOperations?.length) return;
        this.isLoading = true;
        this.isProductionOrderCached = false;
        this.isShowSetUpOrder = false;
        this.gridTable.isBusy = true;
        this.gridTable.render();

        const status = this.isProductionBtnClick ? ProdOrderPosOperationStatus.IN_PRODUCTION : changeStatus;
        const machineId = this.machine?.id;
        this.commonService
            .post(`production-plan/link-production`, {operationIds, machineId, status}, false)
            .subscribe({
                next: (response: any) => {
                    this.linkOperations = response.linkOperations;
                    this.inProductionOperations = response.inProductionOperations;
                    this.operationControlProfiles =  response.operationControlProfiles;
                    this.inSetupOperations  = response.inSetupOperations;
                    this.machineBoardEventService.prodOrderPosOperationChangeEvent();
                    this.machineBoardEventService.quantityChartChangeEvent();
                    const isProductionOrder = this.isProductionOrder();
                    const isSetUpOrder = this.isSetUpOrder();
                    this.isSetUpOrder();
                    if(this.operationControlProfiles.length){
                        this.selectedOperationControlProfile = {
                            ...this.operationControlProfiles[0],
                            index:0
                        }
                        this.openDialog("operationControlProfileDialog")
                    }
                    else if (isProductionOrder || isSetUpOrder) {
                        this.openDialog("deleteDialog",true)
                    } else {
                        this.updateProdOrderOperationStatus();
                    }
                }, error: (e) => {
                    this.gridTable.isBusy = false;
                    this.gridTable.render();
                }
            });
    }


    updateProdOrderOperationStatus(isStatus:boolean = false) {
        this.isDisabledTab = true;
        if (!this.selectedOperations?.length) return;
        this.gridTable.isBusy = true;
        this.gridTable.globalFilterValue = '';
        this.gridTable.globalSearchFieldValue = '';
        this.gridTable.render()
        this.isLoading = true;
        let changeStatus = this.planSuspendStatus ?? this.getStatus();

        const operationIds = this.selectedOperations.map(
            (operation: any) => operation.original.operation_id,
        );
        const machineIds = this.selectedOperations.map(
            (operation: any) => operation.original.machine_id,
        );
        const machineTimeIds = this.selectedOperations.map(
            (operation: any) => operation.original.machine_time_id,
        );

        const isPlanned = this.currentProdOrderPosOperationStatus == this.prodOrderPosOperationStatus.PLANNED;
        isStatus  = isStatus ?  (this.isProductionOrder() || this.isSetUpOrder()) : false;
        let payload = {
            status: this.isProductionBtnClick ? ProdOrderPosOperationStatus.IN_PRODUCTION : changeStatus,
            state_status: isStatus ? this.checkStateStatus : "",
            operationIds: operationIds,
            machineIds: machineIds,
            machineId: this.machine?.id,
            ...(isPlanned ? {} : {machineTimeIds: machineTimeIds}),
        };

        const endpoint = (isPlanned || this.isProductionBtnClick)
            ? "production-plan/update-operation-status"
            : "production-plan/update-operation-time-status";
        this.closeDialogWarning();
        this.commonService
            .post(endpoint, payload, false)
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        this.machineBoardEventService.prodOrderPosOperationChangeEvent();
                        this.machineBoardEventService.quantityChartChangeEvent();
                        this.gridTable.data = [];
                        this.gridTable.onFilterAndSorting();
                        this.isLoading = false;
                        this.isLoadUrl = false;
                        this.getStatusWithCount();
                        this.planSuspendStatus = undefined;
                        this.selectedOperations = [];
                        this.gridTable.render();
                        this.buttonDisable();
                    }
                },
                error: () => {
                    this.gridTable.isBusy = false;
                    this.isDisabledTab = false;
                    this.isButtonDisabled = !this.machineBoardProductionPlanEdit;
                    this.buttonEnable()
                    this.planSuspendStatus = undefined;
                    this.gridTable.render()
                },
            });
    }
     buttonEnable = () => {
         this.isButtonDisabled = !this.machineBoardProductionPlanEdit;
         this.multipleButtons.map((value, index  )=>   this.multipleButtons[index].disabled = !this.machineBoardProductionPlanEdit)
     }
    buttonDisable = () => {
        this.isButtonDisabled = true;
        this.multipleButtons.map((value, index  )=>   this.multipleButtons[index].disabled = true)
    }

    closeDialogProductionPlanPage() {
        const dialog = document.getElementById("productionPlanPage") as Dialog;
        dialog.open = false;

        this.router.navigate(["../"], {relativeTo: this.activeRoute});
    }

    closeDialogWarning() {
        const dialog = document.getElementById("deleteDialog") as Dialog;
        this.linkOperations = [];
        dialog.open = false;
        this.isProductionBtnClick = false;
        this.planSuspendStatus = undefined;
        this.buttonEnable();
    }

    getStatus() {
        const statusTransitions = {
            [ProdOrderPosOperationStatus.PLANNED]: this.getPlannedStatus(),
            [ProdOrderPosOperationStatus.IN_PREPARATION]: ProdOrderPosOperationStatus.WAITING_FOR_SETUP,
            [ProdOrderPosOperationStatus.IN_SETUP]: ProdOrderPosOperationStatus.IN_PRODUCTION,
            [ProdOrderPosOperationStatus.WAITING_FOR_SETUP]: ProdOrderPosOperationStatus.IN_SETUP,
            [ProdOrderPosOperationStatus.IN_TEARDOWN]: ProdOrderPosOperationStatus.IN_PRODUCTION,
            [ProdOrderPosOperationStatus.IN_PRODUCTION]: ProdOrderPosOperationStatus.CLOSED,
        };

        // @ts-ignore
        return statusTransitions[this.currentProdOrderPosOperationStatus] ?? undefined;
    }

    getPlannedStatus() {
        if (this.machine?.production_plan_type === ProductionPlanType.MANUAL) {
            return ProdOrderPosOperationStatus.IN_PRODUCTION;
        } else if (this.machine?.production_plan_type === ProductionPlanType.SETUP_2) {
            return ProdOrderPosOperationStatus.IN_SETUP;
        } else {
            return ProdOrderPosOperationStatus.IN_PREPARATION;
        }
    }

    getAddButton() {
        if (this.machine?.production_plan_type === this.productionPlanType.SETUP_1) {
            if(this.multipleButtons[0]){
                this.multipleButtons[0].display = true;
                this.multipleButtons[0].disabled = !this.machineBoardProductionPlanEdit;
            }
            return $localize`Start Preparation`;
        } else if (this.machine?.production_plan_type === this.productionPlanType.SETUP_2) {
            if(this.multipleButtons[0]){
                this.multipleButtons[0].display = true;
                this.multipleButtons[0].disabled = !this.machineBoardProductionPlanEdit;
            }
            return $localize`Start Setup`;
        } else {
            return $localize`Start Production`;
        }
    }
    selectedOperationEvent(operation: OrderDetails) {
        if (operation?.id) {
            this.selectedOperations?.map((eventData: any) => {
                if (eventData.original.operation_id == operation.id) {
                    this.machItem = eventData.original.item;
                    this.toolbarId = eventData.original.tool_id;
                }
            });
        } else {
            this.machItem = undefined;
            this.toolbarId = undefined;
        }
    }

    isProductionOrder() {
        const currentStatus = this.getStatus();
        const checkStatus = this.planSuspendStatus ?? currentStatus;
        let isInSetup:boolean = false ;
        if(!this.machine?.supports_parallel_operations){
            if(checkStatus == this.prodOrderPosOperationStatus.IN_PRODUCTION)
                isInSetup = this.inProductionOperations.length > 0;
        }else{

            isInSetup = this.inProductionOperations.length
                ? (currentStatus === this.prodOrderPosOperationStatus.IN_SETUP) &&
                ![
                    this.prodOrderPosOperationStatus.PLANNED,
                    this.prodOrderPosOperationStatus.SUSPENDED,
                    this.prodOrderPosOperationStatus.IN_TEARDOWN,
                    this.prodOrderPosOperationStatus.CLOSED,
                ].includes(checkStatus)
                : false;
        }
        const isManualInProduction = this.inProductionOperations.length
            ? this.machine?.production_plan_type === this.productionPlanType.MANUAL &&
            checkStatus === ProdOrderPosOperationStatus.IN_PRODUCTION
            : false;

        this.isProductionOrderCached = isInSetup || isManualInProduction || (this.isProductionBtnClick && (this.inProductionOperations.length > 0));
        return this.isProductionOrderCached;
    }

    isSetUpOrder(){
        const currentStatus = this.getStatus();
        const checkStatus = this.planSuspendStatus ?? currentStatus;
        let isInSetup:boolean = false ;
        if(!this.machine?.supports_parallel_operations){
            if(checkStatus == this.prodOrderPosOperationStatus.IN_SETUP)
                isInSetup =  this.inSetupOperations.length > 0;
        }
        this.isShowSetUpOrder =  !this.machine?.supports_parallel_operations && (this.inSetupOperations.length>0) && isInSetup && !this.isProductionBtnClick;
        return this.isShowSetUpOrder;
    }

    processData(data: any) {
        this.isDisabledTab = false;
        this.buttonDisable();
    }

    disabledTab() {
        return this.gridTable.isBusy;
    }

    getSettingData(){
        this.commonService.get('/Settings').subscribe({
            next:(response:any)=>{
             this.isEwmEnabled = response?.value[0]?.is_ewm_enabled;

             this.isEwmEnabled && this.addAdditionalColumns()
        }
        })
    }

    addAdditionalColumns(){
        const isAlreadyExist = this.columns.find(
			(col: any) => col.Header == this.airTankText
		);

		if (!isAlreadyExist) {
			const airTankColumn = {
				Header: this.airTankText,
				accessor: "air_tank",
				hAlign: "Left",
				disableFilters: false,
				disableSortBy: false,
				disableResizing: false,
				disableGroupBy: true,
				canReorder: false,
				isSelected: true,
			};

            const groupColumn = {
				Header: this.groupText,
				accessor: "group",
				hAlign: "Left",
				disableFilters: false,
				disableSortBy: false,
				disableResizing: false,
				disableGroupBy: true,
				canReorder: false,
				isSelected: true,
			};

			let index = this.columns.findIndex(
				(col: any) => col.Header == $localize`Status Staging`
			);

			this.columns.splice(index, 0, airTankColumn);
			this.columns.splice(++index, 0, groupColumn);
		}

        this.columns = this.columns.filter((column:any)=> column.Header != $localize`Order Link`);

        if (this.gridTable) {
            this.gridTable.columns = this.columns;
            this.gridTable?.ngOnChanges();
        }
    }

    createTasks(operationId:number){
        this.showWarehouseQuantity = false;
        this.commonService.post(`warehouse/${operationId}/create-tasks`,{},false).subscribe({
            next:(response:any)=>{
                this.showWarehouseQuantity = true
             this.warehouseQuantity = response;
            },error:()=>{
                this.showWarehouseQuantity = true
            }
        })
    }
    clickProfileOk() {
        const index = this.selectedOperationControlProfile?.index;
        const nextProfile = this.getNextProfile(index);
        const isProductionOrder = this.isProductionOrder();
        const isSetUpOrder = this.isSetUpOrder();
        if (nextProfile) {
            this.updateSelectedOperationControlProfile(nextProfile, index + 1);
        } else {
            if (isProductionOrder || isSetUpOrder) {
                this.openDialog("deleteDialog", true);
            } else {
                if(this.selectedOperations.length) this.updateProdOrderOperationStatus();
            }
            this.closeDialog("operationControlProfileDialog", false);
        }
    }

    clickProfileClose() {
        const index = this.selectedOperationControlProfile?.index;
        const nextProfile = this.getNextProfile(index);

        this.gridTable.data.forEach((data:any, i:number) => {
            if (data.operation_id === this.selectedOperationControlProfile.select_pos_id) {
                const row = this.renderer.selectRootElement(`[data-row-index="${i + 1}"]`, true);
                row?.click();
            }
        });

        if (nextProfile) {
            this.updateSelectedOperationControlProfile(nextProfile, index + 1);
        } else {
            const isProductionOrder = this.isProductionOrder();
            const isSetUpOrder = this.isSetUpOrder();
            setTimeout(() => {
                if ((isProductionOrder && this.selectedOperations.length) || isSetUpOrder) {
                    this.openDialog("deleteDialog", true);
                } else {
                    if(this.selectedOperations.length) this.updateProdOrderOperationStatus();
                }
            }, 10);
            this.closeDialog("operationControlProfileDialog");
            this.isProductionBtnClick = false;
        }
    }

    getNextProfile(index:number) {
        return this.operationControlProfiles[index + 1] ?? null;
    }

    updateSelectedOperationControlProfile(profile:any, index:number) {
        this.selectedOperationControlProfile = {
            ...profile,
            index,
        };
    }

    openDialog(dialogId:string, hasStateStatus?:boolean) {
        if (hasStateStatus) {
            if (this.machine?.supports_parallel_operations) this.checkStateStatus = ProdOrderPosOperationStatus.IN_PRODUCTION;
            else this.checkStateStatus = ProdOrderPosOperationStatus.SUSPENDED;
        }
        const dialog = document.getElementById(dialogId) as Dialog;
        dialog.open = true;
        this.isLoading = false;
        this.gridTable.isBusy = false;
        this.gridTable.render();
    }

    closeDialog(dialogId:string,changeStatus = true) {
        const dialog = document.getElementById(dialogId) as Dialog;
        dialog.open = false;
        this.planSuspendStatus = undefined;
        if(changeStatus) this.checkStateStatus = undefined
    }

    checkIsStatusOfOperationCanBeChangd(){
        const operationIds = this.selectedOperations.map(
            (operation: any) => operation.original.operation_id,
        ) || [];

        const payload = {
            operationIds: operationIds,
            status: this.planSuspendStatus ?? this.getStatus()
        }

        this.commonService.post(`production-plan/can-change-state-of-operations`,payload, false).subscribe({
            next: (response: any) => {
                if(response){
                    this.setUpButtonClick(true, false, false);
                } else {
                    this.isWarningForInspectionPointOpen = true;
                }
            },error: ()=>{
                this.isWarningForInspectionPointOpen = true;
            }
        })
    }

    closedOrder(){
        this.setUpButtonClick(true, false)
      
      const dialog = document.getElementById('closed-warning-modal') as Dialog;
        dialog.open = false;
    }

    closedWarning(openCloseModeal:boolean){
        const dialog = document.getElementById('closed-warning-modal') as Dialog;
        dialog.open = openCloseModeal;

        if(!openCloseModeal){
            this.planSuspendStatus = undefined;
        }
    }

}
