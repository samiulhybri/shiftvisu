export enum SurfaceCrackTestMethod {
    MT = 'MT',
    PT = 'PT',
    VT = 'VT'
}

export class SurfaceCrackTestMethodClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case SurfaceCrackTestMethod.MT:
                return $localize`MT`;
            case SurfaceCrackTestMethod.PT:
                return $localize`PT`;
            case SurfaceCrackTestMethod.VT:
                return $localize`VT`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(SurfaceCrackTestMethod);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}