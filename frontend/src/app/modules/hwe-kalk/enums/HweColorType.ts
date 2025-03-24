export enum HweColorType {
    PINK = 'PINK',
    GREY = 'GREY',
    STAR = 'STAR',
    YELLOW = 'YELLOW',
    RED = 'RED',
    BROWN = 'BROWN',
    BLUE = 'BLUE',
    ORANGE = 'ORANGE',
    WHITE = 'WHITE',
}

export class HweColorTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweColorType.PINK:
                return $localize`Pink`;
            case HweColorType.GREY:
                return $localize`Grey`;
            case HweColorType.STAR:
                return $localize`Star`;
            case HweColorType.YELLOW:
                return $localize`Yellow`;
            case HweColorType.RED:
                return $localize`Red`;
            case HweColorType.BROWN:
                return $localize`Brown`;
            case HweColorType.BLUE:
                return $localize`Blue`;
            case HweColorType.ORANGE:
                return $localize`Orange`;
            case HweColorType.WHITE:
                return $localize`White`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweColorType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}