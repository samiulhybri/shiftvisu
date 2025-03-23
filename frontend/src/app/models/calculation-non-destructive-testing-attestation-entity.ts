import { Deserializable } from "../interfaces/deserializable";
import {AttestationEntity, AttestationEntityClass} from "@app/modules/hwe-kalk/enums/AttestationEntity";


export class CalcualtionNonDestructiveTestingAttestationEntity implements Deserializable {
    id?: number;
    attestation_entity?: AttestationEntity;
    non_destructive_testing_id?: number;
    text: string = '';
    value: string = '';

    constructor() {

    }

    deserialize(input: any) {
        Object.assign(this, input);

        this.text = input.attestation_entity ? AttestationEntityClass.getStateTranslate(input.attestation_entity) : '';
        this.value = input.attestation_entity

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