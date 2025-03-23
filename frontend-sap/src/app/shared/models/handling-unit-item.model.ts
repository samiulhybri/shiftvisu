import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Item } from "@app/shared/models/item.model";
import HandlingUnit from "@app/shared/models/handling-unit.model";

export default class HandlingUnitItem implements Deserializable {
	id?: number;
	handlingUnit: HandlingUnit | undefined;
	batch?: string;
	serial?: string;
	quantity?: number;
	erp_quantity?: number;
	item: Item | undefined;

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.item) this.item = new Item().deserialize(input.item);
		if (input.handlingUnit)
			this.handlingUnit = new HandlingUnit().deserialize(input.handlingUnit);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			handling_unit_id: this.handlingUnit?.id,
			item: undefined,
			handlingUnit: undefined,
		};
	}
}
