
import { UsNormAdjustmentClass } from "@app/modules/hwe-qs/enums/UsNormAdjustment";
import { Deserializable } from "../interfaces/deserializable";


export class UsNormAdjustment implements Deserializable {
    id?: number;
    adjustment: string = '';
    us_norm_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.adjustment ? UsNormAdjustmentClass.getStateTranslate(input.adjustment) : '';
        this.value = input.adjustment
        return this;
    }
    toOdata(): Object {
        return {
            ...this,
            value:undefined,
            text:undefined,
        };
    }
}
