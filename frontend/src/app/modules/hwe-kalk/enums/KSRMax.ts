export enum KSRMax {
    ZERO_EIGHT,
    ONE_FIVE,
    TWO,
    THREE,
    FIVE
}

export class KSRMaxClass {
    constructor() { }

    static  getStateTranslate(state: any): String {
        switch (state) {
            case "ZERO_EIGHT":
                return $localize`0.8-`;
            case "ONE_FIVE":
                return $localize`1.5-`;
            case "TWO":
                return $localize`2-`;
            case "THREE":
                return $localize`3-`;
            case "FIVE":
                return $localize`5-`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(KSRMax);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}