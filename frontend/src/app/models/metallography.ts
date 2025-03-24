import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import {NeedsAccordingToIc} from "@app/modules/hwe-kalk/enums/NeedsAccordingToIc";
import { CleanlinessDeterminationAccordingTo } from "./cleanliness-determination-according-to";

export class Metallography implements ODatable, Deserializable {
    id?: number;
    custom_id?: string;
    name: string = '';
    regulation: string = '';
    issue_revision: string = '';
    grain_size: string = '';
    grain_size_after_carburizing: string = '';
    grain_size_determination_according_to: string = '';
    grain_size_textfield: string = '';
    cleanlinessDeterminationAccordingTo: CleanlinessDeterminationAccordingTo[] = [];
    cleanliness_determination: string = '';
    cleanliness_50602_astma45_sep1570: string = '';
    cleanliness_textfield: string = '';
    a_fine?: number;
    a_coarse?: number;
    b_fine?: number;
    b_coarse?: number;
    c_fine?: number;
    c_coarse?: number;
    d_fine?: number;
    d_coarse?: number;
    ds?: number;
    image: boolean = false;
    needs_microsection_structure: boolean = false;
    needs_microsection_grain_size: boolean = false;
    needs_microsection_carburized: boolean = false;
    needs_microsection_cleanliness: boolean = false;
    microstructure_assessment: string = '';
    microstructure_quota: string = '';
    microstructure_max_quota?: number;
    microstructure_textfield: string = '';
    needs_ic_according_to?: NeedsAccordingToIc;
    needs_ic_simulation_annealing: boolean = false;
    needs_ic_external_testing: boolean = false;
    needs_ic_textfield: string = '';
    offer_note: string = '';
    cleanliness_max_value?: number;
    grain_size_value?: number;
    wb_parameter?:number;

    constructor() { }

    deserialize(input: any) {
        Object.assign(this, input);

        if (input.cleanlinessDeterminationAccordingTo) {
            this.cleanlinessDeterminationAccordingTo = [];
            input.cleanlinessDeterminationAccordingTo.forEach((data: any) => {
                this.cleanlinessDeterminationAccordingTo.push(new CleanlinessDeterminationAccordingTo().deserialize(data));
            });
        }

        return this;
    }

    toOdata(): Object {
        return { 
            ...this,
            cleanlinessDeterminationAccordingTo: this.getArrData('cleanliness_determination_according_to', this.cleanlinessDeterminationAccordingTo) ?? undefined,
         };
    }

    getArrData(key: string, arr: any) {
        let arrVal: any[] = []
        arr?.forEach((data: any) => {
            let obj: any = {}
            obj[key] = data.value;
            arrVal.push(obj)
        })
        return arrVal;
    }
}

