export enum GrainSizeSpecification {
    ISO643 = 'ISO643'
}

export class GrainSizeSpecificationClass {
    constructor() {
    }

    static getStateTranslate(state: any): string {
        switch (state) {
            case "ISO643":
                return $localize`DIN EN ISO 643 June 2020`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        let res_arr: any = [];
        let elemetns = Object.keys(GrainSizeSpecification);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({value: elm, text: this.getStateTranslate(elm)});
            }
        });
        return res_arr;

    }
}

