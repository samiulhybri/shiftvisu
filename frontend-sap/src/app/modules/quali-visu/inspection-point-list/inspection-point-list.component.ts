import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild,} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {lastValueFrom} from 'rxjs';
import {InspectionOperationTabType} from "@app/shared/enums/inspection-operation-tab-type";
import {AuthService} from "@app/shared/services/auth.service";
import {PermissionEnum} from "@app/shared/enums/PermissionEnum";
import {MachineboardService} from "@app/modules/machine-board/services/machineboard.service";
import {QualiVisuService} from "@app/modules/quali-visu/services/quali-visu.service";
import {InspectionOperationFilterEnum} from "@app/modules/quali-visu/enums/inspection-operation-filter-enum";
import {
    InspectionPointTabComponent
} from "@app/modules/quali-visu/inspection-point-list/inspection-point-tab/inspection-point-tab.component";
import {InspectionOperationResourceType} from "@app/modules/quali-visu/enums/inspection-operation-resource-type-enum";
import {CommonService} from "@app/shared/services/common.service";
import {
    ProdInspectionOperationFrequencyClass
} from "@app/modules/quali-visu/enums/prod-inspection-operation-frequency-enum";
import {ProdInspectionOperation} from "@app/shared/models/prod-inspection-operation.model";
import {HttpClient} from "@angular/common/http";
import {
	CustomReactGridTable,
} from "@app/shared/components/CustomGridTable";

@Component({
    selector: "app-inspection-point-list",
    templateUrl: "./inspection-point-list.component.html",
    styleUrl: "./inspection-point-list.component.css",
})
export class InspectionPointListComponent implements OnChanges {
    @ViewChild("inspectionPointTab") inspectionPointTab?: InspectionPointTabComponent;
	@ViewChild("childComponentRef", { static: false }) childComponent:
			| CustomReactGridTable
			| undefined;
    @Input() operationIds: number[] = [];
    @Output() selectedInspectionOperationChanged = new EventEmitter<ProdInspectionOperation | undefined>();
    @ViewChild("operationFilterRef") operationRef: any;

    allInspectionOperation: ProdInspectionOperation[] = [];

    filteredInspectionOperations: ProdInspectionOperation[] = [];
    filterInspectionOperations(): ProdInspectionOperation[] {
        return this.allInspectionOperation.filter(operation => {
            switch (this.inspectionOperationFilterType) {
                case InspectionOperationFilterEnum.ALL:
                    return true;
                case InspectionOperationFilterEnum.CLOSED:
                    return !operation.hasOpenInspectionPoints();
                case InspectionOperationFilterEnum.OPEN:
                    return operation.hasOpenInspectionPoints();
            }
        });
    }

    openInspectionOperations(): ProdInspectionOperation[] {
        return this.allInspectionOperation.filter(operation => operation.hasOpenInspectionPoints());
    }

    inspectionOperationFilterType: InspectionOperationFilterEnum = InspectionOperationFilterEnum.OPEN;

    isNavBarLoading = true;

    selectedTab?: InspectionOperationTabType = this.firstValidTab;

    selectedInspectionOperation: ProdInspectionOperation | undefined;

    isUserBlocked: boolean = false;

    selectedInspectionOperationResources: any = [];

    fetchedFiles: any = [];

    tabPermissionList: { type: InspectionOperationTabType, permission: PermissionEnum[] }[] = [
        {
            type: InspectionOperationTabType.INSPECTION_POINT,
            permission: [PermissionEnum.QUALIVISU_INSPECTION_POINT_VIEW, PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT, PermissionEnum.MACHINEBOARD_QUALIVISU_EDIT_IF_QUALIFIED]
        },
        {
            type: InspectionOperationTabType.ATTACHMENT,
            permission: []
        },
    ];

	availableOperations: any = [];

	selectedOperation: any = [];

    get inspectionOperationTabType() {
        return InspectionOperationTabType;
    }

    get inspectionOperationFilterEnum() {
        return InspectionOperationFilterEnum;
    }

    get permissionEnums() {
        return PermissionEnum;
    }

    get firstValidTab() {
        return this.tabPermissionList?.find(tab => tab.permission.some(p => this.authService.isPermissionValid(p)))?.type;
    }

    constructor(
        private qualiVisuService: QualiVisuService,
        public authService: AuthService,
        private machineboardService: MachineboardService,
        private commonService: CommonService,
    ) {
    }

