import { Offer } from '@app/shared/models/offer.model';
import { Deserializable } from "@app/shared/interfaces/deserializable";
import { ODatable } from "@app/shared/interfaces/odatable";
import OfferPosRawDimention from "@app/shared/models/offer-pos-raw-dimention.model";
import { Material } from "@app/shared/models/material.model";

export class OfferPos implements ODatable, Deserializable {
	id?: number;
	offer_id?: number;
	pos: string = "";
	material_id?: number;
	is_commission: boolean = false;
	item_name: string = "";
	quantity?: number;
	drawing_id: string = "";
	attachments: string = "";
	outer_diameter_final?: number;
	side_a_final?: number;
	to_be_defined?: number;
	side_b_final?: number;
	inner_diameter_final?: number;
	height_final?: number;
	length_final?: number;
	outer_diameter_surface_final: string = "";
	side_a_surface_final: string = "";
	side_b_surface_final: string = "";
	inner_diameter_surface_final: string = "";
	height_surface_final: string = "";
	length_surface_final: string = "";
	customer_material_number: string = "";
	min_allowance_outer_diameter_final?: number;
	max_allowance_outer_diameter_final?: number;
	min_allowance_side_a_final?: number;
	max_allowance_side_a_final?: number;
	min_allowance_side_b_final?: number;
	max_allowance_side_b_final?: number;
	min_allowance_inner_diameter_final?: number;
	max_allowance_inner_diameter_final?: number;
	min_allowance_height_final?: number;
	max_allowance_height_final?: number;
	min_allowance_length_final?: number;
	max_allowance_length_final?: number;
	product_type?: string;
	is_rejected: boolean = false;
	rejection_type?: string = "";
	calculation_heat_treatments_type?: string = "";
	crm_id?: string;
	total_length?: number;
	max_outer_diameter?: number;
	length_encore_info?: number;
	outer_diameter_encore_info?: number;
	outer_diameter_lower_tolerance?: number;
	outer_diameter_upper_tolerance?: number;
	length_lower_tolerance?: number;
	length_upper_tolerance?: number;
	drilling_diameter?: number;
	is_specification_needed: boolean = false;
	has_no_contour: boolean = false;
	has_mechanical_drilling: boolean = false;
	delivery_state?: string;
	outer_tolerance?: string;

	offerPosRawDimensions: OfferPosRawDimention[] = [];
	offer?: Offer;
	material?: Material;
	constructor() {}

	deserialize(input: any) {
		Object.assign(this, input);

		if (input.offerPosRawDimensions) {
			this.offerPosRawDimensions = input.offerPosRawDimensions.map(
				(offerPosRawDimension: any) =>
					new OfferPosRawDimention().deserialize(offerPosRawDimension)
			);
		}
		if (input.offer_pos_raw_dimensions) {
			this.offerPosRawDimensions = input.offer_pos_raw_dimensions.map(
				(offerPosRawDimension: any) =>
					new OfferPosRawDimention().deserialize(offerPosRawDimension)
			);
		}

		if (input.offer) {
			this.offer = new Offer().deserialize(input.offer);
		}

		if (input.material) {
			this.material = new Material().deserialize(input.material);
		}
		return this;
	}

	toOdata(): OfferPos {
		return {
			...this,
			calculation: undefined,
		};
	}
}
