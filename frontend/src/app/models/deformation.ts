
import { Deserializable } from "../interfaces/deserializable";

import { ContinuousCasting } from "@app/modules/hwe-kalk/enums/ContinuousCasting";
import { IngotCast} from "@app/modules/hwe-kalk/enums/IngotCast";
import { Deformation as  DeformationEnum} from "@app/modules/hwe-kalk/enums/Deformation";
import { StretchForgingDegree } from "@app/modules/hwe-kalk/enums/StretchForgingDegree";
import { ODatable } from "../interfaces/odatable";

export class Deformation implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    note: string = '';
    continuous_casting?: ContinuousCasting;
    ingot_casting?: IngotCast;
    deformation?: DeformationEnum;
    stretch_forging_degree?: StretchForgingDegree;
    
    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
        
            continuous_casting: this.continuous_casting ?? '',
            ingot_casting: this.ingot_casting ?? '',
            stretch_forging_degree: this.stretch_forging_degree ?? '',
            deformation: this.deformation ?? '',
        };
    }
}