    ngOnInit(): void {
        this.machineboardService.isUserBlockedForInspectionPoint$.subscribe({
            next: (res) => {
                this.isUserBlocked = res;
            },
            error: (e) => {

            },
            complete: () => {
            }
        })
        document.addEventListener('keydown', this.onKeyDown.bind(this));

		this.machineboardService.operationsBehaviorObservable().subscribe({
			next: (res)=> {
				this.availableOperations = res;
			}
		})

		this.machineboardService.updateSelectedOperation$.subscribe({
            next: (res) => {
				if(res && res.prodOrderCustomId && res.itemId) {
                    this.selectedOperation = [res.id];
				}
            },
            error: (e) => {},
            complete: () => {}
        });
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

    preventUserInteraction(event: KeyboardEvent): void {
        event.preventDefault();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes["operationIds"]?.currentValue?.length &&
            changes["operationIds"].currentValue != changes["operationIds"].previousValue
        ) {
            this.updateInspectionOperationList();
        }
    }

	applySelectedOperationFilters() {
		this.filteredInspectionOperations = this.filterInspectionOperations();
		this.filteredInspectionOperations = this.filteredInspectionOperations.filter((op: any) =>
			this.selectedOperation.map(String).includes(String(op.prod_order_pos_operation_id))
		);

		this.updateFilteredInspectionOperations(true);
	}

    applyOperationFilterSelection() {
        if (this.selectedOperation && this.availableOperations) {
            const selectedOperationIds = this.selectedOperation;
            
            if (this.operationRef) {
                const comboBoxItems = this.operationRef.elementRef.nativeElement.items;
 
                for (let operation of comboBoxItems) {
                    if (selectedOperationIds.includes(Number(operation.id))) {
                        operation.selected = true;
                    } else {
                        operation.selected = false;
                    }
                }
            }
        }
    }

    operationSelection(event: any) {
        this.selectedOperation = event.srcElement.selectedValues.map(
            (el: any) => +el.id
        ) as number[];

        this.applySelectedOperationFilters();
    }

    updateInspectionOperationList() {
        this.isNavBarLoading = true;
        let payload = {
            prod_order_pos_operation_ids: this.operationIds,
        };

        this.qualiVisuService
            .post(`quali-visu/get-inspections-by-operations`, payload, false)
            .subscribe({
                next: (response: any) => {
                    this.allInspectionOperation = response.inspection_operations.map(
                        (inspection_operation: any) => {
                            return new ProdInspectionOperation().deserialize(inspection_operation);
                        }
                    );

                    this.updateFilteredInspectionOperations();

                    if(this.openInspectionOperations().length == 0)
                        this.machineboardService.isUserBlockedForInspectionPoint = false;

                    if(this.availableOperations.length > 1) {
                        this.applySelectedOperationFilters();
                        this.applyOperationFilterSelection();
                    }
					
                    this.selectedTab = this.firstValidTab;

                    this.isNavBarLoading = false;
                },

                error: (error: any) => {
                    this.isNavBarLoading = false;
                },
            });
    }

    private updateFilteredInspectionOperations(isCalledForOperationWiseFilter: boolean = false) {
		if(!isCalledForOperationWiseFilter) this.filteredInspectionOperations = this.filterInspectionOperations();

        if (this.filteredInspectionOperations.length == 0) {
            this.selectedInspectionOperation = undefined;
        } else {
            this.selectedInspectionOperation =
                this.filteredInspectionOperations.find(
                    iO => iO.id == this.selectedInspectionOperation?.id
                ) ?? this.filteredInspectionOperations[0];
        }

        this.selectedInspectionOperationChanged.emit(this.selectedInspectionOperation);
    }

    selectInspectionOperation(inspectionOption: ProdInspectionOperation) {
        this.selectedTab = this.firstValidTab;
        this.selectedInspectionOperation = inspectionOption;
        this.selectedInspectionOperationChanged.emit(this.selectedInspectionOperation);
    }

    async updateAttachmentSection() {
        this.selectedInspectionOperationResources = this.selectedInspectionOperation?.prodInspectionOperationResources.filter((resource) => resource.type == InspectionOperationResourceType.SAP_DOCUMENT);

        const constructedUrls = this.selectedInspectionOperationResources.map((resource: any) => {
            return  `import-attachment-from-btp/${resource.id}`;
        });

        if (constructedUrls.length == 0) {
            this.fetchedFiles = [];
            return
        }

        try {
            const filePromises = constructedUrls.map((url: any) => lastValueFrom(
                this.commonService.getOption(url)
            ));
            this.fetchedFiles = await Promise.all(filePromises);

        } catch (e) {
            this.fetchedFiles = [];
        }
    }

    selectTab(event: any) {
        this.selectedTab = event.detail.tab.id;
    }

    updateInspectionOperationFilterType(event: any) {
        this.inspectionOperationFilterType = event.detail.selectedItems[0].id;

        this.updateFilteredInspectionOperations();

        if(this.availableOperations.length > 1) {
            this.applySelectedOperationFilters();
            this.applyOperationFilterSelection();
        }

        this.selectedTab = this.firstValidTab;
    }

    protected readonly ProdInspectionOperation = ProdInspectionOperation;
    protected readonly ProdInspectionOperationFrequencyClass = ProdInspectionOperationFrequencyClass;
}
