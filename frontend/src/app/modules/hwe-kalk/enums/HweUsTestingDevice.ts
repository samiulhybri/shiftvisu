export enum HweUsTestingDevice {
    ECOGRAPH_1095_10737 = 'ECOGRAPH_1095_10737',
    ECOGRAPH_1095_10738 = 'ECOGRAPH_1095_10738',
    ECOGRAPH_1090_10785 = 'ECOGRAPH_1090_10785',
    ECOGRAPH_1091_10784 = 'ECOGRAPH_1091_10784',
    ECOGRAPH_1092_21388 = 'ECOGRAPH_1092_21388',
    ECOGRAPH_1093_10221 = 'ECOGRAPH_1093_10221',
    ECOGRAPH_1094_21387 = 'ECOGRAPH_1094_21387',
    ECOGRAPH_1095_10266 = 'ECOGRAPH_1095_10266',
    ECOGRAPH_1096_10248 = 'ECOGRAPH_1096_10248',
    ECOGRAPH_1097_11109 = 'ECOGRAPH_1097_11109',
    ECOGRAPH_1098_10220 = 'ECOGRAPH_1098_10220'
}

export class HweUsTestingDeviceClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweUsTestingDevice.ECOGRAPH_1095_10737:
                return $localize`Echograph 1095 - 10737`;
            case HweUsTestingDevice.ECOGRAPH_1095_10738:
                return $localize`Echograph 1095 - 10738`;
            case HweUsTestingDevice.ECOGRAPH_1090_10785:
                return $localize`Echograph 1090 - 10785`;
            case HweUsTestingDevice.ECOGRAPH_1091_10784:
                return $localize`Echograph 1091 - 10784`;
            case HweUsTestingDevice.ECOGRAPH_1092_21388:
                return $localize`Echograph 1092 - 21388`;
            case HweUsTestingDevice.ECOGRAPH_1093_10221:
                return $localize`Echograph 1093 - 10221`;
            case HweUsTestingDevice.ECOGRAPH_1094_21387:
                return $localize`Echograph 1094 - 21387`;
            case HweUsTestingDevice.ECOGRAPH_1095_10266:
                return $localize`Echograph 1095 - 10266`;
            case HweUsTestingDevice.ECOGRAPH_1096_10248:
                return $localize`Echograph 1096 - 10248`;
            case HweUsTestingDevice.ECOGRAPH_1097_11109:
                return $localize`Echograph 1097 - 11109`;
            case HweUsTestingDevice.ECOGRAPH_1098_10220:
                return $localize`Echograph 1098 - 10220`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elements = Object.keys(HweUsTestingDevice);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}