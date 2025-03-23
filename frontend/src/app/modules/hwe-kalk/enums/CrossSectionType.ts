export enum CrossSectionType {
    ROUND = 'ROUND',
    SQUARE = 'SQUARE'
}

export class CrossSectionTypeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case CrossSectionType.ROUND:
                return $localize`Round`;
            case CrossSectionType.SQUARE:
                return $localize`Square`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(CrossSectionType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}