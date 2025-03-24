export enum Cleanliness4967 {
    ISO_4967_METHOD_A ='ISO_4967_METHOD_A',
    ISO_4967_METHOD_B ='ISO_4967_METHOD_B',
    NF_A_04_106 ='NF_A_04_106',
   ASMT_E45_Methode_A ='ASMT_E45_Methode_A',
    ASTM_E45_Methode_D ='ASTM_E45_Methode_D'
}

export class Cleanliness4967Class {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case Cleanliness4967.ISO_4967_METHOD_A:
                return $localize`ISO 4967 METHOD A`;
            case Cleanliness4967.ISO_4967_METHOD_B:
                return $localize`ISO 4967 METHOD B`;
            case Cleanliness4967.NF_A_04_106:
                return $localize`NF A 04-106`;
                case Cleanliness4967.ASMT_E45_Methode_A:
                return $localize`ASMT E45, Methode A`;
                case Cleanliness4967.ASTM_E45_Methode_D:
                return $localize`ASTM E45 Methode D`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Cleanliness4967);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}