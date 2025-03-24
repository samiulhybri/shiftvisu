export enum PtNormTestEquipmentSystem {
    IIAE,
}

export class PtNormTestEquipmentSystemClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "IIAE":
                return $localize`II A e`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormTestEquipmentSystem);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
