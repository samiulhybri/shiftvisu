
export enum LuxMeter {
    DELTA_OHM_SN_21022622,
    TIEDE_SN_07022649
}

export class LuxMeterClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "DELTA_OHM_SN_21022622":
                return $localize`Delta OHM SN:21022622`;
            case "TIEDE_SN_07022649":
                return $localize`Tiede SN:07022649`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(LuxMeter);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

