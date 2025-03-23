export enum UsNormTestDirection {
    AXIAL = 'AXIAL',
    RADIAl = 'RADIAl',
    AXIALOBLIQUE = 'AXIALOBLIQUE',
    US2X90OFFSET = 'US2X90OFFSET',
    AXIALRADIAl = 'AXIALRADIAl',
}

export class UsNormTestDirectionClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case UsNormTestDirection.AXIAL:
                return $localize`AXIAL`;
            case UsNormTestDirection.RADIAl:
                return $localize`RADIAl`;
            case UsNormTestDirection.AXIALOBLIQUE:
                return $localize`AXIALOBLIQUE`;
            case UsNormTestDirection.US2X90OFFSET:
                return $localize`US2X90OFFSET`;
            case UsNormTestDirection.AXIALRADIAl:
                return $localize`AXIALRADIAl`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormTestDirection);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
