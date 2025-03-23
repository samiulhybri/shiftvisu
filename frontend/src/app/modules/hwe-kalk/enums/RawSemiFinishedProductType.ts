export enum RawSemiFinishedProductType {
    SQUARE,
    ROUND,
    OCTAGON
}


export class RawSemiFinishedProductTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "SQUARE":
                return $localize`SQUARE`;
            case "ROUND":
                return $localize`ROUND`;
            case "OCTAGON":
                return $localize`OCTAGON`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(RawSemiFinishedProductType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}