export enum HardnessTestLocation {
    COMPONENT,
    SAMPLE
}

export class HardnessTestLocationClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "COMPONENT":
                return $localize`COMPONENT`;
            case "SAMPLE":
                return $localize`SAMPLE`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(HardnessTestLocation);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}