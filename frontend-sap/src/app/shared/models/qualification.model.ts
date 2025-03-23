import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { User } from "@app/shared/models/user.model";

export class Qualification implements Deserializable {
	id?: number;
	item?: Item = new Item().deserialize({});
	item_id?: number;
	machine?: Machine = new Machine().deserialize({});
	machine_id?: number;
	operation_code?: string = "";
	min_qualification_hours?: number = 0;
	min_qualification_operations?: number = 0;
	is_imported_from_erp: boolean = false;
	isSelected?: boolean = false; //internal use only
	users?: User[] = [];

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.machine = new Machine().deserialize(input?.machine || {});
		this.item = new Item().deserialize(input?.item || {});
		this.operation_code=input.operation_code ?? "";
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_id: this.item?.id,
			item: undefined,
			machine_id: this.machine?.id,
			machine: undefined,
			isSelected: undefined,
			users: undefined,
			operation_code: this.operation_code ? this.operation_code : null,
		};
	}
}
