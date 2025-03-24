export enum OfferStatus {
    OPEN,
    IN_PROCESS_BY,
    CONSULTATION,
    ARCHIVED
}


export class OfferStatusClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "OPEN":
                return $localize`OPEN`;
            case "IN_PROCESS_BY":
                return $localize`IN PROCESS BY`;
            case "CONSULTATION":
                return $localize`CONSULTATION`;
            case "ARCHIVED":
                return $localize`ARCHIVED`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferStatus);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}