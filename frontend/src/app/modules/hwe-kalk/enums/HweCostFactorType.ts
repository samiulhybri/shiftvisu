export enum HweCostFactorType {
    RING_ROLLING = 'RING_ROLLING',
    HEAT_TREATMENT = 'HEAT_TREATMENT'
}

export class HweCostFactorTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweCostFactorType.RING_ROLLING:
                return $localize`Ring Rolling`;
            case HweCostFactorType.HEAT_TREATMENT:
                return $localize`Heat Treatment`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweCostFactorType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}