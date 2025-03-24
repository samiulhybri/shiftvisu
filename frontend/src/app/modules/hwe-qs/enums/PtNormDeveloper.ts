export enum PtNormDeveloper {
    MR_70_AEROSOL,
}

export class PtNormDeveloperClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MR_70_AEROSOL":
                return $localize`MR 70 Aerosol Can`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormDeveloper);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
