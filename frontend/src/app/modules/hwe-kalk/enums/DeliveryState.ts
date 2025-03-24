export enum DeliveryState {
    RM1 = 'RM1',
    FM2 = 'FM2',
    FM3 = 'FM3',
    FM4 = 'FM4',
    VM4 = 'VM4'
}
export class DeliveryStateClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case DeliveryState.RM1:
                return $localize`RM1`;
            case DeliveryState.FM2:
                return $localize`FM2`;
            case DeliveryState.FM3:
                return $localize`FM3`;
            case DeliveryState.FM4:
                return $localize`FM4`;
            case DeliveryState.VM4:
                return $localize`VM4`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elements = Object.keys(DeliveryState);
        elements.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
