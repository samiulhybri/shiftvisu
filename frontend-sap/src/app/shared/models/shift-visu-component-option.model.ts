import { Deserializable } from "@app/shared/interfaces/deserializable";

export class ShiftVisuComponentOptionModel implements Deserializable {
	id?: number;
	shift_visu_component_id?: number;
	option?: string = "";

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}
    
	toOdata(): Object {
		return {
			...this,
		};
	}
}
