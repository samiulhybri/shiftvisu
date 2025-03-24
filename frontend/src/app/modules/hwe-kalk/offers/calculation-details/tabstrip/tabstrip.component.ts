import {Component, ComponentRef, EventEmitter, inject, Input, Output, ViewChild, ViewContainerRef} from '@angular/core';
import {Calculation} from '@app/models/calculation';
import {Documentation} from '@app/models/documentation';
import {Material} from '@app/models/material';
import {Metallography} from '@app/models/metallography';
import {NonDestructiveTesting} from '@app/models/non-destructive-testing';
import {ODataBatchCall} from '@app/models/odata-batch-call';
import {OfferPos} from '@app/models/offer-pos';
import {ResidualMaterial} from '@app/models/residual-materials';
import {TestingScope} from '@app/models/testing-scope';
import {CalculationHeatTreatment} from '@app/models/calculation-heat-treatment';
import {SpecificationsComponent} from '@app/modules/hwe-kalk/specifications/specifications.component';
import {ComboFilter} from '@app/shared/classes/combo-filter';
import {CommonService} from '@app/shared/services/common.service';
import {CalculationAdditionalHeatTreatment} from '@app/models/calculation-additional-heat-treatment';
import {FileInfo, FileRestrictions, UploadEvent} from "@progress/kendo-angular-upload";
import {DomSanitizer} from '@angular/platform-browser';
import {Notification} from '@app/shared/services/notification.service';
import {OfferPosWorkPlanName, OfferPosWorkPlanNameClass} from '@app/modules/hwe-kalk/enums/OfferPosWorkPlanName';
import {OfferPosProductType} from '@app/modules/hwe-kalk/enums/OfferPosProductType';
import {Attestation} from '@app/modules/hwe-kalk/enums/Attestation';
import {SpecimenMaterial} from '@app/modules/hwe-kalk/enums/SpecimenMaterial';
import {DeliveryState} from '@app/modules/hwe-kalk/enums/DeliveryState';
import {CalculationHeatTreatmentType} from '@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType';
import {
    CalculationAdditionalHeatTreatmentType
} from '@app/modules/hwe-kalk/enums/CalculationAdditionalHeatTreatmentType';
import {CalculationDocumentation} from '@app/models/calculation-documentation';
import {CalculationResidualMaterial} from '@app/models/calculation-rasidual-material';
import {CalculationNonDestructiveTesting} from '@app/models/calculation-non-destructive-testing';
import {CalculationMetallography} from '@app/models/calculation-metallography';
import {tap, timer} from 'rxjs';
import {CalculationTestingScope} from '@app/models/calculation-testing-scope';
import {OfferPosRawDimension} from '@app/models/offer-pos-raw-dimension';
import {Deformation} from '@app/models/deformation';
import {HardenabilityRange} from '@app/models/hardenability-range';
import {MaterialAnalysis} from '@app/models/material-analysis';
import {OpPlanPosHeatTreatmentComponent} from '../op-plan-pos-heat-treatment/op-plan-pos-heat-treatment.component';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import {Machine} from "@app/models/machine";
import {HweWorkPlan} from "@app/models/hwe-work-plan";
import {HweWorkPlanHeatTreatment} from "@app/models/hwe-work-plan-heat-treatment";
import {OperationPlanPos} from "@app/models/operation-plan-pos";
import {OperationPlan} from "@app/models/operation-plan";
import {HweKalkService} from '@app/modules/hwe-kalk/hwe-kalk.service';
import {MtNorm} from "@app/models/mt-norm";
import {VtNorm} from "@app/models/vt-norm";
import {PtNorm} from "@app/models/pt-norm";
import {SurfaceCrackTestMethod} from "@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod";
import {HweWorkPlanUnitEnum, HweWorkPlanUnitClass} from '@app/modules/hwe-kalk/enums/HweWorkPlanUnit';
import {CalculationHardenabilityRange} from "@app/models/calculation-hardenability-range";
import {CalculationMaterialAnalysis} from "@app/models/calculation-material-analysis";
import {CalculationDeformation} from "@app/models/calculation-deformation";

