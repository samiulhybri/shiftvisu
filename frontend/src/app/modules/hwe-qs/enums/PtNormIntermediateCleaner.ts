export enum PtNormIntermediateCleaner {
    WATER,
    MR_79_AEROSOL,
}

export class PtNormIntermediateCleanerClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "WATER":
                return $localize`Water`;
            case "MR_79_AEROSOL":
                return $localize`MR 79 Aerosol Can`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormIntermediateCleaner);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

