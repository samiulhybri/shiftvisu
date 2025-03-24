export enum HardnessTestType {
    HV,
    HRC
}

export class HardnessTestTypeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "HV":
                return $localize`HV`;
            case "HRC":
                return $localize`HRC`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HardnessTestType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}