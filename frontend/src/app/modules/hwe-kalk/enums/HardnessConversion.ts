export enum HardnessConversion {
    A_1,
    B_2,
    CUSTOMER_SPECIFICATION
}

export class HardnessConversionClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "A_1":
                return $localize`A.1`;
            case "B_2":
                return $localize`B.2`;
            case "CUSTOMER_SPECIFICATION":
                return $localize`Customer specification`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HardnessConversion);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}