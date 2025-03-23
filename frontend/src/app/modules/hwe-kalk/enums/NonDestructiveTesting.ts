export enum NonDestructiveTesting {
    THREE_ONE,
    THREE_TWO
}


export class NonDestructiveTestingClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "THREE_ONE":
                return $localize`3.1`;
            case "THREE_TWO":
                return $localize`3.2`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(NonDestructiveTesting);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}