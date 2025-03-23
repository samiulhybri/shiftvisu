
export enum MtNormUvLamp {
    MAGNAFLUX_UV_LED_EV_6000,
}
export class MtNormUvLampClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "MAGNAFLUX_UV_LED_EV_6000":
                return $localize`Magnaflux UV LED EV 6000 Seriennummer 628001`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormUvLamp);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

