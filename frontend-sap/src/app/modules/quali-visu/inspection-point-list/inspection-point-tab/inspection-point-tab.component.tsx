import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from "@angular/core";
import {NgForm} from "@angular/forms";
import {PermissionEnum} from "@app/shared/enums/PermissionEnum";
import {AuthService} from "@app/shared/services/auth.service";
import {Localization} from "@app/shared/utils/common-localize";
import {CustomReactGridTable, GridTableColumnDataType,} from "@app/shared/components/CustomGridTable";
import {CommonService} from "@app/shared/services/common.service";
import {ToastService} from "@app/shared/services/toaster.service";
import Toast from "@ui5/webcomponents/dist/Toast";
import {
    InspectionUpdateTabComponent
} from "@app/modules/quali-visu/inspection-point-list/inspection-update-tab/inspection-update-tab.component";
import React from "react";
import {ObjectStatus, Text} from "@ui5/webcomponents-react";
import {formatDate} from "@app/shared/utils/date-time-formatter";
import {
    InspectionOperationCharacteristicsOptions
} from "@app/modules/quali-visu/enums/inspection-operation-characteristics-options-enum";
import {MachineboardService} from "@app/modules/machine-board/services/machineboard.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import {ProdInspectionOperation} from "@app/shared/models/prod-inspection-operation.model";
import {InspectionOperationFilterEnum} from "@app/modules/quali-visu/enums/inspection-operation-filter-enum";
import {InspectionPoint} from "@app/shared/models/inspection-point.model";
import {InspectionOperationChateristic} from "@app/shared/models/inspection-operation-characteristic.model";
import MachineUserTime from "@app/shared/models/machine-user-time.model";
import { Machine } from "@app/shared/models/machine.model";

@Component({
    selector: "app-inspection-point-tab",
    templateUrl: "./inspection-point-tab.component.html",
    styleUrl: "./inspection-point-tab.component.css",
})
export class InspectionPointTabComponent implements OnInit, OnDestroy {
    @Input() selectedInspectionOperation: ProdInspectionOperation | undefined;
    @Input() selectedFilter: InspectionOperationFilterEnum = InspectionOperationFilterEnum.OPEN;

    @Output() onDataUpdate: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("insertionTab") inspectionUpdateTab?: InspectionUpdateTabComponent;
    @ViewChild("childComponentRef", {static: false}) childComponent:
        | CustomReactGridTable
        | undefined;

    clockedInUsers: MachineUserTime[] | undefined;
    selectedClockedInUser: MachineUserTime | undefined;
    isClockedDialogOpen: boolean = false;
    selectedMachine: Machine | undefined;

    form?: NgForm;
    inspectionOperationCharacteristics: any;
    selectedInspectionPoint: InspectionPoint | undefined;
    deleteableId?: number;
    createdInspectionPoint?: InspectionPoint;
    isLoading: boolean = false;
    localization = Localization;
    isDeleteDialogOpen: boolean = false;
    headerTitle: string = ` `;
    isGridLoader: boolean = false;
    toastMessage?: string;
    productionLotNotAvailable: string = $localize`Production lot is not available for this inspection operation`;
    saveAndOpenNextBtnLabel: string = $localize`Save & Open Next`;
    isSaveAndNextDisable: boolean = true;
    isAddNewInspectionPointDisable: boolean = false;
    customUrl: string = ``;
    top: number = 40;
    skip: number = 0;
    page: number = 1;
    globalSearchValue: string = "";
    isLimitsAvailable: boolean = false;
    currentLoggedInUser: any = [];
    availableUserGroups: any = [];
    isSaveEnabled: boolean = false;
    isSaveEnabledForNotes: boolean = false;
    isUserBlocked: boolean = false;
    confirmationPopupVisible: boolean = false;
    isConfirmationPopupOpen: boolean = false;
    deleteId: number = 0;
    saveAndOpenNext: boolean = false;

