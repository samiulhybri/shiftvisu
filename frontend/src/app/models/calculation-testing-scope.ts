
import { SpecimenDimension } from "@app/modules/hwe-kalk/enums/SpecimenDimension";
import { Deserializable } from "../interfaces/deserializable";
import { ExtendedSampleSize } from "@app/modules/hwe-kalk/enums/ExtendedSampleSize";
import { SpecimenMaterial } from "@app/modules/hwe-kalk/enums/SpecimenMaterial";
import { CalculationTestingScopeAttestationEntity } from "./calculation-testing-scope-attestation-entity";
import { CalculationTestingScopeAccordingToTensileTest } from "./calculation-testing-scope-according-to-tensile-test";
import { CalculationTestingScopeAccordingToImpactTest } from "./calculation-testing-scope-according-impact-test";
import {ImpactTestType} from "@app/modules/hwe-qs/enums/ImpactTestType";
import {SpecimenLocation} from "@app/modules/hwe-kalk/enums/SpecimenLocation";
import {Attestation} from "@app/modules/hwe-kalk/enums/Attestation";
import { CalculationTestingScopeMeltingType } from "./calculation-testing-scope-melting-type";
import { CalculationTestingClassifiedBy } from "./calculation-testing-scope-classified-bies";
import {Frequency} from "@app/modules/hwe-kalk/enums/Frequency";
import {TestingScopeSampleDepth} from "@app/models/testing-scope-sample-depth";

export class CalculationTestingScope implements Deserializable {
    id?: number;
    calculation_id?: number;
    testing_scope_id?: number;
    custom_id?: string;
    name: string = '';
    issue_revision: string = '';
    attestation?: Attestation;
    frequency?: Frequency;
    frequency_at_3_2?: ExtendedSampleSize;
    specimen_material?: SpecimenMaterial;
    specimen_allowance: string = '';
    specimen_dimension?: SpecimenDimension;
    bhp_dimension: string = '';
    specimen_rest_material: boolean = false;
    specimen_location?: SpecimenLocation;
    zug?: number;
    kbz?: number;
    tensile_test_external_testing: boolean = false;
    reh?: number;
    reh_min?: number;
    rp_1_0?: number;
    rm?: number;
    rm_min?: number;
    a5_min?: number;
    a4_min?: number;
    z_min?: number;
    rp_rm_ratio?: number;
    impact_test_external_testing: boolean = false;
    impact_test_typ?: ImpactTestType;
    impact_test_temperature?: number;
    impact_test_details: string = '';
    tensile_test_details: string = '';
    tensile_test_warm_according_to: string = '';
    tensile_test_warm_external_testing: boolean = false;
    tensile_test_warm_details: string = '';
    hardness_test_location: string = '';
    min_hbw_on_the_component?: number;
    max_hbw_on_the_component?: number;
    min_hbw_on_sample?: number;
    max_hbw_on_sample?: number;
    hardness_test_details: string = '';
    hardness_test_type: string = '';
    hardness_details: string = '';
    jominy_test: boolean = false;
    jominy_details: string = '';
    further_testing: string = '';
    further_testing_external: boolean = false;
    attestationEntities!: CalculationTestingScopeAttestationEntity[];
    accordingToTensileTests!: CalculationTestingScopeAccordingToTensileTest[];
    accordingToImpactTests!: CalculationTestingScopeAccordingToImpactTest[];
    kbz_0?: number;
    kbz_m_20?: number;
    kbz_m_50?: number;
    kbz_m_60?: number;
    zug_gt_40?: number;
    zug_300?: number;
    toughness?: number;
    lateral_expansion?: number;
    test_fold_and_bending: boolean = false;
    test_blue_structure: boolean = false;
    test_baumann_imprint: boolean = false;
    test_pin: boolean = false;
    test_us_calibration: boolean = false;
    quantity_testing_pieces?: number;
    offer_note:string = '';
    meltingTypes!: CalculationTestingScopeMeltingType[];
    classifiedBies!: CalculationTestingClassifiedBy[];
    impact_energy_av?:number;
    setpoint_hot_tensile_test?:number;
    attestation_following_regulation: boolean = false;
    sampleDepths: TestingScopeSampleDepth[] = [];
    max_sample_depth:string = ''
    buffer_90_mm?:number
    lotweight?:number
    max_lotsize?:number
    max_ht_weight_lot_testing?:number
    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.attestationEntities) {
            this.attestationEntities = [];
            input.attestationEntities.forEach((data: any) => {
                this.attestationEntities?.push(new CalculationTestingScopeAttestationEntity().deserialize(data));
            });
        }
        if (input.accordingToTensileTests) {
            this.accordingToTensileTests = [];
            input.accordingToTensileTests.forEach((data: any) => {
                this.accordingToTensileTests.push(new CalculationTestingScopeAccordingToTensileTest().deserialize(data));
            });
        }
        if (input.accordingToImpactTests) {
            this.accordingToImpactTests = [];
            input.accordingToImpactTests.forEach((data: any) => {
                this.accordingToImpactTests.push(new CalculationTestingScopeAccordingToImpactTest().deserialize(data));
            });
        }
        if (input.meltingTypes) {
            this.meltingTypes = [];
            input.meltingTypes.forEach((data: any) => {
                this.meltingTypes?.push(new CalculationTestingScopeMeltingType().deserialize(data));
            });
        }
        if (input.classifiedBies) {
            this.classifiedBies = [];
            input.classifiedBies.forEach((data: any) => {
                this.classifiedBies?.push(new CalculationTestingClassifiedBy().deserialize(data));
            });
        }
        if (input.sampleDepths) {
            this.sampleDepths = [];
            input.sampleDepths.forEach((data: any) => {
                this.sampleDepths.push(new TestingScopeSampleDepth().deserialize(data));
            });
        }

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            custom_id: undefined,
            id: undefined,
            specimen_dimension: this.specimen_dimension ?? '',
            frequency_at_3_2: this.frequency_at_3_2 ?? '',
            meltingTypes: this.getArrData('melting_type', this.meltingTypes) ?? undefined,
            classifiedBies: this.getArrData('classified_by', this.classifiedBies) ?? undefined,
            attestationEntities: this.getArrData('attestation_entity', this.attestationEntities) ?? undefined,
            accordingToTensileTests: this.getArrData('according_to_tensile_test', this.accordingToTensileTests) ?? undefined,
            accordingToImpactTests: this.getArrData('according_to_impact_test', this.accordingToImpactTests) ?? undefined,
            sampleDepths: this.getArrData('sample_depth', this.sampleDepths) ?? undefined,
        };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal;
    }
}
