export interface Demand {
    machine_id: number;
	machine_custom_id: string;
	machine_name: string;
	machine_group_id: number;
	machine_group_custom_id: string;
	machine_group_name: string;
	item_id: number;
	item_custom_id: string;
	item_name: string;
	year: number;
	week: number;
	hours_demand: number;
}
