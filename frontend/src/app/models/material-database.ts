import { Deserializable } from "../interfaces/deserializable";
import { Material } from "./material";

export class MaterialDatabase implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    material?: Material;
    heat_treatment: string = '';
    min_tensile_strength?: number;
    max_tensile_strength?: number;
    hardness?: number;
    temperature: string = '';

    deserialize(input: any) {
        Object.assign(this, input);

        this.material = input.material ? new Material().deserialize(input.material) : new Material();

        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            id: this.id ?? undefined,
            material_id: this.material?.id ?? null,
            material: undefined,
            heat_treatment: this?.heat_treatment ?? null,
            temperature: this?.temperature ?? null,
        };
    }
}
