export enum GrainSizeAccordingToDetermination {
    DIN_50601,
    ASTM_E112,
    ISO_643,
    ASTM_E1181
}

export class GrainSizeAccordingToDeterminationClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "DIN_50601":
                return $localize`DIN 50601`;
            case "ASTM_E112":
                return $localize`ASTM E112`;
            case "ISO_643":
                return $localize`ISO 643`;
            case "ASTM_E1181":
                return $localize`ASTM E1181`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(GrainSizeAccordingToDetermination);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
