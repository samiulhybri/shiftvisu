export enum HweUsShim {
    DEG_0 = 'DEG_0',
    DEG_7 = 'DEG_7',
    DEG_14 = 'DEG_14',
    DEG_21 = 'DEG_21',
    DEG_28 = 'DEG_28'
}

export class HweUsShimClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweUsShim.DEG_0:
                return $localize`0°`;
            case HweUsShim.DEG_7:
                return $localize`7°`;
            case HweUsShim.DEG_14:
                return $localize`14°`;
            case HweUsShim.DEG_21:
                return $localize`21°`;
            case HweUsShim.DEG_28:
                return $localize`28°`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elements = Object.keys(HweUsShim);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}