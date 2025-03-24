export enum HardnessTestAccordingTo {
    CONVERSION_ISO_18265_A_1,
    CONVERSION_ISO_18265_B_2
}

export class HardnessTestAccordingToClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "CONVERSION_ISO_18265_A_1":
                return $localize`Conversion according to ISO18265 Tab. A.1`;
            case "CONVERSION_ISO_18265_B_2":
                return $localize`Conversion according to ISO18265 Tab. B.2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HardnessTestAccordingTo);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}