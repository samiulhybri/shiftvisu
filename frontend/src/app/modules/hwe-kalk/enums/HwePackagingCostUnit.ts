export enum HwePackagingCostUnit {
    PIECE = 'PIECE',
    PACKAGING_PIECE = 'PACKAGING_PIECE'
}

export class HwePackagingCostUnitClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case HwePackagingCostUnit.PIECE:
                return $localize`Piece`;
            case HwePackagingCostUnit.PACKAGING_PIECE:
                return $localize`Packaging Piece`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HwePackagingCostUnit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}