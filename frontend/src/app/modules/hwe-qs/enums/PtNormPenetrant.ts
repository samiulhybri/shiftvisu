export enum PtNormPenetrant {
    MR_68_NF_AEROSOL,
}

export class PtNormPenetrantClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MR_68_NF_AEROSOL":
                return $localize`MR 68 NF Aerosol Can`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormPenetrant);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
