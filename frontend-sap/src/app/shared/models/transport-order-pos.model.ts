import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ProdOrderPosBomPos } from "@app/shared/models/prod-order-pos-bom-pos.model";
import { TransportOrder } from "@app/shared/models/transport-order.model";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { User } from "@app/shared/models/user.model";
import { UnitOfMeasure } from "@app/shared/models/unit-of-measures.model";
import { TransportOrderPosDeliveries } from "@app/shared/models/transport-order-pos-delivery.model";

export class TransportOrderPos implements Deserializable {
	id?: number;
	prod_order_pos_bom_pos_id?: number;
	transport_order_id?: number;
	item_id?: number;
	responsible_user_id?: number;
	machine_id?: number;
	pos?: string;
	transportable_type?: string;
	transportable_id?: number;
	status?: string;
	is_accepted?: boolean = false;
	is_urgent: boolean = false;
	is_completed: boolean = false;
	entry_date?: Date;
	prodOrderPosBomPos?: ProdOrderPosBomPos;
	transportOrder?: TransportOrder;
	item?: Item;
	machine?: Machine;
	responsibleUser?: User;
	quantity!: number;
	deliveredQuantity!: number;
	unitOfMeasure?: UnitOfMeasure;
	currentDelivery?: TransportOrderPosDeliveries;
	transportOrderPosDeliveries: TransportOrderPosDeliveries[] = [];
	quantityDelivered? = 0;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.prodOrderPosBomPos) this.prodOrderPosBomPos = new ProdOrderPosBomPos().deserialize(input.prodOrderPosBomPos);
		if (input.transportOrder) this.transportOrder = new TransportOrder().deserialize(input.transportOrder);
		if (input.item) this.item = new Item().deserialize(input.item);
		if (input.machine) this.machine = new Machine().deserialize(input.machine);
		if (input.responsibleUser) this.responsibleUser = new User().deserialize(input.responsibleUser);
		if (input.unitOfMeasure) this.unitOfMeasure = new UnitOfMeasure().deserialize(input.unitOfMeasure);

		if (input.transportOrderPosDeliveries) {
			this.quantityDelivered = 0;
			this.transportOrderPosDeliveries = input.transportOrderPosDeliveries?.map(
				(transportOrderPosDeliveries: any) => {
					this.quantityDelivered! += parseInt(transportOrderPosDeliveries.delivered_quantity);
					return new TransportOrderPosDeliveries().deserialize(
						transportOrderPosDeliveries
					);
				}
			);

			this.currentDelivery = this.transportOrderPosDeliveries?.find(
				(transportOrderPosDeliveries: TransportOrderPosDeliveries) =>
					!transportOrderPosDeliveries.is_completed
			);
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
            prod_order_pos_bom_pos_id: this.prodOrderPosBomPos?.id,
            transport_order_id: this.transportOrder?.id,
            item_id: this.item?.id,
            machine_id: this.machine?.id,
            responsible_user_id: this.responsibleUser?.id,
			prodOrderPosBomPos: undefined,
			transportOrder: undefined,
			item: undefined,
			machine: undefined,
			responsibleUser: undefined,
			quantity: undefined,
			deliveredQuantity: undefined,
            unitOfMeasure: undefined,
            transportOrderPosDeliveries: undefined,
            currentDelivery: undefined,
            quantityDelivered: undefined,
		};
	}
}
