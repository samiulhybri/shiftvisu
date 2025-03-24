export enum OfferPosStatus {
    AV = 'AV',
    QS = 'QS',
    HEAT_TREATMENT = 'HEAT_TREATMENT',
    RELEASED = 'RELEASED'
}

export class OfferPosStatusClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosStatus.AV:
                return $localize`AV`;
            case OfferPosStatus.QS:
                return $localize`QS`;
            case OfferPosStatus.HEAT_TREATMENT:
                return $localize`Heat Treatment`;
            case OfferPosStatus.RELEASED:
                return $localize`Released`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPosStatus);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}