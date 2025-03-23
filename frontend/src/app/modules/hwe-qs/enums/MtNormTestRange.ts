export enum MtNormTestRange {
    SURFACE_WITH_HOLE,
    OUTER_SURFACE,
    SURFACE_WITHOUT_HOLE,
}

export class MtNormTestRangeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "SURFACE_WITH_HOLE":
                return $localize`SURFACE WITH HOLE`;
            case "OUTER_SURFACE":
                return $localize`OUTER SURFACE`;
            case "SURFACE_WITHOUT_HOLE":
                return $localize`SURFACE WITHOUT HOLE`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormTestRange);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

