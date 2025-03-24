export enum TestingScopeSampleDepth {
    T_2='T_2',
    T_4='T_4',
    T_8= 'T_8',
    T_6= 'T_6',
    T = 'T',
    T_12_5 = 'T_12_5'

}

export class TestingScopeSampleDepthClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case TestingScopeSampleDepth.T_2:
                return $localize`T/2`;
            case TestingScopeSampleDepth.T_4:
                return $localize`T/4`;
            case TestingScopeSampleDepth.T_8:
                return $localize`T/8`;
            case TestingScopeSampleDepth.T_6:
                return $localize`T/6`;
            case TestingScopeSampleDepth.T:
                return $localize`T`; 
            case TestingScopeSampleDepth.T_12_5:
                return $localize`12.5 mm`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(TestingScopeSampleDepth);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;
    }
}