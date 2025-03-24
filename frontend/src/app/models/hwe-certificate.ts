import {Deserializable} from "../interfaces/deserializable";
import { ProdOrderPos } from "@app/models/prod-order-pos";
import { SampleNumber } from "@app/models/sample-number";
import { HweCertificateHweQsSample } from "@app/models/hwe-certificate-hwe-qs-sample";

export class HweCertificate implements Deserializable {
    id?: number;
    sample?:ProdOrderPos;
    ultrasonic?:ProdOrderPos
    note_ultrasonic: string= '';
    surface?:ProdOrderPos;
    note_surface: string= '';
    heatTreatment?:ProdOrderPos;
    note_heat_treatment: string= '';
    test_result_note: string= '';
    hardness_note: string= '';
    test_no: string= '';
    hweCertificateHweQsSamples: HweCertificateHweQsSample[] = [];
    is_show_chemical_analysis:boolean = true;
    is_show_grain_size_determination:boolean = true;
    is_show_purity_determination:boolean = true;
    is_show_jominy_test:boolean = true;
    zzv1:string = ''
    note_attachment:string = ''
    inspection_no:string = ''
    rev:number = 0;
    deserialize(input: any) {
        Object.assign(this, input);
        this.sample = input.sample ? new ProdOrderPos().deserialize(input.sample) : new ProdOrderPos();
        this.ultrasonic = input.ultrasonic ? new ProdOrderPos().deserialize(input.ultrasonic) : new ProdOrderPos();
        this.surface = input.surface ? new ProdOrderPos().deserialize(input.surface) : new ProdOrderPos();
        this.heatTreatment = input.heatTreatment ? new ProdOrderPos().deserialize(input.heatTreatment) : new ProdOrderPos();

        this.hweCertificateHweQsSamples= [];
        input.hweCertificateHweQsSamples?.map((hweCertificateHweQsSample: HweCertificateHweQsSample)=>{
            let hweQsSample:any ={};
            hweQsSample.hweQsSample = hweCertificateHweQsSample.hweQsSample;
            hweQsSample.note_qs_sample = hweCertificateHweQsSample.note_qs_sample;
            this.hweCertificateHweQsSamples.push(hweQsSample)
        })
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            prod_order_pos_id_qs_samples:this.sample?.id,
            prod_order_pos_id_ultrasonic:this.ultrasonic?.id??null,
            prod_order_pos_id_surface:this.surface?.id??null,
            prod_order_pos_id_heat_treatment:this.heatTreatment?.id??null,
            sample:undefined,
            ultrasonic:undefined,
            surface:undefined,
            heatTreatment:undefined,
            order_sampling: undefined,
            order_ultrasonic: undefined,
            calculation_id: undefined,
            order_surface: undefined,
            order_heat_treatment: undefined,
            zzv1: undefined,
            hweCertificateHweQsSamples : this.hweCertificateHweQsSamples.map((hweCertificateHweQsSample:HweCertificateHweQsSample)=>{
                let hweCerSample:any ={}
                hweCerSample.note_qs_sample = hweCertificateHweQsSample.note_qs_sample
                hweCerSample.hwe_qs_sample_id = hweCertificateHweQsSample.hweQsSample?.id
                return hweCerSample;
            })
        };
    }
}
