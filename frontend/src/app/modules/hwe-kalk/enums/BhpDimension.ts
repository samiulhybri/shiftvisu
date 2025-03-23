export enum BhpDimension {
    __19= "__19",
    __21= "__21",
    __30= "__30",
    __40= "__40",
    __60= "__60",
    __63= "__63"
}

export class BhpDimensionClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case BhpDimension.__19:
                return $localize`19`;
            case BhpDimension.__21:
                return $localize`21`;
            case BhpDimension.__30:
                return $localize`30`;
            case BhpDimension.__40:
                return $localize`40`;
            case BhpDimension.__60:
                return $localize`60`;
            case BhpDimension.__63:
                return $localize`63`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(BhpDimension);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}