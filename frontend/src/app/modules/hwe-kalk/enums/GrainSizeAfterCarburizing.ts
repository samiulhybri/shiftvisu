export enum GrainSizeAfterCarburizing {
    H50,
    H80
}

export class GrainSizeAfterCarburizingClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "H50":
                return $localize`50 h`;
            case "H80":
                return $localize`80 h`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(GrainSizeAfterCarburizing);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
