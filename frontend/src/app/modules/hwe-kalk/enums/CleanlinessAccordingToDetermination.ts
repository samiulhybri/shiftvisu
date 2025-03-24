export enum CleanlinessAccordingToDetermination {
    DIN_50602= 'DIN_50602',
    ASTM_E45= 'ASTM_E45',
    SEP_1570= 'SEP_1570',
    K1_max= 'K1_max',
    DIN_EN_10174= 'DIN_EN_10174',
    DIN_50602_Verfahren_M = 'DIN_50602_Verfahren_M',
    ISO_4967_METHOD_A ='ISO_4967_METHOD_A',
    ISO_4967_METHOD_B ='ISO_4967_METHOD_B',
    NF_A_04_106 ='NF_A_04_106',
    ASMT_E45_Methode_A ='ASMT_E45_Methode_A',
    ASTM_E45_Methode_D ='ASTM_E45_Methode_D'
}

export class CleanlinessAccordingToDeterminationClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case CleanlinessAccordingToDetermination.DIN_50602:
                return $localize`DIN 50602`;
            case CleanlinessAccordingToDetermination.ASTM_E45:
                return $localize`ASTM E45`;
            case CleanlinessAccordingToDetermination.SEP_1570:
                return $localize`SEP 1570`;
                case CleanlinessAccordingToDetermination.K1_max:
                return $localize`K1 max`;
            case CleanlinessAccordingToDetermination.DIN_EN_10174:
                return $localize`DIN EN 10174`;
            case CleanlinessAccordingToDetermination.DIN_50602_Verfahren_M:
                return $localize`DIN 50602, Verfahren M `;
                case CleanlinessAccordingToDetermination.ISO_4967_METHOD_A:
                return $localize`ISO 4967 METHOD A`;
            case CleanlinessAccordingToDetermination.ISO_4967_METHOD_B:
                return $localize`ISO 4967 METHOD B`;
            case CleanlinessAccordingToDetermination.NF_A_04_106:
                return $localize`NF A 04-106`;
            case CleanlinessAccordingToDetermination.ASMT_E45_Methode_A:
                return $localize`ASMT E45, Methode A`;
            case CleanlinessAccordingToDetermination.ASTM_E45_Methode_D:
                return $localize`ASTM E45 Methode D`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(CleanlinessAccordingToDetermination);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}