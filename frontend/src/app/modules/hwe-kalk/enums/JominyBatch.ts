export enum JominyBatch {
    H,
    HH
}
export class JominyBatchClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "H":
                return $localize`H`;
            case "HH":
                return $localize`HH`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elements = Object.keys(JominyBatch);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}