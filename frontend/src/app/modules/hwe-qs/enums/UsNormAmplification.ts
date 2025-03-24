export enum UsNormAmplification {
    AVG,
    DAC,
    ECHOHEIGHTS,
    ECHOHDECAY,
}

export class UsNormAmplificationClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "AVG":
                return $localize`AVG`;
            case "DAC":
                return $localize`DAC`;
            case "ECHOHEIGHTS":
                return $localize`ECHOHEIGHTS`;
            case "ECHOHDECAY":
                return $localize`ECHOHDECAY`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormAmplification);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
