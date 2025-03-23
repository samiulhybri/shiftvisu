import { Deserializable } from "@app/shared/interfaces/deserializable";
import { BackendModelType } from "@app/shared/enums/BackendModelType";
import { Item } from "@app/shared/models/item.model";
import ItemState from "@app/shared/models/item-state.model";

export default class Stock implements Deserializable {
	id?: number;
	item: Item | undefined;
	itemState?: ItemState;
	batch?: string;
	serial?: string;
	quantity?: number;
	stockable_type?: BackendModelType;
	stockable_id?: number;
	positionable_type?: BackendModelType;
	positionable_id?: number;
	positionable: any;
	stockable: any;
	item_state_id?: number;
	isNewlyAdded: boolean = false; // internal use only

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.item) this.item = new Item().deserialize(input.item);

		if (input.itemState) this.itemState = new ItemState().deserialize(input.itemState);

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_state_id: this.itemState?.id,
			item: undefined,
			itemState: undefined,
			isNewlyAdded: undefined
		};
	}

	toJSON(): Object {
		return {
			batch: this.batch,
			serial: this.serial,
			quantity: this.quantity,
			stockable_type: this.stockable_type,
			stockable_id: this.stockable_id,
			positionable_type: this.positionable_type,
			positionable_id: this.positionable_id,
			item_state_id: this.itemState?.id,
		};
	}
}
