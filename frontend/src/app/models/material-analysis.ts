import { HweShrinkage } from "@app/modules/hwe-kalk/enums/HweShrinkage";
import { Deserializable } from "../interfaces/deserializable";
import { ChemAnalysis } from "./chem-analysis";
import { Material } from "./material";

export class MaterialAnalysis implements Deserializable {
    id?: number;
    custom_id?: string;
    materials?: Material[];
    note: string = '';
    regulation: string = '';
    issue_revision: string = '';
    chemAnalyses: ChemAnalysis[] = [];

    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        this.materials = Array.isArray(input.materials) ? input.materials.map((m: any) => new Material().deserialize(m)) : [];
        if (input.chemAnalyses) {
            this.chemAnalyses = [];
            input.chemAnalyses.forEach((data: any) => {
                this.chemAnalyses!.push(new ChemAnalysis().deserialize(data))
            });
        }
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            chemAnalyses: undefined,
            materials: undefined,
            material:undefined
        };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal.length ? arrVal : null;
    }
}
