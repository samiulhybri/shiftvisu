import { MtNormControlUnitClass } from "@app/modules/hwe-qs/enums/MtNormControlUnit";
import { Deserializable } from "../interfaces/deserializable";


export class MtNormControlUnit implements Deserializable {
    id?: number;
    control_unit: string = '';
    mt_norm_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.control_unit ? MtNormControlUnitClass.getStateTranslate(input.control_unit) : '';
        this.value = input.control_unit
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
