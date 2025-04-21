import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {CommonService} from "@app/shared/services/common.service";
import {AuthService} from "@app/shared/services/auth.service";
import {Localization} from "@app/shared/utils/common-localize";
import {NgForm} from "@angular/forms";
import {Router} from "@angular/router";
import {QualiEventsTypeClass} from "@app/modules/quali-visu/enums/quali-events-type-enum";
import {DataService} from "@app/shared/services/data.service";
import {ReplaySubject, takeUntil} from "rxjs";
import {Machine} from "@app/shared/models/machine.model";
import {MachineboardService} from "@app/modules/machine-board/services/machineboard.service";
import {
    ProdInspectionOperationFrequencyClass
} from "@app/modules/quali-visu/enums/prod-inspection-operation-frequency-enum";
import {
    InspectionSpecificationImportanceCodeIconType
} from "@app/modules/quali-visu/enums/inspection-specification-importance-code-icon-type-enum";
import {InspectionOperationResourceType} from "@app/modules/quali-visu/enums/inspection-operation-resource-type-enum";
import {ProdInspectionOperation} from "@app/shared/models/prod-inspection-operation.model";
import {InspectionPoint} from "@app/shared/models/inspection-point.model";
import {ProdInspectionOperationResource} from "@app/shared/models/prod-inspection-operation-resource.model";
import {DecimalPipe} from "@angular/common";
import {
    InspectionOperationCharacteristicsOptions
} from "@app/modules/quali-visu/enums/inspection-operation-characteristics-options-enum";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";

@Component({
    selector: "app-inspection-update-tab",
    templateUrl: "./inspection-update-tab.component.html",
    styleUrl: "./inspection-update-tab.component.css",
    providers: [DecimalPipe]
})
export class InspectionUpdateTabComponent implements OnInit, AfterViewInit, OnDestroy {
    private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
    @Input() inspectionPoint: InspectionPoint | undefined;
    @Input() selectedInspectionOperation: ProdInspectionOperation | undefined;
    @Input() userGroupsAvailable: any;
    @Output() assignForm: EventEmitter<any> = new EventEmitter<any>();
    @Output() allConfirmationsFilled: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() allRequiredFieldNoteFilled: EventEmitter<boolean> = new EventEmitter<boolean>();
    @Output() allCharacteristicsValuesInRange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild("characteristicsForm") form?: NgForm;
    @ViewChild("characteristicInput") characteristicInput: any;

    fileSrc?: string | SafeResourceUrl;
    inspectionOperationDetails: any;
    isInfoDialogueOpen: boolean = false;
    dialogTitle: string = $localize`Info`;
    inspectionItem: any;
    characteristics: any[] = [];
    localization = Localization;
    selectedCharacteristic: any;
    isLoading: boolean = false;
    restructuredDataForGraph: any;
    chartTimeInterval: string = "minute";
    qualiEvents: any = [];
    currentMachine: Machine | undefined;
    hasSingleCharacteristics: boolean = false;
    singleCharacteristicsDefinitions: any = {
        upperLimit: null,
        lowerLimit: null,
        unitOfMeasure: null
    };
    availableResourceEquipmentType: ProdInspectionOperationResource[] = [];
    availableResourceAttachmentType: ProdInspectionOperationResource[] = [];
    selectedInspectionOperationPos: any = "";
    isUserBlocked: boolean = false;
    fileNotFound: boolean = false;
    currentLangCode: string = "";

    constructor(
        public authService: AuthService,
        private commonService: CommonService,
        private router: Router,
        private dataService: DataService,
        private machineboardService: MachineboardService,
        private sanitizer: DomSanitizer,
        private decimalPipe: DecimalPipe
    ) {
        this.getCurrentMachine();
    }

