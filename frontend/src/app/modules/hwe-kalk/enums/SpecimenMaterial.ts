export enum SpecimenMaterial {
    PIECE = 'PIECE',
    SEPARATE_SPECIMEN = 'SEPARATE_SPECIMEN',
    SEPARATE_SAMPLE_PIECE = 'SEPARATE_SAMPLE_PIECE'
}

export class SpecimenMaterialClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case SpecimenMaterial.PIECE:
                return $localize`From piece`;
            case SpecimenMaterial.SEPARATE_SPECIMEN:
                return $localize`Separate sample bar`;
            case SpecimenMaterial.SEPARATE_SAMPLE_PIECE:
                return $localize`Separate sample piece`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(SpecimenMaterial);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}