import { TestingScopeAccordingToTensileTestClass } from "@app/modules/hwe-kalk/enums/TestingScopeAccordingToTensileTest";
import { Deserializable } from "../interfaces/deserializable";


export class CalculationTestingScopeAccordingToTensileTest implements Deserializable {
    id?: number;
    according_to_tensile_test: string = '';
    calculation_testing_scope_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.according_to_tensile_test ? TestingScopeAccordingToTensileTestClass.getStateTranslate(input.according_to_tensile_test) : '';
        this.value = input.according_to_tensile_test

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
