
import { Deserializable } from "../interfaces/deserializable";
import { HWEAdditionalCostTriggerClass, HWEAdditionalCostTrigger as HWEAdditionalCostTriggerEnum } from "@app/modules/hwe-kalk/enums/HWEAdditionalCostTrigger";


export class HweAdditionalCostTrigger implements Deserializable {
    id?: number;
    trigger?: HWEAdditionalCostTriggerEnum;
    hwe_additional_cost_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.trigger ? HWEAdditionalCostTriggerClass.getStateTranslate(input.trigger) : '';
        this.value = input.trigger
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
