export enum HweShrinkage {
    ONE_AND_HALF_PERCENT = 'ONE_AND_HALF_PERCENT',
    TWO_PERCENT = 'TWO_PERCENT',
}

export class HweShrinkageClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case HweShrinkage.ONE_AND_HALF_PERCENT:
                return $localize`1.5%`;
            case HweShrinkage.TWO_PERCENT:
                return $localize`2%`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweShrinkage);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}