export enum PtNormTestTemperature {
    RT,
}

export class PtNormTestTemperatureClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "RT":
                return $localize`RT`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormTestTemperature);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
