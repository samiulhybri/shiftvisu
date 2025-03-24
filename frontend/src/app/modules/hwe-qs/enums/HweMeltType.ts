export enum HweMeltType {
    ELECTRIC_FURNACE = 'ELECTRIC_FURNACE',
    BLAST_FURNACE = 'BLAST_FURNACE'
}

export class HweMeltTypeClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "ELECTRIC_FURNACE":
                return $localize`Electric Furnace`;
                case "BLAST_FURNACE":
                return $localize`Blast Furnace`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(HweMeltType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;

    }
}

