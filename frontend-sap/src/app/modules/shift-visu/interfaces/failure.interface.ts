import { ShiftVisuComponentOptionModel } from "@app/shared/models/shift-visu-component-option.model";
export interface ShiftVisuComponent {
	name: string;
	is_required: number;
	model_type: string;
	id: number;
	component_type?: ShiftVisuComponentOptionModel[];
	view_in?: string;
	measure_options: any;
	options: { shift_visu_component_id: number; option: string; id: number }[];
}

export interface ShiftVisuComponentGroup {
	type: string;
	components: ShiftVisuComponent[];
}

export interface ShiftVisuSection {
	component_types: ShiftVisuComponentGroup[];
}

export interface ShiftVisuFailureComponentResponse {
	OVERVIEW?: ShiftVisuSection;
	DETAILS?: ShiftVisuSection;
	UNKNOWN?: ShiftVisuSection;
}

export interface FailureInfo {
	id?: number;
	hall_id: number;
	creator_id: number;
	error_id: number;
	error_type: string;
	description: string;
}

export interface ComponentPayload {
	component_type: string;
	component_model_type: string;
	component_id: number;
	value: any;
}
