

import { UsNormTestDirection } from "@app/modules/hwe-qs/enums/UsNormTestDirection";
import { Deserializable } from "../interfaces/deserializable";
import { UsNorm } from "./us-norm";
import { UsNormProbe } from "@app/modules/hwe-qs/enums/UsNormProbe";
import { UsNormSoundAttenuationOperator } from "@app/modules/hwe-qs/enums/UsNormSoundAttenuationOperator";


export class UsNormTestScope implements Deserializable {
    id?: number;
    test_scope?: string = '';
    usNorm?: UsNorm;
    probe?: UsNormProbe;
    test_direction?: UsNormTestDirection;
    sound_attenuation?: number;
    sound_attenuation_operator?: UsNormSoundAttenuationOperator;

    constructor() {

    }
    deserialize(input: any) {
        Object.assign(this, input);



        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            probe: this.probe ?? '',
            test_direction: this.test_direction ?? '',
            sound_attenuation_operator: this.sound_attenuation_operator ?? '',
            us_norm_id: this.usNorm?.id,
            usNorm: undefined,
        };
    }
}
