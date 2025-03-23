export enum MtNormIrradiance {
    GREATER_THAN_OR_EQUAL_10,
}

export class MtNormIrradianceClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "GREATER_THAN_OR_EQUAL_10":
                return $localize`≥ 10`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormIrradiance);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
