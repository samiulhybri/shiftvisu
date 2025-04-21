import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ShiftVisuComponentTypeEnum } from "@app/shared/enums/ShiftVisuComponentTypeEnum";
import { ShiftVisuComponentOptionModel } from "@app/shared/models/shift-visu-component-option.model";

export class ShiftVisuComponentModel implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	model_type?: string = "";
	view_in?: string = "";
	measure_options?: string = "";
	component_type?: ShiftVisuComponentTypeEnum;
	shiftVisuComponentOptions?: ShiftVisuComponentOptionModel[] = [];

	deserialize(input: any) {
		Object.assign(this, input);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			shiftVisuComponentOptions: undefined,
		};
	}
}
