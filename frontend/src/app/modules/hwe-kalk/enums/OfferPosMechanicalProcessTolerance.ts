export enum OfferPosMechanicalProcessTolerance {
    PLUS_OR_ONE = 'PLUS_OR_ONE',
    PLUS_ONE_OR_MINUS_ZERO = 'PLUS_ONE_OR_MINUS_ZERO',
    DIN_2768_MK = 'DIN_2768_MK',
    MINUS_ONE_OR_PLUS_ZERO = 'MINUS_ONE_OR_PLUS_ZERO',
    MINUS_ONE_OR_MINUS_TWO = 'MINUS_ONE_OR_MINUS_TWO',
    DRAWING = 'DRAWING'
}

export class OfferPosMechanicalProcessToleranceClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosMechanicalProcessTolerance.PLUS_OR_ONE:
                return $localize`+/-1 mm`;
            case OfferPosMechanicalProcessTolerance.PLUS_ONE_OR_MINUS_ZERO:
                return $localize`+1/-0 mm`;
            case OfferPosMechanicalProcessTolerance.DIN_2768_MK:
                return $localize`DIN 2768 MK`;
            case OfferPosMechanicalProcessTolerance.MINUS_ONE_OR_PLUS_ZERO:
                return $localize`-1/+0 mm`;
            case OfferPosMechanicalProcessTolerance.MINUS_ONE_OR_MINUS_TWO:
                return $localize`-1/-2 mm`;
            case OfferPosMechanicalProcessTolerance.DRAWING:
                return $localize`acc. to drawing`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(OfferPosMechanicalProcessTolerance);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