    ngOnInit() {
        this.currentLangCode = this.readCookie("sct_language") ?? "en";
        this.getInspectionPointDetails();
        const queryParams = {};
        this.router.navigate([], {queryParams, replaceUrl: false});
        this.machineboardService.isUserBlockedForInspectionPoint$.subscribe({
            next: (res) => {
                this.isUserBlocked = res;
            },
            error: (e) => {

            },
            complete: () => {
            }
        });
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    ngAfterViewInit(): void {
        this.assignForm.emit(this.form);
    }

    ngOnDestroy(): void {
        this.destroyed$.next(true);
        this.destroyed$.complete();
        document.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    readCookie(name: string): string | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
    }

    onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape' && this.isUserBlocked) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    getInspectionPointDetails() {
        if (!this.selectedInspectionOperation?.id) return;

        this.selectedInspectionOperationPos = this.selectedInspectionOperation.pos ?? "";

        this.availableResourceEquipmentType = this.selectedInspectionOperation.prodInspectionOperationResources.filter(
            (resource: ProdInspectionOperationResource) => resource.type === InspectionOperationResourceType.EQUIPMENT
        );

        this.availableResourceAttachmentType = this.selectedInspectionOperation.prodInspectionOperationResources.filter(
            (resource: ProdInspectionOperationResource) => resource.type === InspectionOperationResourceType.SAP_DOCUMENT
        );

        if (this.availableResourceAttachmentType.length > 0) {
            this.generateAttachmentUrl();
        }

        const inspectionId = this.inspectionPoint?.id;
        this.characteristics = [];
        this.isLoading = true;
        if (inspectionId) {
            this.commonService
                .get(
                    `inspection-point/get-inspection-point-details/${this.selectedInspectionOperation?.id}/${inspectionId}`,
                    false
                )
                .subscribe({
                    next: (res: any) => {
                        this.inspectionOperationDetails = res?.prod_order_pos_operation;
                        this.inspectionItem = res?.item;
                        this.characteristics = res?.options.map((c: any) => {
                            return {
                                ...c,
                                iconSrc: c.inspection_specification_importance_code?.icon_type
                                    ? this.getIconPath(c.inspection_specification_importance_code.icon_type)
                                    : null
                            };
                        });

                        this.isLoading = false;
                        this.getQualiEventTypes();
                        this.checkConfirmationFields();
                        this.checkFieldNotes();
                        this.checkCharacteristicsValue();
                    },
                    error: err => {
                        this.isLoading = false;
                    },
                });
        }
    }

    generateAttachmentUrl() {
        const resourceId = this.availableResourceAttachmentType?.[0]?.id;
        if (resourceId) {
            this.commonService.getOption(`import-attachment-from-btp/${resourceId}`, false, true).subscribe({
                next: (blob) => {
                    this.fileNotFound = false;
                    if (blob.type !== 'application/pdf') {
                        console.error('Error: Received non-PDF content', blob);
                        return;
                    }
                    this.fileSrc = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
                },
                error: err => {
                    this.fileNotFound = false;
                }
            });
        }
    }

    getIconPath(iconType: InspectionSpecificationImportanceCodeIconType): string {
        const basePath = './assets/icons/';
        const fileName = `icon-${iconType.toLowerCase()}.png`;
        return `${basePath}${fileName}`;
    }

    onInputChange() {
        this.checkConfirmationFields();
        this.checkFieldNotes();
        this.checkCharacteristicsValue();
    }

    checkConfirmationFields() {
        const allFilled = this.characteristics.every((char) => {
            const isDisabled = !this.isUserAuthorized(char.user_group_id);
            return isDisabled || (char.confirmation_number && char.confirmation_number !== '');
        });

        const emitValue = this.inspectionOperationDetails?.cavity > 1 ? allFilled : true;
        this.allConfirmationsFilled.emit(emitValue);
    }

    checkFieldNotes() {
        const allNotesFilled = this.characteristics
            .filter((char) => char.is_note_required == 1)
            .every((char) => {
                const isDisabled = !this.isUserAuthorized(char.user_group_id);
                return isDisabled || (char.field_note && char.field_note.trim() !== '');
            });
        this.allRequiredFieldNoteFilled.emit(allNotesFilled);
    }

