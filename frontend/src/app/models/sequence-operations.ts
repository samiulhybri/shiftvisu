
import { Deserializable } from "../interfaces/deserializable";
import { SequenceOperationsClass } from "@app/modules/hwe-kalk/enums/SequenceOperations";


export class SequenceOperations implements Deserializable {
    id?: number;
    sequence_operation: string = '';
    specification_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.sequence_operation ? SequenceOperationsClass.getStateTranslate(input.sequence_operation) : '';
        this.value = input.sequence_operation
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
