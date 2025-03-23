export enum UsNormSoundAttenuationOperator {
    LESS_THAN = 'LESS_THAN',
    GREATER_EQUAL = 'GREATER_EQUAL'
}

export class UsNormSoundAttenuationOperatorClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case UsNormSoundAttenuationOperator.LESS_THAN:
                return `<`;
            case UsNormSoundAttenuationOperator.GREATER_EQUAL:
                return `≥`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormSoundAttenuationOperator);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
