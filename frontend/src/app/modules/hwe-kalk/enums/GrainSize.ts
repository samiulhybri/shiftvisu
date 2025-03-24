export enum GrainSize {
    FORMER_Y,
    FP
}

export class GrainSizeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "FORMER_Y":
                return $localize`Former Y`;
            case "FP":
                return $localize`FP`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(GrainSize);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}