@Component({
    selector: "app-tabstrip",
    templateUrl: "./tabstrip.component.html",
    styleUrls: ["./tabstrip.component.scss"],
})
export class TabstripComponent {
    protected _commonService = inject(CommonService)
    public metallographies: Metallography[] = [];
    public documentations: Documentation[] = [];
    public testingScopes: TestingScope[] = [];
    public nonDestructiveTestings: NonDestructiveTesting[] = [];
    public specifications: SpecificationsComponent[] = [];
    public residualMaterials: ResidualMaterial[] = [];
    public hweWorkPlans: HweWorkPlan[] = [];
    public cmbItem: any;
    public cmbMachines: any;
    public cmbMetallographies: any;
    public cmbDocumentations: any;
    public cmbTestingScopes: any;
    public cmbUsNorms: any;
    public cmbItems: any;
    public cmbSpecifications: any;
    public cmbMtNorms: any;
    public previewHtml: any;
    public cmbPtNorms: any;
    public cmbVtNorms: any;
    public formData: any;
    public cmbResidualMaterials: any;
    public cmbHweWorkPlans: any;
    public cmbNonDestructiveTestings: any;
    public boms: any = [];
    public machines: any = [];
    public mGroupByCustomId: any = {};
    public infoPopupModel: any = undefined;
    public infoPopupWidth: string = '90vw';
    public isInfoPopupClosed: boolean = false;
    public selectedAssessmentType: string = '';
    public filesArr: Array<FileInfo> = [];
    public operationsFilesArr: Array<FileInfo> = [];
    public previewDialogOpened: boolean = false;
    public selectedFile: string = "";
    public isShowAttachmentLoader: boolean = false;
    public workPlanNames!: Array<{ value: string, text: string }>;
    public workPlanUnits!: Array<{ value: string, text: string }>;
    public cmbworkPlanNames: any;
    public cmbworkPlanUnits: any;
    public isAllDisabled: boolean = true;
    public cmpRef!: ComponentRef<any>;
    public selectedWindowWidth: string = "75vw";
    public hardenabilityRanges: HardenabilityRange[] = [];
    public materialAnalyses: MaterialAnalysis[] = [];
    public deformations: Deformation[] = [];
    public cmbHardenabilityRanges: any;
    public cmbMaterialAnalyses: any;
    public cmbDeformations: any;
    public cmbMaterials: any;
    public permissionEnum = PermissionEnum;
    public selectedOperationPlanPos?: OperationPlanPos;
    public authService = inject(AuthService)
    public hasWorkPlanDeletePermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_WORK_PLAN_DELETE_BUTTON_VIEW);
    public hasWorkPlanGeneratePermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_WORK_PLAN_GENERATE_BUTTON_VIEW);
    public hasWorkPlanNewPermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_WORK_PLAN_NEW_BUTTON_VIEW);
    public hasWorkPlanGridDeletePermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_WORK_PLAN_GRID_DELETE_BUTTON_VIEW);
    public additionalText = '';
    public selectedOfferPosMaterial: any = [];
    public filteredSpecifications: any = [];
    public materialSelectionChanged: boolean = false;

    @Input() offerPos!: OfferPos;
    @Input() set offerPosData(dataItem: OfferPos){
        if(dataItem){
            this.offerPos = dataItem;
            this.loadFiles(false);
        } 
    }
    @Input() set offerPosSelectedMaterial(dataItem: any){
        this.selectedOfferPosMaterial = dataItem
        if(this.specifications.length > 0) {
            this.updateSpecificationsAccordingMaterial()
        }
    }
    @Input() set isMaterialChanged(dataItem: any){
        this.materialSelectionChanged = dataItem;
        if(this.materialSelectionChanged && this.calculation.specification) {
            this.specificationValueChange(null);
            this.calculation.specification = undefined;   
        }
    }
    @Input() calculation!: Calculation;
    @Input() isWindowLoaderEnabled: boolean = true;
    @Input() opPlanPos: any;
    @Input() calculationHeatTreatments!: CalculationHeatTreatment[];
    @Input() calculationAdditionalHeatTreatments!: CalculationAdditionalHeatTreatment[];
    @Input() hasValidationErrorHeatTreatment: boolean = false;
    @Input() hasValidationErrorAdditionalHeatTreatment: boolean = false;
    @Input() submitted: boolean = false;
    @Input() hasValidationErrorShaftUpsetPart: boolean = false;
    @Input() isValid: boolean = false;
    @Output() addEmiter = new EventEmitter<any>();
    @Output() deleteEmiter = new EventEmitter<any>();

    public uploadRemoveUrl = "removeUrl";
    @ViewChild("modalBody", {read: ViewContainerRef})
    modalBody!: ViewContainerRef;
    public fileRestrictions: FileRestrictions = {
        allowedExtensions: [
            ".jpg",
            ".jpeg",
            ".png",
            ".docx",
            ".pdf",
            ".doc",
            ".ppt",
            ".pptx",
            ".xlx",
            ".xlsx",
            ".xlsm",
            ".xlsb",
            ".xls",
        ],
        maxFileSize: 4194304,
    };

    certainWorkPlanNames = [
        OfferPosWorkPlanName.WARM_TAKEOVER,
        OfferPosWorkPlanName.GLOWING,
        OfferPosWorkPlanName.NORMALIZING,
        OfferPosWorkPlanName.DIFFUSION_ANNEALING,
        OfferPosWorkPlanName.SOLUTION_ANNEALING,
        OfferPosWorkPlanName.RELAXATION,
        OfferPosWorkPlanName.WEG,
        OfferPosWorkPlanName.HARDENING,
        OfferPosWorkPlanName.TEMPERING_1,
        OfferPosWorkPlanName.TEMPERING_2,
        OfferPosWorkPlanName.FP_STAGE_1,
        OfferPosWorkPlanName.FP_STAGE_2,
        OfferPosWorkPlanName.BG_STAGE_1,
        OfferPosWorkPlanName.BG_STAGE_2,
        OfferPosWorkPlanName.BG_STAGE_2,
        OfferPosWorkPlanName.BF_STAGE_1,
        OfferPosWorkPlanName.BF_STAGE_2,
        OfferPosWorkPlanName.PREHEATING_FOR_STRAIGHTENING,
        OfferPosWorkPlanName.HARDENING
    ];

    constructor(
        private sanitizer: DomSanitizer,
        protected _notification: Notification,
        public hweKalkService: HweKalkService
    ) {
        this.workPlanNames = OfferPosWorkPlanNameClass.getEnumArray();
        this.workPlanUnits = HweWorkPlanUnitClass.getEnumArray();
        this.cmbworkPlanNames = new ComboFilter(this.workPlanNames);
        this.cmbworkPlanUnits = new ComboFilter(this.workPlanUnits);

    }

    ngOnInit() {
        this.batchCall();
        this.additionalText = this.offerPos.generateText4() ? this.offerPos.generateText4().replace(/\n/g, '<br>') : '';
        this.hweKalkService.copyOfferPos.subscribe({
            next: (value: any) => {
                this.loadFiles(false, false)
            }
        })
    }

    isPermissionValidate(): boolean {
        return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_WORK_PLAN_EDIT)
    }

    isSummeryPermissionValidate(): boolean {
        return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_SUMMARY_VIEW)
    }

    isAssessmentPermissionValidate(): boolean {
        return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_ASSESSMENT_EDIT_VIEW)
    }

    batchCall() {
        this.isWindowLoaderEnabled = true;
        let requests: ODataBatchCall[] = [];
        requests.push(
            new ODataBatchCall(0, "get", `\/odata\/Metallographies?$expand=cleanlinessDeterminationAccordingTo&$top=10000000`)
        );
        requests.push(new ODataBatchCall(
            1,
            "get",
            `\/odata\/Machines?$top=10000000&$expand=costCenter($expand=costCenterCostToday)`
        ));
        requests.push(new ODataBatchCall(
            2,
            "get",
            `\/odata\/Documentations?expand=certificates&$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            3,
            "get",
            `\/odata\/TestingScopes?$top=10000000&$expand=sampleDepths,attestationEntities,accordingToTensileTests,accordingToImpactTests,meltingTypes,classifiedBies`
        ));
        requests.push(new ODataBatchCall(
            4,
            "get",
            `\/odata\/HardenabilityRanges?expand=materials&$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            5,
            "get",
            `\/odata\/MaterialAnalyses?expand=materials,chemAnalyses&$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            6,
            "get",
            `\/odata\/Deformations?$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            7,
            "get",
            `\/odata\/ResidualMaterials?$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            8,
            "get",
            `\/odata\/NonDestructiveTestings?$expand=attestationEntities,usNorm,nonDestructiveNorm&$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            9,
            "get",
            `\/odata\/Specifications?$top=10000000&$expand=material,hweWorkPlan($expand=heatTreatments,additionalHeatTreatments),metallography,documentation,testingScope,nonDestructiveTesting,usNorm,mtNorm,ptNorm,vtNorm,residualMaterial,hardenabilityRange(expand=materials),materialAnalysis(expand=materials,chemAnalyses),deformation`
        ));
        requests.push(new ODataBatchCall(
            10,
            "get",
            `\/odata\/HweWorkPlans?$top=10000000&$expand=heatTreatments,additionalHeatTreatments`
        ));

        this._commonService.post("$batch", {requests}).subscribe({
            next: (response: any) => {
                this.metallographies = response.responses[0].body.value;
                this.machines = response.responses[1].body.value;
                this.documentations = response.responses[2].body.value;
                this.testingScopes = response.responses[3].body.value;
                this.hardenabilityRanges = response.responses[4].body.value;
                this.cmbHardenabilityRanges = new ComboFilter(this.hardenabilityRanges);
                this.materialAnalyses = response.responses[5].body.value;
                this.cmbMaterialAnalyses = new ComboFilter(this.materialAnalyses);
                this.deformations = response.responses[6].body.value;
                this.cmbDeformations = new ComboFilter(this.deformations);
                this.residualMaterials = response.responses[7].body.value;
                this.nonDestructiveTestings = response.responses[8].body.value;
                this.specifications = response.responses[9].body.value;
                this.hweWorkPlans = response.responses[10].body.value;
                this.cmbMachines = new ComboFilter(this.machines);
                this.cmbMachines = new ComboFilter(this.machines);
                this.cmbMetallographies = new ComboFilter(this.metallographies);
                this.cmbHweWorkPlans = new ComboFilter(this.hweWorkPlans);
                this.cmbDocumentations = new ComboFilter(this.documentations);
                this.cmbTestingScopes = new ComboFilter(this.testingScopes);
                this.cmbResidualMaterials = new ComboFilter(this.residualMaterials);
                this.cmbNonDestructiveTestings = new ComboFilter(
                    this.nonDestructiveTestings
                );
                this.cmbSpecifications = new ComboFilter(this.specifications);
                this.isWindowLoaderEnabled = false;
                this.machines.map((machine: Machine) => {
                    if (machine.custom_id) {
                        this.mGroupByCustomId[machine.custom_id] =
                            new Machine().deserialize(machine);
                    }
                });
                this.updateSpecificationsAccordingMaterial()
            },
            error: (e) => (this.isWindowLoaderEnabled = false),
        });
    }

    updateSpecificationsAccordingMaterial() {
        this.filteredSpecifications = [...this.specifications];
        if (this.selectedOfferPosMaterial && this.selectedOfferPosMaterial.id && !this.calculation.specification) {
            this.filteredSpecifications = this.specifications.filter((spec: any) => spec.material_id == this.selectedOfferPosMaterial.id);
        }
    }

    public close(): void {
        this.previewDialogOpened = false;
    }

    public upload(e: UploadEvent, model?: string, id?: number): void {
        this.isShowAttachmentLoader = true;
        e.preventDefault();
        let formdata = new FormData();
        formdata.append("id", id ? id + "" : this.offerPos?.id + "");
        formdata.append("model", model ?? "OfferPos");
        formdata.append("media", e.files[0].rawFile ?? "");
        this._commonService.post("media/upload", formdata, false).subscribe({
            next: (response: any) => {
                id ? this.loadFiles(true, true) : this.loadFiles();
            },
            error: () => (this.isShowAttachmentLoader = false),
        });
    }

    uploadWorkPlan(e: UploadEvent) {
        this.upload(e, 'OperationPlanPos', this.selectedOperationPlanPos?.id)
    }

    loadFiles(isShowAttachmentLoader = true, fromOperation = false) {
        this.isShowAttachmentLoader = isShowAttachmentLoader;
        let url = fromOperation ? `media/OperationPlanPos/${this.selectedOperationPlanPos?.id}` : `media/OfferPos/${this.offerPos.id}`;
        this._commonService
            .get(url, false)
            .subscribe({
                next: (response: any) => {
                    let file_arr = response?.media;

                    file_arr?.forEach((e: any) => {
                        e.name = e.file_name;
                    });

                    this.selectedOperationPlanPos ? this.operationsFilesArr = file_arr : this.filesArr = file_arr;
                    this.isShowAttachmentLoader = false;
                },
                error: (e) => {
                    this.isShowAttachmentLoader = false;
                },
            });
    }

    openAttachment(data: OperationPlanPos) {
        this.selectedOperationPlanPos = data;
        this.loadFiles(true, true)
    }

    public getIconForFile(files: any[]): string {
        // Use a switch case to handle different file extensions
        const extension = files[0]?.extension?.toLowerCase() ?? "";
        switch (extension) {
            case ".pdf":
                return "assets/icons/pdf.png";
            case ".doc":
            case ".docx":
                return "assets/icons/doc.png";
            case ".png":
            case ".jpg":
            case ".jpeg":
                return files[0]?.original_url;
            case ".ppt":
            case ".pptx":
                return "assets/icons/ppt.png";
            case ".xls":
            case ".xlsx":
            case ".xlsm":
            case ".xlsb":
                return "assets/icons/xlx.png";
            default:
                return "assets/icons/unknown.png";
        }
    }

    public convertFileSize(bytes: number): string {
        if (bytes < 1024) {
            return bytes + " B";
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(3) + " KB";
        } else {
            return (bytes / (1024 * 1024)).toFixed(3) + " MB";
        }
    }

    public show(files: any[]): void {
        this.selectedFile = files[0];
        if (files[0]?.original_url) {
            if (files[0]?.mime_type.includes("image")) {
                this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(
                    `<img src="${files[0]?.original_url}" alt="Image Preview" style="max-width: 100%;max-height: 100%"/>`
                );
                this.previewDialogOpened = true
            } else if (files[0]?.mime_type == "application/pdf") {
                this.previewHtml = this.sanitizer.bypassSecurityTrustHtml(
                    `<embed style="width: 100%" src="${files[0]?.original_url}" id="pdf" />`
                );
                this.previewDialogOpened = true
            } else if (files[0]?.mime_type == "text/plain") {
                fetch(files[0].original_url)
                    .then(response => response.blob())
                    .then(blob => {
                        const link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = files[0].file_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })

            } else {
                this.downloadFile(files[0])
            }

        }
    }

    downloadFile(file: any) {
        const fileUrl = file?.original_url;
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = file.file_name
        downloadLink.click()

    }

    public remove(e: any): void {
        this._notification.deleteItem().subscribe((result: any) => {
            if (result.action == 'next') {
                let item: any = e[0];
                if (item.id) {
                    this.isShowAttachmentLoader = true;
                    this._commonService.delete(`Media(${item.id})`).subscribe({
                        next: (response: any) => {
                            if (this.selectedOperationPlanPos) this.loadFiles(true, true);
                            else this.loadFiles();
                        }
                    });
                }
            }
        });
    }

    cancelHandler(event: any) {
        this.formData = undefined;
        if (this.cmpRef.instance.onCancel) this.cmpRef.instance.onCancel();
    }

    handleFilter(value: String, src: String) {
        switch (src) {
            case "machine":
                this.machines =
                    this.cmbMachines.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "metallography":
                this.metallographies =
                    this.cmbMetallographies.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "documentation":
                this.documentations =
                    this.cmbDocumentations.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;

            case "testing_scope":
                this.testingScopes =
                    this.cmbTestingScopes.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "residual_material":
                this.residualMaterials =
                    this.cmbResidualMaterials.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "non_destructive_testing":
                this.nonDestructiveTestings =
                    this.cmbNonDestructiveTestings.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "specification":
                this.specifications =
                    this.cmbSpecifications.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "workPlan":
                this.workPlanNames =
                    this.cmbworkPlanNames.handleLocalDataFilter(
                        value,
                        "text"
                    );
                break;
            case "unit":
                this.workPlanUnits =
                    this.cmbworkPlanUnits.handleLocalDataFilter(
                        value,
                        "text"
                    );
                break;
            case "hardenability_range":
                this.hardenabilityRanges =
                    this.cmbHardenabilityRanges.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "material_analysis":
                this.materialAnalyses =
                    this.cmbMaterialAnalyses.handleLocalDataFilter(
                        value,
                        "material_analysis"
                    );
                break;
            case "deformation":
                this.deformations =
                    this.cmbDeformations.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "hwe_work_plan":
                this.hweWorkPlans =
                    this.cmbHweWorkPlans.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;

        }
    }

    documentationChange(documentation?: Documentation) {

        let bodyData = {
            ...documentation,
            calculation_id: this.calculation.id,
            documentation_id: documentation?.id,
        }
        this.calculation.calculationDocumentation = new CalculationDocumentation().deserialize(documentation ? bodyData : {})
    }

    nonDestructiveTestingChange(nonDestructiveTesting?: NonDestructiveTesting) {

        let bodyData = {
            ...nonDestructiveTesting,
            calculation_id: this.calculation.id,
            non_destructive_testing_id: nonDestructiveTesting?.id,
        }
        this.calculation.calculationNonDestructiveTesting = new CalculationNonDestructiveTesting().deserialize(nonDestructiveTesting ? bodyData : {})
    }

    hardenabilityRangeTestingChange(hardenabilityRange?: HardenabilityRange) {

        let bodyData = {
            ...hardenabilityRange,
            calculation_id: this.calculation.id,
            hardenability_range_id: hardenabilityRange?.id,
        }
        this.calculation.calculationHardenabilityRange = new CalculationHardenabilityRange().deserialize(hardenabilityRange ? bodyData : {})
    }

    materialAnalysisChange(materialAnalysis?: MaterialAnalysis) {

        let bodyData = {
            ...materialAnalysis,
            calculation_id: this.calculation.id,
            material_analysis_id: materialAnalysis?.id,
        }
        this.calculation.calculationMaterialAnalysis = new CalculationMaterialAnalysis().deserialize(materialAnalysis ? bodyData : {})
    }

    deformation(deformation?: Deformation) {

        let bodyData = {
            ...deformation,
            calculation_id: this.calculation.id,
            deformation_id: deformation?.id,
        }
        this.calculation.calculationDeformation = new CalculationDeformation().deserialize(deformation ? bodyData : {})
    }


    metallographyChange(metallography?: Metallography) {

        let bodyData = {
            ...metallography,
            calculation_id: this.calculation.id,
            metallography_id: metallography?.id,
        }
        this.calculation.calculationMetallography = new CalculationMetallography().deserialize(metallography ? bodyData : {})
    }

    testingScopeChange(testingScope?: TestingScope) {

        let bodyData = {
            ...testingScope,
            calculation_id: this.calculation.id,
            testing_scope_id: testingScope?.id,
        }
        this.calculation.calculationTestingScope = new CalculationTestingScope().deserialize(testingScope ? bodyData : {})
    }

    residualMaterialChange(residualMaterial?: ResidualMaterial) {

        let bodyData = {
            ...residualMaterial,
            calculation_id: this.calculation.id,
            residual_material_id: residualMaterial?.id,
        }
        this.calculation.calculationResidualMaterial = new CalculationResidualMaterial().deserialize(residualMaterial ? bodyData : {})
    }

    addOpperations() {
        this.addEmiter.emit()
    }

    removeOperations(data: any, index: number, mode: string) {
        this.deleteEmiter.emit({data, index, mode})
    }

    specificationValueChange(value: any): void {
        this.calculation.documentation = value ? value.documentation : null;
        this.calculation.metallography = value ? value.metallography : null;
        this.calculation.testingScope = value ? value.testingScope : null;
        this.calculation.nonDestructiveTesting = value ? value.nonDestructiveTesting : null;
        this.calculation.hardenabilityRange = value ? value.hardenabilityRange : null;
        this.calculation.materialAnalysis = value ? value.materialAnalysis : null;
        this.calculation.deformation = value ? value.deformation : null;
        this.calculation.residualMaterial = value ? value.residualMaterial : null;
        this.calculation.hweWorkPlan = value ? value.hweWorkPlan : null;
        this.documentationChange(this.calculation.documentation);
        this.residualMaterialChange(this.calculation.residualMaterial)
        this.nonDestructiveTestingChange(this.calculation.nonDestructiveTesting)
        this.metallographyChange(this.calculation.metallography)
        this.testingScopeChange(this.calculation.testingScope)

        this.hardenabilityRangeTestingChange(this.calculation.hardenabilityRange)
        this.materialAnalysisChange(this.calculation.materialAnalysis)
        this.deformation(this.calculation.deformation)


        if (value?.hweWorkPlan?.id) this.hweWorkPlanValueChange(value.hweWorkPlan)
    }

    
    getCrossSectionTableMachine() {
        const maxSemiProduct = this.offerPos.getMaxRawMeasurementSemiFinishedProduct();

        return (maxSemiProduct >= 0 && maxSemiProduct <= 400) ? '152600' : ((maxSemiProduct > 400 && maxSemiProduct <= 600) ? '152650' : (maxSemiProduct > 600 && maxSemiProduct <= 2100) ? '152420' : '');
    }

    getBWTableMachine() {
        if (this.offerPos.product_type === OfferPosProductType.PIPE) return !this.offerPos.length_final ? '' : this.offerPos.length_final < 2000 ? '410' : '601';
        if (this.offerPos.product_type === OfferPosProductType.SHAFT) return !this.offerPos.total_length ? '' : this.offerPos.total_length < 2000 ? '410' : '601';
        if (this.offerPos.product_type &&
            [
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.RING_ROLLED,
                OfferPosProductType.DISK_PUNCHED
            ].includes(this.offerPos.product_type)
        ) {
            return !this.offerPos.outer_diameter_final ? '' : this.offerPos.outer_diameter_final < 1000 ? '501' : '570';
        }

        return '';
    }

    getWeightTableMachine() {
        const maxWeight = this.offerPos.getMaxRawMeasurementOperatingWeight();

        if (maxWeight >= 0 && maxWeight <= 350) return '30_ZTR.';
        if (maxWeight > 350 && maxWeight <= 500) return '40_ZTR.';
        if (maxWeight > 500 && maxWeight <= 1500) return '60_ZTR.';
        if (maxWeight > 1500 && maxWeight <= 2500) return 'P1';
        if (maxWeight > 2500 && maxWeight <= 25000) return 'P2';

        return '';
    }

    getDimensionTableMachine() {
        if (this.offerPos.product_type === OfferPosProductType.BAR_SQUARE) {
            const maxSideA = this.offerPos.getMaxRawMeasurementSideA();

            if (maxSideA >= 0 && maxSideA <= 400) return '40_ZTR.';
            if (maxSideA > 400 && maxSideA <= 500) return 'P1';
            if (maxSideA > 500 && maxSideA <= 1200) return 'P2';
        }

        let finalDimensionEncoreInfo = 0;

        if (this.offerPos.product_type === OfferPosProductType.BAR_ROUND) finalDimensionEncoreInfo += (this.offerPos.outer_diameter_final ?? 0) + (this.offerPos.length_final ?? 0);
        if (this.offerPos.product_type === OfferPosProductType.SHAFT) finalDimensionEncoreInfo += (this.offerPos.max_outer_diameter ?? 0) + (this.offerPos.outer_diameter_encore_info ?? 0);

        if (finalDimensionEncoreInfo >= 0 && finalDimensionEncoreInfo <= 300) return '40_ZTR.';
        if (finalDimensionEncoreInfo > 300 && finalDimensionEncoreInfo <= 400) return '60_ZTR.';
        if (finalDimensionEncoreInfo > 400 && finalDimensionEncoreInfo <= 550) return 'P1';
        if (finalDimensionEncoreInfo > 550 && finalDimensionEncoreInfo <= 1200) return 'P2';

        return '';
    }

    getProcessingTimeForToCompress(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case 'P1':
            case 'P2':
                return 0.1 * 60 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForForgeH(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case 'P1':
            case 'P2':
                return 0.4 * maxOperatingWeight / 100;
            case '60_ZTR.':
                return 1.35 * maxOperatingWeight / 100;
            case '40_ZTR.':
                return 2.2 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForForgeS(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case '40_ZTR.':
                return 4 * maxOperatingWeight / 100;
            case '60_ZTR.':
                return 2.2 * maxOperatingWeight / 100;
            case 'P1':
                return maxOperatingWeight / 100;
            case 'P2':
                return 0.9 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForPunch(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case '30_ZTR.':
                if (maxOperatingWeight >= 0 && maxOperatingWeight <= 200) return 10;
                if (maxOperatingWeight > 200 && maxOperatingWeight <= 300) return 11;
                if (maxOperatingWeight > 300 && maxOperatingWeight <= 350) return 12;
                return;
            case '40_ZTR.':
                if (maxOperatingWeight > 350 && maxOperatingWeight <= 400) return 15;
                if (maxOperatingWeight > 400 && maxOperatingWeight <= 450) return 16;
                if (maxOperatingWeight > 450 && maxOperatingWeight <= 500) return 17;
                return;
            case '60_ZTR.':
                if (maxOperatingWeight > 500 && maxOperatingWeight <= 750) return 15;
                if (maxOperatingWeight > 750 && maxOperatingWeight <= 1500) return 2 * maxOperatingWeight / 100;
                return;
            case 'P1':
                if (maxOperatingWeight > 1500 && maxOperatingWeight <= 2000) return 1.2 * maxOperatingWeight / 100;
                return;
            case 'P2':
                if (maxOperatingWeight > 2000 && maxOperatingWeight <= 25000) return 0.9 * maxOperatingWeight / 100;
                return;
            default:
                return;
        }
    }

    getProcessingTimeForFinishForge(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case '30_ZTR.':
                if (maxOperatingWeight >= 0 && maxOperatingWeight <= 200) return 10;
                if (maxOperatingWeight > 200 && maxOperatingWeight <= 300) return 11;
                if (maxOperatingWeight > 300 && maxOperatingWeight <= 350) return 12;
                return;
            case '40_ZTR.':
                if (maxOperatingWeight > 350 && maxOperatingWeight <= 400) return 17;
                if (maxOperatingWeight > 400 && maxOperatingWeight <= 450) return 18;
                if (maxOperatingWeight > 450 && maxOperatingWeight <= 500) return 19;
                return;
            case '60_ZTR.':
                if (maxOperatingWeight > 500 && maxOperatingWeight <= 750) return 16;
                if (maxOperatingWeight > 750 && maxOperatingWeight <= 1500) return 2.2 * maxOperatingWeight / 100;
                return;
            case 'P1':
                if (maxOperatingWeight > 1500 && maxOperatingWeight <= 2000) return 1.2 * maxOperatingWeight / 100;
                return;
            case 'P2':
                if (maxOperatingWeight > 2000 && maxOperatingWeight <= 25000) return 0.9 * maxOperatingWeight / 100;
                return;
            default:
                return;
        }
    }

    getProcessingTimeForFinishForgeLs(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case '30_ZTR.':
                if (maxOperatingWeight >= 0 && maxOperatingWeight <= 200) return 11;
                if (maxOperatingWeight > 200 && maxOperatingWeight <= 300) return 12;
                if (maxOperatingWeight > 300 && maxOperatingWeight <= 350) return 13;
                return;
            case '40_ZTR.':
                if (maxOperatingWeight > 350 && maxOperatingWeight <= 400) return 18;
                if (maxOperatingWeight > 400 && maxOperatingWeight <= 450) return 19;
                if (maxOperatingWeight > 450 && maxOperatingWeight <= 500) return 20;
                return;
            case '60_ZTR.':
                if (maxOperatingWeight > 500 && maxOperatingWeight <= 750) return 17;
                if (maxOperatingWeight > 750 && maxOperatingWeight <= 1500) return 2.3 * maxOperatingWeight / 100;
                return;
            case 'P1':
                if (maxOperatingWeight > 1500 && maxOperatingWeight <= 2000) return 1.2 * maxOperatingWeight / 100;
                return;
            case 'P2':
                if (maxOperatingWeight > 2000 && maxOperatingWeight <= 25000) return 0.9 * maxOperatingWeight / 100;
                return;
            default:
                return;
        }
    }

    getProcessingTimeForFinishForgeReck(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case '40_ZTR.':
                return 5 * maxOperatingWeight / 100;
            case '60_ZTR.':
                return 2.5 * maxOperatingWeight / 100;
            case 'P1':
                return 1.1 * maxOperatingWeight / 100;
            case 'P2':
                return maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForStretch(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case 'P1':
            case 'P2':
                return 0.9 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForRollsAndCompress(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case 'P1':
            case 'P2':
                return 1.1 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimeForRollingUp(machine: string, maxOperatingWeight: number) {
        switch (machine) {
            case 'P1':
                return 1.2 * maxOperatingWeight / 100;
            case 'P2':
                return 1 * maxOperatingWeight / 100;
            default:
                return;
        }
    }

    getProcessingTimes(workPlan: OfferPosWorkPlanName, machine: string) {
        let maxOperatingWeight = this.offerPos.getMaxRawMeasurementOperatingWeight();

        switch (workPlan) {
            case OfferPosWorkPlanName.UPSETTING_ON:
                return this.getProcessingTimeForToCompress(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.PRE_FORGING_SEMI_FINISHED_PRODUCT:
                return this.getProcessingTimeForForgeH(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.PRE_FORGING_FOR_UPSETTING:
                return this.getProcessingTimeForForgeS(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.PUNCHING:
                return this.getProcessingTimeForPunch(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.FINISHED_FORGING_S:
                return this.getProcessingTimeForFinishForge(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.FINISHED_FORGING_LS:
                return this.getProcessingTimeForFinishForgeLs(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.FINISHED_FORGING_STRETCH:
                return this.getProcessingTimeForFinishForgeReck(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.STRETCHING:
                return this.getProcessingTimeForStretch(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.ROLLING:
            case OfferPosWorkPlanName.UPSETTING:
                return this.getProcessingTimeForRollsAndCompress(machine, maxOperatingWeight);
            case OfferPosWorkPlanName.ROLLING_UP:
                return this.getProcessingTimeForRollingUp(machine, maxOperatingWeight);
            default:
                return;
        }
    }

    generateOpPlanPos() {
        /**
         * TODO: Step 1 not definable
         *
         * 60: anstauch,
         * 470: pack,
         * 480: Outbound processing,
         */

        const maxGrossWeight = this.offerPos.getMaxRawMeasurementGrossWeight()  //TODO fix with factor;
        const avgGrossWeight = this.offerPos.getAvgRawMeasurementGrossWeight()  //TODO fix with factor;
        const maxSemiProduct = this.offerPos.getMaxRawMeasurementSemiFinishedProduct();

        let defaultOperationPlans = [];

        // Client request 16.07.
        // defaultOperationPlans.push({
        //     pos: '20',
        //     name: OfferPosWorkPlanName.MATERIAL_REQUIREMENT,
        //     machine: 'MAT.BE.',
        //     te: 0//TODO Einsatzgewicht
        // });

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.GRINDING_SEMI_FINISHED_PRODUCTS)) {
            defaultOperationPlans.push({
                pos: '30',
                name: OfferPosWorkPlanName.HBZ_GRINDING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'SCHLEIF.'
            });
        }

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.TURNING_DEBURRING_SEMI_FINISHED_PRODUCTS)) {
            defaultOperationPlans.push({
                pos: '40',
                name: OfferPosWorkPlanName.HBZ_TURNING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: '601'
            });
        }

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.WELDING_SEALING)) {
            defaultOperationPlans.push({
                pos: '45',
                name: OfferPosWorkPlanName.HBZ_TURNING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'IHHWE'
            });
        }


        if (maxSemiProduct > 0) {
            defaultOperationPlans.push({
                pos: '70',
                name: OfferPosWorkPlanName.PRE_FORGING_SEMI_FINISHED_PRODUCT,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: this.getProcessingTimes(OfferPosWorkPlanName.PRE_FORGING_SEMI_FINISHED_PRODUCT, 'P2')
            });
        }

        defaultOperationPlans.push({
            pos: '75',
            name: OfferPosWorkPlanName.SAWING,
            unit: HweWorkPlanUnitEnum.MIN,
            machine: this.getCrossSectionTableMachine(),
            te: Math.max(0.1166 *
                (this.offerPos.offerPosRawDimensions && this.offerPos.offerPosRawDimensions.length ? this.offerPos.offerPosRawDimensions[0].semi_finished_product ?? 0 : 0)
                - 24.497, 5)
        });

        if (this.offerPos.product_type === OfferPosProductType.UPSET_PART) {
            defaultOperationPlans.push({
                pos: '80',
                name: OfferPosWorkPlanName.PRE_FORGING_FOR_UPSETTING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P1',
                te: this.getProcessingTimes(OfferPosWorkPlanName.PRE_FORGING_FOR_UPSETTING, 'P1')
            });
        }

        if (this.offerPos.product_type === OfferPosProductType.DISK) {
            defaultOperationPlans.push({
                pos: '90',
                name: OfferPosWorkPlanName.FINISHED_FORGING_S,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getWeightTableMachine(),
                te: this.getProcessingTimes(OfferPosWorkPlanName.FINISHED_FORGING_S, this.getWeightTableMachine())
            });
        }

        if (this.offerPos.product_type === OfferPosProductType.DISK_PUNCHED) {
            defaultOperationPlans.push({
                pos: '92',
                name: OfferPosWorkPlanName.FINISHED_FORGING_LS,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getWeightTableMachine(),
                te: this.getProcessingTimes(OfferPosWorkPlanName.FINISHED_FORGING_LS, this.getWeightTableMachine())
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.BAR_SQUARE,
                OfferPosProductType.BAR_ROUND,
                OfferPosProductType.SHAFT
            ].includes(this.offerPos.product_type)
        ) {
            defaultOperationPlans.push({
                pos: '95',
                name: OfferPosWorkPlanName.FINISHED_FORGING_STRETCH,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getDimensionTableMachine(),
                te: this.getProcessingTimes(OfferPosWorkPlanName.FINISHED_FORGING_STRETCH, this.getWeightTableMachine())
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.RING_ROLLED,
                OfferPosProductType.PIPE,
                OfferPosProductType.SHAFT_HOLLOW,
                OfferPosProductType.BAR_ROLLED
            ].includes(this.offerPos.product_type)
        ) {
            defaultOperationPlans.push({
                pos: '100',
                name: OfferPosWorkPlanName.PUNCHING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getWeightTableMachine(),
                te: this.getProcessingTimes(OfferPosWorkPlanName.PUNCHING, this.getWeightTableMachine())
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.BAR_ROLLED
            ].includes(this.offerPos.product_type)
        ) {
            defaultOperationPlans.push({
                pos: '120',
                name: OfferPosWorkPlanName.WALZEN,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'W3',
                te: avgGrossWeight
            });
        }

        if (this.offerPos.product_type === OfferPosProductType.BAR_ROLLED) {
            defaultOperationPlans.push({
                pos: '125',
                name: OfferPosWorkPlanName.FLATTENING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P1',
                te: 10
            });
        }

        if (this.offerPos.product_type == OfferPosProductType.SOCKET || (this.offerPos.product_type == OfferPosProductType.UPSET_PART && this.offerPos.is_extruded)) {
            defaultOperationPlans.push({
                pos: '130',
                name: OfferPosWorkPlanName.EXTRUSION,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: 20
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.BAR_SQUARE,
                OfferPosProductType.BAR_ROUND,
                OfferPosProductType.BAR_ROLLED,
                OfferPosProductType.SHAFT,
                OfferPosProductType.UPSET_PART,
                OfferPosProductType.SOCKET
            ].includes(this.offerPos.product_type)
        ) {
            defaultOperationPlans.push({
                pos: '160',
                name: OfferPosWorkPlanName.SAWING_F,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: '152420'
            });
        }

        if (this.offerPos.product_type === OfferPosProductType.UPSET_PART && !this.offerPos.is_extruded) {
            defaultOperationPlans.push({
                pos: '170',
                name: OfferPosWorkPlanName.UPSETTING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: this.getProcessingTimes(OfferPosWorkPlanName.UPSETTING, 'P2')
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.UPSET_PART,
                OfferPosProductType.DISK_PUNCHED,
                OfferPosProductType.PIPE,
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.RING_ROLLED,
            ].includes(this.offerPos.product_type)
            && this.offerPos.is_hollow_punching
        ) {
            defaultOperationPlans.push({
                pos: '175',
                name: OfferPosWorkPlanName.HOLLOW_PUNCHING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: 15
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.SHAFT_HOLLOW,
                OfferPosProductType.PIPE,
            ].includes(this.offerPos.product_type) &&
            this.offerPos.offerPosRawDimensions &&
            (this.offerPos.offerPosRawDimensions.length ?? 0) > 0 &&
            this.offerPos.offerPosRawDimensions[0].is_rolled
        ) {
            defaultOperationPlans.push({
                pos: '176',
                name: OfferPosWorkPlanName.ROLLING_UP,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: this.getProcessingTimes(OfferPosWorkPlanName.ROLLING_UP, 'P2')
            });
        }

        if (this.offerPos.product_type &&
            [
                OfferPosProductType.PIPE,
                OfferPosProductType.SHAFT_HOLLOW
            ].includes(this.offerPos.product_type)
        ) {
            defaultOperationPlans.push({
                pos: '177',
                name: OfferPosWorkPlanName.STRETCHING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: this.getProcessingTimes(OfferPosWorkPlanName.STRETCHING, 'P2')
            });
        }

        if (this.offerPos.product_type === OfferPosProductType.RING_ROLLED) {
            defaultOperationPlans.push({
                pos: '178',
                name: OfferPosWorkPlanName.ROLLING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'P2',
                te: this.getProcessingTimes(OfferPosWorkPlanName.ROLLING, 'P2')
            });
        }

        defaultOperationPlans.push({
            pos: '180',
            name: OfferPosWorkPlanName.FORGE_INSPECTION,
            unit: HweWorkPlanUnitEnum.EURO,
            machine: 'ROHK._S.'
        });

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.ROUGHING)) {
            defaultOperationPlans.push({
                pos: '200',
                name: OfferPosWorkPlanName.GLOWING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
            defaultOperationPlans.push({
                pos: '220',
                name: OfferPosWorkPlanName.PRE_ROUGHING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getBWTableMachine()
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.DIFFUSION_ANNEALING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_NORMALIZE, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_QUENCHING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_FP, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BG, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BF, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_TH].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '230',
                name: OfferPosWorkPlanName.DIFFUSION_ANNEALING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.NORMALIZE, CalculationHeatTreatmentType.NORMALIZE_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.NORMALIZE_QUENCHING, CalculationHeatTreatmentType.NORMALIZE_QUENCHING_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_NORMALIZE].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '240',
                name: OfferPosWorkPlanName.NORMALIZING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.GLOWING) &&
            !this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.ROUGHING)) {
            defaultOperationPlans.push({
                pos: '250',
                name: OfferPosWorkPlanName.GLOWING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.SOLUTION_ANNEALING)) {
            defaultOperationPlans.push({
                pos: '260',
                name: OfferPosWorkPlanName.SOLUTION_ANNEALING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.STRESS_RELIEVING, CalculationHeatTreatmentType.DESP_OAK_FURNACE_COOLING].includes(item.type)) &&
            !this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.ROUGHING)) {
            defaultOperationPlans.push({
                pos: '270',
                name: OfferPosWorkPlanName.RELAXATION,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.WEG_HYDROGEN_EFFUSION_ANNEALING)) {
            defaultOperationPlans.push({
                pos: '275',
                name: OfferPosWorkPlanName.WEG,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.QUENCHING, CalculationHeatTreatmentType.TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN, CalculationHeatTreatmentType.NORMALIZE_QUENCHING, CalculationHeatTreatmentType.NORMALIZE_QUENCHING_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.QUENCHING_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.QUENCHING_INCL_2X_QUENCHING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_QUENCHING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_TH, CalculationHeatTreatmentType.HARDENING_FP].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '280',
                name: OfferPosWorkPlanName.HARDENING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.QUENCHING, CalculationHeatTreatmentType.TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN, CalculationHeatTreatmentType.NORMALIZE_QUENCHING, CalculationHeatTreatmentType.NORMALIZE_QUENCHING_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.QUENCHING_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.QUENCHING_INCL_2X_QUENCHING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_QUENCHING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_TH].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '290',
                name: OfferPosWorkPlanName.TEMPERING_1,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.QUENCHING_INCL_2X_QUENCHING)) {
            defaultOperationPlans.push({
                pos: '295',
                name: OfferPosWorkPlanName.TEMPERING_2,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.FP_FERRITE_PEARLITE_ANNEALING, CalculationHeatTreatmentType.FP_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_FP, CalculationHeatTreatmentType.HARDENING_FP].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '300',
                name: OfferPosWorkPlanName.FP_STAGE_1,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.FP_FERRITE_PEARLITE_ANNEALING, CalculationHeatTreatmentType.FP_OAK_FURNACE_COOLING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_FP, CalculationHeatTreatmentType.HARDENING_FP].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '310',
                name: OfferPosWorkPlanName.FP_STAGE_2,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.BG_MACHINING_ANNEALING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BG].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '320',
                name: OfferPosWorkPlanName.BG_STAGE_1,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.BG_MACHINING_ANNEALING, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BG].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '330',
                name: OfferPosWorkPlanName.BG_STAGE_2,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BF].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '340',
                name: OfferPosWorkPlanName.BF_STAGE_1,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type && [CalculationHeatTreatmentType.BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN, CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BF].includes(item.type))) {
            defaultOperationPlans.push({
                pos: '350',
                name: OfferPosWorkPlanName.BF_STAGE_2,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.PRE_HEAT)) {
            defaultOperationPlans.push({
                pos: '360',
                name: OfferPosWorkPlanName.PREHEATING_FOR_STRAIGHTENING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.HARDENING)) {
            defaultOperationPlans.push({
                pos: '370',
                name: OfferPosWorkPlanName.AGE_HARDENING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: avgGrossWeight
            });
        }

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.STRAIGHTENING)) {
            defaultOperationPlans.push({
                pos: '380',
                name: OfferPosWorkPlanName.STRAIGHTENING,
                unit: HweWorkPlanUnitEnum.KG,
                machine: '310100',
                te: maxGrossWeight
            });
            defaultOperationPlans.push({
                pos: '385',
                name: OfferPosWorkPlanName.RELAXATION,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1',
                te: maxGrossWeight
            });
        }

        if (!this.calculationHeatTreatments.some(item => !item.isDeleted && item.type === CalculationHeatTreatmentType.UNTREATED)) {
            defaultOperationPlans.push({
                pos: '390',
                name: OfferPosWorkPlanName.HARDNESS_TESTING,
                unit: HweWorkPlanUnitEnum.STK,
                machine: 'HB',
                te: this.calculation.hardness_testing_hbw_per_piece || this.calculation.calculationDocumentation?.hardness_testing_hbw_per_piece ?
                    1 :
                    1 / (this.offerPos.quantity ?? 1)
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2) {
            defaultOperationPlans.push({
                pos: '400',
                name: OfferPosWorkPlanName.STAMPING_ON,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'ERPR'
            });
        }

        if (this.calculation?.calculationTestingScope?.specimen_material === SpecimenMaterial.PIECE) {
            defaultOperationPlans.push({
                pos: '410',
                name: OfferPosWorkPlanName.SAMPLING,
                unit: HweWorkPlanUnitEnum.MIN
            });
        }

        if (this.calculation?.calculationTestingScope?.specimen_material === SpecimenMaterial.PIECE) {
            defaultOperationPlans.push({
                pos: '411',
                name: OfferPosWorkPlanName.PRESAW_SAMPLE,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: '152610'
            });
        }

        if (this.calculation?.calculationTestingScope?.specimen_material === SpecimenMaterial.PIECE) {
            defaultOperationPlans.push({
                pos: '412',
                name: OfferPosWorkPlanName.PRODUCE_SAMPLE,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'PRW'
            });
        }

        if (this.calculation?.calculationTestingScope?.specimen_material) {
            defaultOperationPlans.push({
                pos: '420',
                name: OfferPosWorkPlanName.TESTING,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'ERPR',
                //TODO Calculate TE based on hwe_additional_costs
            });
        }

        if (this.offerPos.delivery_state &&
            [
                DeliveryState.FM3,
                DeliveryState.FM4,
                DeliveryState.VM4
            ].includes(this.offerPos.delivery_state)) {

            if (this.offerPos.product_type &&
                [
                    OfferPosProductType.SHAFT,
                    OfferPosProductType.BAR_ROUND,
                ].includes(this.offerPos.product_type)) {
                defaultOperationPlans.push({
                    pos: '430',
                    name: OfferPosWorkPlanName.CENTERING,
                    unit: HweWorkPlanUnitEnum.EURO,
                    machine: 'ZENT'
                });
            }
            if (this.offerPos.product_type &&
                [
                    OfferPosProductType.SHAFT,
                    OfferPosProductType.BAR_ROUND,
                    OfferPosProductType.UPSET_PART,
                    OfferPosProductType.SHAFT_HOLLOW,
                    OfferPosProductType.SOCKET,
                    OfferPosProductType.DISK,
                    OfferPosProductType.DISK_PUNCHED,
                    OfferPosProductType.RING_CYLINDER,
                    OfferPosProductType.RING_ROLLED,
                    OfferPosProductType.PIPE,
                ].includes(this.offerPos.product_type)) {
                defaultOperationPlans.push({
                    pos: '440',
                    name: OfferPosWorkPlanName.TURNING,
                    unit: HweWorkPlanUnitEnum.MIN,
                    machine: this.getBWTableMachine()
                });
            }

            if (this.offerPos.product_type &&
                [
                    OfferPosProductType.BAR_SQUARE,
                    OfferPosProductType.BAR_ROLLED,
                ].includes(this.offerPos.product_type)) {
                defaultOperationPlans.push({
                    pos: '450',
                    name: OfferPosWorkPlanName.MILLING,
                    unit: HweWorkPlanUnitEnum.MIN,
                    machine: '20'
                });
            }
        }

        if (this.offerPos.has_mechanical_drilling &&
            (this.offerPos.product_type &&
                [
                    OfferPosProductType.DISK,
                    OfferPosProductType.BAR_SQUARE,
                    OfferPosProductType.BAR_ROUND,
                    OfferPosProductType.SHAFT,
                    OfferPosProductType.UPSET_PART,
                ].includes(this.offerPos.product_type))) {
            defaultOperationPlans.push({
                pos: '460',
                name: OfferPosWorkPlanName.DRILLING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: '70'
            });
        }

        if (this.offerPos.delivery_state &&
            [
                DeliveryState.FM3,
                DeliveryState.FM4,
                DeliveryState.VM4
            ].includes(this.offerPos.delivery_state)) {

            if (this.offerPos.product_type &&
                [
                    OfferPosProductType.SHAFT_HOLLOW,
                    OfferPosProductType.PIPE
                ].includes(this.offerPos.product_type)) {
                defaultOperationPlans.push({
                    pos: '465',
                    name: OfferPosWorkPlanName.BORE_OUT,
                    unit: HweWorkPlanUnitEnum.MIN,
                    machine: '640'
                });
            }
        }

        if (this.offerPos?.offerPosRawDimensions?.some((item: OfferPosRawDimension) => item.quantity_raw_piece && item.quantity_raw_piece > 1) &&
            this.offerPos.product_type &&
            [
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.RING_ROLLED,
                OfferPosProductType.DISK_PUNCHED,
                OfferPosProductType.DISK,
            ].includes(this.offerPos.product_type)) {
            defaultOperationPlans.push({
                pos: '466',
                name: OfferPosWorkPlanName.CUTTING_INDIVIDUAL_LENGTH,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: '152420'
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2) {
            defaultOperationPlans.push({
                pos: '490',
                name: OfferPosWorkPlanName.RESTAMPING,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'US'
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2 &&
            this.offerPos.product_type &&
            [
                OfferPosProductType.SHAFT,
                OfferPosProductType.BAR_ROUND,
                OfferPosProductType.UPSET_PART,
                OfferPosProductType.SHAFT_HOLLOW,
                OfferPosProductType.SOCKET,
                OfferPosProductType.DISK,
                OfferPosProductType.DISK_PUNCHED,
                OfferPosProductType.RING_CYLINDER,
                OfferPosProductType.RING_ROLLED,
                OfferPosProductType.PIPE,
            ].includes(this.offerPos.product_type)) {
            defaultOperationPlans.push({
                pos: '500',
                name: OfferPosWorkPlanName.TURNING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getBWTableMachine()
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2 &&
            this.offerPos.product_type &&
            [
                OfferPosProductType.BAR_SQUARE,
                OfferPosProductType.BAR_ROLLED,
            ].includes(this.offerPos.product_type)) {
            defaultOperationPlans.push({
                pos: '510',
                name: OfferPosWorkPlanName.MILLING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: '20'
            });
        }

        if (this.offerPos.delivery_state &&
            [
                DeliveryState.FM3,
                DeliveryState.FM4,
                DeliveryState.VM4
            ].includes(this.offerPos.delivery_state) &&
            !this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.TURNING_FOR_US)) {
            defaultOperationPlans.push({
                pos: '515',
                name: OfferPosWorkPlanName.BW_CONTROL,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'KONTRBW'
            });
        }

        if (this.calculation?.calculationNonDestructiveTesting?.ultrasound_efg_max || this.calculation.individualNonDestructiveTesting?.ultrasound_efg_max) {
            defaultOperationPlans.push({
                pos: '520',
                name: OfferPosWorkPlanName.US,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'US'
            });
        }

        if (this.calculation?.calculationNonDestructiveTesting?.surface_crack_test_method || this.calculation.individualNonDestructiveTesting?.surface_crack_test_method) {
            defaultOperationPlans.push({
                pos: '530',
                name: OfferPosWorkPlanName.OR,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: 'US'
            });
        }

        if (this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.TURNING_FOR_US)) {
            defaultOperationPlans.push({
                pos: '533',
                name: OfferPosWorkPlanName.IDENT,
                unit: HweWorkPlanUnitEnum.STK,
                machine: 'IDENT',
                te: 1
            });
            defaultOperationPlans.push({
                pos: '535',
                name: OfferPosWorkPlanName.TURNING,
                unit: HweWorkPlanUnitEnum.MIN,
                machine: this.getBWTableMachine()
            });
            defaultOperationPlans.push({
                pos: '536',
                name: OfferPosWorkPlanName.BW_CONTROL,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'KONTRBW'
            });
        }

        if (this.calculationHeatTreatments.some(item => !item.isDeleted && item.pos !== 10 && item.type === CalculationHeatTreatmentType.STRESS_RELIEVING)) {
            defaultOperationPlans.push({
                pos: '540',
                name: OfferPosWorkPlanName.RELAXATION,
                unit: HweWorkPlanUnitEnum.KG,
                machine: 'OFEN1'
            });
        }

        if (this.offerPos.calculation?.residualMaterial) {
            defaultOperationPlans.push({
                pos: '545',
                name: OfferPosWorkPlanName.PRODUCE_SAMPLE,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'PRW'
            });
        }

        if (this.offerPos.delivery_state &&
            [
                DeliveryState.FM2,
                DeliveryState.RM1,
            ].includes(this.offerPos.delivery_state)) {
            defaultOperationPlans.push({
                pos: '560',
                name: OfferPosWorkPlanName.STAMPING,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'KONTR.'
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2) {
            defaultOperationPlans.push({
                pos: '570',
                name: OfferPosWorkPlanName.QS_STAMPING,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'ERPR'
            });
        }
        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2 ||
            this.calculation?.calculationDocumentation?.certificates) {
            defaultOperationPlans.push({
                pos: '580',
                name: OfferPosWorkPlanName.QS_CERTIFICATE,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'QS'
            });
        }

        if (this.calculation?.calculationTestingScope?.attestation === Attestation.EN_10204_3_2) {
            defaultOperationPlans.push({
                pos: '590',
                name: OfferPosWorkPlanName.EXTERNAL_ACCEPTANCE,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'ERPR'
            });
        }

        if (this.offerPos.delivery_state &&
            [
                DeliveryState.FM2,
                DeliveryState.RM1
            ].includes(this.offerPos.delivery_state)) {
            defaultOperationPlans.push({
                pos: '595',
                name: OfferPosWorkPlanName.FINAL_INSPECTION,
                unit: HweWorkPlanUnitEnum.EURO,
                machine: 'KONTR.'
            });
        }

        defaultOperationPlans.push({
            pos: '600',
            name: OfferPosWorkPlanName.PACKAGING,
            unit: HweWorkPlanUnitEnum.EURO,
            machine: 'VERP',
            //TODO: Based on verpkost te: 0
        });

        if (!this.calculationAdditionalHeatTreatments.some(item => !item.isDeleted && item.type === CalculationAdditionalHeatTreatmentType.TURNING_FOR_US)) {
            defaultOperationPlans.push({
                pos: '605',
                name: OfferPosWorkPlanName.IDENT,
                unit: HweWorkPlanUnitEnum.STK,
                machine: 'IDENT',
                te: 1
            });
        }

        defaultOperationPlans.push({
            pos: '610',
            name: OfferPosWorkPlanName.SHIPPING,
            unit: HweWorkPlanUnitEnum.EURO,
            machine: 'VERSAND'
        });

        defaultOperationPlans.map((item: any) => {
            if (typeof item.machine !== 'object') {
                item.machine = this.mGroupByCustomId[item.machine];
            }
        });

        this.addEmiter.emit(defaultOperationPlans);
    }

    deleteValues() {
        this.removeOperations({}, -1, 'all');
    }

    public isIndividualAssessmentHidden(): boolean {
        const {
            specification,
            documentation,
            metallography,
            testingScope,
            nonDestructiveTesting,
            residualMaterial,
            hardenabilityRange,
            deformation
        } = this.calculation || {};

        return !!(specification?.id || documentation?.id || metallography?.id || testingScope?.id || nonDestructiveTesting?.id || hardenabilityRange?.id || residualMaterial?.id || deformation?.id);
    }


    openInfoPopup(type: string, isAllDisabled = true, from?: string) {
        timer(100).pipe(
            tap(() => {
                if (!this.hweKalkService.fromCalDetail) this.isAllDisabled = !this.hweKalkService.fromCalDetail;
                else if (this.hweKalkService.disableTabs) this.isAllDisabled = this.hweKalkService.disableTabs;
                else this.isAllDisabled = isAllDisabled;
                switch (type) {
                    case 'specification':
                    case 'residualMaterial':
                    case 'deformation':
                        this.infoPopupWidth = '50vw';
                        break;
                    case 'documentation':
                    case 'material':
                    case 'hardenabilityRange':
                    case 'materialAnalysis':
                    case 'nonDestructiveTesting':
                        this.infoPopupWidth = '75vw';
                        break;
                    case 'metallography':
                    case 'testingScope':
                        this.infoPopupWidth = '80vw';
                        break;
                    case 'hweWorkPlan':
                        this.infoPopupWidth = '85vw';
                        break;
                }

                this.selectedAssessmentType = type;
                this.infoPopupModel = {};
                if (from == 'calNonTesting') {
                    if (this.calculation?.calculationNonDestructiveTesting?.id) this.getNormData(this.calculation?.calculationNonDestructiveTesting?.nonDestructiveNorm?.id)
                    else this.getNormData(this.calculation?.nonDestructiveTesting?.id, true)
                }
            })
        ).subscribe()

    }

    getNormData(nonDestructiveNormId?: Number, nonDestructiveTesting = false) {
        const url = nonDestructiveTesting ? `hwe-kalk/non-destructive-testing/norm/${nonDestructiveNormId}` : `hwe-kalk/calculation-non-destructive-testing/norm/${nonDestructiveNormId}`
        this._commonService.get(url, false).subscribe({
            next: (response: any) => {
                if (response.norm) this.setNorm(response.norm)

            },
        })
    }

    setNorm(norm: PtNorm | VtNorm | MtNorm) {
        switch (this.calculation?.calculationNonDestructiveTesting?.surface_crack_test_method) {
            case SurfaceCrackTestMethod.PT:
                this.calculation.calculationNonDestructiveTesting.ptNorm = norm as PtNorm;
                break;
            case SurfaceCrackTestMethod.VT:
                this.calculation.calculationNonDestructiveTesting.vtNorm = norm as VtNorm;
                break;
            case SurfaceCrackTestMethod.MT:
                this.calculation.calculationNonDestructiveTesting.mtNorm = norm as MtNorm;
                break;
        }
    }

    onInfoPopupCancel() {
        this.isInfoPopupClosed = true;
        this.infoPopupModel = undefined;
    }

    openOpPlanPosHeatTreatmentModal(formdata: any, index: number) {
        this.formData = formdata;
        if (this.cmpRef) this.cmpRef.destroy();
        this.cmpRef = this.modalBody.createComponent(OpPlanPosHeatTreatmentComponent);

        this.cmpRef.setInput("opPlanPos", this.opPlanPos[index]);
    }

    checkWorkPlanMatch(inputName: OfferPosWorkPlanName) {
        return this.certainWorkPlanNames.includes(inputName);

    }

    hweWorkPlanValueChange(hweWorkPlan: HweWorkPlan) {
        this.calculation?.heatTreatments.map((heatTreatment: CalculationHeatTreatment) => {
            heatTreatment.isDeleted = true
        })
        this.calculation?.additionalHeatTreatments.map((additionalHeatTreatment: CalculationAdditionalHeatTreatment) => {
            additionalHeatTreatment.isDeleted = true
        })

        hweWorkPlan.heatTreatments.map((heatTreatment: HweWorkPlanHeatTreatment) => {
            let hweWorkPlan = new CalculationHeatTreatment().deserialize({});
            hweWorkPlan.pos = heatTreatment.pos;
            hweWorkPlan.isDeleted = false;
            hweWorkPlan.type = heatTreatment.type;
            this.calculation?.heatTreatments.push(hweWorkPlan)
            if (heatTreatment.pos == 10) this.offerPos.calculation_heat_treatments_type = heatTreatment.type
        })
        hweWorkPlan.additionalHeatTreatments.map((additionalHeatTreatment: CalculationAdditionalHeatTreatment) => {
            let hweWorkPlan = new CalculationAdditionalHeatTreatment().deserialize({});
            hweWorkPlan.pos = additionalHeatTreatment.pos;
            hweWorkPlan.isDeleted = false;
            hweWorkPlan.type = additionalHeatTreatment.type;
            this.calculation?.additionalHeatTreatments.push(hweWorkPlan)

        })
    }

    permission(permission: string) {
        return this.authService.isPermissionValidate(permission)
    }
}
