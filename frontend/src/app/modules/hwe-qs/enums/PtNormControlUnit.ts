export enum PtNormControlUnit {
    CONTROL_UNIT_2,
}

export class PtNormControlUnitClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "CONTROL_UNIT_2":
                return $localize`Control Unit 2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormControlUnit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

