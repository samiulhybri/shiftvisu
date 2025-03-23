
import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { Customer } from "./customer";
import { Norm } from "./norm";
import { SequenceOperations } from "./sequence-operations";
import { Metallography } from "./metallography";
import { Documentation } from './documentation';
import { ResidualMaterial } from './residual-materials';
import { TestingScope } from './testing-scope';
import { NonDestructiveTesting } from "./non-destructive-testing";
import { Material } from './material';
import { HardenabilityRange } from './hardenability-range';
import { Deformation } from './deformation';
import { MaterialAnalysis } from './material-analysis';
import {HweWorkPlan} from "@app/models/hwe-work-plan";

export class Specification implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    metallography?: Metallography;
    documentation?: Documentation;
    testingScope?: TestingScope;
    nonDestructiveTesting?: NonDestructiveTesting;
    material?: Material;
	hardenabilityRange?: HardenabilityRange;
	materialAnalysis?: MaterialAnalysis;
	deformation?: Deformation;
    residualMaterial?: ResidualMaterial;
    hweWorkPlan?: HweWorkPlan;

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);
        
        this.metallography = input.metallography ? new Metallography().deserialize(input.metallography) : new Metallography();
        this.documentation = input.documentation ? new Documentation().deserialize(input.documentation) : new Documentation();
        this.testingScope = input.testingScope ? new TestingScope().deserialize(input.testingScope) : new TestingScope();
        this.nonDestructiveTesting = input.nonDestructiveTesting ? new NonDestructiveTesting().deserialize(input.nonDestructiveTesting) : new NonDestructiveTesting();

        this.material = input.material ? new Material().deserialize(input.material) : new Material();
        this.hardenabilityRange = input.hardenabilityRange ? new HardenabilityRange().deserialize(input.hardenabilityRange) : new HardenabilityRange();
        this.materialAnalysis = input.materialAnalysis ? new MaterialAnalysis().deserialize(input.materialAnalysis) : new MaterialAnalysis();
        this.deformation = input.deformation ? new Deformation().deserialize(input.deformation) : new Deformation();
        this.residualMaterial = input.residualMaterial ? new ResidualMaterial().deserialize(input.residualMaterial) : new ResidualMaterial();
        this.hweWorkPlan = input.hweWorkPlan ? new HweWorkPlan().deserialize(input.hweWorkPlan) : new HweWorkPlan();

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            id: this.id ?? undefined,
            metallography_id: this.metallography?.id ?? null,
            hwe_work_plan_id: this.hweWorkPlan?.id ?? null,
            documentation_id: this.documentation?.id ?? null,
            testing_scope_id: this.testingScope?.id ?? null,
            non_destructive_testing_id: this.nonDestructiveTesting?.id ?? null,
            
            material_id: this.material?.id ?? null,
            hardenability_range_id: this.hardenabilityRange?.id ?? null,
            material_analysis_id: this.materialAnalysis?.id ?? null,
            deformation_id: this.deformation?.id ?? null,

            residual_material_id: this.residualMaterial?.id ?? null,
            material: undefined,
            metallography: undefined,
            documentation: undefined,
            testingScope: undefined,
            nonDestructiveTesting: undefined,
            hardenabilityRange: undefined,
            materialAnalysis: undefined,
            deformation: undefined,
            residualMaterial: undefined,
            hweWorkPlan: undefined,
        };
    }
}