    checkCharacteristicsValue() {
        const allValueWithinLimits = this.characteristics.every((char) => {
            if(char.is_quantitative) {
                if (char.inserted_value === null || char.inserted_value === undefined) {
                    return true;
                }

                let res = true;
                if (char.value_lower_limit !== undefined)
                    res = res && char.inserted_value >= char.value_lower_limit;

                if(char.value_upper_limit !== undefined)
                    res = res && char.inserted_value <= char.value_upper_limit;

                return res;
            } else {
                let vals = char.inspection_operation_characteristic_options.filter((option: any) => (option.is_selected && option.valuation == InspectionOperationCharacteristicsOptions.REJECT));
                return vals.length == 0;
            }
        });

        this.allCharacteristicsValuesInRange.emit(allValueWithinLimits);
    }

    checkCharacteristicsLength() {
        this.hasSingleCharacteristics = this.selectedInspectionOperation?.inspectionOperationCharacteristics.length == 1 && this.selectedInspectionOperation?.inspectionOperationCharacteristics[0].is_quantitative == true
        if (this.hasSingleCharacteristics) {
            let singleCharacteristic = this.selectedInspectionOperation?.inspectionOperationCharacteristics[0];
            if (singleCharacteristic) {
                Object.assign(this.singleCharacteristicsDefinitions, {
                    lowerLimit: singleCharacteristic.value_lower_limit,
                    upperLimit: singleCharacteristic.value_upper_limit,
                    unitOfMeasure: singleCharacteristic.unitOfMeasure
                });
            }

            this.generateGraphAgainstInspectionOperation(singleCharacteristic)
        }
    }

    closeDialog() {
        this.isInfoDialogueOpen = false;
    }

    openPointInfoModal(selectedCharacteristics: any) {
        this.generateGraphAgainstInspectionOperation(selectedCharacteristics);
        this.selectedCharacteristic = selectedCharacteristics;
        this.dialogTitle = this.selectedCharacteristic.name;
        this.isInfoDialogueOpen = true;
    }

    getQualiEventTypes() {
        this.isLoading = true;
        this.commonService
            .get(
                `quali-visu/get-quali-events/${this.currentMachine?.id}/${this.inspectionOperationDetails.id}`,
                false
            )
            .subscribe({
                next: (res: any) => {
                    this.qualiEvents = res.map((event: any) => {
                        const localDate = new Date(event.registered_datetime + "Z").getTime();
                        return {
                            label: QualiEventsTypeClass.getTypeTranslate(event.type),
                            date: localDate,
                        };
                    });
                    this.checkCharacteristicsLength();
                    this.isLoading = false;
                },
                error: err => {
                    this.qualiEvents = [];
                    this.checkCharacteristicsLength();
                    this.isLoading = false;
                },
            });
    }

