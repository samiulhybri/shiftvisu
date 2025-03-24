

import { TestingScopeMeltingTypeClass } from "@app/modules/hwe-kalk/enums/TestingScopeMeltingType";
import { Deserializable } from "../interfaces/deserializable";


export class TestingScopeMeltingType implements Deserializable {
    id?: number;
    melting_type: string = '';
    testing_scope_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.melting_type? TestingScopeMeltingTypeClass.getStateTranslate(input.melting_type):'';
        this.value = input.melting_type
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