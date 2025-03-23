export enum MtNormResidualMagnetism {
    LESS_THAN_800_AM,
    LESS_THAN_600_AM,
    LESS_THAN_400_AM,
    LESS_THAN_6_GAUSS,
    LESS_THAN_4_GAUSS,
    LESS_THAN_2_GAUSS,
}

export class MtNormResidualMagnetismClass {
    constructor() { }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "LESS_THAN_800_AM":
                return $localize`< 800 A/m`;
            case "LESS_THAN_600_AM":
                return $localize`< 600 A/m`;
            case "LESS_THAN_400_AM":
                return $localize`< 400 A/m`;
            case "LESS_THAN_6_GAUSS":
                return $localize`< 6 Gauss`;
            case "LESS_THAN_4_GAUSS":
                return $localize`< 4 Gauss`;
            case "LESS_THAN_2_GAUSS":
                return $localize`< 2 Gauss`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(MtNormResidualMagnetism);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}

