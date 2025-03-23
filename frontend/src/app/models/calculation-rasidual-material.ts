import { Marking } from "@app/modules/hwe-kalk/enums/Marking";
import { Deserializable } from "@app/interfaces/deserializable";
import { ODatable } from "@app/interfaces/odatable";
import { CrossSectionType } from "@app/modules/hwe-kalk/enums/CrossSectionType";
import {ResidualMaterialFrequency} from "@app/modules/hwe-kalk/enums/ResidualMaterialFrequency";

export class CalculationResidualMaterial implements ODatable, Deserializable {
	id?: number;
	custom_id?: string;
    calculation_id?: number;
    residual_material_id?: number;
    name: string = '';
	free_text: string = '';
	marking?: Marking;
	specification: string = '';
	revision: string = '';
	frequency?: ResidualMaterialFrequency;
	quantity_sample_geometries?:number;
	cross_section_type?: CrossSectionType;
	offer_note:string = '';

	constructor() { }

	deserialize(input: any) {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return { 
			...this,
			marking: this.marking ?? '',
			cross_section_type: this.cross_section_type ?? '',
			custom_id: undefined,
            id: undefined,
		};
	}
}

