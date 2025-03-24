import { HweShrinkage } from "@app/modules/hwe-kalk/enums/HweShrinkage";
import { Deserializable } from "../interfaces/deserializable";
import { ChemAnalysis } from "./chem-analysis";
import { MaterialDatabase } from "./material-database";
import { HweColorType } from "@app/modules/hwe-kalk/enums/HweColorType";
import { MaterialAnalysis } from "./material-analysis";
import { HardenabilityRange } from "./hardenability-range";

export class Material implements Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    note: string = '';
    density: number = 0.0;
    forging_temperature_min?: number;
    forging_temperature_max?: number;
    put_in_cold_oven: boolean = false;
    shrinkage: HweShrinkage = HweShrinkage.ONE_AND_HALF_PERCENT;
    color_type?: HweColorType;
    warehouse_material: string = '';
    material_group_type: string = '';
    check_starting_material: boolean = false;
    materialDatabases: MaterialDatabase[] = [];  
    hardenabilityRanges: HardenabilityRange[] = [];  
    materialAnalyses: MaterialAnalysis[] = [];  
    constructor() { }
    deserialize(input: any) {
        Object.assign(this, input);
        
        return this;
    }

    toOdata(): Object {
        return {
            ...this,
            chemAnalyses: undefined,
            hardenabilityRanges: undefined,
            materialAnalyses: undefined,
            warehouse_material: this.warehouse_material ?? '',
            material_group_type: this.material_group_type ?? '',
            color_type: this.color_type ?? '',
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
