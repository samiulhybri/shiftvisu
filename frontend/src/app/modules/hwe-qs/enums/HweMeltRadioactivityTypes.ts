export enum HweMeltRadioactivityTypes {
    RADIOACTIVITY_BGG = '< 0.1 Bg/g',
    RADIOACTIVITY_SVH = '< 170 nSv/h'
}

export class HweMeltRadioactivityTypesClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "RADIOACTIVITY_BGG":
                return $localize`< 0.1 Bg/g`;
                case "RADIOACTIVITY_SVH":
                return $localize`< 170 nSv/h`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(HweMeltRadioactivityTypes);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;

    }
}

