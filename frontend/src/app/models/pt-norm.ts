import { Deserializable } from "../interfaces/deserializable";
import { ODatable } from "../interfaces/odatable";

export class PtNorm implements ODatable, Deserializable {
	id?: number;
	custom_id: string = '';
	name: string = '';
	specification: string = '';
	issue_revision_status: string = '';
	quality_class: string = '';
	test_scope: string = '';
	test_equipment: string = '';
	test_temperature: string = '';
	developer: string = '';
	batch_developer: string = '';
	penetrant: string = '';
	batch_penetrant: string = '';
	intermediate_cleaner: string = '';
	cleaner: string = '';
	control_unit: string = '';
	comments: string = '';
	lux_meter: string = '';
	illuminance_lux: string = '';
	registration_limit: string = '';

	constructor() { }

	deserialize(input: any) {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return { 
			...this,
			test_scope: this.test_scope ?? '',
            test_equipment: this.test_equipment ?? '',
            test_temperature: this.test_temperature ?? '',
            developer: this.developer ?? '',
            penetrant: this.penetrant ?? '',
            intermediate_cleaner: this.intermediate_cleaner ?? '',
            cleaner: this.cleaner ?? '',
            lux_meter: this.lux_meter ?? '',
            control_unit: this.control_unit ?? '',
            illuminance_lux: this.illuminance_lux ?? '',
            registration_limit: this.registration_limit ?? ''
		};
	}
}
