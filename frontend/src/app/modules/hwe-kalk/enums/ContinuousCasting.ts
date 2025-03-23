export enum ContinuousCasting {
    THREE,
    THREE_FIVE,
    FOUR,
    FIVE,
    SIX
}

export class ContinuousCastingClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "THREE":
                return $localize`3-`;
            case "THREE_FIVE":
                return $localize`3.5-`;
            case "FOUR":
                return $localize`4-`;
            case "FIVE":
                return $localize`5-`;
            case "SIX":
                return $localize`6-fach`;
            default:
                return "";
        }
    }

   static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(ContinuousCasting);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}