export enum ExtendedSampleSize {
    SAMPLE_OFFSET_BY_180 = 'SAMPLE_OFFSET_BY_180',
    DOUBLE_SIDED_TESTING = 'DOUBLE_SIDED_TESTING',
    KBZ_OFFSET_BY_180 = 'KBZ_OFFSET_BY_180',
    X3x_120_versetzt = 'X3x_120_versetzt '
}

export class ExtendedSampleSizeClass {
    constructor() {
    }

    static getStateTranslate(state: any): String {
        switch (state) {
            case ExtendedSampleSize.SAMPLE_OFFSET_BY_180:
                return $localize`Sample offset by 180°`;
            case ExtendedSampleSize.DOUBLE_SIDED_TESTING:
                return $localize`Double sided testing`;
            case ExtendedSampleSize.KBZ_OFFSET_BY_180:
                return $localize`KBZ offset by 180°`;
            case ExtendedSampleSize.X3x_120_versetzt:
                return $localize`3x 120° versetzt`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(ExtendedSampleSize);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;
    }
}