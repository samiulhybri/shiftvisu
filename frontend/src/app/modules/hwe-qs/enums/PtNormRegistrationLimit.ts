export enum PtNormRegistrationLimit {
    GREATER_THAN_OR_EQUAL_7,
    GREATER_THAN_OR_EQUAL_5,
    GREATER_THAN_OR_EQUAL_3,
    GREATER_THAN_OR_EQUAL_2,
    GREATER_THAN_OR_EQUAL_1,
}

export class PtNormRegistrationLimitClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "GREATER_THAN_OR_EQUAL_7":
                return $localize`≥ 7`;
            case "GREATER_THAN_OR_EQUAL_5":
                return $localize`≥ 5`;
            case "GREATER_THAN_OR_EQUAL_3":
                return $localize`≥ 3`;
            case "GREATER_THAN_OR_EQUAL_2":
                return $localize`≥ 2`;
            case "GREATER_THAN_OR_EQUAL_1":
                return $localize`≥ 1`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(PtNormRegistrationLimit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
