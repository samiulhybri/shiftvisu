export enum HweCostType {
    PURITY_ASSESSMENT = 'PURITY_ASSESSMENT',
    GRAIN_SIZE_ASSESSMENT = 'GRAIN_SIZE_ASSESSMENT',
    OVEN_DIAGRAM = 'OVEN_DIAGRAM',
    TENSILE_TEST = 'TENSILE_TEST',
    PIECE_ANALYSIS = 'PIECE_ANALYSIS',
    MICROSTRUCTURE_ANALYSIS = 'MICROSTRUCTURE_ANALYSIS',
    SAMPLE_LAYOUT_PLAN = 'SAMPLE_LAYOUT_PLAN',
    US_INSTRUCTION = 'US_INSTRUCTION',
    OR_INSTRUCTION = 'OR_INSTRUCTION',
    OPERATION_PLAN = 'OPERATION_PLAN',
    HEAT_TREATMENT_PLAN = 'HEAT_TREATMENT_PLAN',
    INSPECTION_SEQUENCE_PLAN = 'INSPECTION_SEQUENCE_PLAN',
    OVEN_LAYOUT_PLAN = 'OVEN_LAYOUT_PLAN',
    MACHINE_CAPABILITY_ANALYSIS = 'MACHINE_CAPABILITY_ANALYSIS',
    INITIAL_SAMPLE_INSPECTION = 'INITIAL_SAMPLE_INSPECTION',
    IK_TEST = 'IK_TEST',
    HOT_TENSILE_TEST_RT = 'HOT_TENSILE_TEST_RT',
    HOT_TENSILE_TEST_GT_40 = 'HOT_TENSILE_TEST_GT_40',
    HOT_TENSILE_TEST_300 = 'HOT_TENSILE_TEST_300',
    IMPACT_TEST_RT = 'IMPACT_TEST_RT',
    IMPACT_TEST_P_20 = 'IMPACT_TEST_P_20',
    IMPACT_TEST_0 = 'IMPACT_TEST_0',
    IMPACT_TEST_M_20 = 'IMPACT_TEST_M_20',
    IMPACT_TEST_M_50 = 'IMPACT_TEST_M_50',
    IMPACT_TEST_M_60 = 'IMPACT_TEST_M_60',
    FOLD_AND_BEND_TEST = 'FOLD_AND_BEND_TEST',
    BLUE_FRACTURE_TEST = 'BLUE_FRACTURE_TEST',
    PIN_TEST = 'PIN_TEST',
    US_CALIBRATION_TEST = 'US_CALIBRATION_TEST'
}

export class HweCostTypeClass {
    constructor() {}

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweCostType.PURITY_ASSESSMENT:
                return $localize`Purity assessment`;
            case HweCostType.GRAIN_SIZE_ASSESSMENT:
                return $localize`Grain size assessment`;
            case HweCostType.OVEN_DIAGRAM:
                return $localize`Oven diagram`;
            case HweCostType.TENSILE_TEST:
                return $localize`Tensile test`;
            case HweCostType.PIECE_ANALYSIS:
                return $localize`Piece analysis`;
            case HweCostType.MICROSTRUCTURE_ANALYSIS:
                return $localize`Microstructure analysis`;
            case HweCostType.SAMPLE_LAYOUT_PLAN:
                return $localize`Sample layout plan`;
            case HweCostType.US_INSTRUCTION:
                return $localize`US instruction`;
            case HweCostType.OR_INSTRUCTION:
                return $localize`OR instruction`;
            case HweCostType.OPERATION_PLAN:
                return $localize`Operation plan`;
            case HweCostType.HEAT_TREATMENT_PLAN:
                return $localize`Heat treatment plan`;
            case HweCostType.INSPECTION_SEQUENCE_PLAN:
                return $localize`Inspection sequence plan`;
            case HweCostType.OVEN_LAYOUT_PLAN:
                return $localize`Oven layout plan`;
            case HweCostType.MACHINE_CAPABILITY_ANALYSIS:
                return $localize`Machine capability analysis`;
            case HweCostType.INITIAL_SAMPLE_INSPECTION:
                return $localize`Initial sample inspection`;
            case HweCostType.IK_TEST:
                return $localize`IK test`;
            case HweCostType.HOT_TENSILE_TEST_RT:
                return $localize`Hot tensile test RT`;
            case HweCostType.HOT_TENSILE_TEST_GT_40:
                return $localize`Hot tensile test GT 40`;
            case HweCostType.HOT_TENSILE_TEST_300:
                return $localize`Hot tensile test 300`;
            case HweCostType.IMPACT_TEST_RT:
                return $localize`Impact test RT`;
            case HweCostType.IMPACT_TEST_P_20:
                return $localize`Impact test P 20`;
            case HweCostType.IMPACT_TEST_0:
                return $localize`Impact test 0`;
            case HweCostType.IMPACT_TEST_M_20:
                return $localize`Impact test M 20`;
            case HweCostType.IMPACT_TEST_M_50:
                return $localize`Impact test M 50`;
            case HweCostType.IMPACT_TEST_M_60:
                return $localize`Impact test M 60`;
            case HweCostType.FOLD_AND_BEND_TEST:
                return $localize`Fold and bend test`;
            case HweCostType.BLUE_FRACTURE_TEST:
                return $localize`Blue fracture test`;
            case HweCostType.PIN_TEST:
                return $localize`Pin test`;
            case HweCostType.US_CALIBRATION_TEST:
                return $localize`US calibration test`;
            default:
                return '';
        }
    }
    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweCostType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
