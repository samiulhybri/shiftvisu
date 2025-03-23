export enum OfferPosRejectionType {
    TO_HEAVY = "TO_HEAVY",
    NOT_POSSIBLE = "NOT_POSSIBLE",
    TO_RISKY = "TO_RISKY",
    NO_MATERIAL = "NO_MATERIAL",
    TO_SMALL = "TO_SMALL",
}


export class OfferPosRejectionTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosRejectionType.TO_HEAVY:
                return $localize`To heavy`;
            case OfferPosRejectionType.NOT_POSSIBLE:
                return $localize`Not possible`;
            case OfferPosRejectionType.TO_RISKY:
                return $localize`To risky`;
            case OfferPosRejectionType.NO_MATERIAL:
                return $localize`No material`;
            case OfferPosRejectionType.TO_SMALL:
                return $localize`To small `;
            default:
                return "";
        }
    }



    static getTypeLongText(state: any): string {
        switch (state) {
            case OfferPosRejectionType.TO_HEAVY:
                return $localize`Unfortunately, we do not have the suitable manufacturing option as the requested forging is too big/heavy`;
            case OfferPosRejectionType.NOT_POSSIBLE:
                return $localize`Unfortunately, we do not have the suitable manufacturing option.`;
            case OfferPosRejectionType.TO_RISKY:
                return $localize`Unfortunately, we do not have the suitable manufacturing option as the requested forging too risky/technical requirements cannot be met`;
            case OfferPosRejectionType.NO_MATERIAL:
                return $localize`Unfortunately, we do not have the suitable material on stock.`;
            case OfferPosRejectionType.TO_SMALL:
                return $localize`Unfortunately, we do not have the suitable manufacturing option as the requested forging is too small/light.`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPosRejectionType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}