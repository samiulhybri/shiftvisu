export enum Cleanliness50602 {
    K4_max = "K4_max",
    K3_max = "K3_max",
    K2_max = "K2_max",
    K1_max = "K1_max"
}

export class Cleanliness50602Class {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case Cleanliness50602.K4_max:
                return $localize`K4 max.`;
            case Cleanliness50602.K3_max:
                return $localize`K3 max.`;
            case Cleanliness50602.K2_max:
                return $localize`K2 max.`;
            case Cleanliness50602.K1_max:
                return $localize`K1 max.`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Cleanliness50602);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
