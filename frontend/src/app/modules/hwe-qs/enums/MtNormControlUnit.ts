export enum MtNormControlUnit {
    REFERENCE_BLOCK,
}

export class MtNormControlUnitClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "REFERENCE_BLOCK":
                return $localize`REFERENCE BLOCK 1`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormControlUnit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

