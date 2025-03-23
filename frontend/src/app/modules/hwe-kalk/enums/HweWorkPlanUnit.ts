export enum HweWorkPlanUnitEnum {
    MIN = 'MIN',
    EURO = 'EURO',
    STK = 'STK',
    KG = 'KG'
}

export class HweWorkPlanUnitClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case HweWorkPlanUnitEnum.MIN:
                return $localize`Min.`;
            case HweWorkPlanUnitEnum.EURO:
                return $localize`€`;
            case HweWorkPlanUnitEnum.STK:
                return $localize`Stk.`;
            case HweWorkPlanUnitEnum.KG:
                return $localize`kg`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HweWorkPlanUnitEnum);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}