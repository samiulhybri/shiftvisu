export enum SpecimenDimension {
    DIAMETER_8 = 'DIAMETER_8',
    DIAMETER_10 = 'DIAMETER_10',
    DIAMETER_12_5 = 'DIAMETER_12_5'
}

export class SpecimenDimensionClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case SpecimenDimension.DIAMETER_8:
                return $localize`Ø8`;
            case SpecimenDimension.DIAMETER_10:
                return $localize`Ø10`;
            case SpecimenDimension.DIAMETER_12_5:
                return $localize`Ø12.5`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(SpecimenDimension);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}