
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { HwePackagingCostProductType } from "./hwe-packaging-cost-product-type";
import { HwePackagingCostUnit } from "@app/modules/hwe-kalk/enums/HwePackagingCostUnit";

export class HwePackagingCost implements ODatable, Deserializable {
    id?: number;
    outer_diameter_min?: number;
    outer_diameter_max?: number;
    height_min?: number;
    height_max?: number;
    weight_min?: number;
    weight_max?: number;
    quantity_min?: number;
    quantity_max?: number;
    cost?: number;
    product_types: string = '';
    packaging_cost_unit?: HwePackagingCostUnit;
    hwePackagingCostProductTypes: HwePackagingCostProductType[] = [];
    
    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.hwePackagingCostProductTypes) {
            this.hwePackagingCostProductTypes = [];
            input.hwePackagingCostProductTypes.forEach((hwePackagingCostProductType: HwePackagingCostProductType) => {
                this.hwePackagingCostProductTypes?.push(new HwePackagingCostProductType().deserialize(hwePackagingCostProductType));
            });
        }

        return this;
    }

    toOdata(): object {
        return {
            ...this,
            packaging_cost_unit: this.packaging_cost_unit ?? '',
            product_types: undefined,
            hwePackagingCostProductTypes: this.getArrData('product_type', this.hwePackagingCostProductTypes) ?? undefined
        };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal;
    }
}
