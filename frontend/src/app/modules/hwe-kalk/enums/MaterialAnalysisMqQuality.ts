export enum TestingScopeMqQuality {
    ISO_6336_5,
    ISO_3990_5
}

export class TestingScopeMqQualityClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "ISO_6336_5":
                return $localize`ISO 6336-5`;
            case "ISO_3990_5":
                return $localize`ISO 3990-5`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(TestingScopeMqQuality);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}