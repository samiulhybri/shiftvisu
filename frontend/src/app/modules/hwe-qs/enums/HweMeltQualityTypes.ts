export enum HweMeltQualityTypes {
    ME_QUALITY = 'ME Quality',
    MQ_QUALITY = 'MQ Quality'
}

export class HweMeltQualityTypesClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "ME_QUALITY":
                return $localize`ME Quality`;
                case "MQ_QUALITY":
                return $localize`MQ Quality`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(HweMeltQualityTypes);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;

    }
}

