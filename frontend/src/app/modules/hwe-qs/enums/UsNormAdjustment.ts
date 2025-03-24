export enum UsNormAdjustment {
    COMPONENT,
    K1_R_100MM,
    K1_R_25MM,
    K2_R_12_5MM,
    K2_R_25MM,
    K2_R_50MM,
    CROSSHOLE,
    COMPARISONBODY,
}

export class UsNormAdjustmentClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "COMPONENT":
                return $localize`COMPONENT`;
            case "K1_R_100MM":
                return $localize`K1 (r = 100 mm)`;
            case "K1_R_25MM":
                return $localize` K1 (r = 25 mm)`;
            case "K2_R_12_5MM":
                return $localize`K2 (r = 12.5 mm)`;
            case "K2_R_25MM":
                return $localize` K2 (r = 25 mm)`;
            case "K2_R_50MM":
                return $localize`K2 (r = 50 mm)`;
            case "CROSSHOLE":
                return $localize`CROSSHOLE`;
            case "COMPARISONBODY":
                return $localize`COMPARISONBODY`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormAdjustment);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
