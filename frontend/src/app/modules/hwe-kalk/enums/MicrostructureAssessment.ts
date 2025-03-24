export enum MicrostructureAssessment {
    X100,
    X200,
    X500,
}

export class MicrostructureAssessmentClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "X100":
                return $localize`100x`;
            case "X200":
                return $localize`200x`;
            case "X500":
                return $localize`500x`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(MicrostructureAssessment);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}