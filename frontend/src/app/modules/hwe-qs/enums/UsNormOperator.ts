export enum UsNormOperator {
    GREATER = 'GREATER',
    GREATER_EQUAL = 'GREATER_EQUAL',
    EMPTY = 'EMPTY',
    LESS_EQUAL = 'LESS_EQUAL'
}

export class UsNormOperatorClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case UsNormOperator.GREATER:
                return `>`;
            case UsNormOperator.GREATER_EQUAL:
                return `≥`;
            case UsNormOperator.EMPTY:
                return `""`;
            case UsNormOperator.LESS_EQUAL:
                return `≤`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(UsNormOperator);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
