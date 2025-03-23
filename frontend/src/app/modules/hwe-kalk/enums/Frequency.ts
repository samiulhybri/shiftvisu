export enum Frequency {
    BATCH,
    BATCH_FURNACE,
    PIECE,
    BATCH_FURNACE_DIMENSION,
    BATCH_FURNACE_POSITION
}

export class FrequencyClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case "BATCH":
                return $localize`Batch`;
            case "BATCH_FURNACE":
                return $localize`Batch Furnace`;
            case "PIECE":
                return $localize`Piece`;
            case "BATCH_FURNACE_DIMENSION":
                return $localize`Batch Furnace Dimension`;
            case "BATCH_FURNACE_POSITION":
                return $localize`Batch Furnace Position`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(Frequency);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}