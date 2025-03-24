export enum ResidualMaterialFrequency {
    PER_PART,
    PER_POSITION
}

export class ResidualMaterialFrequencyClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "PER_PART":
                return $localize`Per Part`;
            case "PER_POSITION":
                return $localize`Per Position`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(ResidualMaterialFrequency);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}