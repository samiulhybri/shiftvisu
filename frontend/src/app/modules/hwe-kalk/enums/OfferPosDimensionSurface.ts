export enum OfferPosDimensionSurface {
    RAW = 'RAW',
    N6 = 'N6',
    N7 = 'N7',
    N8 = 'N8',
    N9 = 'N9',
    N10 = 'N10',
    DRAWING = 'DRAWING'
}
export class OfferPosDimensionSurfaceClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosDimensionSurface.RAW:
                return $localize`Raw/Unprocessed`;
            case OfferPosDimensionSurface.N6:
                return $localize`Ra.0.8/N6`;
            case OfferPosDimensionSurface.N7:
                return $localize`Ra.1.6/N7`;
            case OfferPosDimensionSurface.N8:
                return $localize`Ra.3.2/N8`;
            case OfferPosDimensionSurface.N9:
                return $localize`Ra.6.3/N9`;
            case OfferPosDimensionSurface.N10:
                return $localize`Ra.12.5/N10`;
            case OfferPosDimensionSurface.DRAWING:
                return $localize`according to drawing`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPosDimensionSurface);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
