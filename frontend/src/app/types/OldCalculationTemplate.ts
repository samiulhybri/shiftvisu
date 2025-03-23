export type OldCalculationTemplate = {
	documentaion_id?: number,
	documentaion_certificates?: number[],
	residual_material_id?: number,
	metallography_id?: number,
	hardenability_range_id?: number,
	non_destructive_testing_id?: number,
	non_destructive_testing_attestation?: number[],
	testing_scope_id?: number,
	calculation_material_analysis_id?: number,
	calculation_deformation_id?: number,
	attestation_entities?: number[],
	according_to_tensile_tests?: number[],
	according_to_impact_tests?: number[],
	classified_bies?: number[],
	melting_types?: number[]
	sample_depths?: number[];
	cleanliness_determination?: number[];
}