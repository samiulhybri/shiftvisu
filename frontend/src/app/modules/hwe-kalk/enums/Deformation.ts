export enum Deformation {
    ONE_FIVE,
    ONE_EIGHT,
    TWO_FIVE,
    THREE
}
export class DeformationClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "ONE_FIVE":
                return $localize`1.5-`;
            case "ONE_EIGHT":
                return $localize`1.8-`;
            case "TWO_FIVE":
                return $localize`2.5-`;
            case "THREE":
                return $localize`3-fach`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Deformation);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
