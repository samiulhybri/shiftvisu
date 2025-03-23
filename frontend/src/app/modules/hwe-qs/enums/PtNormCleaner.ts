export enum PtNormCleaner {
    MR_79_AEROSOL,
}

export class PtNormCleanerClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MR_79_AEROSOL":
                return $localize`MR 79 Aerosol Can`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormCleaner);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
