import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Item } from "@app/shared/models/item.model";

export default class HandlingUnit implements Deserializable {
	id?: number;
	custom_id?: string;
	is_active: boolean = true;
	is_exported: boolean = false;
	is_complete: boolean = false;
	packaging_instruction_id: number | null = null;
	item: Item | undefined;
	created_at: Date | undefined;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.item) this.item = new Item().deserialize(input.item);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_id: this.item?.id,
			item: undefined,
			created_at: undefined,
		};
	}
}
