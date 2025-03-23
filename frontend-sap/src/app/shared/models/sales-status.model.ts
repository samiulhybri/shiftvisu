import { Deserializable } from "@app/shared/interfaces/deserializable";
import { Color } from "@app/shared/enums/Color";
import { Customer } from "@app/shared/models/customer.model";

export class SalesStatus implements Deserializable {
	id?: number;
	show_in_kanban: boolean = true;
	custom_id?: string;
	sort_order?: number = 0;
	color: string = Color.BLACK;
	customers?: Customer[] = [];
	show_in_sales_funnel: boolean = true;
	
	constructor() {}

	deserialize(input: any): this {
		Object.assign(this, input);

		if (input.customers)
			this.customers = input.customers.map((customer: Customer) =>
				new Customer().deserialize(customer)
			);
		return this;
	}

	toOdata(): Object {
		return {
			...this,
			customers: undefined,
		};
	}
}
