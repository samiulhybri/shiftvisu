import { Deserializable } from "@app/shared/interfaces/deserializable";
import Bom from "@app/shared/models/bom.model";
import ItemGroup from "@app/shared/models/item-group.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { Plant } from "@app/shared/models/plant.model";
import { Classification } from "@app/shared/models/classification.model";
import ItemType from "@app/shared/models/item-type.model";
import {Customer} from "@app/shared/models/customer.model";

export class Item implements Deserializable {
	id?: number;
	custom_id?: string = "";
	name?: string = "";
	is_sales_item?: boolean = false;
	is_alloy?: boolean = false;
	use_stock_for_backlog?: boolean = false;
	use_for_capacity_planning?: boolean = false;
	is_active?: boolean = true;
	price?: number = 0;
	stock?: number = 0;
	hwe_period_month?: number = 0;
	hwe_period_year?: number = 0;
	hwe_norm_name?: string = "";
	hwe_warehouse_material?: string = "";
	is_packaging_item?: boolean = false;
	isUsed: boolean = false;
	operationPlan?: OperationPlan = new OperationPlan().deserialize({});
	bom?: Bom = new Bom().deserialize({});
	is_imported_from_erp: boolean = false;
	itemGroup?: ItemGroup = new ItemGroup().deserialize({});
	media?: any;
	is_tool: boolean = false;
	plant: Plant = new Plant().deserialize({});
	itemType: ItemType = new ItemType().deserialize({});
	prodOrderPos: ProdOrderPos[] = [];
	bom_id?: number;
	classifications: Classification[] = [];
	note?: string = "";
	height?: string = '';
	width?: string = '';
	length?: string = '';
	total_weight?: string = '';
	is_production_item?: boolean = false;
	is_purchased_item?: boolean = false;
	name3?: string = '';
	name2?: string = '';
	customers: Customer[] = [];
	batch_quantity?: number = 0;

	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		this.length = input.length ?? '';
		this.width = input.width ?? '';
		this.height = input.height ?? '';
		this.total_weight = input.total_weight ?? '';

		if (input.plant) this.plant = new Plant().deserialize(input.plant);
		this.itemType = new ItemType().deserialize(input.itemType ?? {});
		if (input.customers && input.customers.length) {
			this.customers = input.customers.map((customer: any) =>
				new Customer().deserialize(customer)
			);
		}
		if (input.operationPlan)
			this.operationPlan = new OperationPlan().deserialize(input.operationPlan);
		if (input.bom) this.bom = new Bom().deserialize(input.bom);
		if (input.itemGroup) this.itemGroup = new ItemGroup().deserialize(input.itemGroup);
		if (input.prodOrderPos)
			this.prodOrderPos = input.prodOrderPos.map((pos: any) =>
				new ProdOrderPos().deserialize(pos)
			);

		if (input.classifications) {
			this.classifications = input.classifications.map((classification: any) =>
				new Classification().deserialize(classification)
			);
		}
		if (input.topQualification) {
			this.isUsed = true;
		}

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			operation_plan_id: this.operationPlan?.id,
			operationPlan: undefined,
			bom_id: this.bom?.id,
			bom: undefined,
			item_group_id: this.itemGroup?.id,
			plant_id: this.plant?.id,
			item_type_id: this.itemType?.id,
			itemGroup: undefined,
			plant: undefined,
			isUsed: undefined,
			media: undefined,
			prodOrderPos: undefined,
			itemType: undefined,
			customers: undefined
		};
	}

	toOdataForItemPlant(): object {
		return {
			item_id: this.id,
			plant_id: this.plant?.id,
			is_batch_managed: false,
		};
	}

  getDeliveryPriority() {
   return  this.classifications.find(
		(classification: Classification) => classification.attribute == "LPRIO_BEZ"
	);
  }
}
