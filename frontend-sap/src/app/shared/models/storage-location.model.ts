import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Warehouse } from "@app/shared/models/warehouse.model";
import { TransportOrderType } from "@app/shared/models/transport-order-type";

export class StorageLocation implements Deserializable {
	id?: number;
	custom_id?: string;
	name?: string = "";
	is_active?: boolean = true;
	warehouse?: Warehouse = new Warehouse().deserialize({});
	transportOrderType?: TransportOrderType = new TransportOrderType().deserialize({});

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.warehouse) {
			this.warehouse = new Warehouse().deserialize(input.warehouse ?? {});
		}

		this.transportOrderType = new TransportOrderType().deserialize(input.transportOrderType ?? {});

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			warehouse_id: this.warehouse?.id ?? null,
			warehouse: undefined,
			transport_order_type_id: this.transportOrderType?.id ?? null,
			transportOrderType: undefined,
		};
	}
}
