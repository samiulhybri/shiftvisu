import { TestingScopeAccordingToImpactTestClass } from "@app/modules/hwe-kalk/enums/TestingScopeAccordingToImpactTest";
import { Deserializable } from "../interfaces/deserializable";


export class TestingScopeAccordingToImpactTest implements Deserializable {
    id?: number;
    according_to_impact_test: string = '';
    testing_scope_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.according_to_impact_test ? TestingScopeAccordingToImpactTestClass.getStateTranslate(input.according_to_impact_test) : '';
        this.value = input.according_to_impact_test

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
