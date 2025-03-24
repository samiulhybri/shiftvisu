import { Deserializable } from "@app/shared/interfaces/deserializable";


export class TestingScope implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    issue_revision: string = '';
    attestation: string = '';
    frequency: string = '';
    specimen_allowance: string = '';
    bhp_dimension: string = '';
    specimen_rest_material: boolean = false;
    specimen_location: string = '';
    zug?: number;
    kbz?: number;
    tensile_test_external_testing: boolean = false;
    reh?: number;
    reh_min?: number;
    rp_0_2?: number;
    rp_1_0?: number;
    rm?: number;
    rm_min?: number;
    a5_min?: number;
    a4_min?: number;
    z_min?: number;
    rp_rm_ratio?: number;
    impact_test_external_testing: boolean = false;
    impact_test_typ: string = '';
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
    kbz_p_20?: number;
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
    is_classified_steel_plant: boolean = false;
    is_eu_material: boolean = false;
    attestation_following_regulation: boolean = false;
    temperature_wzv?: number;
    impact_energy_av?: number;
    setpoint_hot_tensile_test?: number;
    sample_depth?: string;
    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
        };
    }
}
