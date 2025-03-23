import {Component, Input} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {ComboFilter} from '@app/shared/classes/combo-filter';
import {ODataBatchCall} from '@app/models/odata-batch-call';
import {CommonService} from '@app/shared/services/common.service';
import {GridComponent} from '@app/shared/components/kendo/grid/grid.component';
import {Specification} from '@app/models/specifications';
import {Metallography} from '@app/models/metallography';
import {Documentation} from '@app/models/documentation';
import {TestingScope} from '@app/models/testing-scope';
import {NonDestructiveTesting} from '@app/models/non-destructive-testing';
import {ResidualMaterial} from '@app/models/residual-materials';
import {Material} from '@app/models/material';
import {HardenabilityRange} from '@app/models/hardenability-range';
import {Deformation} from '@app/models/deformation';
import {MaterialAnalysis} from '@app/models/material-analysis';
import {HweWorkPlan} from "@app/models/hwe-work-plan";

@Component({
    selector: 'app-specification-details',
    templateUrl: './specification-details.component.html',
    styleUrls: ['./specification-details.component.scss']
})
export class SpecificationDetailsComponent {
    public isLoaderEnabled: boolean = false;
    public metallographies: Metallography[] = [];
    public hweWorkPlan: HweWorkPlan[] = [];
    public documentations: Documentation[] = [];
    public testingScopes: TestingScope[] = [];
    public nonDestructiveTestings: NonDestructiveTesting[] = [];
    public residualMaterials: ResidualMaterial[] = [];
    public cmbMetallographies: any;
    public cmbHweWorkPlan: any;
    public cmbDocumentations: any;
    public cmbTestingScopes: any;
    public cmbResidualMaterials: any;
    public cmbNonDestructiveTestings: any;
    public batchSubscription!: Subscription;
    public materials: Material[] = [];
    public hardenabilityRanges: HardenabilityRange[] = [];
    public materialAnalyses: MaterialAnalysis[] = [];
    public deformations: Deformation[] = [];
    public cmbMaterials: any;
    public cmbHardenabilityRanges: any;
    public cmbMaterialAnalyses: any;
    public cmbDeformations: any;

    @Input('data') specification?: Specification;
    @Input() isAllDisabled: boolean = false;

    constructor(public _commonService: CommonService) {
        this.batchCall();
    }

    ngOnInit() {
        if (!this.specification) {
            this.specification = new Specification();
            this.getCustomId()
        } else {
            this.specification = new Specification().deserialize(this.specification)
            if (this.specification.material) this.onMaterialChange(this.specification.material, false)
        }
    }

    onAdd(e: any, grid: GridComponent) {
        if (!this.specification?.custom_id?.trim()) {
            grid.isWindowLoaderEnabled = false
            return new Observable(observer => {
                observer.error($localize`Custom ID is required.`);
            });
        }

        return this._commonService.post(`Specifications`, this.specification.toOdata())
    }

    onUpdate(e: any, grid: GridComponent) {
        if (!this.specification?.custom_id?.trim()) {
            grid.isWindowLoaderEnabled = false
            return new Observable(observer => {
                observer.error($localize`Custom ID is required.`);
            });
        }

        const data = new Specification().deserialize(this.specification).toOdata();

        return this._commonService.put(`Specifications(${this.specification?.id})`, data)
    }

    async getCustomId() {
        this.isLoaderEnabled = true;
        let value = await this._commonService.getEntity('Specification').catch(() => false)
        if (value) this.specification!.custom_id = value;
        this.isLoaderEnabled = false;
    }

    batchCall() {
        this.isLoaderEnabled = true;
        let requests: ODataBatchCall[] = [];
        requests.push(new ODataBatchCall(
            0,
            "get",
            `\/odata\/Metallographies?$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            1,
            "get",
            `\/odata\/Documentations?$top=10000000`
        ));
        requests.push(new ODataBatchCall(
            2,
            "get",
            `\/odata\/TestingScopes?$top=10000000`
        ));
        requests.push(new ODataBatchCall(
                3,
                "get",
                `\/odata\/Materials?$top=10000000`
            )
        );
        requests.push(new ODataBatchCall(
            4,
            "get",
            `\/odata\/Deformations?$top=10000000`)
        );
        requests.push(new ODataBatchCall(
            5,
            "get",
            `\/odata\/ResidualMaterials?$top=10000000`)
        );
        requests.push(new ODataBatchCall(
                6,
                "get",
                `\/odata\/NonDestructiveTestings?$top=10000000`
            )
        );
        requests.push(new ODataBatchCall(
                7,
                "get",
                `\/odata\/HweWorkPlans?$top=10000000`
            )
        );
        requests.push(new ODataBatchCall(
                8,
                "get",
                `\/odata\/HardenabilityRanges?$expand=materials&$top=10000000`
            )
        );
        requests.push(new ODataBatchCall(
                9,
                "get",
                `\/odata\/MaterialAnalyses?$expand=materials&$top=10000000`
            )
        );

        this.batchSubscription = this._commonService.post("$batch", {requests}).subscribe({
            next: (response: any) => {
                this.metallographies = response.responses[0].body.value;
                this.documentations = response.responses[1].body.value;
                this.testingScopes = response.responses[2].body.value;
                this.materials = response.responses[3].body.value;
                this.deformations = response.responses[4].body.value;
                this.residualMaterials = response.responses[5].body.value;
                this.nonDestructiveTestings = response.responses[6].body.value;
                this.hweWorkPlan = response.responses[7].body.value;
                this.hardenabilityRanges = response.responses[8].body.value;
                this.materialAnalyses = response.responses[9].body.value;
                this.cmbMaterialAnalyses = new ComboFilter(this.materialAnalyses);
                this.cmbHweWorkPlan = new ComboFilter(this.hweWorkPlan);
                this.cmbMetallographies = new ComboFilter(this.metallographies);
                this.cmbHardenabilityRanges = new ComboFilter(this.hardenabilityRanges);
                this.cmbDocumentations = new ComboFilter(this.documentations);
                this.cmbTestingScopes = new ComboFilter(this.testingScopes);
                this.cmbMaterials = new ComboFilter(this.materials);
                this.cmbDeformations = new ComboFilter(this.deformations);
                this.cmbResidualMaterials = new ComboFilter(this.residualMaterials);
                this.cmbNonDestructiveTestings = new ComboFilter(
                    this.nonDestructiveTestings
                );
                this.isLoaderEnabled = false;
            },
            error: () => this.isLoaderEnabled = false
        })
    }

    onMaterialChange(event: Material, fromEvent = true) {
        if (fromEvent) {
            this.specification!.hardenabilityRange = undefined;
            this.specification!.materialAnalysis = undefined;
        }
        this.hardenabilityRanges = event?.hardenabilityRanges ?? [];
        this.materialAnalyses = event?.materialAnalyses ?? [];
        this.cmbHardenabilityRanges = new ComboFilter(this.hardenabilityRanges);
        this.cmbMaterialAnalyses = new ComboFilter(this.materialAnalyses);
    }

    handleFilter(value: String, src: String) {
        switch (src) {
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
            case "material":
                this.materials =
                    this.cmbMaterials.handleLocalDataFilter(
                        value,
                        "custom_id"
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
            case "hwe_work_plan":
                this.hweWorkPlan =
                    this.cmbHweWorkPlan.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "hardenability_range":
                this.hardenabilityRanges =
                    this.cmbHardenabilityRanges.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
        }
    }
}