    getCurrentMachine() {
        this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
            this.currentMachine = res;
        });
    }

    generateGraphAgainstInspectionOperation(selectedCharacter: any) {
        const selectedCharId = selectedCharacter.id;
        this.restructuredDataForGraph = this.selectedInspectionOperation?.inspectionPoints
            .flatMap((point: any) =>
                point.inspection_point_characteristics
                    ?.filter(
                        (char: any) =>
                            char.inspection_operation_characteristic_id === selectedCharId &&
                            char.value !== null
                    )
                    .map((validChar: any) => {
                        const localDate = new Date(point.registered_datetime + "Z");
                        return {
                            date: localDate.getTime(),
                            value: parseFloat(validChar.value),
                            user: validChar?.last_modified_by?.name
                        };
                    })
            )
            .filter((entry: any) => entry !== undefined)
            .sort((a: any, b: any) => a.date - b.date);
    }

    setSelectedOption(characteristic: any, selectedOption: any) {
        characteristic.inspection_operation_characteristic_options.forEach((option: any) => {
            option.is_selected = option.id === selectedOption.id;
        });
        this.checkCharacteristicsValue();
    }

    isValueOutsideRange(value?: any, minValue?: any, maxValue?: any, unit: string = "", plausibleMaxLimit?: any, plausibleMinLimit?: any, decimals: number = 0) {
        if (value == "" || !value) {
            return "";
        }

        const numValue = Number(value);
        const numMinValue = Number(minValue);
        const numMaxValue = Number(maxValue);
        const numPlausibleMin = plausibleMinLimit !== null && plausibleMinLimit !== undefined ? Number(plausibleMinLimit) : null;
        const numPlausibleMax = plausibleMaxLimit !== null && plausibleMaxLimit !== undefined ? Number(plausibleMaxLimit) : null;

        if (numPlausibleMin !== null && numValue < numPlausibleMin) {
            return $localize`Plausible Lower Limit Exceeded: ` + this.decimalPipe.transform(numPlausibleMin, '1.0-' + decimals) + (unit ? ` ${unit}` : "");
        }

        if (numPlausibleMax !== null && numValue > numPlausibleMax) {
            return $localize`Plausible Upper Limit Exceeded: ` + this.decimalPipe.transform(numPlausibleMax, '1.0-' + decimals) + (unit ? ` ${unit}` : "");
        }

        if (minValue !== undefined && numValue < numMinValue) {
            return $localize`Lower Limit Exceeded: ` + this.decimalPipe.transform(numMinValue, '1.0-' + decimals) + (unit ? ` ${unit}` : "");
        }

        if (maxValue !== undefined && numValue > numMaxValue) {
            return $localize`Upper Limit Exceeded: ` + this.decimalPipe.transform(numMaxValue, '1.0-' + decimals) + (unit ? ` ${unit}` : "");
        }

        return "";
    }

    getValueStateBasedOnLimit(value?: any, minValue?: any, maxValue?: any, plausibleMinLimit?: any, plausibleMaxLimit?: any): string {
        if (value === "" || value === null || value === undefined) {
            return "";
        }

        const numPlausibleMin = plausibleMinLimit !== null && plausibleMinLimit !== undefined ? Number(plausibleMinLimit) : null;
        const numPlausibleMax = plausibleMaxLimit !== null && plausibleMaxLimit !== undefined ? Number(plausibleMaxLimit) : null;

        if (numPlausibleMin !== null && Number(value) < Number(numPlausibleMin)) {
            return "PlausibleLowerExceeded";
        }

        if (numPlausibleMax !== null && Number(value) > Number(numPlausibleMax)) {
            return "PlausibleUpperExceeded";
        }

        if (minValue !== undefined && Number(value) < Number(minValue)) {
            return "LowerExceeded";
        }

        if (maxValue !== undefined && Number(value) > Number(maxValue)) {
            return "UpperExceeded";
        }

        return "";
    }

    getValueState(c: any, character: any): 'None' | 'Positive' | 'Negative' | 'Critical' {
        if (!(character.touched || character.dirty || c.inserted_value !== null)) {
            return 'None';
        }

        if (character.invalid) {
            return 'Negative';
        }

        const state = this.getValueStateBasedOnLimit(
            c.inserted_value,
            c.value_lower_limit,
            c.value_upper_limit,
            c?.value_lower_limit_plausible,
            c?.value_upper_limit_plausible
        );

        switch (state) {
            case 'PlausibleLowerExceeded':
                return 'Negative';
            case 'PlausibleUpperExceeded':
                return 'Negative';
            case 'LowerExceeded':
                return 'Critical';
            case 'UpperExceeded':
                return 'Critical';
            default:
                return 'None';
        }
    }

    disableArrowKeys(event: KeyboardEvent): void {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
        }
    }

    preventDecimal(event: KeyboardEvent) {
        const charCode = event.key;
        if (charCode === "." || charCode === ",") {
            event.preventDefault();
        }
    }

    isUserAuthorized(userGroupId: number | null): boolean {
        if (userGroupId === null) {
            return true;
        }

        return this.userGroupsAvailable?.some((userGroup: any) => userGroup.id == userGroupId);
    }

    protected readonly ProdInspectionOperationFrequencyClass = ProdInspectionOperationFrequencyClass;
}
