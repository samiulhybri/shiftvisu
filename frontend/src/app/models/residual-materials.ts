import { Marking } from "@app/modules/hwe-kalk/enums/Marking";
import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";
import { CrossSectionType } from "@app/modules/hwe-kalk/enums/CrossSectionType";

export class ResidualMaterial implements ODatable, Deserializable {
	id?: number;
	custom_id?: string;
    name: string = '';
	free_text: string = '';
	marking?: Marking;
	specification: string = '';
	revision: string = '';
	frequency: string = '';
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
			cross_section_type: this.cross_section_type ?? ''
		};
	}
}

