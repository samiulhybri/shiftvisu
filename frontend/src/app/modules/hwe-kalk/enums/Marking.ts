export enum Marking {
    HARD_STAMPING = 'HARD_STAMPING',
    LABEL = 'LABEL'
}

export class MarkingClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case Marking.HARD_STAMPING:
                return $localize`Hard stamping`;
            case Marking.LABEL:
                return $localize`Label`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Marking);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}