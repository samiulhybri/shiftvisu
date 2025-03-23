import { Deserializable } from "../interfaces/deserializable";
import { Bom } from "./bom";
import { OperationPlan } from "./operation-plan";
import { Metallography } from "./metallography";
import { Documentation } from './documentation';
import { ResidualMaterial } from './residual-materials';
import { TestingScope } from './testing-scope';
import { NonDestructiveTesting } from "./non-destructive-testing";
import { Specification } from "./specifications";
import { CalculationHeatTreatment } from "./calculation-heat-treatment";
import { CalculationAdditionalHeatTreatment } from "./calculation-additional-heat-treatment";
import { CalculationDocumentation } from "./calculation-documentation";
import { CalculationResidualMaterial } from "./calculation-rasidual-material";
import { CalculationNonDestructiveTesting } from "./calculation-non-destructive-testing";
import { CalculationMetallography } from "./calculation-metallography";
import { CalculationTestingScope } from "./calculation-testing-scope";
import { Material } from "./material";
import { HardenabilityRange } from "./hardenability-range";
import { Deformation } from "./deformation";
import { MaterialAnalysis } from "./material-analysis";
import {HweWorkPlan} from "@app/models/hwe-work-plan";
import {CalculationHardenabilityRange} from "@app/models/calculation-hardenability-range";
import {CalculationMaterialAnalysis} from "@app/models/calculation-material-analysis";
import {CalculationDeformation} from "@app/models/calculation-deformation";

export class Calculation implements Deserializable {
    id?: number;
    metallography?: Metallography;
    documentation?: Documentation;
    testingScope?: TestingScope;
    nonDestructiveTesting?: NonDestructiveTesting;
    residualMaterial?: ResidualMaterial;
    operation_plan_id?: number;
    operationPlan?: OperationPlan;
    bom_id?: number;
    bom?: Bom | null;
    offer_pos_id?: number;
    specification_note: string = '';
    note_machining?: string;
    internal_note: string = '';
    sales_order: string = '';
    sales_order_pos: string = '';
    revision: string = '';
    specification?: Specification;
    strength_span_min?: number;
    strength_span_max?: number;
    min_hardness?: number;
    max_hardness?: number;
    charge: boolean = false;
    melting_process: boolean = false;
    cleanliness_of_the_charge: boolean = false;
    grainsize_of_the_charge: boolean = false;
    specify_deformation: boolean = false;
    jominy: boolean = false;
    heattreamtment: boolean = false;
    heattreamtment_with_diagram: boolean = false;
    hardness_testing_hbw: boolean = false;
    hardness_testing_hbw_per_piece: boolean = false;
    conversion_acc_iso_18265_table_a_1: boolean = false;
    conversion_acc_iso_18265_table_b_2: boolean = false;
    pmi: boolean = false;
    visual_inspection: boolean = false;
    indication_of_the_surface_condition: boolean = false;
    dimension_control: boolean = false;
    dimension_protocol: boolean = false;
    residual_magnetic_field_strength: boolean = false;
    radioactivity_freedom_confirmation: boolean = false;
    get_approval_from_the_client: boolean = false;
    concentricity_check: boolean = false;
    heatTreatments: CalculationHeatTreatment[] = [];
    additionalHeatTreatments: CalculationAdditionalHeatTreatment[] = [];
    price?: number;
    lead_time_days?: number;
    text?: string;
    text2?: string;
    text3?: string;
    text4?: string;
    text_final_dimension?: string;
    text_raw_dimension?: string;
    delivery_weight?: number;
    calculationDocumentation?: CalculationDocumentation;
    calculationResidualMaterial?:CalculationResidualMaterial
    calculationNonDestructiveTesting?:CalculationNonDestructiveTesting;
    calculationMetallography?:CalculationMetallography;
    calculationTestingScope?: CalculationTestingScope;

    calculationHardenabilityRange?: CalculationHardenabilityRange;
	hardenabilityRange?: HardenabilityRange;
	materialAnalysis?: MaterialAnalysis;
	calculationMaterialAnalysis?: CalculationMaterialAnalysis;
	deformation?: Deformation;
    calculationDeformation?: CalculationDeformation;
    individualNonDestructiveTesting?: NonDestructiveTesting;
    individualDeformation?:Deformation;
    hweWorkPlan?:HweWorkPlan;
    note_linked_operations:string=''
    delivery_interval?:number;
    price_note: string = '';

    is_material_in_stock?: boolean;
    
