import { Deserializable } from "@app/shared/interfaces/deserializable";
import { TpmGroup } from "@app/shared/models/tpm-group.model";

export default class TpmSubGroup implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_active?: boolean = true;
	is_imported_from_erp: boolean = false;
	tpmGroup: TpmGroup = new TpmGroup().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.tpmGroup = new TpmGroup().deserialize(input.tpmGroup || {});

		return this;
	}
	toOdata(): Object {
		return {
			...this,
			tpm_group_id: this.tpmGroup?.id,
			tpmGroup: undefined,
		};
	}
}
