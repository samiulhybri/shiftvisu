export enum MtNormMagnetization {
    FIELD_FLOODING_TANGENTIAL_FIELD_STRENGTH,
    CURRENT_FLOW_TANGENTIAL_FIELD_STRENGTH,
}

export class MtNormMagnetizationClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "FIELD_FLOODING_TANGENTIAL_FIELD_STRENGTH":
                return $localize`Field flooding/ tangential field strength 2-6 KA/m`;
            case "CURRENT_FLOW_TANGENTIAL_FIELD_STRENGTH":
                return $localize`Current flow/ tangential field strength 2-6 KA/m`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormMagnetization);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

