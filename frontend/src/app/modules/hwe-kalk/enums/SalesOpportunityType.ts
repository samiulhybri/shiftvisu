import {SalesOpportunity} from "@app/models/sales-opportunity";

export enum SalesOpportunityType {
    DEMAND = 'DEMAND',
    PROJECT = 'PROJECT',
    ORDER = 'ORDER'
}

export class SalesOpportunityTypeClass {
    constructor() { }

    static getStateTranslate(state: any): String {
        switch (state) {
            case SalesOpportunityType.DEMAND:
                return $localize`Demand`;
            case SalesOpportunityType.PROJECT:
                return $localize`Project`;
            case SalesOpportunityType.ORDER:
                return $localize`Order`;
            default:
                return "";
        }
    }

    static getEnumArray() {
        var res_arr: any = [];
        var elemetns = Object.keys(SalesOpportunityType);
        elemetns.forEach((elm) => {
            if (isNaN(Number(elm))) {
                res_arr.push({ value: elm, text: this.getStateTranslate(elm) });
            }
        });
        return res_arr;

    }
}



