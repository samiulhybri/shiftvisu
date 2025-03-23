export enum MeltAnalysisVariant {
    VARIANT_1 = 'VARIANT_1',
    VARIANT_2 = 'VARIANT_2'
}

export class MeltAnalysisVariantClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case MeltAnalysisVariant.VARIANT_1:
                return $localize`Variant 1`
            case MeltAnalysisVariant.VARIANT_2:
                return $localize`Variant 2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MeltAnalysisVariant);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
