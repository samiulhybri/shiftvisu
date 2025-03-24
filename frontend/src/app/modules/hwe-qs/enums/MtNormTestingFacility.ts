
export enum MtNormTestingFacility {
    HAND_MAGNET_TWM_230_SERIAL_NUMBER_SERIAL_NUMBER_338899,
    FERROTEST_20_SERIAL_NUMBER_138033,
    HAND_MAGNET_TWM_230_SERIAL_NUMBER_9734963,
}

export class MtNormTestingFacilityClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "HAND_MAGNET_TWM_230_SERIAL_NUMBER_SERIAL_NUMBER_338899":
                return $localize`HAND MAGNET TWM 230 SERIAL NUMBER SERIAL NUMBER 338899`;
            case "FERROTEST_20_SERIAL_NUMBER_138033":
                return $localize`FERROTEST 20 SERIAL NUMBER 138033`;
            case "HAND_MAGNET_TWM_230_SERIAL_NUMBER_9734963":
                return $localize`HAND MAGNET TWM 230 SERIAL NUMBER 9734963`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormTestingFacility);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