    staticColumns: any = [
        {
            Header: $localize`User`,
            accessor: "user_creator.name",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original.user_creator?.name;
                let userName = rowData || $localize`System generated`;
                return (
                    <React.StrictMode>
                        <Text>{userName}</Text>
                    </React.StrictMode>
                );
            },
        },
        {
            Header: $localize`Registered Date and Time`,
            accessor: "registered_datetime",
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            hAlign: "End",
            dataType: GridTableColumnDataType.Date,
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original.created_at;
                let formattedDate = formatDate(rowData);
                return (
                    <React.StrictMode>
                        <Text>{formattedDate}</Text>
                    </React.StrictMode>
                );
            },
        },
    ];

    columns: any[] = [...this.staticColumns];

    isEditDialogOpen: boolean = false;

    get permission() {
        return PermissionEnum;
    }

    constructor(
        public authService: AuthService,
        private commonService: CommonService,
        public _toasterSrv: ToastService,
        private machineboardService: MachineboardService,
    ) {
    }

    ngOnInit(): void {
        this.currentLoggedInUser = this.authService.loggedInUser;        
        this.getLoggedInUserGroup();

        this.machineboardService.isUserBlockedForInspectionPoint$.subscribe({
            next: (res) => {
                this.isUserBlocked = res;
            },
            error: (e) => {

            },
            complete: () => {
            }
        });

        this.checkWhetherWindowHasChanged();

        this.clockedInUsers = this.machineboardService.clockedInUser || [];
        
        if(this.clockedInUsers.length == 1) this.selectedClockedInUser = this.clockedInUsers[0];

        this.selectedMachine = this.machineboardService.getSelectedMachine();

        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    ngOnDestroy() {
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape' && this.isUserBlocked) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes) {
            if (
                changes["selectedInspectionOperation"] &&
                changes["selectedInspectionOperation"]?.currentValue?.id !==
                changes["selectedInspectionOperation"]?.previousValue?.id
            ) {
                this.page = 1;
                this.createdInspectionPoint = undefined;
                this.globalSearchValue = "";
                this.customUrl = this.constructCustomUrl();
                if (this.childComponent) {
                    this.childComponent.globalSearchFieldValue = '';
                    this.childComponent.globalFilterValue = '';
                    this.childComponent.customUrl = this.customUrl;
                    this.childComponent?.onFilterAndSorting();
                }
                this.checkWhetherWindowHasChanged();
            }
        }
    }

    checkWhetherWindowHasChanged() {
        const openPoints = this.getOpenInspectionPoints();
        if (openPoints.length == 1) {
            this.editClick(openPoints[0]);
        }
    }

    constructCustomUrl() {
        return `/inspection-point/get-inspection-points/${this.selectedInspectionOperation?.id}?&page=${this.page}&search=${this.globalSearchValue}`;
    }

    getLoggedInUserGroup() {
        this.commonService
            .get(
                `Users/${this.currentLoggedInUser.id}?$expand=userGroup`, true
            )
            .subscribe({
                next: (res: any) => {
                    this.availableUserGroups = res.userGroup;
                },
                error: err => {
                    this.availableUserGroups = [];
                },
            });
    }

    isAllConfirmationsFilled(isFilled: boolean) {
        this.isSaveEnabled = isFilled;
    }

    isAllRequiredFieldNoteFilled(isFilled: boolean) {
        this.isSaveEnabledForNotes = isFilled;
    }

    isShowConfiramationPopUp(displayConfirmation: boolean) {
        this.confirmationPopupVisible = displayConfirmation;
    }

    addInspectionPoint() {
        this.isAddNewInspectionPointDisable = true;
        this.isGridLoader = true;
        const {recordSavedSuccessfully} = Localization;
        if (this.selectedInspectionOperation) {
            this.commonService
                .post(
                    `quali-visu/prod-inspection-operation/${this.selectedInspectionOperation?.id}/create-inspection-point`,
                    {},
                    false
                )
                .subscribe({
                    next: (res: any) => {
                        if (res) {
                            this.createdInspectionPoint = res;
                            this.showModalToast(recordSavedSuccessfully, "success");
                            this.childComponent?.onPagination(true);
                            this.isGridLoader = false;
                            this.editClick(this.createdInspectionPoint);
                            this.isAddNewInspectionPointDisable = false;
                            this.onDataUpdate.emit();
                        } else {
                            this.isGridLoader = false;
                            this.isAddNewInspectionPointDisable = false;
                            this.childComponent?.onPagination(true);
                            this.onDataUpdate.emit();
                            this.showModalToast(this.productionLotNotAvailable, "warning");
                        }
                    },
                    error: err => {
                        this.isGridLoader = false;
                        this.isAddNewInspectionPointDisable = false;
                    },
                });
        }
    }

    insertDynamicColumns() {
        const characteristics = new Map<number, string>();
        this.columns = [...this.staticColumns];
        this.selectedInspectionOperation?.inspectionOperationCharacteristics.forEach((inspectionOperationCharacteristic: InspectionOperationChateristic) => {
            if (inspectionOperationCharacteristic.id) {
                characteristics.set(
                    inspectionOperationCharacteristic.id,
                    inspectionOperationCharacteristic.name
                );
            }
        });

        const dynamicColumns = Array.from(characteristics.entries()).map(([charId, charName]) => ({
            Header: charName,
            accessor: charId.toString(),
            disableFilters: true,
            disableGroupBy: true,
            disableSortBy: true,
            isSelected: true,
            hAlign: "Center",
            Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
                const {row} = instance;
                const rowData = row.original.inspection_point_characteristics;
                const characteristic = rowData.find(
                    (char: any) => char.inspection_operation_characteristic_id == charId
                );
                let characteristicValue = "";
                let state = ValueState.None;

                if (characteristic) {
                    if (characteristic.inspection_operation_characteristic.is_quantitative == 0) {
                        const validOption =
                            characteristic.inspection_point_characteristic_options.find(
                                (option: any) =>
                                    option.inspection_operation_characteristic_option &&
                                    option.inspection_operation_characteristic_option.valuation
                            );

                        if (validOption) {
                            const valuation =
                                validOption.inspection_operation_characteristic_option.valuation;
                            if (
                                Object.values(InspectionOperationCharacteristicsOptions).includes(
                                    valuation
                                )
                            ) {
                                characteristicValue = valuation;
                                if (valuation == InspectionOperationCharacteristicsOptions.ACCEPT) {
                                    state = ValueState.Positive;
                                } else if (
                                    valuation == InspectionOperationCharacteristicsOptions.REJECT
                                ) {
                                    state = ValueState.Negative;
                                }
                            }

                            characteristicValue =
                                validOption.inspection_operation_characteristic_option.custom_id;
                        }
                    } else {
                        state = ValueState.Positive;

                        characteristicValue = characteristic.value || "";
                        const numericValue = parseFloat(characteristicValue);
                        const unit =
                            characteristic?.inspection_operation_characteristic?.unit_of_measure
                                ?.name ?? "";

                        if (!isNaN(numericValue)) {
                            const lowerLimit =
                                characteristic.inspection_operation_characteristic
                                    .value_lower_limit;
                            const upperLimit =
                                characteristic.inspection_operation_characteristic
                                    .value_upper_limit;
                            this.isLimitsAvailable = (lowerLimit == null && upperLimit == null)
                            if (numericValue < lowerLimit) {
                                state = ValueState.Negative;
                            } else if (numericValue > upperLimit) {
                                state = ValueState.Negative;
                            }

                            characteristicValue += ` ${unit}`;
                        } else {
                            state = ValueState.None;
                        }
                    }
                }
                let statusStylePrefix = "";
                if (state == ValueState.Positive) {
                    statusStylePrefix = "status-true";
                } else if (state == ValueState.Negative) {
                    statusStylePrefix = "status-false";
                }

                return (
                    <React.StrictMode>
                        {characteristicValue && characteristicValue !== "" && state && !this.isLimitsAvailable ? (
                            <ObjectStatus
                                className="object-status"
                                title={characteristicValue}
                                state={state}
                                style={{
                                    minWidth: "72px",
                                    height: "18px",
                                    backgroundColor: `var(--${statusStylePrefix}-background-color)`,
                                    color: `var(--${statusStylePrefix}-text-color)`,
                                    border: `1px solid var(--${statusStylePrefix}-border-color)`,
                                    padding: "5px 8px 5px 8px",
                                    borderRadius: "8px",
                                    fontWeight: 700,
                                }}>
                                {characteristicValue}
                            </ObjectStatus>
                        ) : (
                            <Text>{characteristicValue}</Text>
                        )}
                    </React.StrictMode>
                );
            },
        }));

        dynamicColumns.forEach(col => {
            if (!this.columns.some(existingCol => existingCol.accessor == col.accessor)) {
                this.columns.push(col);
            }
        });
    }

    editClick(data: any) {
        this.selectedInspectionPoint = new InspectionPoint().deserialize(data);
        let currentSelectedIndex = undefined;
        if (this.selectedInspectionPoint && this.selectedInspectionPoint.id) {
            currentSelectedIndex = this.selectedInspectionOperation?.inspectionPoints.findIndex(
                (point: InspectionPoint) => point.id == this.selectedInspectionPoint?.id
            );
        }
        this.isSaveAndNextDisable = currentSelectedIndex == (this.selectedInspectionOperation?.inspectionPoints.length ?? 0) - 1;
        const openPointsAvailable = this.getOpenInspectionPoints();
        if (openPointsAvailable.length == 1 && this.selectedFilter == InspectionOperationFilterEnum.OPEN)
            this.isSaveAndNextDisable = true;
        this.isEditDialogOpen = true;
    }

    editInspectionPoint(isSaveAndOpenNext: boolean) {
        this.saveAndOpenNext = isSaveAndOpenNext;

        if(this.clockedInUsers?.length && this.clockedInUsers?.length === 1) {
            this.selectedClockedInUser = this.clockedInUsers[0];
            this.isClockedDialogOpen = false;
        } else if(this.clockedInUsers?.length && !this.selectedClockedInUser){
            if (this.selectedMachine?.save_operator_id_qualivisu === true) {
                this.isClockedDialogOpen = true;
                return;
            } else {
                this.selectedClockedInUser = undefined;
            }
        } else {
            this.isClockedDialogOpen = false;
        }

        if (!this.confirmationPopupVisible) {
            this.isConfirmationPopupOpen = true;
            this.saveAndOpenNext = isSaveAndOpenNext;
            return;
        }

        this.proceedWithSave(isSaveAndOpenNext);
    }

    proceedWithSave(isNext: boolean) {
        this.isConfirmationPopupOpen = false;
        this.isGridLoader = true;
        const {recordSavedSuccessfully} = Localization;
        const payload = {
            inspection_points: [
                {
                    inspection_point_id: this.inspectionUpdateTab?.inspectionPoint?.id,
                    characteristics: this.inspectionUpdateTab?.characteristics.map(
                        characteristic => ({
                            inspection_operation_characteristic_id: characteristic.id,
                            value:
                                characteristic.is_quantitative == 1
                                    ? characteristic.inserted_value || ""
                                    : "",
                            confirmation_number: characteristic.confirmation_number || null,
                            field_note: characteristic.field_note || null,
                            user_id: this.selectedClockedInUser ? this.selectedClockedInUser?.user_id : this.currentLoggedInUser.id,
                            options:
                                characteristic.is_quantitative == 1
                                    ? []
                                    : characteristic.inspection_operation_characteristic_options
                                        .filter((option: any) => option.is_selected)
                                        .map((option: any) => option.id),
                        })
                    ),
                },
            ],
        };
        this.isLoading = true;

        if (this.inspectionUpdateTab) {
            this.inspectionUpdateTab.isLoading = true;
        }

        this.commonService
            .post(`inspection-point/update-inspection-point`, payload, false)
            .subscribe({
                next: (res: any) => {
                    this.isGridLoader = false;
                    this.showModalToast(recordSavedSuccessfully, "success");
                    this.isLoading = false;

                    if (this.inspectionUpdateTab) {
                        this.inspectionUpdateTab.isLoading = true;
                    }

                    this.isEditDialogOpen = false;
                    this.saveAndOpenNext = false;
                    this.selectedClockedInUser = undefined;
                    this.childComponent?.onPagination(true);
                    this.onDataUpdate.emit();

                },
                error: err => {
                    this.isGridLoader = false;
                    this.isLoading = false;

                    if (this.inspectionUpdateTab) {
                        this.inspectionUpdateTab.isLoading = true;
                    }

                    this.isEditDialogOpen = false;
                    this.selectedClockedInUser = undefined;
                    this.onDataUpdate.emit();
                },
            });
    }

    closeDialog(flagName: "edit" | "delete" | "confirmation") {
        if (flagName == "edit") {
            this.isEditDialogOpen = false;
        } else if (flagName == "delete") {
            this.isDeleteDialogOpen = false;
        } else if (flagName == "confirmation") {
            this.isConfirmationPopupOpen = false;
        }
    }

    deleteClick(data: any) {
        this.isDeleteDialogOpen = true;
        this.deleteableId = data.id;
    }

    deleteInspectionPoint() {
        const {recordDeleted} = Localization;
        this.isLoading = true;
        this.commonService.delete(`inspection-point/delete/${this.deleteableId}`, false).subscribe({
            next: (res: any) => {
                this.isDeleteDialogOpen = false;
                this.isLoading = false;
                this.childComponent?.onPagination(true);
                this.showModalToast(recordDeleted, "success");
                this.onDataUpdate.emit();
            },
            error: err => {
                this.isLoading = false;
                this.isDeleteDialogOpen = false;
                this.onDataUpdate.emit();
            },
        });
    }

    handleSearchFunctionality(searchValue: string) {
        this.globalSearchValue = searchValue;
        this.page = 1;
        this.customUrl = this.constructCustomUrl();

        if (this.childComponent) {
            this.childComponent.customUrl = this.customUrl;
            this.childComponent.onPagination(true);
        }
    }

    handlePaginationFunctionality() {
        this.page += 1;
        this.customUrl = this.constructCustomUrl();

        if (this.childComponent) {
            this.childComponent.customUrl = this.customUrl;
            this.childComponent.onPagination();
        }
    }

    processInspectionPoints(event: any, isSaveAndNext: boolean = false) {
        if (this.selectedInspectionOperation?.inspectionOperationCharacteristics?.length) {
            this.insertDynamicColumns();
        } else {
            this.columns = [...this.staticColumns];
        }

        this.childComponent?.render();
    }

    getOpenInspectionPoints() {
        return this.selectedInspectionOperation?.inspectionPoints?.filter((point: InspectionPoint) => point.isOpen()) ?? [];
    }

    showModalToast(message: string, type: string) {
        this.toastMessage = message;
        const toast = document.getElementById("detailModalToast") as Toast;
        toast.setAttribute("z-index", "10000000");
        toast.setAttribute("display", "block");
        toast.className = this._toasterSrv.setToasterType(type);
        toast.open = true;
    }
}
