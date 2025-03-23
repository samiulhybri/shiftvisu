import { Deserializable } from "../interfaces/deserializable";
import { TestingScopeSampleDepthClass } from "@app/modules/hwe-kalk/enums/TestingScopeSampleDepth";


export class TestingScopeSampleDepth implements Deserializable {
    id?: number;
    sample_depth: string = '';
    testing_scope_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.sample_depth ? TestingScopeSampleDepthClass.getStateTranslate(input.sample_depth) : '';
        this.value = input.sample_depth

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
