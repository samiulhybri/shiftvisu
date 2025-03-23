import { HweShrinkage } from "@app/modules/hwe-kalk/enums/HweShrinkage";
import { Deserializable } from "../interfaces/deserializable";
import { ChemAnalysis } from "./chem-analysis";
import { Material } from "./material";
import {CalculationChemicalAnalysis} from "@app/models/calculation-chemical-analysis";

export class CalculationMaterialAnalysis implements Deserializable {
    id?: number;
    custom_id?: string;
    calculation_id?: string;
    materials?: Material[];
    note: string = '';
    material_analysis_id?:number;
    regulation: string = '';
    issue_revision: string = '';
    chemAnalyses: CalculationChemicalAnalysis[] = [];

    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        this.materials = Array.isArray(input.materials) ? input.materials.map((m: any) => new Material().deserialize(m)) : [];
        if (input.chemAnalyses) {
            this.chemAnalyses = [];
            input.chemAnalyses.forEach((data: any) => {
                this.chemAnalyses!.push(new CalculationChemicalAnalysis().deserialize(data))
            });
        }
        return this;
    }

    toOdata(isUpdate:boolean = false): Object {
        return {
            ...this,
            id: undefined,
            custom_id:undefined,
            chemAnalyses: isUpdate? undefined : this.chemAnalyses.map(elm => elm.toOdata()),
            materials: undefined,
        };
    }

}
