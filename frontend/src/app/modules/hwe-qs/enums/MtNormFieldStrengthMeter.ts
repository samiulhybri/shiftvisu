
export enum MtNormFieldStrengthMeter {
    MAGNAFLUX_FSM_1_SN_1238,
}

export class MtNormFieldStrengthMeterClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MAGNAFLUX_FSM_1_SN_1238":
                return $localize`Magnaflux FSM-1 SN: 1238`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormFieldStrengthMeter);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

