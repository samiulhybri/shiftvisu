import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Calculations } from "@app/shared/models/calculations.model";
import { Item } from "@app/shared/models/item.model";
import { ProdOrder } from "@app/shared/models/prod-order.model";
import { User } from "@app/shared/models/user.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { ProdOrderPosStatus } from "@app/shared/enums/ProdOrderPosStatus";
import { ProdOrderPosBomPos } from "./prod-order-pos-bom-pos.model";
import { Suppliers } from "./suppliers.model";

export class ProdOrderPos implements Deserializable {
	id?: number;
	pos?: number;
	start?: Date;
	end?: number;
	quantity?: number;
	just_plan_it_guid?: string;
	status: string = ProdOrderPosStatus.PLANNED;
	status_plan: string = ProdOrderPosStatus.PLANNED;
	is_production_possible?: boolean;
	item_id?: number;
	item?: Item;
	prod_order_id?: number;
	prodOrder?: ProdOrder;
	calculation?: Calculations;
	user_id_creator?: number;
	user_id_responsible?: number;
	estimated_hours?: number;
	label?: string;
	release_date?: Date;
	created_at?: Date;
	userCreator?: User;
	userResponsible?: User;
	notes!: string;
	prodOrderPosOperations!: ProdOrderPosOperation[];
	media?: any;
	bomPos: ProdOrderPosBomPos[] = [];
	actual_time?: string;
	cost?: number;
	supplier_id_tool?: number;
	toolSupplier?: Suppliers;
	is_sampling_required?:boolean;
	is_sampling_done?:boolean;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);
		if (input.item) {
			this.item = new Item().deserialize(input.item);
		}

		if (input.prodOrder ?? input.prod_order) {
			this.prodOrder = new ProdOrder().deserialize(input.prodOrder ?? input.prod_order);
		}

		if (input.calculation) {
			this.calculation = new Calculations().deserialize(input.calculation);
		}
		if (input.userCreator) this.userCreator = new User().deserialize(input.userCreator);
		if (input.userResponsible) this.userResponsible = new User().deserialize(input.userResponsible);
		if (input.toolSupplier) this.toolSupplier = new Suppliers().deserialize(input.toolSupplier);
		if (input.prodOrderPosOperations)
			this.prodOrderPosOperations = input.prodOrderPosOperations.map((elm: any) => {
				return new ProdOrderPosOperation().deserialize(elm);
			});

			if(input.bomPos) {
			this.bomPos = input.bomPos.map((pos:any)=> new ProdOrderPosBomPos().deserialize(pos));
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			item_id: this.item?.id,
			prod_order_id: this.prodOrder?.id,
			user_id_responsible: this.userResponsible?.id,
			user_id_creator: this.userCreator?.id,
			supplier_id_tool: this.toolSupplier?.id,
			item: undefined,
			prodOrder: undefined,
			userCreator: undefined,
			userResponsible: undefined,
			toolSupplier: undefined,
			prodOrderPosOperations: undefined,
			media: undefined,
			status: undefined,
			status_plan: this.status,
			bomPos:undefined
		};
	}
}