    deserialize(input: any) {
        Object.assign(this, input);
        this.heatTreatments = [];
        if (input.heatTreatments) {
            input.heatTreatments.forEach((item: CalculationHeatTreatment) => {
                this.heatTreatments?.push(new CalculationHeatTreatment().deserialize(item))
            });
        }
        this.additionalHeatTreatments = [];
        if (input.additionalHeatTreatments) {


            input.additionalHeatTreatments.forEach((item: CalculationAdditionalHeatTreatment) => {
                this.additionalHeatTreatments?.push(new CalculationAdditionalHeatTreatment().deserialize(item))
            });
        }

        this.operationPlan = input.operationPlan ? new OperationPlan().deserialize(input.operationPlan) : undefined;
        this.metallography = input.metallography ? new Metallography().deserialize(input.metallography) : undefined;
        this.documentation = input.documentation ? new Documentation().deserialize(input.documentation) : undefined;
        this.testingScope = input.testingScope ? new TestingScope().deserialize(input.testingScope) : undefined;
        this.nonDestructiveTesting = input.nonDestructiveTesting ? new NonDestructiveTesting().deserialize(input.nonDestructiveTesting) : undefined;
        this.residualMaterial = input.residualMaterial ? new ResidualMaterial().deserialize(input.residualMaterial) : undefined;
        this.specification = input.specification ? new Specification().deserialize(input.specification) : undefined;
        this.calculationDocumentation = input.calculationDocumentation ? new CalculationDocumentation().deserialize(input.calculationDocumentation) : undefined;
        this.calculationHardenabilityRange = input.calculationHardenabilityRange ? new CalculationHardenabilityRange().deserialize(input.calculationHardenabilityRange) : undefined;
        this.calculationResidualMaterial = input.calculationResidualMaterial ? new CalculationResidualMaterial().deserialize(input.calculationResidualMaterial) : undefined;
        this.calculationNonDestructiveTesting = input.calculationNonDestructiveTesting ? new CalculationNonDestructiveTesting().deserialize(input.calculationNonDestructiveTesting) : undefined;
        this.calculationMetallography = input.calculationMetallography ? new CalculationMetallography().deserialize(input.calculationMetallography) : undefined;
        this.calculationTestingScope = input.calculationTestingScope ? new CalculationTestingScope().deserialize(input.calculationTestingScope) : undefined;

        this.hardenabilityRange = input.hardenabilityRange ? new HardenabilityRange().deserialize(input.hardenabilityRange) : undefined;
        this.materialAnalysis = input.materialAnalysis ? new MaterialAnalysis().deserialize(input.materialAnalysis) : undefined;
        this.calculationMaterialAnalysis = input.calculationMaterialAnalysis ? new CalculationMaterialAnalysis().deserialize(input.calculationMaterialAnalysis) : undefined;
        this.deformation = input.deformation ? new Deformation().deserialize(input.deformation) : undefined;
        this.calculationDeformation = input.calculationDeformation ? new CalculationDeformation().deserialize(input.calculationDeformation) : undefined;
        this.individualNonDestructiveTesting = input.individualNonDestructiveTesting ? new NonDestructiveTesting().deserialize(input.individualNonDestructiveTesting) : undefined;
        this.individualDeformation = input.individualDeformation ? new Deformation().deserialize(input.individualDeformation) : undefined;
        this.hweWorkPlan = input.hweWorkPlan ? new HweWorkPlan().deserialize(input.hweWorkPlan) : undefined;

        return this;
    }

    toOdata(isHeatTreatments = false,fromOfferPos = false): Object {
        return {
            ...this,
            id: this.id ?? undefined,
            operationPlan: undefined,
            metallography_id: fromOfferPos ? undefined : (this.metallography?.id ?? null),
            hwe_work_plan_id: fromOfferPos ? undefined : (this.hweWorkPlan?.id ?? null),
            documentation_id: fromOfferPos ? undefined : (this.documentation?.id ?? null),
            testing_scope_id: fromOfferPos ? undefined : (this.testingScope?.id ?? null),
            non_destructive_testing_id: fromOfferPos ? undefined : (this.nonDestructiveTesting?.id ?? null),
            non_destructive_testing_individual_id: fromOfferPos ? undefined : (this.individualNonDestructiveTesting?.id ?? null),
            deformation_individual_id: fromOfferPos ? undefined : (this.individualDeformation?.id ?? null),
            residual_material_id: fromOfferPos ? undefined : (this.residualMaterial?.id ?? null),
            metallography: undefined,
            documentation: undefined,
            testingScope: undefined,
            nonDestructiveTesting: undefined,
            usNorm: undefined,
            mtNorm: undefined,
            ptNorm: undefined,
            vtNorm: undefined,
            residualMaterial: undefined,
            specification_id: this.specification?.id ?? null,
            specification: undefined,
            heatTreatments: isHeatTreatments ? this.heatTreatments : undefined,
            additionalHeatTreatments: undefined,
            calculationDocumentation: undefined,
            calculationHardenabilityRange: undefined,
            calculationResidualMaterial:undefined,
            calculationNonDestructiveTesting: undefined,
            calculationMetallography: undefined,
            calculationTestingScope: undefined,
            calculationDeformation: undefined,
            hardenability_range_id: fromOfferPos ? undefined : (this.hardenabilityRange?.id ?? null),
            material_analysis_id: fromOfferPos ? undefined : (this.materialAnalysis?.id ?? null),
            deformation_id: fromOfferPos ? undefined : (this.deformation?.id ?? null),
            material: undefined,
            hardenabilityRange: undefined,
            materialAnalysis: undefined,
            calculationMaterialAnalysis: undefined,
            deformation: undefined,
            individualNonDestructiveTesting: undefined,
            individualDeformation: undefined,
            hweWorkPlan: undefined,
            prodOrderPos: undefined,
        };
    }
}

