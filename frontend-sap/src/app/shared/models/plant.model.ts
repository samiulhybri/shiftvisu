import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Item } from "@app/shared/models/item.model";
import { StorageLocation } from "@app/shared/models/storage-location.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";

export class Plant implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_active?: boolean = true;
	hu_requires_container_item?: boolean = true;
	auto_post_goods_receipt_scrap?: boolean = false;
	is_shift_for_clockin_required?: boolean = true;
	qualivisu_block_threshold?: number = 0;
	qualivisu_shift_check_offset?: number = 0;

	itemPackagingRework: Item | undefined;
	itemPackagingScrap: Item | undefined;

	storageLocationRework: StorageLocation = new StorageLocation().deserialize({});
	storageLocationScrap: StorageLocation = new StorageLocation().deserialize({});
	prodOrderPosOperationIndirect: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.itemPackagingRework = input.itemPackagingRework ?? {}
		this.itemPackagingScrap = input.itemPackagingScrap ?? {}
		this.storageLocationRework = input.storageLocationRework ?? {}
		this.storageLocationScrap = input.storageLocationScrap ?? {}
		this.prodOrderPosOperationIndirect = input.prodOrderPosOperationIndirect ?? {}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_id_packaging_rework: this.itemPackagingRework?.id,
			item_id_packaging_scrap: this.itemPackagingScrap?.id,
			storage_location_id_rework: this.storageLocationRework?.id,
			storage_location_id_scrap: this.storageLocationScrap?.id,
			prod_order_pos_operation_id_indirect: this.prodOrderPosOperationIndirect?.id,
			itemPackagingRework: undefined,
			itemPackagingScrap: undefined,
			storageLocationRework: undefined,
			storageLocationScrap: undefined,
			prodOrderPosOperationIndirect: undefined,
		};
	}
}
