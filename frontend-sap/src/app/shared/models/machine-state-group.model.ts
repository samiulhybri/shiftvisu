import { ColorPalette } from "@app/shared/enums/ColorPalette";
import { Deserializable } from "@app/shared/interfaces/deserializable";

export class MachineStateGroup implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_active?: boolean = true;
	is_productive?: boolean = false;
	has_capacity?: boolean = true;
	is_imported_from_erp: boolean = false;
	color?: string = ColorPalette.BLACK;
	isUsed: boolean = false;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.topMachineState) this.isUsed = true;
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			isUsed: undefined,
		};
	}
}
