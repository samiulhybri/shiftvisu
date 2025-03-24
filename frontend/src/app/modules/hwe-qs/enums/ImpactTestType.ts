export enum ImpactTestType {
    DVM,
    ISO_V,
    KCU
}

export class ImpactTestTypeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "DVM":
                return $localize`DVM`;
            case "ISO_V":
                return $localize`ISO V`;
            case "KCU":
                return $localize`KCU`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(ImpactTestType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}