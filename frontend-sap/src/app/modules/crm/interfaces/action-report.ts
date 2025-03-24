export interface CrmActionLog {
	customer: string;
	customer_custom_id: string;
	user_custom_id: string;
	crm_action_custom_id: string;
	id: number;
	date: string; // Format: "DD-MM-YYYY"
	month: number;
	week: number;
	action: string;
	note: string;
	user: string;
	customer_name: string;
	country_name: string;
	country_id: number;
	country_custom_id: string;
	market_segment_name: string;
	market_segment_custom_id: string;
	week_year: string;
	month_year: string;
}

export interface ResposibleGrid {
	user_id: number;
	name: string;
	user_custom_id: string;
	total_actions: number;
	ratio: number;
	formatted_ratio?: string;
}

export interface ActionGrid {
	crm_action_custom_id: string;
	name: string;
	note: string;
	total_actions: number;
	ratio: number;
	formatted_ratio?: string;
}

export interface CountryGrid {
	country_custom_id: string;
	name: string;
	total_actions: number;
	ratio: number;
	formatted_ratio?: string;
}

export interface MarketSegments {
	name: string;
	ratio: number;
}

