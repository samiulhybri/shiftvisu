
import { VtNormTestTechniqueClass } from "@app/modules/hwe-qs/enums/VtNormTestTechnique";
import { Deserializable } from "../interfaces/deserializable";


export class VtNormTestTechnique implements Deserializable {
    id?: number;
    test_technique: string = '';
    vt_norm_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.test_technique ? VtNormTestTechniqueClass.getStateTranslate(input.test_technique) : '';
        this.value = input.test_technique
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
