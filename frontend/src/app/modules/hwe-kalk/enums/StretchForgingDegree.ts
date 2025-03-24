export enum StretchForgingDegree {
    TWO,
    TWO_FIVE,
    THREE,
    THREE_FIVE
}

export class StretchForgingDegreeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "TWO":
                return $localize`2-`;
            case "TWO_FIVE":
                return $localize`2.5-`;
            case "THREE":
                return $localize`3-`;
            case "THREE_FIVE":
                return $localize`3.5-fach`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(StretchForgingDegree);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
