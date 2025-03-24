export enum TestingScopeAccordingToImpactTest {
    ISO_148 = 'ISO_148',
    A_370 = 'A_370',
    DIN_EN_ISO_IEC_17025 = 'DIN_EN_ISO_IEC_17025'
}

export class TestingScopeAccordingToImpactTestClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case TestingScopeAccordingToImpactTest.ISO_148:
                return $localize`ISO 148`;
            case TestingScopeAccordingToImpactTest.A_370:
                return $localize`A 370`;
            case TestingScopeAccordingToImpactTest.DIN_EN_ISO_IEC_17025:
                return $localize`Approval: DIN EN ISO/IEC 17025`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(TestingScopeAccordingToImpactTest);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}