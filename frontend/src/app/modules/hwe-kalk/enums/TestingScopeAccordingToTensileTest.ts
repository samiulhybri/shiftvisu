export enum TestingScopeAccordingToTensileTest {
    ISO_6892_1 = "ISO_6892_1",
    A_370 = "A_370",
    DIN_EN_ISO_IEC_17025 = "DIN_EN_ISO_IEC_17025"
}

export class TestingScopeAccordingToTensileTestClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case TestingScopeAccordingToTensileTest.ISO_6892_1:
                return $localize`ISO 6892-1`;
            case TestingScopeAccordingToTensileTest.A_370:
                return $localize`A 370`;
            case TestingScopeAccordingToTensileTest.DIN_EN_ISO_IEC_17025:
                return $localize`Approval: DIN EN ISO/IEC 17025`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(TestingScopeAccordingToTensileTest);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}