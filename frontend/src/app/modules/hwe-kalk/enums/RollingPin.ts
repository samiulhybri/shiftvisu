export enum RollingPinType {
    _110,
    _120,
    _140,
    _160,
    _180,
    _200,
    _220,
}

export class RollingPinTypeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "_110":
                return `110 mm`;
            case "_120":
                return `120 mm`;
            case "_140":
                return `140 mm`;
            case "_160":
                return `160 mm`;
            case "_180":
                return `180 mm`;
            case "_200":
                return `200 mm`;
            case "_220":
                return `220 mm`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(RollingPinType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: Number(elm.slice(1)), text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}