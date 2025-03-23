export enum HweQuenchingMedium {
    WATER = 'WATER',
    OIL = 'OIL',
    AIR = 'AIR'
}

export class HweQuenchingMediumClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweQuenchingMedium.WATER:
                return $localize`Water`;
            case HweQuenchingMedium.OIL:
                return $localize`Oil`;
            case HweQuenchingMedium.AIR:
                return $localize`Air`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweQuenchingMedium);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}