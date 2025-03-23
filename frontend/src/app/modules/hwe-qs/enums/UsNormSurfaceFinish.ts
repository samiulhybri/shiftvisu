export enum UsNormSurfaceFinish {
    PREMACHINED,
    SCALED,
    RAW,
}

export class UsNormSurfaceFinishClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "PREMACHINED":
                return $localize`Premachined`;
            case "SCALED":
                return $localize`Scaled`;
            case "RAW":
                return $localize`Raw`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormSurfaceFinish);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
