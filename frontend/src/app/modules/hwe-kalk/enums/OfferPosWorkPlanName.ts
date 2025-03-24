export enum OfferPosWorkPlanName {
    MATERIAL_REQUIREMENT = 'MATERIAL_REQUIREMENT',
    SAWING = 'SAWING',
    SAWING_F = 'SAWING_F',
    CUTTING_INDIVIDUAL_LENGTH = 'CUTTING_INDIVIDUAL_LENGTH',
    SPLITTING_HALF_SHELL = 'SPLITTING_HALF_SHELL',
    PRE_FORGING_FOR_UPSETTING = 'PRE_FORGING_FOR_UPSETTING',
    PRE_FORGING_SEMI_FINISHED_PRODUCT = 'PRE_FORGING_SEMI_FINISHED_PRODUCT',
    UPSETTING_ON = 'UPSETTING_ON',
    UPSETTING_RB = 'UPSETTING_RB',
    UPSETTING_HBZ = 'UPSETTING_HBZ',
    UPSETTING = 'UPSETTING',
    PUNCHING = 'PUNCHING',
    ROLLING_UP = 'ROLLING_UP',
    STRETCHING = 'STRETCHING',
    WALZEN = 'WALZEN',
    ROLLING = 'ROLLING',
    HOLLOW_PUNCHING = 'HOLLOW_PUNCHING',
    FLATTENING = 'FLATTENING',
    EXTRUSION = 'EXTRUSION',
    FORGING_SHAPING = 'FORGING_SHAPING',
    FINISHED_FORGING_S = 'FINISHED_FORGING_S',
    FINISHED_FORGING_LS = 'FINISHED_FORGING_LS',
    FINISHED_FORGING_STRETCH = 'FINISHED_FORGING_STRETCH',
    STRAIGHTENING = 'STRAIGHTENING',
    SHEET_WELDING = 'SHEET_WELDING',
    HBZ_TURNING = 'HBZ_TURNING',
    HBZ_GRINDING = 'HBZ_GRINDING',
    WELDING_SEALING = 'WELDING_SEALING',
    RUNOUT_CONTROL = 'RUNOUT_CONTROL',
    FORGE_INSPECTION = 'FORGE_INSPECTION',
    RELAXATION = 'RELAXATION',
    GLOWING = 'GLOWING',
    SOLUTION_ANNEALING = 'SOLUTION_ANNEALING',
    WEG = 'WEG',
    NORMALIZING = 'NORMALIZING',
    HARDENING = 'HARDENING',
    TEMPERING_1 = 'TEMPERING_1',
    TEMPERING_2 = 'TEMPERING_2',
    WARM_TAKEOVER = 'WARM_TAKEOVER',
    DIFFUSION_ANNEALING = 'DIFFUSION_ANNEALING',
    FP_STAGE_1 = 'FP_STAGE_1',
    FP_STAGE_2 = 'FP_STAGE_2',
    BG_STAGE_1 = 'BG_STAGE_1',
    BG_STAGE_2 = 'BG_STAGE_2',
    BF_STAGE_1 = 'BF_STAGE_1',
    BF_STAGE_2 = 'BF_STAGE_2',
    PREHEATING_FOR_STRAIGHTENING = 'PREHEATING_FOR_STRAIGHTENING',
    AGE_HARDENING = 'AGE_HARDENING',
    RETEMPERING = 'RETEMPERING',
    WARM_TAKEOVER_OAK = 'WARM_TAKEOVER_OAK',
    TESTING = 'TESTING',
    HARDNESS_TESTING = 'HARDNESS_TESTING',
    PRE_ROUGHING = 'PRE_ROUGHING',
    TURNING = 'TURNING',
    MILLING = 'MILLING',
    DRILLING = 'DRILLING',
    BORE_OUT = 'BORE_OUT',
    GROOVING = 'GROOVING',
    CENTERING = 'CENTERING',
    RMD = 'RMD',
    BW_CONTROL = 'BW_CONTROL',
    SAMPLING = 'SAMPLING',
    PRESAW_SAMPLE = 'PRESAW_SAMPLE',
    PRODUCE_SAMPLE = 'PRODUCE_SAMPLE',
    RESTAMPING = 'RESTAMPING',
    STAMPING_ON = 'STAMPING_ON',
    STAMPING = 'STAMPING',
    US = 'US',
    OR = 'OR',
    IDENT = 'IDENT',
    QS_STAMPING = 'QS_STAMPING',
    QS_CERTIFICATE = 'QS_CERTIFICATE',
    EXTERNAL_ACCEPTANCE = 'EXTERNAL_ACCEPTANCE',
    PACKAGING = 'PACKAGING',
    SHIPPING = 'SHIPPING',
    FINAL_INSPECTION = 'FINAL_INSPECTION',
    SALE = 'SALE',
    OUTSOURCING = 'OUTSOURCING'
}


export class OfferPosWorkPlanNameClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case OfferPosWorkPlanName.MATERIAL_REQUIREMENT:
                return $localize`Material requirement`;
            case OfferPosWorkPlanName.SAWING:
                return $localize`Sawing`;
            case OfferPosWorkPlanName.SAWING_F:
                return $localize`Sawing F`;
            case OfferPosWorkPlanName.CUTTING_INDIVIDUAL_LENGTH:
                return $localize`Cutting individual length`;
            case OfferPosWorkPlanName.SPLITTING_HALF_SHELL:
                return $localize`Splitting half shell`;
            case OfferPosWorkPlanName.PRE_FORGING_FOR_UPSETTING:
                return $localize`Pre-forging for upsetting`;
            case OfferPosWorkPlanName.PRE_FORGING_SEMI_FINISHED_PRODUCT:
                return $localize`Pre-forging semi-finished product`;
            case OfferPosWorkPlanName.UPSETTING_ON:
                return $localize`Upsetting on`;
            case OfferPosWorkPlanName.UPSETTING_RB:
                return $localize`Upsetting RB`;
            case OfferPosWorkPlanName.UPSETTING_HBZ:
                return $localize`Upsetting HBZ`;
            case OfferPosWorkPlanName.UPSETTING:
                return $localize`Upsetting`;
            case OfferPosWorkPlanName.PUNCHING:
                return $localize`Punching`;
            case OfferPosWorkPlanName.ROLLING_UP:
                return $localize`Rolling up`;
            case OfferPosWorkPlanName.STRETCHING:
                return $localize`Stretching`;
            case OfferPosWorkPlanName.WALZEN:
                return $localize`Walzen`;
            case OfferPosWorkPlanName.ROLLING:
                return $localize`Rolling`;
            case OfferPosWorkPlanName.HOLLOW_PUNCHING:
                return $localize`Hollow punching`;
            case OfferPosWorkPlanName.FLATTENING:
                return $localize`Flattening`;
            case OfferPosWorkPlanName.EXTRUSION:
                return $localize`Extrusion`;
            case OfferPosWorkPlanName.FORGING_SHAPING:
                return $localize`Forging shaping`;
            case OfferPosWorkPlanName.FINISHED_FORGING_S:
                return $localize`Finished forging S`;
            case OfferPosWorkPlanName.FINISHED_FORGING_LS:
                return $localize`Finished forging LS`;
            case OfferPosWorkPlanName.FINISHED_FORGING_STRETCH:
                return $localize`Finished forging stretch`;
            case OfferPosWorkPlanName.STRAIGHTENING:
                return $localize`Straightening`;
            case OfferPosWorkPlanName.SHEET_WELDING:
                return $localize`Sheet welding`;
            case OfferPosWorkPlanName.HBZ_TURNING:
                return $localize`HBZ turning`;
            case OfferPosWorkPlanName.HBZ_GRINDING:
                return $localize`HBZ grinding`;
            case OfferPosWorkPlanName.WELDING_SEALING:
                return $localize`Welding Sealing`;
            case OfferPosWorkPlanName.RUNOUT_CONTROL:
                return $localize`Runout control`;
            case OfferPosWorkPlanName.FORGE_INSPECTION:
                return $localize`Forge inspection`;
            case OfferPosWorkPlanName.RELAXATION:
                return $localize`Relaxation`;
            case OfferPosWorkPlanName.GLOWING:
                return $localize`Glowing`;
            case OfferPosWorkPlanName.SOLUTION_ANNEALING:
                return $localize`Solution annealing`;
            case OfferPosWorkPlanName.WEG:
                return $localize`WEG`;
            case OfferPosWorkPlanName.NORMALIZING:
                return $localize`Normalizing`;
            case OfferPosWorkPlanName.HARDENING:
                return $localize`Hardening`;
            case OfferPosWorkPlanName.TEMPERING_1:
                return $localize`Tempering 1`;
            case OfferPosWorkPlanName.TEMPERING_2:
                return $localize`Tempering 2`;
            case OfferPosWorkPlanName.WARM_TAKEOVER:
                return $localize`Warm takeover`;
            case OfferPosWorkPlanName.DIFFUSION_ANNEALING:
                return $localize`Diffusion annealing`;
            case OfferPosWorkPlanName.FP_STAGE_1:
                return $localize`FP/Stage 1`;
            case OfferPosWorkPlanName.FP_STAGE_2:
                return $localize`FP/Stage 2`;
            case OfferPosWorkPlanName.BG_STAGE_1:
                return $localize`BG/Stage 1`;
            case OfferPosWorkPlanName.BG_STAGE_2:
                return $localize`BG/Stage 2`;
            case OfferPosWorkPlanName.BF_STAGE_1:
                return $localize`BF/Stage 1`;
            case OfferPosWorkPlanName.BF_STAGE_2:
                return $localize`BF/Stage 2`;
            case OfferPosWorkPlanName.PREHEATING_FOR_STRAIGHTENING:
                return $localize`Preheating for straightening`;
            case OfferPosWorkPlanName.AGE_HARDENING:
                return $localize`Age hardening`;
            case OfferPosWorkPlanName.RETEMPERING:
                return $localize`Retempering`;
            case OfferPosWorkPlanName.WARM_TAKEOVER_OAK:
                return $localize`Warm takeover/OAK`;
            case OfferPosWorkPlanName.TESTING:
                return $localize`Testing`;
            case OfferPosWorkPlanName.HARDNESS_TESTING:
                return $localize`Hardness testing`;
            case OfferPosWorkPlanName.PRE_ROUGHING:
                return $localize`Pre-roughing`;
            case OfferPosWorkPlanName.TURNING:
                return $localize`Turning`;
            case OfferPosWorkPlanName.MILLING:
                return $localize`Milling`;
            case OfferPosWorkPlanName.DRILLING:
                return $localize`Drilling`;
            case OfferPosWorkPlanName.BORE_OUT:
                return $localize`Bore out`;
            case OfferPosWorkPlanName.GROOVING:
                return $localize`Grooving`;
            case OfferPosWorkPlanName.CENTERING:
                return $localize`Centering`;
            case OfferPosWorkPlanName.RMD:
                return $localize`RMD`;
            case OfferPosWorkPlanName.BW_CONTROL:
                return $localize`BW control`;
            case OfferPosWorkPlanName.SAMPLING:
                return $localize`Sampling`;
            case OfferPosWorkPlanName.PRESAW_SAMPLE:
                return $localize`Presaw sample`;
            case OfferPosWorkPlanName.PRODUCE_SAMPLE:
                return $localize`Produce sample`;
            case OfferPosWorkPlanName.RESTAMPING:
                return $localize`Restamping`;
            case OfferPosWorkPlanName.STAMPING_ON:
                return $localize`Stamping on`;
            case OfferPosWorkPlanName.STAMPING:
                return $localize`Stamping`;
            case OfferPosWorkPlanName.US:
                return $localize`US`;
            case OfferPosWorkPlanName.OR:
                return $localize`OR`;
            case OfferPosWorkPlanName.IDENT:
                return $localize`Ident`;
            case OfferPosWorkPlanName.QS_STAMPING:
                return $localize`QS stamping`;
            case OfferPosWorkPlanName.QS_CERTIFICATE:
                return $localize`QS certificate`;
            case OfferPosWorkPlanName.EXTERNAL_ACCEPTANCE:
                return $localize`External acceptance`;
            case OfferPosWorkPlanName.PACKAGING:
                return $localize`Packaging`;
            case OfferPosWorkPlanName.SHIPPING:
                return $localize`Shipping`;
            case OfferPosWorkPlanName.FINAL_INSPECTION:
                return $localize`Final inspection`;
            case OfferPosWorkPlanName.SALE:
                return $localize`Sale`;
            case OfferPosWorkPlanName.OUTSOURCING:
                return $localize`Outsourcing`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(OfferPosWorkPlanName);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}