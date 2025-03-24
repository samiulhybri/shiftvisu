export enum SequenceOperations {
    HARDENING,
    FP,
    NORMALIZING,
    HYDROGEN_EFFUSION_ANNEALING,
    SOLUTION_ANNEALING,
    TEMPERING,
    TEMPERING_2x,
    ANNEALING,
    GKZ,
    STRESS_RELIEVING,
    OAK,
    PRE_TURNING_ROUGHING
}

export class SequenceOperationsClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "HARDENING":
                return $localize`HARDENING`;
            case "FP":
                return $localize`FP`;
            case "NORMALIZING":
                return $localize`NORMALIZING`;
            case "HYDROGEN_EFFUSION_ANNEALING":
                return $localize`HYDROGEN EFFUSION ANNEALING`;
            case "SOLUTION_ANNEALING":
                return $localize`SOLUTION ANNEALING`;
            case "TEMPERING":
                return $localize`TEMPERING`;
            case "TEMPERING_2x":
                return $localize`2x TEMPERING`;
            case "ANNEALING":
                return $localize`ANNEALING`;
            case "GKZ":
                return $localize`GKZ`;
            case "STRESS_RELIEVING":
                return $localize`STRESS RELIEVING`;
            case "OAK":
                return $localize`OAK`;
            case "PRE_TURNING_ROUGHING":
                return $localize`PRE TURNING ROUGHING`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(SequenceOperations);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}
