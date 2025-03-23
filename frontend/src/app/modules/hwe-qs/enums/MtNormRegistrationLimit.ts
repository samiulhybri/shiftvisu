export enum MtNormRegistrationLimit {
    GREATER_THAN_OR_EQUAL_5,
    GREATER_THAN_OR_EQUAL_2,
    GREATER_THAN_OR_EQUAL_1,
}

export class MtNormRegistrationLimitClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "GREATER_THAN_OR_EQUAL_5":
                return $localize`≥ 5`;
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
        let elemetns = Object.keys(MtNormRegistrationLimit);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
