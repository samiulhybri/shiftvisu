
import { UsNormTestDirection } from "@app/modules/hwe-qs/enums/UsNormTestDirection";
import { Deserializable } from "../interfaces/deserializable";
import { UsNorm } from "./us-norm";
import { UsNormProbe } from "@app/modules/hwe-qs/enums/UsNormProbe";



export class UsNormRating implements Deserializable {
    id?: number;
    rating?: string = '';
    usNorm?: UsNorm;
    probe?: UsNormProbe;
    sender_section?: number;
    test_direction?: UsNormTestDirection;
    amplification?: number;
    justification?: number;
    ksr?: number;

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
            us_norm_id: this.usNorm?.id,
            usNorm: undefined

        };
    }
}
