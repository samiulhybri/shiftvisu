import {Deserializable} from "@app/interfaces/deserializable";
import {Item} from "@app/models/item";
import { UsNormSoundAttenuationOperator } from "@app/modules/hwe-qs/enums/UsNormSoundAttenuationOperator";
import { MeltAnalysisVariant } from "@app/modules/hwe-qs/enums/MeltAnalysisVariant";
import { MaterialAnalysis } from "@app/models/material-analysis";
import { HweMeltType } from "@app/modules/hwe-qs/enums/HweMeltType";
import { HweMeltQualityTypes } from "@app/modules/hwe-qs/enums/HweMeltQualityTypes";
import { HweMeltRadioactivityTypes } from "@app/modules/hwe-qs/enums/HweMeltRadioactivityTypes";


export class HweMeltAnalysis implements Deserializable {
    id?: number;
    custom_id: string = '';
    materialAnalysis?: MaterialAnalysis;
    melting_type!: HweMeltType;
    quality_6336_5!: HweMeltQualityTypes;
    purchase_order: string = '';
    purchase_order_pos: string = '';
    item?: Item;
    delivery_specification: string = '';
    year?:Date;
    radioactivity!: HweMeltRadioactivityTypes;
    grain_size_testing_operator?:UsNormSoundAttenuationOperator;
    grain_size_value:string = '';
    grain_size_testing_operator_hwe?:UsNormSoundAttenuationOperator;
    grain_size_value_hwe:string = '';
    k3?:number;
    k4?:number;
    k3_hwe?:number;
    k4_hwe?:number;
    fine_a?:number;
    fine_b?:number;
    fine_c?:number;
    fine_d?:number;
    ds?:number;
    thick_a?:number;
    thick_b?:number;
    thick_c?:number;
    thick_d?:number;
    thick_ds?:number;
    fine_a_hwe?:number;
    fine_b_hwe?:number;
    fine_c_hwe?:number;
    fine_d_hwe?:number;
    ds_hwe?:number;
    thick_a_hwe?:number;
    thick_b_hwe?:number;
    thick_c_hwe?:number;
    thick_d_hwe?:number;
    thick_ds_hwe?:number;
    variant?:MeltAnalysisVariant = MeltAnalysisVariant.VARIANT_1;
    j_1_sw?:number;
    j_1_5_sw?:number;
    j_2_sw?:number;
    j_3_sw?:number;
    j_4_sw?:number;
    j_5_sw?:number;
    j_6_sw?:number;
    j_7_sw?:number;
    j_8_sw?:number;
    j_9_sw?:number;
    j_10_sw?:number;
    j_11_sw?:number;
    j_13_sw?:number;
    j_15_sw?:number;
    j_20_sw?:number;
    j_25_sw?:number;
    j_30_sw?:number;
    j_35_sw?:number;
    j_40_sw?:number;
    j_45_sw?:number;
    j_50_sw?:number;
    j_1_hwe?:number;
    j_1_5_hwe?:number;
    j_2_hwe?:number;
    j_3_hwe?:number;
    j_4_hwe?:number;
    j_5_hwe?:number;
    j_6_hwe?:number;
    j_7_hwe?:number;
    j_8_hwe?:number;
    j_9_hwe?:number;
    j_10_hwe?:number;
    j_11_hwe?:number;
    j_13_hwe?:number;
    j_15_hwe?:number;
    j_20_hwe?:number;
    j_25_hwe?:number;
    j_30_hwe?:number;
    j_35_hwe?:number;
    j_40_hwe?:number;
    j_45_hwe?:number;
    j_50_hwe?:number;
    note:string ='';
    note_2:string ='';
    note_3:string ='';
    note_4:string ='';
    note_5:string ='';
    note_6:string ='';
    element_c?:number;
    element_si?:number;
    element_mn?:number;
    element_p?:number;
    element_s?:number;
    element_cr?:number;
    element_mo?:number;
    element_ni?:number;
    element_v?:number;
    element_ai?:number;
    element_h2?:number;
    element_cu?:number;
    element_w?:number;
    element_ti?:number;
    element_co?:number;
    element_b?:number;
    element_o2?:number;
    element_sn?:number;
    element_n?:number;
    element_nb?:number;
    element_ca?:number;
    element_c_hwe?:number;
    element_si_hwe?:number;
    element_mn_hwe?:number;
    element_p_hwe?:number;
    element_s_hwe?:number;
    element_cr_hwe?:number;
    element_mo_hwe?:number;
    element_ni_hwe?:number;
    element_v_hwe?:number;
    element_ai_hwe?:number;
    element_h2_hwe?:number;
    element_cu_hwe?:number;
    element_w_hwe?:number;
    element_ti_hwe?:number;
    element_co_hwe?:number;
    element_b_hwe?:number;
    element_o2_hwe?:number;
    element_sn_hwe?:number;
    element_n_hwe?:number;
    element_nb_hwe?:number;
    element_ca_hwe?:number;
    element_as?:number;
    element_as_hwe?:number;
    element_ta?:number;
    element_ta_hwe?:number;
    element_sb?:number;
    element_sb_hwe?:number;
    element_zr?:number;
    element_zr_hwe?:number;
    grain_size_specification?:string;
    grain_size_procedure?:string;
    grain_size_testing_scope?:string;
    class_18?:number;
    class_17?:number;
    class_16?:number;
    class_15?:number;
    class_14?:number;
    class_13?:number;
    class_12?:number;
    class_11?:number;
    class_10?:number;
    class_9?:number;
    class_8?:number;
    class_7?:number;
    class_6?:number;
    class_5?:number;
    class_4?:number;
    class_3?:number;
    class_2?:number;
    class_1?:number;



    deserialize(input: any) {
        Object.assign(this, input);
        this.year = input?.year ? new Date(Date.UTC(input.year, 0, 1)) : new Date(Date.UTC(new Date().getFullYear(), 0, 1));
        this.materialAnalysis = input.materialAnalysis ? new MaterialAnalysis().deserialize(input.materialAnalysis) : new MaterialAnalysis().deserialize({});
        this.item = input.item ? new Item().deserialize(input.item) : new Item().deserialize({});
        return this;
    }

    toOdata() {
        return {
            ...this,
            material_analysis_id : this.materialAnalysis?.id,
            materialAnalysis: undefined,
            item_id: this.item?.id,
            item: undefined,
            year: this.year ? new Date(this.year).getFullYear() : undefined
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
