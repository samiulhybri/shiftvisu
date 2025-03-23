export enum CleanlinessDetermination {
    Oxidic = "Oxidic",
    Sulfidic = "Sulfidic",
    Oxidic_Sulfidic = "Oxidic_Sulfidic"
}

export class CleanlinessDeterminationClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case CleanlinessDetermination.Oxidic:
                return $localize`Oxidic`;
            case CleanlinessDetermination.Sulfidic:
                return $localize`Sulfidic`;
            case CleanlinessDetermination.Oxidic_Sulfidic:
                return $localize`Oxidic and Sulfidic`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(CleanlinessDetermination);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}
