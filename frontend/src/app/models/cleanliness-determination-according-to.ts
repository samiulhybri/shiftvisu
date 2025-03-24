import { Deserializable } from "../interfaces/deserializable";
import { CleanlinessAccordingToDeterminationClass } from "@app/modules/hwe-kalk/enums/CleanlinessAccordingToDetermination";

export class CleanlinessDeterminationAccordingTo implements Deserializable {
    id?: number;
    cleanliness_determination_according_to: string = '';
    metallography_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.cleanliness_determination_according_to? CleanlinessAccordingToDeterminationClass.getStateTranslate(input.cleanliness_determination_according_to):'';
        this.value = input.cleanliness_determination_according_to
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