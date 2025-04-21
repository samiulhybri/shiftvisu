import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm, FormBuilder } from '@angular/forms';
import React from "react";
import { Input as UI5Input, FlexBox, ComboBox, ComboBoxItem, Button, CheckBox } from "@ui5/webcomponents-react";

import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { AuthService } from '@app/shared/services/auth.service';

import { CustomReactGridTable } from '@app/shared/components/CustomGridTable';
import { ODataBatchCall } from '@app/shared/models/odata-batch-call';
import { ProdOrder } from '@app/shared/models/prod-order.model';
import { ProdOrderPosOperation } from '@app/shared/models/prod-order-pos-operation.model';
import { ProdOrderPos } from '@app/shared/models/prod-order-pos.model';
import OperationPlan from '@app/shared/models/operation-plan.model';

import { User } from '@app/shared/models/user.model';
import { ToolRepairLabelType, ToolRepairLabelTypeClass } from '@app/modules/tool-visu/enums/ToolRepairLabelType';
import { ProdOrderType } from '@app/shared/enums/ProdOrderType';
import { ProdOrderPosStatus } from '@app/shared/enums/ProdOrderPosStatus';
import moment from 'moment';
import { RepairTreeComponent } from '@app/modules/tool-visu/shared/repair-tree/repair-tree.component';
import ValueState from '@ui5/webcomponents-base/dist/types/ValueState';
import { ProdOrderPosOperationStatus } from '@app/shared/enums/ProdOrderPosOperationStatus';
import Toast from '@ui5/webcomponents/dist/Toast';
import { Item } from '@app/shared/models/item.model';
import { Localization } from '@app/shared/utils/common-localize';
import { Router } from '@angular/router';
import { Suppliers } from '@app/shared/models/suppliers.model';
import { environment } from '@app/environments/environment';
import { SectionActivatableTypes } from '@app/shared/enums/SectionActivatableTypes';
import { PermissionEnum } from '@app/shared/enums/PermissionEnum';

@Component({
    selector: 'app-repair-details',
    templateUrl: './repair-details.component.html',
    styleUrl: './repair-details.component.css'
})
export class RepairDetailsComponent {
    @Input() public set repairId(dataItem: number | undefined) {
        if (dataItem && (this.modalType == "edit" || this.modalType == "view")) {
            this.loadData(dataItem);
        }
        this.prodOrderData = new ProdOrder().deserialize({});
    }
    @Input() modalHeight!: string;
    @Input() modalType!: string;
    @Input() selectedItem: any = new Item().deserialize({});
    @Input() selectedProdOrderPos: any = {};
    @Input() isDialogOpen!: boolean;
    @Input() allUserList!: User[];
    @Input() allSupplierList!: Suppliers[];
    @Input() allRepairTypeList!: OperationPlan[];
    @Input() isPlannedOrder = false;
    @Input() selectedNewOtherRepairOp: any[] = [];
    localization = Localization;
    @Output() public isCloseClicked: EventEmitter<boolean> = new EventEmitter();
    @Output() public isSaveClicked: EventEmitter<boolean> = new EventEmitter();
    @Output() public isShowMessage: EventEmitter<any> = new EventEmitter();

    @ViewChild("repairForm") form?: NgForm;
    @ViewChild("typeOfRepairTree", { static: false }) typeOfRepairTree: RepairTreeComponent | undefined;
    @ViewChild("newTypeOfRepairTable", { static: false }) newTypeOfRepairTable:
        | CustomReactGridTable
        | undefined;
    @ViewChild("typeRepairTab") typeRepairTab!: ElementRef;
    @ViewChild("otherRepairTab") otherRepairTab!: ElementRef;
    @ViewChild("attachmentTab") attachTab!: ElementRef;
    @ViewChild("notesTab") notesTab!: ElementRef;
    @ViewChild("otherRepair", { static: false }) childComponentGrid:
        | CustomReactGridTable
        | undefined;
    @ViewChild("modal", { static: true }) modal!: ElementRef;
    @ViewChild("detailModalToast", { static: true }) modalToast!: ElementRef<HTMLElement>;

    public authUser!: User;
    public orderCustomId!: any;
    public prodOrderData: ProdOrder = new ProdOrder().deserialize({});
    public prodOrderPosData: ProdOrderPos = new ProdOrderPos().deserialize({});
    public prodOrderPosOperations: ProdOrderPosOperation[] = [];
    public selectedTab: string = "type_of_repair_tab";
    public deletItemId: number | null = null;
    public checkForNewAttachments: boolean = false;
    public tempFiles: any = [];
    public deletedSavedFiles: any = [];
    public selectedStandardFile: any = {};
    public attachmentCount: number = 0;
    public disableButtonDuringRequest: boolean = false;
    public isCreateDialogOpen: boolean = false;
    public isPreviewDialogOpen: boolean = false;
    public files: any = [];
    public isLoading: boolean = false;
    public dialogTitle: string = " ";
    public toolRepairLabelTypeEnum: ToolRepairLabelType = ToolRepairLabelType.INTERNAL;
    public showActionRepair: boolean = false;
    public selectedNewTypeRepairOp: ProdOrderPosOperation[] = [];
    public toastMessage: string = "";
    public isStartDateUpdate: boolean = false;
    public isReleaseDateUpdate: boolean = false;

    public treeTableData: any[] = [];
    public userCreatorName: string = '';
    public userResponsibleName: string = '';
    public toolSupplierName: string = '';
    public prevTypeRepairs: any[] = [];
    public prevOtherRepairs: any[] = [];
    public selectedTreeRowIds: { [key: number]: boolean } = {};
    public label = ToolRepairLabelType;
    public treeTableSelectionMode = 'Multiple'
    public isAddButtonShow = true;
    public isAllOrderRepairDoneButtonDisabled = true;
    public isAllRepairDone?: boolean;
    public isSaveOrUpdate = $localize`Save`
    public updatedOperationdata: any = [];
    public newTypeOfRepair: any = [];
    public typeOfRepairTreeTableData: any = [];
    public otherRepairTableData: any = [];
    public tableTitle: string = $localize`Repair Type`;
    public isAddToolRepair = false;
    public isToolRepairProductionDateManual = environment.isToolRepairProductionDateManual;
    public productiondateSubText = environment.isToolRepairProductionDateManual ? $localize`Manual` : $localize`PlanVisu`;
    public typeOfRepairTabCount: number = 0;
    public otherRepairTabCount: number = 0;
    public hasAuth: boolean = true;
    public isOrderHistory: boolean = false;
    public isDisableProdDate: boolean = false;
    public isInvalidProdDate: boolean = false;
    public prodDateDialogTitle: string = '';

