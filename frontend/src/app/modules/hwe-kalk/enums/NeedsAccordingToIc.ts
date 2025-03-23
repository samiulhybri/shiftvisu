export enum NeedsAccordingToIc {
    ISO_3651_1_Huey_Test = 'ISO_3651_1_Huey_Test',
    ISO_3651_2_Strauss_Test = 'ISO_3651_2_Strauss_Test',
    ASTM_A262_Pr_E = 'ASTM_A262_Pr_E',
    ASTM_G48_Method_A = 'ASTM_G48_Method_A',
    ISO_3651_3 = 'ISO_3651_3',
    DIN_50914 = 'DIN_50914',
    SEP_1877 = 'SEP_1877',
    ASTM_A262_Pr_C = 'ASTM_A262_Pr_C',
    ASTM_A923_Verf_A = 'ASTM_A923_Verf_A',
    ASTM_A923_Verf_C = 'ASTM_A923_Verf_C'
}

export class NeedsAccordingToIcClass {
    constructor() {
    }

    static getStateTranslate(state: any): String {
        switch (state) {
            case NeedsAccordingToIc.ISO_3651_1_Huey_Test:
                return $localize`ISO 3651-1 Huey Test`;
            case NeedsAccordingToIc.ISO_3651_2_Strauss_Test:
                return $localize`ISO 3651-2 Strauss-Test`;
            case NeedsAccordingToIc.ASTM_A262_Pr_E:
                return $localize`ASTM A262 Pr. E`;
            case NeedsAccordingToIc.ASTM_G48_Method_A:
                return $localize`ASTM G48 Methode A`;
            case NeedsAccordingToIc.ISO_3651_3:
                return $localize`ISO 3651-3`;
            case NeedsAccordingToIc.DIN_50914:
                return $localize`DIN 50914`;
            case NeedsAccordingToIc.SEP_1877:
                return $localize`SEP 1877`;
            case NeedsAccordingToIc.ASTM_A262_Pr_C:
                return $localize`ASTM A262 Pr.C`;
            case NeedsAccordingToIc.ASTM_A923_Verf_A:
                return $localize`ASTM A923 Verf.A`;
            case NeedsAccordingToIc.ASTM_A923_Verf_C:
                return $localize`ASTM A923 Verf.C`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(NeedsAccordingToIc);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;

    }
}
