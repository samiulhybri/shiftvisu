export enum UsNormCoupling {
    PASTE = "PASTE",
    OIL = "OIL",
}

export class UsNormCouplingClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case UsNormCoupling.PASTE:
                return $localize`PASTE`;
            case UsNormCoupling.OIL:
                return $localize`OIL`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormCoupling);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
