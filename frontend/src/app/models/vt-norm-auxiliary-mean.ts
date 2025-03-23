
import { VtNormAuxiliaryMeanClass } from "@app/modules/hwe-qs/enums/VtNormAuxiliaryMean";
import { Deserializable } from "../interfaces/deserializable";


export class VtNormAuxiliaryMean implements Deserializable {
    id?: number;
    auxiliary_mean: string = '';
    vt_norm_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.auxiliary_mean ? VtNormAuxiliaryMeanClass.getStateTranslate(input.auxiliary_mean) : '';
        this.value = input.auxiliary_mean
        return this;
    }
    toOdata(): Object {
        return {
            ...this,
            value: undefined,
            text: undefined,
        };
    }
}
