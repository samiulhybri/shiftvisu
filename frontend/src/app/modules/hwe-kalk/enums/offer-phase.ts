export enum OfferPhase {
    TECHN_ASSESSMENT,
    CALC,
    CALC_MECH_ED,
    OBTAIN_EXTERNAL_QUOTE,
    QUOTATION_CREATION,
    CLOSING
}


export class OfferPhaseClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "TECHN_ASSESSMENT":
                return $localize`TECHN ASSESSMENT`;
            case "CALC":
                return $localize`CALC`;
            case "CALC_MECH_ED":
                return $localize`CALC MECH ED`;
            case "OBTAIN_EXTERNAL_QUOTE":
                return $localize`OBTAIN EXTERNAL QUOTE`;
            case "QUOTATION_CREATION":
                return $localize`QUOTATION CREATION`;
            case "CLOSING":
                return $localize`CLOSING`;

            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPhase);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}