
export enum MtNormTestEquipment {
    MR_76_F,
    MR_158_R
}

export class MtNormTestEquipmentClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MR_76_F":
                return $localize`MR 76 F yellow - green fluorescent`;
            case "MR_158_R":
                return $localize`MR158-R yellow - green fluorescent`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormTestEquipment);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