    public otherRepairColumns: any = [
        {
            Header: $localize`Repair Type`,
            accessor: "custom_id",
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowIndex = row.index;
                if (this.modalType != 'view') {
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <ComboBox
                                    value={this.selectedNewOtherRepairOp[rowIndex].custom_id}
                                    onInput={(e: any) => this.handleRepairTypeChange(e, rowIndex)}
                                    onSelectionChange={(e: any) => this.handleRepairTypeChange(e, rowIndex)}
                                    valueState={this.selectedNewOtherRepairOp.length > 1 && this.selectedNewOtherRepairOp[rowIndex].custom_id == '' ? ValueState.Negative : ValueState.None}
                                    placeholder={$localize`Select Repair Type`}
                                    disabled={this.selectedNewOtherRepairOp[rowIndex].is_auto_created || this.isPlannedOrder}
                                >
                                    {this.allRepairTypeList.map((plan: OperationPlan) => (
                                        <ComboBoxItem key={plan.id} id={plan.id!.toString()} text={plan.custom_id} />
                                    ))}
                                </ComboBox>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    value={this.selectedNewOtherRepairOp[rowIndex].custom_id}
                                    type="Text"
                                    readonly
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                }
            },
        },
        {
            Header: $localize`Repair`,
            accessor: this.isPlannedOrder ? "prodOrderPosOperation.name" : "name",
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowIndex = row.index;

                const handleInput = (event: any) => {
                    const ui5Input = event.target;
                    const inputElement = ui5Input.shadowRoot?.querySelector('input') as HTMLInputElement;

                    if (event.ctrlKey || event.metaKey) {
                        return;
                    }

                    if (event.key === ' ') {
                        event.preventDefault(); // Prevent the default behavior if it is being blocked
                        const cursorPosition = inputElement.selectionStart || 0;
                        const currentValue = this.selectedNewOtherRepairOp[rowIndex].name;
                        const newValue = currentValue.slice(0, cursorPosition) + ' ' + currentValue.slice(cursorPosition);
                        this.selectedNewOtherRepairOp[rowIndex].name = newValue;
                
                        setTimeout(() => {
                            inputElement.selectionStart = cursorPosition + 1;
                            inputElement.selectionEnd = cursorPosition + 1;
                        }, 0);
                
                        this.childComponentGrid?.render();
                        return;
                    }
                    this.selectedNewOtherRepairOp[rowIndex].name = ui5Input.value;
                };

                if(this.modalType == 'view') {
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    value={this.isPlannedOrder ? this.selectedNewOtherRepairOp[rowIndex].prodOrderPosOperation.name : this.selectedNewOtherRepairOp[rowIndex].name}
                                    type="Text"
                                    readonly
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <UI5Input
                                    value={this.isPlannedOrder ? this.selectedNewOtherRepairOp[rowIndex].prodOrderPosOperation.name : this.selectedNewOtherRepairOp[rowIndex].name}
                                    onInput={(e: any) => this.handleRepairChange(e, rowIndex)}
                                    onKeyDown={handleInput}
                                    placeholder={$localize`Enter Name`}
                                    type="Text"
                                    valueState={this.selectedNewOtherRepairOp[rowIndex]?.custom_id != '' && this.selectedNewOtherRepairOp[rowIndex]?.name?.trim() != '' ? ValueState.None : ValueState.Negative}
                                    disabled={this.selectedNewOtherRepairOp[rowIndex].custom_id == '' || this.selectedNewOtherRepairOp[rowIndex].is_auto_created || this.isPlannedOrder}
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
            disableFilters: false,
            disableGroupBy: true,
            disableSortBy: false,
            hAlign: "Center",
            minWidth: 50,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowIndex = row.index;
                return (
                    <React.StrictMode>
                        <FlexBox>
                            <Button
                                icon='delete'
                                onClick={(e: any) => this.handleDeleteRepair(e, rowIndex)}
                                design="Transparent"
                                disabled={this.selectedNewOtherRepairOp[rowIndex].is_auto_created}>
                            </Button>
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
    ];

    public newTypeOfRepairColumns = [
        {
            Header: $localize`Repair Type`,
            accessor: "operationPlan.custom_id",
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
        },
        {
            Header: $localize`Repair`,
            accessor: "name",
            disableFilters: false,
            disableGroupBy: false,
            disableSortBy: false,
        },
        {
            Header: $localize`Completed`,
            headerTooltip: $localize`Completed`,
            accessor: 'is_repair_completed',
            hAlign: 'Center',
            autoResizable: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox alignItems='Center'>
                            <CheckBox
                                onClick={() => this.setCompletedDate(event, rowData, 'newTypeOfRepair')}
                                text=""
                                checked={rowData.is_repair_completed}
                                valueState="None"
                                readonly={this.modalType == 'view' ? true : false}
                            />
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Completed Date`,
            headerTooltip: $localize`Completed`,
            accessor: 'repair_completed_date',
            autoResizable: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox alignItems='Stretch'>
                            {rowData.is_repair_completed ? moment(rowData.repair_completed_date).format('DD.MM.YYYY') : null}
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        }
    ]

    treeTableColumns: any = [
        {
            Header: $localize`Repair Type`,
            headerTooltip: $localize`Repair Type`,
            accessor: 'custom_id',
            autoResizable: true,
        },
        {
            Header: $localize`Repair`,
            headerTooltip: $localize`Repair`,
            accessor: this.isPlannedOrder || this.modalType == 'view' ? 'prodOrderPosOperation.name' : 'name',
            autoResizable: true,
        },
    ]

    constructor(protected _commonSrv: CommonService,
        protected _authSrv: AuthService,
        protected _toastSrv: ToastService,
        protected formBuilder: FormBuilder,
        private router: Router
    ) { }

    ngOnChanges(changes: any) {
        this.selectedItem = changes.selectedItem ? changes.selectedItem.currentValue : this.selectedItem;
        this.selectedProdOrderPos = changes.selectedProdOrderPos ? changes.selectedProdOrderPos.currentValue : this.selectedProdOrderPos;
        this.isDialogOpen = changes.isDialogOpen ? changes.isDialogOpen.currentValue : false;
        this.modalType = changes.modalType ? changes.modalType.currentValue : this.modalType;
        if (this.modalType == 'add') this.initialLoadData();
    }

    ngOnInit() {
        const fullPath = this.router.url;
        this.isAddToolRepair = fullPath.includes('tool-repair') ? true : false;
        this.isOrderHistory = fullPath.includes('order-history') ? true : false;
        this.authUser = this._authSrv.getUser();
        const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') || 
                      this.authUser.roleString?.includes('ADMIN_TOOLVISU') ||
                      this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_PLANNED_ORDERS_EDIT);
        if(checkAuth) this.hasAuth = true;
        else this.hasAuth = false;

        this.typeOfRepairTabCount = 0;
        this.otherRepairTabCount = 0;

        if (this.isPlannedOrder) {
            this.treeTableColumns.push(
                {
                    Header: $localize`Completed`,
                    headerTooltip: $localize`Completed`,
                    accessor: 'is_repair_completed',
                    autoResizable: true,
                    hAlign: "Center",
                    Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                        const { row } = instance;
                        const rowData = row.original;
                        
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Center'>
                                    {rowData.pos ? <CheckBox
                                        onClick={() => this.setCompletedDate(event, rowData, 'typeOfRepair')}
                                        text=""
                                        valueState="None"
                                        checked={rowData.prodOrderPosOperation.is_repair_completed}
                                        readonly={this.modalType == 'view' ? true : false}
                                    /> : null}
                                </FlexBox>
                            </React.StrictMode>
                        );
                    },
                },
                {
                    Header: $localize`Completed Date`,
                    headerTooltip: $localize`Completed`,
                    accessor: 'repair_completed_date',
                    autoResizable: true,
                    Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                        const { row } = instance;
                        const rowData = row.original;
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Stretch'>
                                    {rowData.pos && rowData.prodOrderPosOperation.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format('DD.MM.YYYY') : null}
                                </FlexBox>
                            </React.StrictMode>
                        );
                    },
                }
            )

            this.otherRepairColumns.splice(2, 1);
            this.otherRepairColumns.push(
                {
                    Header: $localize`Completed`,
                    headerTooltip: $localize`Completed`,
                    accessor: 'is_repair_completed',
                    hAlign: 'Center',
                    autoResizable: true,
                    Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                        const { row } = instance;
                        const rowData = row.original;
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Center'>
                                    <CheckBox
                                        onClick={() => this.setCompletedDate(event, rowData, 'other')}
                                        text=""
                                        checked={rowData.prodOrderPosOperation.is_repair_completed}
                                        valueState="None"
                                        readonly={this.modalType == 'view' ? true : false}
                                    />
                                </FlexBox>
                            </React.StrictMode>
                        );
                    },
                },
                {
                    Header: $localize`Completed Date`,
                    headerTooltip: $localize`Completed`,
                    accessor: 'repair_completed_date',
                    autoResizable: true,
                    Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                        const { row } = instance;
                        const rowData = row.original;
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Stretch'>
                                    {rowData.prodOrderPosOperation.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format('DD.MM.YYYY') : null}
                                </FlexBox>
                            </React.StrictMode>
                        );
                    },
                }
            )

            this.treeTableSelectionMode = "Single";
            this.isAddButtonShow = false;
        }
    }

    loadData(id: number) {
        this.isCreateDialogOpen = true;
        this.isLoading = true;

        let url = '';
        if (this.modalType === 'edit') {
            url = `ProdOrderPos/${id}?$select=id,is_sampling_required,is_sampling_done,notes,estimated_hours,actual_time,cost,label,prod_order_id,item_id,user_id_creator,user_id_responsible,start,created_at,updated_at,status,status_plan,release_date,is_production_possible,supplier_id_tool,is_prod_date_manual&$expand=prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($select=id,user_id,name,pos,prod_order_pos_id,operation_plan_pos_id_origin,operation_plan_id_origin,is_repair_completed,repair_completed_date,is_automatic_created_repair;$expand=operationPlan,user($select=id,name),operationPlanPos($select=id,name,operation_plan_id,pos);$top=100000),item($select=id,name,custom_id,height,length,width,total_weight),userCreator($select=id,name),userResponsible($select=id,name),toolSupplier($select=id,name),media($select=id)`;
        } else if (this.modalType === 'view') {
            url = `ProdOrderPos(${id})?$expand=media($select=id),userCreator($select=id,name,custom_id),userResponsible($select=id,name,custom_id),toolSupplier($select=id,name),item($select=id,name,custom_id,is_active,is_tool,height,length,width,total_weight),prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($expand=operationPlan($select=id,custom_id),operationPlanPos($select=id,name),user($select=id,name);$top=100000)`;
        }

        if (url) {
            this._commonSrv.get(url).subscribe({
                next: (response: any) => {
                    this.selectedProdOrderPos = new ProdOrderPos().deserialize(response);
                    this.isLoading = false;
                    this.initialLoadData();
                },
                error: (error: any) => {
                    console.error("Error while getting ProdOrderPos: ", error);
                    this.isLoading = false;
                    this._toastSrv.showToast($localize`Data loading issue. Check log`, 'error');
                },
            });
        }
    }

    async modifyRepairTables() {
        this.treeTableColumns.push(
            {
                Header: $localize`Completed`,
                headerTooltip: $localize`Completed`,
                accessor: 'is_repair_completed',
                autoResizable: true,
                hAlign: "Center",
                Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                    const { row } = instance;
                    const rowData = row.original;
                    const isShow = 'pos' in rowData;
                    if (this.modalType == 'view') {
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Center'>
                                    {isShow ? <CheckBox
                                        checked={rowData.is_repair_completed}
                                        readonly
                                    /> : null}
                                </FlexBox>
                            </React.StrictMode>
                        );
                    } else {
                        return (
                            <React.StrictMode>
                                <FlexBox alignItems='Center'>
                                    {isShow ? <CheckBox
                                        onClick={() => this.setCompletedDate(event, rowData, 'typeOfRepair')}
                                        text=""
                                        valueState="None"
                                        checked={rowData.prodOrderPosOperation.is_repair_completed}
                                    /> : null}
                                </FlexBox>
                            </React.StrictMode>
                        );
                    }
                },
            },
            {
                Header: $localize`Completed Date`,
                headerTooltip: $localize`Completed`,
                accessor: 'repair_completed_date',
                autoResizable: true,
                Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                    const { row } = instance;
                    const rowData = row.original;
                    const isShow = 'pos' in rowData;

                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Stretch'>
                                {isShow && rowData.repair_completed_date ? moment(rowData.repair_completed_date).format('DD.MM.YYYY') : null}
                            </FlexBox>
                        </React.StrictMode>
                    );
                },
            },
            {
                Header: $localize`Completed By`,
                headerTooltip: $localize`Completed`,
                accessor: 'repair_completed_by',
                
                autoResizable: true,
                Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                    const { row } = instance;
                    const rowData = row.original;
                    const isShow = 'pos' in rowData;                    
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Stretch'>
                            {isShow && rowData.repair_completed_by ? rowData.repair_completed_by : null}
                            </FlexBox>
                        </React.StrictMode>
                    );
                },
            }
        )

        this.otherRepairColumns.splice(2, 1);
        this.otherRepairColumns.push({
            Header: $localize`Completed`,
            headerTooltip: $localize`Completed`,
            accessor: 'prodOrderPosOperation.is_repair_completed',
            hAlign: 'Center',
            autoResizable: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                if (this.modalType == 'view') {
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Center'>
                                <CheckBox
                                    checked={rowData.prodOrderPosOperation.is_repair_completed}
                                    readonly
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    return (
                        <React.StrictMode>
                            <FlexBox alignItems='Center'>
                                <CheckBox
                                    onClick={() => this.setCompletedDate(event, rowData, 'other')}
                                    text=""
                                    checked={rowData.prodOrderPosOperation.is_repair_completed}
                                    valueState="None"
                                />
                            </FlexBox>
                        </React.StrictMode>
                    );
                }
            },
        },
        {
            Header: $localize`Completed Date`,
            headerTooltip: $localize`Completed`,
            accessor: 'prodOrderPosOperation.repair_completed_date',
            autoResizable: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox alignItems='Stretch'>
                            {rowData.prodOrderPosOperation.repair_completed_date ? moment(rowData.prodOrderPosOperation.repair_completed_date).format('DD.MM.YYYY') : null}
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Completed By`,
            headerTooltip: $localize`Completed`,
            accessor: 'prodOrderPosOperation.user.name',
            
            autoResizable: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox alignItems='Stretch'>
                        {rowData.prodOrderPosOperation.user ? rowData.prodOrderPosOperation.user.name : null}
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        })

        this.treeTableSelectionMode = 'Single'
        this.isAddButtonShow = false;
    }

    showModalToast(message: string, type: string) {
        this.toastMessage = message;
        const toast = document.getElementById("detailModalToast") as Toast;
        toast.setAttribute("z-index", "10000000");
        toast.setAttribute("display", "block");
        toast.className = this._toastSrv.setToasterType(type);
        toast.open = true;
    }

    async initialLoadData(): Promise<any> {
        this.selectedTab = "type_of_repair_tab";

        if (this.modalType == 'add') await this.prepareDataForAddModal();
        else if (this.modalType == 'edit') await this.prepareDataForEditModal();
        else if (this.modalType == 'view') await this.prepareDataForViewModal();

        if (!this.isPlannedOrder) {
            if (this.modalType != 'view' && this.allRepairTypeList) {
                this.allRepairTypeList.forEach((elm: any) => {
                    if (elm.operationPlanPos.length > 0) this.treeTableData.push(elm);
                });
            }
        } else {
            this.isAllRepairDone = this.selectedProdOrderPos.status == ProdOrderPosStatus.CLOSED ? true : false;
            this.isAllOrderRepairDoneButtonDisabled = !this.selectedProdOrderPos.prodOrderPosOperations.every((item: any) => item.is_repair_completed == true);
            this.treeTableData = [];
            this.selectedNewOtherRepairOp = [];
            this.selectedProdOrderPos.prodOrderPosOperations.forEach((op: any) => {
                if(!op.operation_plan_id_origin && !op.operation_plan_pos_id_origin) return;
                if (op.operation_plan_id_origin && op.operation_plan_pos_id_origin) {
                    this.newTypeOfRepair.push(op);
                }
                if (!op.operationPlanPos) {
                    op.operationPlan.prodOrderPosOperation = { ...op, operationPlan: undefined, operationPlanPos: undefined };
                } else {
                    op.operationPlan.prodOrderPosOperation = { ...op, operationPlan: undefined, operationPlanPos: undefined, name: undefined };
                }
                op.operationPlanPos ? this.treeTableData.push(op.operationPlan) : this.selectedNewOtherRepairOp.push(op.operationPlan)
                if(!op.operationPlanPos) this.otherRepairTabCount++;
            })

            this.newTypeOfRepair.sort((a: any, b: any) => a.operation_plan_id_origin - b.operation_plan_id_origin);
            this.selectedProdOrderPos.prodOrderPosOperations!.forEach((op: any) => {
                if (!op.operationPlanPos) return;
                op.operationPlanPos.prodOrderPosOperation = { ...op, operationPlan: undefined, operationPlanPos: undefined };

                const opPlan2 = this.treeTableData.find((p: any) => p?.id == op.operationPlanPos?.operation_plan_id);
                if (opPlan2 && !opPlan2?.operationPlanPos) {
                    opPlan2.operationPlanPos = [];
                }

                if (opPlan2) {
                    const operationPlanPosTemp = opPlan2!.operationPlanPos!.find((k: any) => k.id == op.operationPlanPos.id)
                    if (!operationPlanPosTemp) opPlan2!.operationPlanPos!.push(op.operationPlanPos);
                }
            })
            this.newTypeOfRepairTable!.render();
        }

        if (this.modalType == 'add' && this.orderCustomId == false) {
            this.isShowMessage.emit({
                message: $localize`The ProdOrder custom-id is not generated, check the backend.`,
                type: 'error'
            });
            this.isCreateDialogOpen = false;
        } else this.isCreateDialogOpen = true;
        this.isLoading = false;
    }

    async generateCustommId(entity: string) {
        this.orderCustomId = await this._commonSrv.getEntity(`${entity}`).catch((e: any) => { });
    }

    async getPlanVisuStartDateProduction() {
        let url = `ProdOrderPosOperations?$select=id,start,end,status,status_plan,show_in_planvisu,machine_id&$filter=(status eq '${ProdOrderPosOperationStatus.PLANNED}' OR status eq '${ProdOrderPosOperationStatus.RELEASED}' OR status eq '${ProdOrderPosOperationStatus.PROPOSED}') and show_in_planvisu eq true and (item_id_tool eq ${ this.selectedItem.id })&$orderby=start asc&$expand=machine($select=id,name,custom_id;$filter=sectionActivatables/any(a:a/section eq '${ SectionActivatableTypes.PLANVISU }') and sectionActivatables/any(a:a/is_active eq true);$expand=sectionActivatables($select=section,is_active))`;
        this._commonSrv.get(url).subscribe({
            next: (response: any) => {
                let operationsData = response.value;
                let date: any = '';
                if(operationsData && operationsData.length > 0) {
                    for(let i = 0; i < operationsData.length; i++) {
                        if(operationsData[i].machine) {
                            date = operationsData[i].start;
                            break;
                        }
                    }
                }
                if(date && date != '') {
                    this.prodOrderPosData.release_date = new Date(date);
                    this.isDisableProdDate = true;
                } else {
                    this.isToolRepairProductionDateManual = true;
                    this.productiondateSubText = $localize`Manual`;
                    this.isDisableProdDate = false;
                }
            },
            error: (error: any) => {
                console.error("Error while getting Planvisu start date: ", error);
                this.isToolRepairProductionDateManual = true;
                this.productiondateSubText = $localize`Manual`;
                this.isDisableProdDate = false;
            },
        });
    }
    onSamplingRequiredChange(){
        if(this.prodOrderPosData.is_sampling_required){
            this.prodOrderPosData.is_sampling_done = this.prodOrderPosData.is_sampling_done;
        }else{
            this.prodOrderPosData.is_sampling_done = false
        }
    }
    async prepareDataForAddModal(): Promise<any> {
        await this.generateCustommId('ProdOrder');
        this.dialogTitle = `${$localize`Add Tool Order`} - ${this.orderCustomId}`;
        this.selectedTreeRowIds = {};

        this.prodOrderData = new ProdOrder().deserialize({});
        this.prodOrderData.custom_id = this.orderCustomId;
        this.prodOrderPosData = new ProdOrderPos().deserialize({});
        this.attachmentCount = 0;
        this.prodOrderPosData.item = this.selectedItem;
        this.prodOrderPosData.pos = 10;
        this.prodOrderPosData.quantity = 0;
        this.prodOrderPosData.label = ToolRepairLabelType.INTERNAL;
        this.prodOrderPosData.userCreator = this.authUser ? new User().deserialize(this.authUser) : new User().deserialize({});
        this.prodOrderPosData.userResponsible = new User().deserialize({});
        this.prodOrderPosData.toolSupplier = new Suppliers().deserialize({});
        this.userCreatorName = this.prodOrderPosData.userCreator ? (this.prodOrderPosData.userCreator?.name || '') : '';
        this.userResponsibleName = '';
        this.toolSupplierName = '';

        this.prodOrderPosData.created_at = new Date();
        this.prodOrderPosData.start = new Date();
        this.prodOrderPosData.release_date = new Date();
        this.prodOrderPosData.is_production_possible = true;
        this.prodOrderPosData.estimated_hours = 0;
        this.prodOrderPosData.notes = '';

        if(!this.isToolRepairProductionDateManual) await this.getPlanVisuStartDateProduction();
        if (this.selectedItem.prodOrderPos.length > 0) {
            this.prodOrderPosData.pos = parseInt(this.selectedItem.prodOrderPos[this.selectedItem.prodOrderPos.length - 1].pos) + 10;
        }

        this.openNewOtherRepairDialog();
    }

    getUtcDate(date: string) {
        const utcDate = new Date(date);
        return new Date(
            utcDate.getUTCFullYear(),
            utcDate.getUTCMonth(),
            utcDate.getUTCDate()
        );
    }

    async prepareDataForEditModal(): Promise<any> {
        this.isSaveOrUpdate = $localize`Update`;
        this.dialogTitle = `${$localize`Edit Repair Details`}`;
        this.prevTypeRepairs = [];
        this.prevOtherRepairs = [];
        this.prodOrderData = this.selectedProdOrderPos.prodOrder;
        this.selectedItem = this.selectedProdOrderPos.item;
        this.prodOrderPosData = { ...this.selectedProdOrderPos };
        this.isDisableProdDate = this.prodOrderPosData.is_prod_date_manual ? false : true;
        this.productiondateSubText = this.isDisableProdDate ? $localize`PlanVisu` : $localize`Manual`;

        this.prodOrderPosData.media = [];
        this.selectedProdOrderPos.media?.map((elm: any) => {
            this.prodOrderPosData.media.push(elm);
        });
        this.attachmentCount = this.prodOrderPosData.media.length;

        this.prodOrderPosData.created_at = this.getUtcDate(this.selectedProdOrderPos.created_at);
        this.prodOrderPosData.start = this.getUtcDate(this.selectedProdOrderPos.start);
        this.prodOrderPosData.release_date = this.getUtcDate(this.selectedProdOrderPos.release_date);

        this.prodOrderPosData.label = this.selectedProdOrderPos.label;
        this.prodOrderPosData.userCreator = this.selectedProdOrderPos.userCreator ? new User().deserialize(this.selectedProdOrderPos.userCreator) : new User().deserialize({});
        this.prodOrderPosData.userResponsible = this.selectedProdOrderPos.userResponsible ? new User().deserialize(this.selectedProdOrderPos.userResponsible) : new User().deserialize({});
        this.prodOrderPosData.toolSupplier = this.selectedProdOrderPos.toolSupplier ? new Suppliers().deserialize(this.selectedProdOrderPos.toolSupplier) : new Suppliers().deserialize({});
        this.userCreatorName = this.selectedProdOrderPos.userCreator ? this.selectedProdOrderPos.userCreator.name : '';
        this.userResponsibleName = this.selectedProdOrderPos.userResponsible ? this.selectedProdOrderPos.userResponsible.name : '';
        this.toolSupplierName = this.selectedProdOrderPos.toolSupplier ? this.selectedProdOrderPos.toolSupplier.name : '';
        this.prodOrderPosData.prodOrderPosOperations = this.selectedProdOrderPos.prodOrderPosOperations;

        if (this.prodOrderPosData.prodOrderPosOperations.length > 0) {
            this.prodOrderPosData.prodOrderPosOperations.forEach((elm: ProdOrderPosOperation) => {
                if (elm.operation_plan_id_origin != null && elm.operation_plan_pos_id_origin != null) {
                    this.selectedNewTypeRepairOp.push(elm);
                    this.typeOfRepairTabCount++;
                    this.prevTypeRepairs.push(elm);
                    this.selectedTreeRowIds[elm.operation_plan_pos_id_origin] = true;
                } else if (elm.operation_plan_id_origin != null && elm.operation_plan_pos_id_origin == null && !this.isPlannedOrder) {
                    let tempData = this.allRepairTypeList.find((elem: any) => elem.id == elm.operation_plan_id_origin);
                    this.prevOtherRepairs.push(elm);
                    this.selectedNewOtherRepairOp.push({
                        name: elm.name,
                        operation_plan_id_origin: elm.operation_plan_id_origin,
                        custom_id: tempData ? tempData.custom_id : '',
                        is_auto_created: elm.is_automatic_created_repair
                    });
                    this.otherRepairTabCount++;
                }
            });
            this.isPlannedOrder ? this.newTypeOfRepairTable : this.typeOfRepairTree?.render();
        }

        if (this.selectedNewOtherRepairOp.length == 0) {
            this.selectedNewOtherRepairOp.push({
                name: '',
                custom_id: '',
                operation_plan_id_origin: null,
                is_auto_created: false
            });
        }
    }

    async prepareDataForViewModal(): Promise<any> {
        this.dialogTitle = `${$localize`Repair History`}`;
        await this.modifyRepairTables();
        this.prevTypeRepairs = [];
        this.prevOtherRepairs = [];
        this.prodOrderData = this.selectedProdOrderPos.prodOrder;
        this.selectedItem = this.selectedProdOrderPos.item;
        this.prodOrderPosData = { ...this.selectedProdOrderPos };
        this.prodOrderPosData.media = [];
        this.selectedProdOrderPos.media?.map((elm: any) => {
            this.prodOrderPosData.media.push(elm);
        });
        this.attachmentCount = this.prodOrderPosData.media.length;

        this.isDisableProdDate = this.prodOrderPosData.is_prod_date_manual ? false : true;
        this.productiondateSubText = this.isDisableProdDate ? $localize`PlanVisu` : $localize`Manual`;

        this.prodOrderPosData.created_at = this.getUtcDate(this.selectedProdOrderPos.created_at);
        this.prodOrderPosData.start = this.getUtcDate(this.selectedProdOrderPos.start);
        this.prodOrderPosData.release_date = this.getUtcDate(this.selectedProdOrderPos.release_date);

        this.prodOrderPosData.userCreator = this.selectedProdOrderPos.userCreator ? new User().deserialize(this.selectedProdOrderPos.userCreator) : new User().deserialize({});
        this.prodOrderPosData.userResponsible = this.selectedProdOrderPos.userResponsible ? new User().deserialize(this.selectedProdOrderPos.userResponsible) : new User().deserialize({});
        this.prodOrderPosData.toolSupplier = this.selectedProdOrderPos.toolSupplier ? new Suppliers().deserialize(this.selectedProdOrderPos.toolSupplier) : new Suppliers().deserialize({});
        this.userCreatorName = this.selectedProdOrderPos.userCreator ? this.selectedProdOrderPos.userCreator.name : '';
        this.userResponsibleName = this.selectedProdOrderPos.userResponsible ? this.selectedProdOrderPos.userResponsible.name : '';
        this.toolSupplierName = this.selectedProdOrderPos.toolSupplier ? this.selectedProdOrderPos.toolSupplier.name : '';
        this.prodOrderPosData.prodOrderPosOperations = this.selectedProdOrderPos.prodOrderPosOperations;

        if (this.prodOrderPosData.prodOrderPosOperations.length > 0) {
            this.isAllRepairDone = this.selectedProdOrderPos.status == ProdOrderPosStatus.CLOSED ? true : false;
            this.isAllOrderRepairDoneButtonDisabled = true;
            this.treeTableData = [];
            this.selectedNewOtherRepairOp = [];
            this.selectedTreeRowIds = {};

            this.prodOrderPosData.prodOrderPosOperations.forEach((elm: any) => {
                if (elm.operation_plan_id_origin != null && elm.operation_plan_pos_id_origin != null) {
                    if (elm.operationPlan && elm.operationPlanPos) {
                        const opPlan = this.treeTableData.findIndex((p: any) => p.id == elm.operation_plan_id_origin);
                        if (opPlan > -1 && opPlan < this.treeTableData.length) {
                            this.treeTableData[opPlan].operationPlanPos.push({
                                ...elm.operationPlanPos,
                                is_repair_completed: elm.is_repair_completed,
                                repair_completed_date: elm.repair_completed_date,
                                repair_completed_by: elm.user ? elm.user.name : ''
                            });
                            this.typeOfRepairTabCount++;
                        } else {
                            let temp: any = elm.operationPlan;
                            temp.operationPlanPos.push({
                                ...elm.operationPlanPos,
                                is_repair_completed: elm.is_repair_completed,
                                repair_completed_date: elm.repair_completed_date,
                                repair_completed_by:elm.user ? elm.user.name : ''
                            });
                            temp.prodOrderPosOperation = { ...elm, operationPlan: undefined, operationPlanPos: undefined };
                            this.treeTableData.push(temp);
                            this.typeOfRepairTabCount++;
                        }
                    }
                } else if (elm.operation_plan_id_origin != null && elm.operation_plan_pos_id_origin == null) {
                    this.selectedNewOtherRepairOp.push({
                        prodOrderPosOperation: elm,
                        name: elm.name,
                        operation_plan_id_origin: elm.operation_plan_id_origin,
                        custom_id: elm.operationPlan ? elm.operationPlan.custom_id : '',
                        is_auto_created: elm.is_automatic_created_repair
                    });
                    this.otherRepairTabCount++;
                }
            });
        }
        this.typeOfRepairTree?.render();
    }

    handleRepairTypeChange(event: any, rowIndex: any) {
        if (event.detail) {
            const selectedPlanId = event.detail.item?.id;
            const repair = this.selectedNewOtherRepairOp.find((plan: any) => plan.operation_plan_id_origin == selectedPlanId);

            const tempData = this.allRepairTypeList.find((elm: any) => elm.id == selectedPlanId);
            const name = this.selectedNewOtherRepairOp[rowIndex].name != '' ? this.selectedNewOtherRepairOp[rowIndex].name : '';
            this.selectedNewOtherRepairOp[rowIndex] = {
                name: '',
                operation_plan_id_origin: parseInt(selectedPlanId),
                custom_id: tempData ? tempData.custom_id : '',
                is_auto_created: false
            };
            this.otherRepairTabCount++;
        } else if (event.target.value != '') {
            const name = event.target.value;
            const tempData: any = this.allRepairTypeList.find((elm: any) => elm.custom_id == name);
            this.selectedNewOtherRepairOp[rowIndex] = {
                name: '',
                operation_plan_id_origin: parseInt(tempData?.id),
                custom_id: tempData ? tempData.custom_id : '',
                is_auto_created: false
            };
            this.otherRepairTabCount++;
        } else {
            this.selectedNewOtherRepairOp[rowIndex] = {
                name: '',
                operation_plan_id_origin: null,
                custom_id: '',
                is_auto_created: false
            };
        }
        this.childComponentGrid?.render();
    }

    handleRepairChange(event: any, rowIndex: any) {
        const name = event.target.value;
        if (this.selectedNewOtherRepairOp[rowIndex].custom_id != '') this.selectedNewOtherRepairOp[rowIndex].name = name;
        else {
            this.showModalToast($localize`Select the operation plan first!`, 'error');
            this.selectedNewOtherRepairOp[rowIndex] = {
                name: '',
                operation_plan_id_origin: null,
                custom_id: '',
                is_auto_created: false
            };
        }
        this.childComponentGrid?.render();
    }

    handleDeleteRepair(event: any, rowIndex: any) {
        let blankEntry: boolean = false;
        if (rowIndex > -1 && rowIndex < this.selectedNewOtherRepairOp.length) {
            if(this.selectedNewOtherRepairOp[rowIndex].name == '' && this.selectedNewOtherRepairOp[rowIndex].custom_id == '') {
                blankEntry = true;
            }
            this.selectedNewOtherRepairOp.splice(rowIndex, 1);
            this.childComponentGrid?.render();
            if(!blankEntry) this.otherRepairTabCount--;
        }
    }

    openNewOtherRepairDialog() {
        let isValid: boolean = true;
        for (var i = 0; i < this.selectedNewOtherRepairOp.length; i++) {
            if (this.selectedNewOtherRepairOp[i]?.custom_id == '' || this.selectedNewOtherRepairOp[i].name?.trim() == '') {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            this.selectedNewOtherRepairOp.push({
                name: '',
                custom_id: '',
                operation_plan_id_origin: null,
                is_auto_created: false
            });
            this.childComponentGrid?.render();
        } else this.showModalToast($localize`Fill the previous fields!`, 'error');
    }

    tabNavChanged(event: any) {
        this.selectedTab = event.detail.tab.id;
        if (this.selectedTab == 'type_of_repair_tab') {
            this.selectedTreeRowIds = {};
            this.selectedNewTypeRepairOp.forEach((elm: any) => {
                this.selectedTreeRowIds[elm.operation_plan_pos_id_origin] = true;
            });
        }
    }

    inputValueRestrict(event: any, value: any) {
        if (event.target.value != value) {
            event.target.value = value;
        }
    }

    inputInvalidEntryRestrict(event: any, value: any) {
        if (!event.target.value) {
            value = "";
        } else if (event.target.value != value) {
            event.target.value = value;
        }
    }

    onFormSubmit(form: NgForm) {
        if (!form.valid) {
            this.disableButtonDuringRequest = false;
            return;
        }
    }

    onUpdateValue(data: any, field: string, isRadio: boolean = false) {
        switch (field) {
            case 'created_at':
                this.prodOrderPosData.created_at = data.target.value;
                break;
            case 'start_date':
                this.prodOrderPosData.start = data.target.value;
                this.isStartDateUpdate = true;
                break;
            case 'release_date':
                this.prodOrderPosData.release_date = data.target.value;
                this.isReleaseDateUpdate = true;
                break;
            case 'user_creator':
                var user: any = {};
                if (data.detail) {
                    user = this.allUserList.find(
                        elm => elm.id == data.detail.item.id
                    );
                    this.prodOrderPosData.user_id_creator = user.id;
                    this.userCreatorName = data.detail.item.text;
                } else this.userCreatorName = '';
                break;
            case 'user_responsible':
                var user: any = {};
                if (data.detail) {
                    user = this.allUserList.find(
                        elm => elm.id == data.detail.item.id
                    );
                    this.prodOrderPosData.user_id_responsible = user.id;
                    this.userResponsibleName = data.detail.item.text;
                } else this.userResponsibleName = '';
                break;
            case 'is_production_possible':
                this.prodOrderPosData.is_production_possible = isRadio;
                break;
            case 'label':
                this.prodOrderPosData.label = ToolRepairLabelTypeClass.getStateValue(data.target.text);
                break;
            case 'notes':
                this.prodOrderPosData.notes = data.target.value;
                break;
            case 'tool_supplier':
                var supplier: any = {};
                if (data.detail) {
                    supplier = this.allSupplierList.find(
                        elm => elm.id == data.detail.item.id
                    );
                    this.prodOrderPosData.supplier_id_tool = supplier.id;
                    this.toolSupplierName = data.detail.item.text;
                } else this.toolSupplierName = '';
                break;
            default:
                break;
        }
    }

    onSelectionChange(event: any, field: string) {
        const selectedItem = event.target.value;
        if (selectedItem) {
            if(field == 'tool_supplier') {
                var supplier = this.allSupplierList.find(
                    elm => elm.name == selectedItem
                );
                this.toolSupplierName = selectedItem;
                this.prodOrderPosData.supplier_id_tool = supplier?.id;
            } else {
                var user: any = this.allUserList.find(
                    elm => elm.name == selectedItem
                );
                if (user && field == 'user_creator') {
                    this.userCreatorName = selectedItem;
                    this.prodOrderPosData.user_id_creator = user?.id;
                }
                if (user && field == 'user_responsible') {
                    this.userResponsibleName = selectedItem;
                    this.prodOrderPosData.user_id_responsible = user?.id;
                }
            }
        }
    }

    onAttachmentChanges(data: any, type: string) {
        switch (type) {
            case 'fileCount':
                this.attachmentCount = data;
                break;
            case 'onUpload':
                this.tempFiles = data;
                break;
            case 'onDelete':
                this.deletedSavedFiles = data;
                break;
            case 'onStandardSelect':
                this.selectedStandardFile = data;
                break;
            default:
                break;
        }
    }

    setTypeRepairOperaitons(event: any) {
        this.selectedNewTypeRepairOp = [];
        this.typeOfRepairTabCount = 0;
        event.forEach((elm: any) => {
            let temp: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({});
            temp.name = elm.name;
            temp.operation_plan_id_origin = elm.operation_plan_id;
            temp.operation_plan_pos_id_origin = elm.id;
            this.selectedNewTypeRepairOp.push(temp);
            this.typeOfRepairTabCount++;
        });
    }

    async checkValidDataBeforeSaving(): Promise<any> {
        let isValid: boolean = false;
        if (this.selectedNewTypeRepairOp.length > 0) {
            for (let i = 0; i < this.selectedNewTypeRepairOp.length; i++) {
                if (this.selectedNewTypeRepairOp[i].operation_plan_id_origin == null || this.selectedNewTypeRepairOp[i].operation_plan_id_origin == undefined)
                    this.selectedNewTypeRepairOp.splice(i, 1);
            }
        }

        const releaseDate = !this.prodOrderPosData.release_date ? null : this.prodOrderPosData.release_date instanceof Date ? this.prodOrderPosData.release_date : moment(this.prodOrderPosData.release_date, 'DD.MM.YYYY').toDate();
        const startDate = !this.prodOrderPosData.start ? null : this.prodOrderPosData.start instanceof Date ? this.prodOrderPosData.start : moment(this.prodOrderPosData.start, 'DD.MM.YYYY').toDate();

        const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const releaseDateWithoutTime = releaseDate ? new Date(releaseDate.getFullYear(), releaseDate.getMonth(), releaseDate.getDate()) : null;
        const startDateWithoutTime = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()) : null;

        let generalCheck = this.prodOrderData.custom_id &&
            this.userCreatorName !== '' &&
            this.userResponsibleName !== '' &&
            startDateWithoutTime &&
            releaseDateWithoutTime &&
            (this.selectedNewTypeRepairOp.length > 0 || this.selectedNewOtherRepairOp.length > 0)
        
        let isRepairsFound: boolean = false;
        for (let i = 0; i < this.selectedNewTypeRepairOp.length; i++) {
            let type = this.selectedNewTypeRepairOp[i];
            if (type.operation_plan_id_origin && type.operation_plan_pos_id_origin) {
                // isValid = true;
                isRepairsFound = true;
            } else {
                // isValid = false;
                isRepairsFound = false;
            }
        }

        if (this.selectedNewTypeRepairOp.length > 0 && (this.selectedNewOtherRepairOp.length == 1 && this.selectedNewOtherRepairOp[0].custom_id == '' && this.selectedNewOtherRepairOp[0]?.name?.trim() == '')) {
            // isValid = true;
            isRepairsFound = true;
        } else if (this.selectedNewTypeRepairOp.length == 0 && (this.selectedNewOtherRepairOp.length == 1 && this.selectedNewOtherRepairOp[0].custom_id == '' && this.selectedNewOtherRepairOp[0]?.name?.trim() == '')) {
            // isValid = false;
            isRepairsFound = false;
        } else {
            for (let i = 0; i < this.selectedNewOtherRepairOp.length; i++) {
                let type = this.selectedNewOtherRepairOp[i];
                if (type.custom_id != '' && type.name != '') {
                    // isValid = true;
                    isRepairsFound = true;
                } else {
                    // isValid = false;
                    isRepairsFound = false;
                    // return isValid;
                }
            }
        }
        
        if (generalCheck && isRepairsFound) {
            let checkDates: boolean = releaseDateWithoutTime && startDateWithoutTime ? startDateWithoutTime.getTime() <= releaseDateWithoutTime.getTime() : true;
            if(checkDates) {
                isValid = true;
            } else {
                isValid = false;
                this.isInvalidProdDate = true;
                this.prodDateDialogTitle = $localize`Confirmation`;
            }
        } else isValid = false;
        return isValid;
    }

    saveProdDate() {
        this.closeProdDateDialog();
        this.startSavingprocedure();
    }

    async saveNewToolRepair(): Promise<any> {
        if(this.modalType == 'view') this.saveOnlyProdOrderPos(this.prodOrderPosData)
        else {
            try {
                let checkValidity: boolean = await this.checkValidDataBeforeSaving();
                if (checkValidity) {
                    this.startSavingprocedure();
                } else {
                    let fullMsg: string = '';
                    let errorMessage: string = '';
                    let fields: string = '';
    
                    errorMessage = $localize`Required data missing`;
                    fields = '';
                    if (!this.prodOrderData.custom_id) fields = $localize`ProdOrder custom-id`;
                    if (this.userCreatorName == '') fields = $localize`Req. Noted`;
                    if (this.userResponsibleName == '') fields = (fields != '' ? fields + ', ' : '') + $localize`Responsible`;
                    if (!this.prodOrderPosData.start) fields = (fields != '' ? fields + ', ' : '') + $localize`Start date`;
                    if (!this.prodOrderPosData.release_date) fields = (fields != '' ? fields + ', ' : '') + $localize`Start production date`;
    
                    if (!this.isPlannedOrder) {
                        let repairCheck = this.selectedNewTypeRepairOp.length == 0 && (this.selectedNewOtherRepairOp.length == 0 || this.selectedNewOtherRepairOp.length == 1 && this.selectedNewOtherRepairOp[0].custom_id == '' && this.selectedNewOtherRepairOp[0].name?.trim() == '');
                        if (repairCheck) fields = (fields != '' ? fields + ', ' : '') + $localize`Repairs`;
    
                        let otherRepairCheck = this.selectedNewOtherRepairOp.length == 0 || this.selectedNewOtherRepairOp.length == 1 && this.selectedNewOtherRepairOp[0].custom_id == '' && this.selectedNewOtherRepairOp[0].name?.trim() == '';
                        if (!otherRepairCheck) {
                            for (let i = 0; i < this.selectedNewOtherRepairOp.length; i++) {
                                let type = this.selectedNewOtherRepairOp[i];
                                const nameTrimmed = type.name?.trim() || '';
                                const check = (type.custom_id != '' && nameTrimmed == '') || (type.custom_id == '' && nameTrimmed == '') || (type.custom_id == '' && nameTrimmed != '');
    
                                if (check) {
                                    fields = (fields != '' ? fields + ', ' : '') + $localize`Other Repairs`;
                                    break;
                                }
                            }
                        }
                    }
                    fullMsg = fields != '' ? `${errorMessage} (${fields})` : '';
    
                    if (this.prodOrderPosData.start && this.prodOrderPosData.release_date) {
                        let tempMsg: string = '';
                        const releaseDate = this.prodOrderPosData.release_date instanceof Date ? this.prodOrderPosData.release_date : moment(this.prodOrderPosData.release_date, 'DD.MM.YYYY').toDate();
                        const startDate = this.prodOrderPosData.start instanceof Date ? this.prodOrderPosData.start : moment(this.prodOrderPosData.start, 'DD.MM.YYYY').toDate();
    
                        const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
                        const releaseDateWithoutTime = new Date(releaseDate.getFullYear(), releaseDate.getMonth(), releaseDate.getDate());
                        const startDateWithoutTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
                        // if(this.modalType == 'add' && startDateWithoutTime.getTime() < today.getTime()) tempMsg = $localize`Invalid Start Date`;
                        // if (startDateWithoutTime.getTime() > releaseDateWithoutTime.getTime()) tempMsg = (tempMsg !== '' ? tempMsg + ', ' : '') + $localize`Invalid Start Production Date`;
    
                        fullMsg = (fullMsg != '' ? fullMsg + '\n\n' : '') + tempMsg;
                    }
    
                    if(fullMsg) this.showModalToast(fullMsg, 'error');
                }
            } catch (err) {
                this.isLoading = false;
                console.log(err);
                this.showModalToast(this.localization.someThingWentWrong, 'error');
            }
        }    
    }

    async startSavingprocedure(): Promise<any> {
        this.isLoading = true;
        let prodOrder = new ProdOrder().deserialize(this.prodOrderData);
        if (this.modalType == 'add') {
            this.prodOrderData.order_type = ProdOrderType.MAINTENANCE;
            prodOrder = await this.saveProdOrder();
        } else if (this.modalType == 'edit') prodOrder = await this.saveProdOrder();

        this.prodOrderPosData.prodOrder = prodOrder;
        let prodOrderPos = await this.saveProdOrderPos();

        if (!this.isPlannedOrder) await this.saveProdOrderPosOperations(prodOrderPos);
        else await this.saveProdOrderPosOperationsForPlannedOrder(prodOrderPos);
        await this.saveItemAttachments(prodOrderPos);
    }

    saveOnlyProdOrderPos(prodOrderPos:any){
        let data = {
            'is_sampling_required' : prodOrderPos.is_sampling_required,
            'is_sampling_done' : prodOrderPos.is_sampling_done,
        }
        this.isLoading = true
        this._commonSrv.patch(`ProdOrderPos(${this.prodOrderPosData.id})`, data).subscribe({
            next:(res)=>{
                this.isSaveClicked.emit(true);
                this.closeCreateDialog();
            },
            error: (err) => {
				this.isLoading = false;
			},
        })
    }
    async saveProdOrder(): Promise<any> {
        this.isLoading = true;
        if (this.modalType == 'add') {
            return new Promise((resolve, reject) => {
                this._commonSrv.post(`ProdOrders`, this.prodOrderData.toOdata()).subscribe({
                    next: (response: any) => {
                        resolve(new ProdOrder().deserialize(response));
                    },
                    error: (e) => {
                        console.error("Error saving ProdOrder: ", e);
                        reject(e);
                    },
                });
            });
        }
    }

    getLocaleDateTime(date: any, format: string= 'DD.MM.YYYY') {
        if (date) {
            const resultDate = moment(date, format);
            resultDate.set({
                hour: moment().hour(),
                minute: moment().minute(),
                second: moment().second()
            });
            return resultDate.toISOString();  // Returns ISO 8601 with timezone
        } else return null;
    }

    async saveProdOrderPos(): Promise<any> {
        this.isLoading = true;
        this.prodOrderPosData.label = this.prodOrderPosData.label;
        this.prodOrderPosData.userCreator = this.allUserList.find(
            elm => elm.name == this.userCreatorName
        );
        this.prodOrderPosData.userResponsible = this.allUserList.find(
            elm => elm.name == this.userResponsibleName
        );
        if(this.prodOrderPosData.label == this.label.EXTERNAL && this.toolSupplierName != '') {
            this.prodOrderPosData.toolSupplier = this.allSupplierList.find(
                elm => elm.name == this.toolSupplierName
            );
        } 

        this.prodOrderPosData.is_prod_date_manual = !this.isDisableProdDate ? true : false;
        
        return new Promise((resolve, reject) => {
            if (this.modalType == 'add') {
                let postData: any = this.prodOrderPosData.toOdata();
                postData.created_at = this.getLocaleDateTime(this.prodOrderPosData.created_at);
                postData.start = this.getLocaleDateTime(this.prodOrderPosData.start);
                postData.release_date = this.getLocaleDateTime(this.prodOrderPosData.release_date);
                postData.actual_time = null;
                postData.cost = 0;
               
                this._commonSrv.post(`ProdOrderPos`, postData).subscribe({
                    next: (response: any) => {
                        resolve(response);
                    },
                    error: (e) => {
                        console.error("Error saving ProdOrderPos: ", e);
                        reject(e);
                    },
                });
            } else {
                let data = new ProdOrderPos().deserialize({
                    actual_time: this.prodOrderPosData.actual_time ?? null,
                    cost: this.prodOrderPosData.cost ?? 0,
                    estimated_hours: this.prodOrderPosData.estimated_hours,
                    is_production_possible: this.prodOrderPosData.is_production_possible,
                    label: this.prodOrderPosData.label,
                    notes: this.prodOrderPosData.notes,
                    pos: this.prodOrderPosData.pos,
                    release_date: this.isReleaseDateUpdate ? this.getLocaleDateTime(this.prodOrderPosData.release_date) : this.prodOrderPosData.release_date,
                    start: this.isStartDateUpdate ? this.getLocaleDateTime(this.prodOrderPosData.start) : this.prodOrderPosData.start,
                    user_id_creator: this.prodOrderPosData.user_id_creator,
                    user_id_responsible: this.prodOrderPosData.user_id_responsible,
                    supplier_id_tool: this.prodOrderPosData.supplier_id_tool,
                    status: this.isAllRepairDone ? ProdOrderPosStatus.CLOSED : ProdOrderPosStatus.PLANNED,
                    status_plan: this.isAllRepairDone ? ProdOrderPosStatus.CLOSED : ProdOrderPosStatus.PLANNED,
                    end: this.isAllRepairDone ? this.getLocaleDateTime(new Date()) : null,
                    is_sampling_required : this.prodOrderPosData.is_sampling_required,
                    is_sampling_done : this.prodOrderPosData.is_sampling_done
                });

                if(this.isOrderHistory) {
                    data.end = this.prodOrderPosData.end;
                    data.status = ProdOrderPosStatus.CLOSED;
                    data.status_plan = ProdOrderPosStatus.CLOSED;
                }

                this._commonSrv.put(`ProdOrderPos(${this.prodOrderPosData.id})`, data).subscribe({
                    next: (response: any) => {
                        resolve(response);
                    },
                    error: (e) => {
                        console.error("Error saving ProdOrderPos: ", e);
                        reject(e);
                    },
                });
            }
        });
    }

    async saveProdOrderPosOperations(prodOrderPos: any): Promise<any> {
        this.isLoading = true;
        let currentPos: any = 10;
        let newProdOrderPosOperations: ProdOrderPosOperation[] = [];
        let requests: ODataBatchCall[] = [];
        let otherRepairList = this.selectedNewOtherRepairOp;

        if (this.modalType == 'edit') {
            this.prevTypeRepairs.forEach((prevRepair: any) => {
                let temp = this.selectedNewTypeRepairOp.find((newRepair: any) => newRepair.operation_plan_id_origin == prevRepair.operation_plan_id_origin && newRepair.operation_plan_pos_id_origin == prevRepair.operation_plan_pos_id_origin);
                if (temp) {
                    let rowIndex = this.selectedNewTypeRepairOp.findIndex((newRepair: any) => newRepair.operation_plan_id_origin == prevRepair.operation_plan_id_origin && newRepair.operation_plan_pos_id_origin == prevRepair.operation_plan_pos_id_origin);
                    if (rowIndex > -1 && rowIndex < this.selectedNewTypeRepairOp.length) this.selectedNewTypeRepairOp.splice(rowIndex, 1);
                } else {
                    let call = new ODataBatchCall(
                        requests.length,
                        "delete",
                        `\/odata\/ProdOrderPosOperations(${prevRepair.id})`
                    );
                    requests.push(call);
                }
            });

            this.prevOtherRepairs.forEach((elm: any) => {
                let temp = this.selectedNewOtherRepairOp.find((elem: any) => elem.operation_plan_id_origin == elm.operation_plan_id_origin);
                if (temp) {
                    if (temp.name != elm.name) {
                        let call = new ODataBatchCall(
                            requests.length,
                            "put",
                            `\/odata\/ProdOrderPosOperations(${elm.id})`
                        );
                        call.body = {
                            name: temp.name
                        };
                        requests.push(call);
                    }

                    let rowIndex = this.selectedNewOtherRepairOp.findIndex((elem: any) => elem.operation_plan_id_origin == elm.operation_plan_id_origin);
                    if (rowIndex > -1 && rowIndex < this.selectedNewOtherRepairOp.length) otherRepairList.splice(rowIndex, 1);
                } else if (!temp) {
                    let call = new ODataBatchCall(
                        requests.length,
                        "delete",
                        `\/odata\/ProdOrderPosOperations(${elm.id})`
                    );
                    requests.push(call);
                }
            });

            const prodOrderPosOperations = this.selectedProdOrderPos.prodOrderPosOperations ?? [];
            const maxPos = prodOrderPosOperations.reduce((max: number, operation: any) => {
                const pos = parseInt(operation.pos ?? '0');
                return pos > max ? pos : max;
            }, 0);
            currentPos = maxPos + 10;
        }

        this.selectedNewTypeRepairOp.forEach((elm: any) => {
            elm.prod_order_pos_id = prodOrderPos.id;
            elm.pos = currentPos;
            elm.te = 0;
            elm.tr = 0;
            elm.cavity = 1;
            elm.registered_quantity = 0;
            elm.is_changed = 0;
            elm.send_ahead_quantity = 0;
            elm.transfer_time = 0;
            elm.operator_usage_factor = 1;
            elm.is_urgent_delivery = 0;
            elm.has_labels_prepared = 0;
            elm.is_repair_completed = false;
            elm.status = ProdOrderPosOperationStatus.PLANNED;
            elm.quantity = 0;

            if(this.isOrderHistory) {
                elm.status = ProdOrderPosOperationStatus.CLOSED;
                elm.is_repair_completed = true;
                elm.repair_completed_date = prodOrderPos.end ;
                elm.user_id = this.authUser.id;
            }

            newProdOrderPosOperations.push(elm);
            currentPos += 10;
        });

        otherRepairList = otherRepairList.map((elm: any) => {
            if (elm.name !== '' && elm.custom_id !== '') {
                const newElm = new ProdOrderPosOperation().deserialize({
                    name: elm.name,
                    pos: currentPos,
                    te: 0,
                    tr: 0,
                    cavity: 1,
                    registered_quantity: 0,
                    is_changed: 0,
                    send_ahead_quantity: 0,
                    transfer_time: 0,
                    operator_usage_factor: 1,
                    is_urgent_delivery: 0,
                    has_labels_prepared: 0,
                    operation_plan_id_origin: elm.operation_plan_id_origin,
                    prod_order_pos_id: prodOrderPos.id,
                    is_repair_completed: false,
                    status: ProdOrderPosOperationStatus.PLANNED,
                    quantity: 0
                });

                if(this.isOrderHistory) {
                    newElm.status = ProdOrderPosOperationStatus.CLOSED;
                    newElm.is_repair_completed = true;
                    newElm.repair_completed_date = prodOrderPos.end ;
                    newElm.user_id = this.authUser.id;
                }

                newProdOrderPosOperations.push(newElm);
                currentPos += 10;
                return newElm;
            } else return null;
        });

        newProdOrderPosOperations.forEach((operation: any) => {
            operation.prod_order_pos_id = prodOrderPos.id;
            let call = new ODataBatchCall(
                requests.length,
                "post",
                `\/odata\/ProdOrderPosOperations`
            );
            let tempPos = operation.toOdata();
            call.body = tempPos;
            requests.push(call);
        });

        if (requests) {
            return new Promise((resolve, reject) => {
                this._commonSrv["post"]("$batch", {
                    requests: requests,
                }).subscribe({
                    next: (response: any) => {
                        resolve(response);
                    },
                    error: (e: any) => {
                        console.error("Error saving ProdOrderPosOperations: ", e);
                        reject(e);
                    },
                });
            });
        }
    }
    async saveProdOrderPosOperationsForPlannedOrder(prodOrderPos: any): Promise<any> {
        this.isLoading = true;
        let requests: ODataBatchCall[] = [];

        let isAutoRepair: boolean = false;
        let isComplete: boolean = false;
        let autoRepairIds: number[] = [];

        if (this.modalType == 'edit') {
            this.updatedOperationdata.forEach((elm: any) => {
                let call = new ODataBatchCall(
                    requests.length,
                    "put",
                    `\/odata\/ProdOrderPosOperations(${elm.prodOrderPosOperationsId})`
                );
                call.body = {
                    is_repair_completed: elm.isRepairCompleted,
                    repair_completed_date: elm.completedDate,
                    user_id: elm.userId
                };
                requests.push(call);

                if (elm.is_auto_created && elm.isRepairCompleted) {
                    isAutoRepair = true;
                    isComplete = true;
                    const lastDigit = elm.name?.match(/\d+$/)?.[0];

                    if (lastDigit) {
                        autoRepairIds.push(parseInt(lastDigit, 10));
                    }
                }
            });
        }
        return new Promise((resolve, reject) => {
            this._commonSrv["post"]("$batch", {
                requests: requests,
            }).subscribe({
                next: (response: any) => {
                    if (autoRepairIds.length > 0) this.callV10Api(autoRepairIds);
                    resolve(response);
                },
                error: (e: any) => {
                    console.error("Error saving ProdOrderPosOperations: ", e);
                    reject(e);
                },
            });
        });
    }

    callV10Api(repairType: any) {
        let tool = new Item().deserialize(this.selectedItem);
        this._commonSrv.getDataFromV10(`base_visu/php/base_visu_data_service.php?service=update_shot_next_maintenance&tool_nr=${tool.custom_id}&repair_type=${repairType}`).subscribe({
            next: (response: any) => {
                if(response == 1) console.log("updated v10 shot data successfully");
                else console.error("Error while updating shot data in v10");
            },
            error: (error: any) => {
                console.error("Error while updating shot data in v10: ", error);
            },
        });
    }

    async saveItemAttachments(prodOrderPos: ProdOrderPos): Promise<void> {
        try {
            this.isLoading = true;
            if (this.tempFiles && this.tempFiles.length > 0) await this.uploadTempFiles(prodOrderPos);
            if (this.deletedSavedFiles && this.deletedSavedFiles.length > 0) await this.deleteSavedAttachments();
            // if (this.selectedStandardFile && this.selectedStandardFile.name) await this.setStandardImage();
        } catch (error) {
            console.error("Error during file operations: ", error);
        } finally {
            if (this.modalType == 'add') this._toastSrv.showToast(this.localization.recordSavedSuccessfully, 'success');
            else if (this.modalType == 'edit') {
                if (!this.isPlannedOrder) {
                    this.isShowMessage.emit({
                        message: this.localization.recordSavedSuccessfully,
                        type: 'success'
                    });
                } else {
                    this._toastSrv.showToast(this.localization.recordSavedSuccessfully, 'success');
                }
            }

            this.isSaveClicked.emit(true);
            this.closeCreateDialog();
        }
    }

    async setStandardImage(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this._commonSrv.post(`media/update/${this.selectedStandardFile.id}`, this.selectedStandardFile, false).subscribe({
                next: () => resolve(true),
                error: () => reject(false)
            });
        });
    }

    getFilesByProdOrderPos() {
        this.files = [];
        this.isLoading = true;
        this._commonSrv.get(`media/ProdOrderPos/` + 1, false).subscribe({
            next: async (response: any) => {
                var file_arr = response.media;
                for (const file of file_arr) {
                    file.isFromDB = true;
                    file.type = "Complete";
                    file.state = "Complete";
                    file.progress = 100;
                    file.url = file.path;
                    file.description = "Last modified: " + file.created_at + ", size: " + file.size;
                    this.files.push(file);
                }
                this.isLoading = false;
            },
            error: e => {
                this.isLoading = false;
            },
        });
    }

    closeCreateDialog() {
        this.isLoading = false;
        this.isCloseClicked.emit(true);
        this.form?.reset();
    }

    fileDropped(e: any): void {
        e.preventDefault();
        const addedFiles = e.dataTransfer.files;
        this.formatFiles(addedFiles);
    }

    fileUpload(event: any): void {
        const addedFiles = event.detail.files;
        this.formatFiles(addedFiles);
    }

    formatFiles(addedFiles: any) {
        for (let i = 0; i < addedFiles.length; i++) {
            const file = {
                name: addedFiles[i].name,
                lastModified: addedFiles[i].created_at,
                size: addedFiles[i].size,
                progress: 100,
                type: "Ready",
                state: "Ready",
                file: addedFiles[i],
                isFromDB: false,
                description:
                    "Last modified: " +
                    addedFiles[i].lastModifiedDate +
                    ", size: " +
                    addedFiles[i].size,
            };
            const isExists = this.files.find((file: any) => file.name === addedFiles[i].name);
            !isExists && this.files.push(file);
        }
    }

    uploadTempFiles(prodOrderPos: ProdOrderPos): Promise<void> {
        return new Promise((resolve, reject) => {
            let count = 0;
            let notUploadedCount: number = 0;
            let temp = new ProdOrderPos().deserialize(prodOrderPos);

            this.tempFiles.forEach((file: any, index: number) => {
                if (temp) {
                    const formData = new FormData();
                    formData.append("id", temp?.id + "");
                    formData.append("model", "ProdOrderPos");
                    formData.append("media", file);

                    this._commonSrv.post("media/upload", formData, false).subscribe({
                        next: (res: any) => {
                            count++;
                            this.attachmentCount++;
                            if (count === this.tempFiles.length) resolve();
                        },
                        error: err => {
                            count++;
                            notUploadedCount++;
                            console.log("upload file error: ", err);
                            if (count === this.tempFiles.length) reject(err);
                        }
                    });
                }
            });

            if (notUploadedCount > 0) this.showModalToast($localize`Not all files uploaded.`, '');
        });
    }

    async deleteSavedAttachments(): Promise<boolean> {
        let count = 0;
        return new Promise((resolve, reject) => {
            this.deletedSavedFiles.forEach((file: any, index: number) => {
                this._commonSrv.delete(`media/${file.id}`, false).subscribe({
                    next: () => {
                        count++;
                        if (count === this.deletedSavedFiles.length) resolve(true);
                    },
                    error: err => {
                        count++;
                        console.log("delete file error: ", err);
                        if (count === this.deletedSavedFiles.length) resolve(err);
                    },
                });
            });
        });
    }

    closeAttachmentDialog() {
        this.isPreviewDialogOpen = false;
    }

    setCompletedDate(event: Event | undefined, rowData: any, clickFrom: string) {
        if (clickFrom == 'newTypeOfRepair') {
            rowData.is_repair_completed = !rowData.is_repair_completed
            rowData.repair_completed_date = rowData.is_repair_completed ? new Date() : null;
        } else {
            rowData.prodOrderPosOperation.is_repair_completed = !rowData.prodOrderPosOperation.is_repair_completed
            rowData.prodOrderPosOperation.repair_completed_date = rowData.prodOrderPosOperation.is_repair_completed ? new Date() : null;
        }

        const operationId = clickFrom === 'newTypeOfRepair' ? rowData?.id : rowData?.prodOrderPosOperation?.id;
        const existingOperation = this.updatedOperationdata.find((op: any) => op.prodOrderPosOperationsId === operationId);

        if (existingOperation) {
            existingOperation.isRepairCompleted = clickFrom === 'newTypeOfRepair' ? rowData?.is_repair_completed : rowData.prodOrderPosOperation.is_repair_completed;
            existingOperation.completedDate = clickFrom == 'newTypeOfRepair' ? rowData?.repair_completed_date : rowData.prodOrderPosOperation.repair_completed_date;
            existingOperation.userId = rowData?.prodOrderPosOperation?.is_repair_completed || rowData?.is_repair_completed ? this.authUser.id : null;
        } else {
            this.updatedOperationdata.push({
                name: clickFrom == 'newTypeOfRepair' ? rowData?.name : rowData?.prodOrderPosOperation?.name,
                prodOrderPosOperationsId: clickFrom == 'newTypeOfRepair' ? rowData?.id : rowData?.prodOrderPosOperation?.id,
                isRepairCompleted: clickFrom == 'newTypeOfRepair' ? rowData?.is_repair_completed : rowData.prodOrderPosOperation.is_repair_completed,
                completedDate: clickFrom == 'newTypeOfRepair' ? rowData?.repair_completed_date : rowData.prodOrderPosOperation.repair_completed_date,
                userId: rowData?.prodOrderPosOperation?.is_repair_completed || rowData?.is_repair_completed ? this.authUser.id : null,
                is_auto_created: clickFrom == 'newTypeOfRepair' ? rowData?.is_automatic_created_repair : rowData.prodOrderPosOperation.is_automatic_created_repair
            })
        }
        
        if (clickFrom == 'other') {
            this.selectedNewOtherRepairOp.forEach((item: any) => {
                if (item.prodOrderPosOperation.id == rowData.prodOrderPosOperation.id) {
                    item.prodOrderPosOperation.is_repair_completed = rowData.prodOrderPosOperation.is_repair_completed;
                    item.prodOrderPosOperation.repair_completed_date = rowData.prodOrderPosOperation.repair_completed_date
                    return;
                }
            })
            this.childComponentGrid!.render()
        } else if (clickFrom == 'typeOfRepair') {
            this.treeTableData.forEach((item: any) => {
                if (item.prodOrderPosOperation.id == rowData.prodOrderPosOperation.id) {
                    item.prodOrderPosOperation.is_repair_completed = rowData.prodOrderPosOperation.is_repair_completed;
                    item.prodOrderPosOperation.repair_completed_date = rowData.prodOrderPosOperation.repair_completed_date
                    return;
                }
            })
            this.typeOfRepairTree!.render()
        } else {
            this.newTypeOfRepair.forEach((item: any) => {
                if (item.id == rowData.id) {
                    item.is_repair_completed = rowData.is_repair_completed;
                    item.repair_completed_date = rowData.repair_completed_date
                    return;
                }
            })
            this.newTypeOfRepairTable!.render()
        }

        let isAllNewRepairallCompleted = true;

        if (!this.newTypeOfRepair?.every((item: any) => item.is_repair_completed)) {
            isAllNewRepairallCompleted = false;
        }

        let isAllOtherRepairCompleted = true
        if (this.selectedNewOtherRepairOp.length > 0) {
            isAllOtherRepairCompleted = this.selectedNewOtherRepairOp.every((item: any) => item.prodOrderPosOperation.is_repair_completed);
        }
        if (isAllOtherRepairCompleted && isAllNewRepairallCompleted) {
            this.isAllOrderRepairDoneButtonDisabled = false;
        } else {
            this.isAllRepairDone = false;
            this.isAllOrderRepairDoneButtonDisabled = true;
        }
    }

    onChangeNotes(data: any) {
        this.prodOrderPosData.notes = data;
    }

    onSearchTreeTable(searchWord: any) {
        const search = searchWord.trim().toLowerCase();

        const filteredValues = search
            ? (this.treeTableData
                .map((repair: any) => {
                    const isParentMatch = repair.custom_id.toLowerCase().includes(search);  // Convert the repair to lowercase and check if it matches the search term
                    const filteredSubRows = repair.operationPlanPos.filter((subRow: any) =>subRow.name.toLowerCase().includes(search));
                    if (isParentMatch || filteredSubRows.length > 0) {
                        return {
                            ...repair,
                            operationPlanPos: isParentMatch ? repair.operationPlanPos : filteredSubRows,
                        };
                    }
                    return null;
                })
                .filter((op: any) => op !== null) as OperationPlan[])
            : this.treeTableData; // If no search term, return all data

        if (this.typeOfRepairTree) {
            this.typeOfRepairTree.data = filteredValues;
            this.typeOfRepairTree?.render();
            this.typeOfRepairTree.searching = searchWord;
        }
    }

    closeProdDateDialog() {
		this.isInvalidProdDate = false;
		this.prodDateDialogTitle = "";
	}
}
