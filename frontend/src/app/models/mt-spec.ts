import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";

export class MTSpec implements ODatable, Deserializable {
    id?: number;
    custom_id: string = '';
    name: string = '';
    tensile_test_rt: boolean = false;
    astm_a370: boolean = false;
    reh_min?: number;
    reh_max?: number;
    rp_min?: number;
    rp_max?: number;
    rm_min?: number;
    rm_max?: number;
    a5_min?: number;
    a4_min?: number;
    z_min?: number;
    rp_rm_ratio?: number;
    text_tensile_test: string = '';
    impact_test_type: string = '';
    hardness_conversion: string = '';
    hardness_localisation: string = '';
    hardness_test_type: string = '';
    jominy_specification: string = '';
    tensile_test_warm: boolean = false;
    temperature?: number;
    rp_min_warm?: number;
    rm_min_warm?: number;
    a_min_warm?: number;
    z_min_warm?: number;
    impact_test: boolean = false;
    impact_temperature_1?: number;
    impact_temperature_2?: number;
    impact_single_1?: number;
    impact_avg_1?: number;
    impact_single_2?: number;
    impact_avg_2?: number;
    hardness_test: boolean = false;
    hbw_min?: number;
    hbw_max?: number;
    mpa_min_piece?: number;
    mpa_max_piece?: number;
    mpa_min_specimen?: number;
    mpa_max_specimen?: number;
    hardness_min?: number;
    hardness_max?: number;
    bending_test: boolean = false;
    iso_7438: boolean = false;
    jominy_test: boolean = false;
    j_1_5_min?: number;
    j_1_5_max?: number;
    j_3_min?: number;
    j_3_max?: number;
    j_5_min?: number;
    j_5_max?: number;
    j_7_min?: number;
    j_7_max?: number;
    j_9_min?: number;
    j_9_max?: number;
    j_10_min?: number;
    j_10_max?: number;
    j_11_min?: number;
    j_11_max?: number;
    j_13_min?: number;
    j_13_max?: number;
    j_15_min?: number;
    j_15_max?: number;
    j_20_min?: number;
    j_20_max?: number;
    j_25_min?: number;
    j_25_max?: number;
    j_30_min?: number;
    j_30_max?: number;
    j_35_min?: number;
    j_35_max?: number;
    j_40_min?: number;
    j_40_max?: number;
    j_45_min?: number;
    j_45_max?: number;
    j_50_min?: number;
    j_50_max?: number;

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);

        return this;
    }

    toOdata(): Object {
        return { ...this };
    }
}

