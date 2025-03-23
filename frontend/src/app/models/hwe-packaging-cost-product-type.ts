
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { OfferPosProductType, OfferPosProductTypeClass } from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import { HwePackagingCost } from "./hwe-packaging-cost";

export class HwePackagingCostProductType implements ODatable, Deserializable {
    id?: number;
    hwe_packaging_cost_id?: number;
    hwePackagingCost?: HwePackagingCost;
    product_type?: OfferPosProductType;
    text: string = '';
    value: string = '';

    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.product_type ? OfferPosProductTypeClass.getStateTranslate(input.product_type) : '';
        this.value = input.product_type

        return this;
    }

    toOdata(): object {
        return {
            ...this,
            text: undefined,
            value: undefined
        };
    }
}
