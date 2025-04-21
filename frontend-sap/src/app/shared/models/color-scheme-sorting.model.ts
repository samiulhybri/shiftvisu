import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ColorScheme } from "@app/shared/models/color-scheme.model";

export class ColorSchemeSorting implements Deserializable {
	id?: number;
	plan_visu_color_scheme_id?: string;
	sorting?: number;
	model_type?: string = "";
	model_column?: string = "";
	value_string?: string = "";
	color?: string = "";
	colorScheme?: ColorScheme;
	has_border: boolean = false;
	border_color: string = 'none';

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.colorScheme)
			this.colorScheme = new ColorScheme().deserialize(input.colorScheme ?? {});

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			plan_visu_color_scheme_id: this.colorScheme?.id,
			colorScheme: undefined,
		};
	}
}
