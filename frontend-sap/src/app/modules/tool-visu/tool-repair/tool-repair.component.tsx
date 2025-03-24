import { Component, ViewChild } from "@angular/core";
import React, { act } from "react";
import { Button, FlexBox, ObjectStatus } from "@ui5/webcomponents-react";
import { DatePipe } from "@angular/common";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";

import { CustomReactGridTable, GridTableColumnDataType } from "@app/shared/components/CustomGridTable";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { User } from "@app/shared/models/user.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { Item } from "@app/shared/models/item.model";
import { ToolRepairStatus, ToolRepairStatusClass } from "@app/modules/tool-visu/enums/ToolRepairStatus";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";

import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { ActiveRepairComponent } from "@app/modules/tool-visu/shared/active-repair/active-repair.component";
import { ProdOrderPosStatus } from "@app/shared/enums/ProdOrderPosStatus";
import { Localization } from "@app/shared/utils/common-localize";
import { AuthService } from "@app/shared/services/auth.service";
import { Suppliers } from "@app/shared/models/suppliers.model";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
    selector: "app-tool-repair",
    templateUrl: "./tool-repair.component.html",
    styleUrl: "./tool-repair.component.css",
    providers: [DatePipe],
})
export class ToolRepairComponent {
    @ViewChild("childComponentRef", { static: false }) childComponent: CustomReactGridTable | undefined;
    @ViewChild("activeRepairTable", { static: false }) activeRepairTable!: ActiveRepairComponent;

    public expandQuery: string = `$select=id,custom_id,name,is_active,is_tool,height,length,width,total_weight&$expand=media($select=id),prodOrderPos($filter=(status ne '${ProdOrderPosStatus.DELETED}' and status ne '${ProdOrderPosStatus.CLOSED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}' and status_plan ne '${ProdOrderPosStatus.CLOSED}');$expand=prodOrder($select=id;filter=order_type eq '${ProdOrderType.MAINTENANCE}'))`;

    private allTableData: any;
    private currentStateTableData: any;
    private authUser!: User;
    private hasAuth: boolean = true;
    public customId: string = '';
    public prodOrderTypeEnum = ProdOrderType;
    previewDialogTitle = $localize`Attachment`;
    deletItemId = "";
    public dialogTitle: string = '';
    isCreateDialogOpen: boolean = false;
    createDialogModalType: string = '';
    isPreviewDialogOpen: boolean = false;
    public isLoading: boolean = false;
    public selectedRepair?: Item;
    todayDate!: string | null;
    files: any = [];
    deletedSavedFiles: any = [];
    localization = Localization;
    public isDialogOpen: boolean = false;
    public userList: User[] = [];
    public supplierList: Suppliers[] = [];
    public operationPlanList: OperationPlan[] = [];
    public activeRepairs: any;
    public isActiveRepairsDialogOpen: boolean = false;
    public filePreviewHeight = 629;
    public selectedActiveRepair!: ProdOrderPos;
    public isSaveProdOrderPos: boolean = false;
    public fileCount: number = 0;
    public showAttachmentId?: number;
    public activeRepairUrl: string = '';
    private statusFilterKey: string = 'all';
    private activeRepairFilterKey: string = 'all';
    private hasGlobalFilterKey: boolean = false;
    public toolStatusfilterItems = {
        textAccessor: "name",
        idAccessor: "id",
        data: [
            { id: '1', name: $localize`All`, key: 'all' },
            { id: '2', name: ToolRepairStatusClass.getStateTranslate(ToolRepairStatus.READY_FOR_USE), key: 'ready' },
            { id: '3', name: ToolRepairStatusClass.getStateTranslate(ToolRepairStatus.MAINTENANCE_REQUIRED), key: 'maintain' },
            { id: '4', name: ToolRepairStatusClass.getStateTranslate(ToolRepairStatus.NOT_READY_FOR_USE), key: 'not_ready' },
        ]
    };
    public toolActiveReapairsfilterItems = {
        textAccessor: "name",
        idAccessor: "id",
        data: [
            { id: '1', name: $localize`All`, key: 'all' },
            { id: '2', name: $localize`Yes`, key: 'active_reapir' },
            { id: '3', name: $localize`No`, key: 'no_active_reapir' },
        ]
    };

