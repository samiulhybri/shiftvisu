import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Machine } from "@app/shared/models/machine.model";
import { SerialNumberProfile } from "@app/shared/models/SerialNumberProfile.model";

export default class MachineMiddleSerialNumberProfiles implements Deserializable {
	id?: number;
	machine?:Machine; 
	serialNumberProfile?:SerialNumberProfile; 

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
            machine_id: this.machine?.id,
            serial_number_profile_id: this.serialNumberProfile?.id,
            machine: undefined,
            serialNumberProfile: undefined,
		};
	}
}