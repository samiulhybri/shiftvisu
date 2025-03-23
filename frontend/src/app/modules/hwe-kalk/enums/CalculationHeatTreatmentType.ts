export enum CalculationHeatTreatmentType {
    NORMALIZE = 'NORMALIZE',
    QUENCHING = 'QUENCHING',
    GLOWING = 'GLOWING',
    FP_FERRITE_PEARLITE_ANNEALING = 'FP_FERRITE_PEARLITE_ANNEALING',
    BG_MACHINING_ANNEALING = 'BG_MACHINING_ANNEALING',
    STRESS_RELIEVING = 'STRESS_RELIEVING',
    BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN = 'BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN',
    TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN = 'TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN',
    SOLUTION_ANNEALING = 'SOLUTION_ANNEALING',
    NORMALIZE_OAK_FURNACE_COOLING = 'NORMALIZE_OAK_FURNACE_COOLING',
    NORMALIZE_QUENCHING = 'NORMALIZE_QUENCHING',
    NORMALIZE_QUENCHING_OAK_FURNACE_COOLING = 'NORMALIZE_QUENCHING_OAK_FURNACE_COOLING',
    QUENCHING_OAK_FURNACE_COOLING = 'QUENCHING_OAK_FURNACE_COOLING',
    QUENCHING_INCL_2X_QUENCHING = 'QUENCHING_INCL_2X_QUENCHING',
    DESP_OAK_FURNACE_COOLING = 'DESP_OAK_FURNACE_COOLING',
    WEG_HYDROGEN_EFFUSION_ANNEALING = 'WEG_HYDROGEN_EFFUSION_ANNEALING',
    DIFFUSION_ANNEALING = 'DIFFUSION_ANNEALING',
    DIFFUSION_ANNEALING_NORMALIZE = 'DIFFUSION_ANNEALING_NORMALIZE',
    DIFFUSION_ANNEALING_QUENCHING = 'DIFFUSION_ANNEALING_QUENCHING',
    DIFFUSION_ANNEALING_BG = 'DIFFUSION_ANNEALING_BG',
    DIFFUSION_ANNEALING_FP = 'DIFFUSION_ANNEALING_FP',
    DIFFUSION_ANNEALING_BF = 'DIFFUSION_ANNEALING_BF',
    DIFFUSION_ANNEALING_TH = 'DIFFUSION_ANNEALING_TH',
    HARDENING_FP = 'HARDENING_FP',
    FP_OAK_FURNACE_COOLING = 'FP_OAK_FURNACE_COOLING',
    PRE_HEAT = 'PRE_HEAT',
    HARDENING = 'HARDENING',
    UNTREATED = 'UNTREATED',
    INDIVIDUAL = 'INDIVIDUAL'
}

export class CalculationHeatTreatmentTypeClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case CalculationHeatTreatmentType.NORMALIZE:
                return $localize`Normalize`;
            case CalculationHeatTreatmentType.QUENCHING:
                return $localize`Quanching`;
            case CalculationHeatTreatmentType.GLOWING:
                return $localize`Glowing`;
            case CalculationHeatTreatmentType.SOLUTION_ANNEALING:
                return $localize`Solution Annealing`;
            case CalculationHeatTreatmentType.FP_FERRITE_PEARLITE_ANNEALING:
                return $localize`FP Ferrite Pearlite Annealing`;
            case CalculationHeatTreatmentType.BG_MACHINING_ANNEALING:
                return $localize`BG Machining Annealing`;
            case CalculationHeatTreatmentType.STRESS_RELIEVING:
                return $localize`Stress Relieving`;
            case CalculationHeatTreatmentType.BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN:
                return $localize`BF Annealing to specific hardness`;
            case CalculationHeatTreatmentType.TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN:
                return $localize`TH Annealing to specific hardness`;
            case CalculationHeatTreatmentType.NORMALIZE_OAK_FURNACE_COOLING:
                return $localize`Normalize OAK Furnace cooling`;
            case CalculationHeatTreatmentType.NORMALIZE_QUENCHING:
                return $localize`Normalize Quenching`;
            case CalculationHeatTreatmentType.NORMALIZE_QUENCHING_OAK_FURNACE_COOLING:
                return $localize`Normalize Quenching OAK Furnace cooling`;
            case CalculationHeatTreatmentType.QUENCHING_OAK_FURNACE_COOLING:
                return $localize`Quenching OAK Furnace cooling`;
            case CalculationHeatTreatmentType.QUENCHING_INCL_2X_QUENCHING:
                return $localize`Quenching incl 2x Quenching`;
            case CalculationHeatTreatmentType.DESP_OAK_FURNACE_COOLING:
                return $localize`DESP OAK Furnace cooling`;
            case CalculationHeatTreatmentType.WEG_HYDROGEN_EFFUSION_ANNEALING:
                return $localize`WEG Hydrogen Effusion Annealing`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING:
                return $localize`Diffusion Annealing`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_NORMALIZE:
                return $localize`Diffusion Annealing Normalize`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_QUENCHING:
                return $localize`Diffusion Annealing Quenching`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BG:
                return $localize`Diffusion Annealing BG`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_FP:
                return $localize`Diffusion Annealing FP`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BF:
                return $localize`Diffusion Annealing BF`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_TH:
                return $localize`Diffusion Annealing TH`;
            case CalculationHeatTreatmentType.HARDENING_FP:
                return $localize`Hardening FP`;
            case CalculationHeatTreatmentType.FP_OAK_FURNACE_COOLING:
                return $localize`FP OAK Furnace Cooling`;
            case CalculationHeatTreatmentType.PRE_HEAT:
                return $localize`Pre heat`;
            case CalculationHeatTreatmentType.HARDENING:
                return $localize`Hardening`;
            case CalculationHeatTreatmentType.UNTREATED:
                return $localize`Untreated`;
            case CalculationHeatTreatmentType.INDIVIDUAL:
                return $localize`Individual`;
            default:
                return "";
        }
    }

    static getStateTranslateOfferText(state: any): string {
        switch (state) {
            case CalculationHeatTreatmentType.NORMALIZE:
                return $localize`Normalised`;
            case CalculationHeatTreatmentType.QUENCHING:
                return $localize`Quenched and tempered`;
            case CalculationHeatTreatmentType.GLOWING:
                return $localize`Annealed`;
            case CalculationHeatTreatmentType.SOLUTION_ANNEALING:
                return $localize`Solution-Annealed`;
            case CalculationHeatTreatmentType.FP_FERRITE_PEARLITE_ANNEALING:
                return $localize`FP treated`;
            case CalculationHeatTreatmentType.BG_MACHINING_ANNEALING:
                return $localize`BG treated`;
            case CalculationHeatTreatmentType.STRESS_RELIEVING:
                return $localize`Stress relieved`;
            case CalculationHeatTreatmentType.BF_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN:
                return $localize`BF treated`;
            case CalculationHeatTreatmentType.TH_ANNEALING_TO_SPECIFIC_HARDNESS_SPAN:
                return $localize`TH treated`;
            case CalculationHeatTreatmentType.NORMALIZE_OAK_FURNACE_COOLING:
                return $localize`Normalised with furnace cooling`;
            case CalculationHeatTreatmentType.NORMALIZE_QUENCHING:
                return $localize`Normalised, quenched and tempered`;
            case CalculationHeatTreatmentType.NORMALIZE_QUENCHING_OAK_FURNACE_COOLING:
                return $localize`Normalised quenched and tempered with furnace cooling`;
            case CalculationHeatTreatmentType.QUENCHING_OAK_FURNACE_COOLING:
                return $localize`Quenched and tempered with furnace cooling`;
            case CalculationHeatTreatmentType.QUENCHING_INCL_2X_QUENCHING:
                return $localize`Quenched and tempered`;
            case CalculationHeatTreatmentType.DESP_OAK_FURNACE_COOLING:
                return $localize`Stress relieved with furnace cooling`;
            case CalculationHeatTreatmentType.WEG_HYDROGEN_EFFUSION_ANNEALING:
                return $localize`Hydrogen reduction annealed`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING:
                return $localize`Annealed`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_NORMALIZE:
                return $localize`Normalised`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_QUENCHING:
                return $localize`Quenched and tempered`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_FP:
                return $localize`FP treated`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BG:
                return $localize`BG treated`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_BF:
                return $localize`BF treated`;
            case CalculationHeatTreatmentType.DIFFUSION_ANNEALING_TH:
                return $localize`TH treated`;
            case CalculationHeatTreatmentType.FP_OAK_FURNACE_COOLING:
                return $localize`FP treated`;
            case CalculationHeatTreatmentType.UNTREATED:
                return $localize`Without heat treatment`;
            case CalculationHeatTreatmentType.INDIVIDUAL:
                return $localize`Individual`;
            default:
                return '';
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(CalculationHeatTreatmentType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
