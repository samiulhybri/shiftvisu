export enum OfferPosProductType {
    DISK = 'DISK',
    DISK_PUNCHED = 'DISK_PUNCHED',
    RING_CYLINDER = 'RING_CYLINDER',
    RING_ROLLED = 'RING_ROLLED',
    PIPE = 'PIPE',
    BAR_SQUARE = 'BAR_SQUARE',
    BAR_ROUND = 'BAR_ROUND',
    SOCKET = 'SOCKET',
    SHAFT = 'SHAFT',
    UPSET_PART = 'UPSET_PART',
    SHAFT_HOLLOW = 'SHAFT_HOLLOW',
    BAR_ROLLED = 'BAR_ROLLED'
}

export class OfferPosProductTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosProductType.DISK:
                return $localize`DISK`;
            case OfferPosProductType.DISK_PUNCHED:
                return $localize`DISK_PUNCHED`;
            case OfferPosProductType.RING_CYLINDER:
                return $localize`RING_CYLINDER`;
            case OfferPosProductType.RING_ROLLED:
                return $localize`RING_ROLLED`;
            case OfferPosProductType.PIPE:
                return $localize`PIPE`;
            case OfferPosProductType.BAR_SQUARE:
                return $localize`BAR_SQUARE`;
            case OfferPosProductType.BAR_ROUND:
                return $localize`BAR_ROUND`;
            case OfferPosProductType.SOCKET:
                return $localize`SOCKET`;
            case OfferPosProductType.SHAFT:
                return $localize`SHAFT`;
            case OfferPosProductType.UPSET_PART:
                return $localize`UPSET_PART`;
            case OfferPosProductType.SHAFT_HOLLOW:
                return $localize`Hollow Shaft`;
            case OfferPosProductType.BAR_ROLLED:
                return $localize`Rolled Bar`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPosProductType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}