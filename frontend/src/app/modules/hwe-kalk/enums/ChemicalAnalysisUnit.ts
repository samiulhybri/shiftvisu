export enum ChemicalAnalysisUnit {
    PERCENTAGE = 'PERCENTAGE',
    PPM = 'PPM',
}

export class ChemicalAnalysisUnitClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case ChemicalAnalysisUnit.PERCENTAGE:
                return $localize`%`;
            case ChemicalAnalysisUnit.PPM:
                return $localize`ppm`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(ChemicalAnalysisUnit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}