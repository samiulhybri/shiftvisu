export enum Attestation {
    EN_10204_2_2 = 'EN_10204_2_2',
    EN_10204_3_1 = 'EN_10204_3_1',
    EN_10204_3_2 = 'EN_10204_3_2'
}

export class AttestationClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case Attestation.EN_10204_2_2:
                return $localize`EN 10204 / 2.2`;
            case Attestation.EN_10204_3_1:
                return $localize`EN 10204 / 3.1`;
            case Attestation.EN_10204_3_2:
                return $localize`EN 10204 / 3.2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Attestation);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}