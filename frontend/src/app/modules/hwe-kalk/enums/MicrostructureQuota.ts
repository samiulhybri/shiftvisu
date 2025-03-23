export enum MicrostructureQuota {
    Austenite,
    Ferrite
}

export class MicrostructureQuotaClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "Austenite":
                return $localize`Austenit`;
            case "Ferrite":
                return $localize`δ - Ferrit`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(MicrostructureQuota);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}