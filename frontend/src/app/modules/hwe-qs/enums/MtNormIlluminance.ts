export enum MtNormIlluminance {
    LESS_THAN_OR_EQUAL_20,
}

export class MtNormIlluminanceClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "LESS_THAN_OR_EQUAL_20":
                return $localize`≤ 20`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormIlluminance);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
