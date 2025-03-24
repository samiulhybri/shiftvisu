export enum CalculationAdditionalHeatTreatmentType {
    ROUGHING = 'ROUGHING',
    TURNING_FOR_US = 'TURNING_FOR_US',
    GRINDING_SEMI_FINISHED_PRODUCTS = 'GRINDING_SEMI_FINISHED_PRODUCTS',
    TURNING_DEBURRING_SEMI_FINISHED_PRODUCTS = 'TURNING_DEBURRING_SEMI_FINISHED_PRODUCTS',
    WELDING_SEALING = 'WELDING_SEALING',
    STRAIGHTENING = 'STRAIGHTENING',
}

export class CalculationAdditionalHeatTreatmentTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case CalculationAdditionalHeatTreatmentType.ROUGHING:
                return $localize`Roughing`;
            case CalculationAdditionalHeatTreatmentType.TURNING_FOR_US:
                return $localize`Turning for US`;
            case CalculationAdditionalHeatTreatmentType.GRINDING_SEMI_FINISHED_PRODUCTS:
                return $localize`Grinding of semi finished products`;
            case CalculationAdditionalHeatTreatmentType.TURNING_DEBURRING_SEMI_FINISHED_PRODUCTS:
                return $localize`Turning/deburring of semi finished products`;
            case CalculationAdditionalHeatTreatmentType.WELDING_SEALING:
                return $localize`Welding/sealing`;
            case CalculationAdditionalHeatTreatmentType.STRAIGHTENING:
                return $localize`Straightening`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(CalculationAdditionalHeatTreatmentType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
