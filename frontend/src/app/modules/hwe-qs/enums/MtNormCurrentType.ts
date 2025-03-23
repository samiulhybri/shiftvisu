export enum MtNormCurrentType {
    ALTERNATING_CURRENT,
}

export class MtNormCurrentTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "ALTERNATING_CURRENT":
                return $localize`ALTERNATING CURRENT`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormCurrentType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