    private colors: any = {
        success: {
            text: '#256F3A',
            border: '#DBEDA1',
            background: '#EBF5CB'
        },
        warning: {
            text: '#B95100',
            border: '#FFEA84',
            background: '#FFF3B7'
        },
        error: {
            text: '#AA0808',
            border: '#FFC1DF',
            background: '#FFD6E9'
        },
        default: {
            text: '#000000',
            background: '#EFF1F2'
        }
    };

    columns: any = [
        {
            Header: $localize`No.`,
            accessor: "custom_id",
            disableFilters: true,
            disableGroupBy: true,
            isSelected: true,
            disableSortBy: false,
            hAlign: "Left"
        },
        {
            Header: $localize`Name`,
            accessor: "name",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Left",
        },
        {
            Header: $localize`Attachment`,
            accessor: "id",
            disableFilters: true,
            dataType: GridTableColumnDataType.Number,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            hAlign: "Left",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                let totalAttachments: any[] = [];
                rowData.media.map((item: any) => {
                    totalAttachments.push(item.id);
                });

                if (totalAttachments.length > 0) {
                    return (
                        <Button
                            icon="attachment"
                            onClick={() => this.showPreview(rowData, totalAttachments.length)}>
                            {totalAttachments.length > 1 ? totalAttachments.length + ' ' + $localize`Files` : totalAttachments.length + ' ' + $localize`File`}
                        </Button>
                    );
                } else return null;
            },
        },
        {
            Header: $localize`Status`,
            accessor: "price",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.Number,
            hAlign: "Left",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                const prodOrderPos = rowData.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                let isNotPossible;
                if (prodOrderPos.length == 0) {
                    return (
                        <React.StrictMode>
                            <FlexBox>
                                <ObjectStatus
                                    showDefaultIcon
                                    state={ValueState.Positive}
                                    style={{
                                        width: "200px",
                                        height: "18px",
                                        backgroundColor: "var(--production-lite-color)",
                                        color: "var(--status-true-text-color)",
                                        border: "var(--status-border-color)",
                                        padding: "5px 8px 5px 8px",
                                        borderRadius: "8px",
                                        fontWeight: 700,
                                    }}>
                                    {ToolRepairStatusClass.getStateTranslate(
                                        ToolRepairStatus.READY_FOR_USE
                                    )}
                                </ObjectStatus>
                            </FlexBox>
                        </React.StrictMode>
                    );
                } else {
                    isNotPossible = prodOrderPos.find((elm: ProdOrderPos) => elm.is_production_possible == null || elm.is_production_possible === false);
                    if (isNotPossible) {
                        return (
                            <React.StrictMode>
                                <FlexBox>
                                    <ObjectStatus
                                        showDefaultIcon
                                        state={ValueState.Negative}
                                        style={{
                                            width: "200px",
                                            height: "18px",
                                            backgroundColor: "var(--standstill-lite-color)",
                                            color: "var(--statnstill-color-compact-hover)",
                                            border: "var(--bom-status-error-border-color)",
                                            padding: "5px 8px 5px 8px",
                                            borderRadius: "8px",
                                            fontWeight: 700,
                                        }}>
                                        {ToolRepairStatusClass.getStateTranslate(
                                            ToolRepairStatus.NOT_READY_FOR_USE
                                        )}
                                    </ObjectStatus>
                                </FlexBox>
                            </React.StrictMode>
                        );
                    } else {
                        return (
                            <React.StrictMode>
                                <FlexBox>
                                    <ObjectStatus
                                        showDefaultIcon
                                        state={ValueState.Critical}
                                        style={{
                                            width: "200px",
                                            height: "18px",
                                            backgroundColor: "var(--bom-status-warning-bgcolor)",
                                            color: "var(--bom-status-warning-color)",
                                            border: "var(--bom-status-warning-border-color)",
                                            padding: "5px 8px 5px 8px",
                                            borderRadius: "8px",
                                            fontWeight: 700,
                                        }}>
                                        {ToolRepairStatusClass.getStateTranslate(
                                            ToolRepairStatus.MAINTENANCE_REQUIRED
                                        )}
                                    </ObjectStatus>
                                </FlexBox>
                            </React.StrictMode>
                        );
                    }
                }
            },
        },
        {
            Header: $localize`Active Repair`,
            accessor: "stock",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            dataType: GridTableColumnDataType.Number,
            hAlign: "Left",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                const prodOrderPos = rowData.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];

                if (prodOrderPos.length > 0) {
                    return (
                        <Button
                            design={"Default"}
                            onClick={() => this.showActiveRepair(rowData)}
                            style={{ width: '150px', backgroundColor: this.colors.default.background, color: this.colors.default.text }}>
                            {$localize`Active Repair` + ' (' + prodOrderPos.length + ')'}
                        </Button>
                    );
                } else return null;
            },
        },
        {
            Header: $localize`State`,
            accessor: "category",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: false,
            dataType: GridTableColumnDataType.String,
            hAlign: "Left",
        },
        {
            Header: $localize`Action`,
            accessor: "created_at",
            dataType: GridTableColumnDataType.Date,
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: false,
            isSelected: true,
            hAlign: "Center",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const { row } = instance;
                const rowData = row.original;
                return (
                    <React.StrictMode>
                        <FlexBox>
                            <Button
                                onClick={() => this.onAddRepair(rowData)}
                                design="Emphasized"
                                disabled={this.hasAuth ? false : true}>{$localize`Add`}
                            </Button>
                        </FlexBox>
                    </React.StrictMode>
                );
            },
        },
    ];

    constructor(private datePipe: DatePipe,
        private _commonSrv: CommonService,
        private _authSrv: AuthService,
        public _toasterSrv: ToastService) {
        this.todayDate = this.datePipe.transform(new Date(), "MMM dd, yyyy");
    }

    ngOnInit() {
        this.authUser = this._authSrv.getUser();
        const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') ||
            this.authUser.roleString?.includes('ADMIN_TOOLVISU') ||
            this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_REPAIR_EDIT);
        if (checkAuth) this.hasAuth = true;
        else this.hasAuth = false;

        this.loadLists();
        this.loadAllData();
    }

    async loadAllData() {
        this._commonSrv
            .get(
                `/Items?$filter=is_tool eq true and is_active eq true&$select=id,custom_id,name,is_active,is_tool,height,length,width,total_weight&$expand=media($select=id),prodOrderPos($filter=(status ne '${ProdOrderPosStatus.DELETED}' and status ne '${ProdOrderPosStatus.CLOSED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}' and status_plan ne '${ProdOrderPosStatus.CLOSED}');$expand=prodOrder($select=id;filter=order_type eq '${ProdOrderType.MAINTENANCE}'))&$top=10000000&$skip=0`
            )
            .subscribe({
                next: (response: any) => {
                    this.allTableData = response.value;
                },
                error: e => {
                    console.error("Error while getting all items: ", e);
                },
        });
    }

    filterHandler(fieldName: string = "", value: string = "", filterOperator: string = "Contain") {
        this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
    }

    loadLists() {
        let requests: ODataBatchCall[] = [];
        requests.push(new ODataBatchCall(0, "get", `Users?$select=id,custom_id,name,is_active&$filter=is_active eq true&$top=100000`));
        requests.push(new ODataBatchCall(1, "get", `OperationPlans?$select=id,custom_id, is_imported&$filter=custom_id ne null and is_imported eq false&$expand=operationPlanPos($select=id,name,operation_plan_id)&$top=100000`));
        requests.push(new ODataBatchCall(2, "get", `Suppliers?$select=id,custom_id,name,is_active&$filter=is_active eq true&$top=100000`));

        this._commonSrv.post("$batch", { requests }).subscribe({
            next: (response: any) => {
                this.userList = [];
                this.operationPlanList = [];

                if (response.responses[0]?.body?.value) {
                    this.userList = response.responses[0]?.body?.value
                        .map((elm: User) => new User().deserialize(elm));
                }

                if (response.responses[1]?.body?.value) {
                    this.operationPlanList = response.responses[1]?.body?.value?.map((elm: OperationPlan) =>
                        new OperationPlan().deserialize(elm)
                    );
                }

                if (response.responses[2]?.body?.value) {
                    this.supplierList = response.responses[2]?.body?.value
                        .map((elm: Suppliers) => new Suppliers().deserialize(elm));
                }
            },
            error: e => { },
        });
    }

    async onAddRepair(repair: any) {
        this.isLoading = true;
        this.selectedRepair = new Item().deserialize(repair);
        this.selectedActiveRepair = new ProdOrderPos().deserialize({});
        this.createDialogModalType = 'add';
        this.isCreateDialogOpen = true;
    }

    openActiveRepairDetails(repair: ProdOrderPos) {
        this.selectedActiveRepair = new ProdOrderPos().deserialize(repair);
        this.selectedRepair = new Item().deserialize(this.selectedActiveRepair.item);
        if (this.hasAuth) this.createDialogModalType = 'edit';
        else this.createDialogModalType = 'view';
        this.isCreateDialogOpen = true;
    }

    showPreview(repair: any, count: number) {
        this.selectedRepair = new Item().deserialize(repair);
        this.showAttachmentId = this.selectedRepair!.id;
        this.fileCount = count;
        this.isPreviewDialogOpen = true;
    }

    showActiveRepair(data: any) {
        try {
            if (this.activeRepairTable.isSaveProdOrderPos && this.activeRepairTable.isShowToaster) this.activeRepairTable.showModalToast();

            this.selectedActiveRepair = new ProdOrderPos().deserialize(data)
            if (this.activeRepairTable.childComponent) {
                this.activeRepairTable.childComponent.data = [];
                this.activeRepairTable.childComponent.isBusy = true;
                this.activeRepairTable.childComponent?.render();
            }
            this.isActiveRepairsDialogOpen = true;
            this._commonSrv
                .get(
                    `/Items(${data.id})?$filter=is_tool eq true and is_active eq true&$select=id&$expand=prodOrderPos($filter=(status ne '${ProdOrderPosStatus.DELETED}' and status ne '${ProdOrderPosStatus.CLOSED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}' and status_plan ne '${ProdOrderPosStatus.CLOSED}');$expand=media($select=id),userCreator($select=id,custom_id,name),userResponsible($select=id,custom_id,name),toolSupplier($select=id,custom_id,name),prodOrder($select=id,custom_id,order_type;$filter=order_type eq '${ProdOrderType.MAINTENANCE}'),item($select=id,name,custom_id,is_active,is_tool);$orderby=id;)`
                )
                .subscribe({
                    next: (response: any) => {
                        if (this.activeRepairTable.childComponent) {
                            this.activeRepairTable.childComponent.data = [];

                            let repair: any = [];
                            response.prodOrderPos.forEach((element: any) => {
                                if (element.prodOrder) {
                                    repair.push(element);
                                }
                            });
                            this.activeRepairs = repair;
                            this.activeRepairTable.prepareDataForStatus(this.activeRepairs);
                            this.activeRepairTable.childComponent.data =
                                this.activeRepairTable.preparedData;

                            this.activeRepairTable.childComponent.isBusy = false;

                            this.activeRepairTable.childComponent?.render();
                        }
                    },
                    error: e => {
                        console.error("Error while getting ProdOrderPos: ", e);
                        this.activeRepairTable.isLoading = false;
                        this._toasterSrv.showToast(
                            $localize`Data loading issue. Check log`,
                            "error"
                        );
                    },
                });
        } catch (error) {
            console.log("error");
        }
    }
    afterSaveDetails() {
        this.showActiveRepair(this.selectedActiveRepair);
        this.isSaveProdOrderPos = true;
    }
    async closeActiveRepairsDialog() {
        this.isActiveRepairsDialogOpen = false;
        if (this.isSaveProdOrderPos) {
            await this.loadAllData();
            this.filterHandler();
        }
    }

    isSavedModal() {
        this.isSaveProdOrderPos = true;
    }

    async closeCreateDialog(): Promise<any> {
        this.isCreateDialogOpen = false;
        if (this.isSaveProdOrderPos) {
            await this.loadAllData();
            this.filterHandler();
        }
        if (this.isActiveRepairsDialogOpen && this.isSaveProdOrderPos) this.activeRepairTable.isLoading = true;
    }

    async changeWithUpdatedData(event: any = null): Promise<any> {
        this.currentStateTableData = event[0];  
        this.hasGlobalFilterKey = this.childComponent?.globalSearchFieldValue ? true : false;    
        this.onFilterToolGrid();

        if (this.isActiveRepairsDialogOpen) {
            const itemId: any = this.selectedRepair?.id;
            if (itemId) {
                let temp = this.childComponent?.data.find((elm: any) => itemId == elm.id);
                if (temp) this.showActiveRepair(temp);
                else this.activeRepairTable.isLoading = false;
            }
        } 
        this.isSaveProdOrderPos = false;
    }

    closeAttachmentDialog() {
        this.isPreviewDialogOpen = false;
    }

    closeDialog() {
        this.isActiveRepairsDialogOpen = false;
    }

    isShowMessage(event: any) {
        this._toasterSrv.showToast(event.message, event.type);
    }

    onFilterToolGrid(event: any = null, type: string = '') {
        let filter1: any = event && type == 'status' ? this.toolStatusfilterItems.data.filter((item: any) => item.id == event.detail.item.id) : null;
        this.statusFilterKey = filter1 ? filter1[0].key : this.statusFilterKey;

        let filter2: any = event && type == 'active_repair' ? this.toolActiveReapairsfilterItems.data.filter((item: any) => item.id == event.detail.item.id): null;
        this.activeRepairFilterKey = filter2 ? filter2[0].key : this.activeRepairFilterKey;

        this.filterByToolStatus();
    }

    filterByToolStatus() {
        let filteredData: any;
        let data: any = this.allTableData ?? this.currentStateTableData;
        switch (this.statusFilterKey) {
            case 'all':
                if(this.hasGlobalFilterKey) this.filterByActiveRepair(this.currentStateTableData);
                else this.filterByActiveRepair(data);
                break;
            case 'ready':
                filteredData = data.filter((item: any) => {
                    const prodOrderPos = item.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                    if (prodOrderPos.length == 0) return item;
                });
                this.filterByActiveRepair(filteredData);
                break;
            case 'maintain':
                filteredData = data.filter((item: any) => {
                    const prodOrderPos = item.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                    if (prodOrderPos.length > 0) {
                        let isNotPossible = prodOrderPos.find((elm: ProdOrderPos) => elm.is_production_possible == null || elm.is_production_possible === false);
                        if (!isNotPossible) return item;
                    }
                });
                filteredData.sort((a: any, b: any) => b.prodOrderPos.length - a.prodOrderPos.length);
                this.filterByActiveRepair(filteredData);
                break;
            case 'not_ready':
                filteredData = data.filter((item: any) => {
                    const prodOrderPos = item.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                    if (prodOrderPos.length > 0) {
                        let isNotPossible = prodOrderPos.find((elm: ProdOrderPos) => elm.is_production_possible == null || elm.is_production_possible === false);
                        if (isNotPossible) return item;
                    }
                });
                filteredData.sort((a: any, b: any) => b.prodOrderPos.length - a.prodOrderPos.length);
                this.filterByActiveRepair(filteredData);
                break;
            default:
                break;
        }
    }

    filterByActiveRepair(tableData: any) {
        let filteredData: any;
        switch (this.activeRepairFilterKey) {
            case 'all':
                this.reloadWholeGrid(tableData);
                break;
            case 'active_reapir':
                filteredData = tableData.filter((item: any) => {
                    const prodOrderPos = item.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                    if (prodOrderPos.length > 0) return item;
                });
                filteredData.sort((a: any, b: any) => b.prodOrderPos.length - a.prodOrderPos.length);
                this.reloadWholeGrid(filteredData);
                break;
            case 'no_active_reapir':
                filteredData = tableData.filter((item: any) => {
                    const prodOrderPos = item.prodOrderPos?.filter((elem: any) => elem.prodOrder != null) || [];
                    if (prodOrderPos.length == 0) return item;
                });
                filteredData.sort((a: any, b: any) => b.prodOrderPos.length - a.prodOrderPos.length);
                this.reloadWholeGrid(filteredData);
                break;
            default:
                break;
        }
    }

    reloadWholeGrid(tableData: any) {
        this.childComponent!.data = tableData;
        this.childComponent?.render();
    }
}

