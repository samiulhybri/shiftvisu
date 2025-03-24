export enum MtNormUvMeter {
    MAGNAFLUX_UVM3059_SN_87,
    TIEDE_LUXMAT_SN_26616,
}

export class MtNormUvMeterClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MAGNAFLUX_UVM3059_SN_87":
                return $localize`Magnaflux UVM3059 SN:87`;
            case "TIEDE_LUXMAT_SN_26616":
                return $localize`Tiede LUXMAT SN: 26616`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormUvMeter);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

