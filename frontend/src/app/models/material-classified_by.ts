

import { AttestationEntityClass } from "@app/modules/hwe-kalk/enums/AttestationEntity";
import { Deserializable } from "../interfaces/deserializable";


export class MaterialClassifiedBy implements Deserializable {
    id?: number;
    classified_by: string = '';
    material_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);
        this.text = input.classified_by? AttestationEntityClass.getStateTranslate(input.classified_by):'';
        this.value = input.classified_by
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