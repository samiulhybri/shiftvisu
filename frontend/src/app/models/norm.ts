import { Deserializable } from "../interfaces/deserializable";
import { ChemAnalysis } from "./chem-analysis";
import { Material } from "./material";

export class Norm implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    material?: Material;
    material_id?: number;
    note: string = '';
    chemAnalyses: ChemAnalysis[] = [];

    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);

        if (input.chemAnalyses) {
            this.chemAnalyses = [];
            input.chemAnalyses.forEach((data: any) => {
                this.chemAnalyses!.push(new ChemAnalysis().deserialize(data))
            });
        }
        this.material = (input.material) ? new Material().deserialize(input.material) : new Material();
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            material_id: this.material?.id,
            chemAnalyses: undefined,
            material: undefined
        };
    }
}
