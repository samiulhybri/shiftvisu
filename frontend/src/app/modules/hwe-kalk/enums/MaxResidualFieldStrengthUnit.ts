export enum MaxResidualFieldStrengthUnit {
    A_CM,
    GAUSS,
    A_M
}

export class MaxResidualFieldStrengthUnitClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "A_CM":
                return $localize`A/cm`;
            case "GAUSS":
                return $localize`Gauss`;
            case "A_M":
                return $localize`A/m`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(MaxResidualFieldStrengthUnit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}