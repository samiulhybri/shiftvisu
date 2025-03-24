export enum HweOfferPosGroupType {
    MATERIAL = 'MATERIAL',
    OPERATION = 'OPERATION',
    ADDITIONAL = 'ADDITIONAL',
    OVERHEAD = 'OVERHEAD',
    PACKAGING = 'PACKAGING',
    FREIGHT = 'FREIGHT',
    DISCOUNT = 'DISCOUNT',
    MANUAL = 'MANUAL',
}

export class HweOfferPosGroupTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweOfferPosGroupType.MATERIAL:
                return $localize`Material cost`;
            case HweOfferPosGroupType.OPERATION:
                return $localize`Operation cost`;
            case HweOfferPosGroupType.ADDITIONAL:
                return $localize`Additional cost`;
            case HweOfferPosGroupType.OVERHEAD:
                return $localize`Overhead cost`;
            case HweOfferPosGroupType.PACKAGING:
                return $localize`Packaging cost`;
            case HweOfferPosGroupType.FREIGHT:
                return $localize`Freight cost`;
            case HweOfferPosGroupType.DISCOUNT:
                return $localize`Discount`;
            case HweOfferPosGroupType.MANUAL:
                return $localize`Manual`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elements = Object.keys(HweOfferPosGroupType);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}