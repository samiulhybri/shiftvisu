import { Deserializable } from "@app/shared/interfaces/deserializable";
import { DirectoryStructure } from "@app/shared/models/directory-structure.model";
import { BackendModelType } from "@app/shared/enums/BackendModelType";

export class DocumentSection implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	model_type?: BackendModelType;
	sort_order?: number = 0;
	is_active?: boolean = true;
	directoryStructure?: DirectoryStructure = new DirectoryStructure().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.directoryStructure = new DirectoryStructure().deserialize(
			input.directoryStructure || {}
		);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			directory_structure_id: this.directoryStructure?.id,
			directory_structure: undefined,
			directoryStructure: undefined,
		};
	}
}
