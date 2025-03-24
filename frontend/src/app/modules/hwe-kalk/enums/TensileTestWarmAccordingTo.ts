export enum TensileTestWarmAccordingTo {
    ISO_6892_2
}

export class TensileTestWarmAccordingToClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "ISO_6892_2":
                return $localize`ISO 6892-2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(TensileTestWarmAccordingTo);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;
    }
}