
import { Deserializable } from "../interfaces/deserializable";
import { JominyBatch } from "@app/modules/hwe-kalk/enums/JominyBatch";
import { Material } from "./material";

export class HardenabilityRange implements Deserializable {
    id?: number;
    custom_id?: string;
    materials?: Material[] = [];
    with_applicable_standard: string = '';
    jominy_batch?: JominyBatch;
    note: string = '';
    j_1_5_min?: number;
    j_1_5_max?: number;
    j_3_min?: number;
    j_3_max?: number;
    j_5_min?: number;
    j_5_max?: number;
    j_7_min?: number;
    j_7_max?: number;
    j_9_min?: number;
    j_9_max?: number;
    j_10_min?: number;
    j_10_max?: number;
    j_11_min?: number;
    j_11_max?: number;
    j_13_min?: number;
    j_13_max?: number;
    j_15_min?: number;
    j_15_max?: number;
    j_20_min?: number;
    j_20_max?: number;
    j_25_min?: number;
    j_25_max?: number;
    j_30_min?: number;
    j_30_max?: number;
    j_35_min?: number;
    j_35_max?: number;
    j_40_min?: number;
    j_40_max?: number;
    j_45_min?: number;
    j_45_max?: number;
    j_50_min?: number;
    j_50_max?: number;
    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        this.materials = Array.isArray(input.materials) ? input.materials.map((m: any) => new Material().deserialize(m)) : [];
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            jominy_batch: this.jominy_batch ?? '',
            materials: undefined,
            materials_concated : undefined
        };
    }
}
