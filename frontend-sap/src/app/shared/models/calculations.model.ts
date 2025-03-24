import { Deserializable } from "@app/shared/interfaces/deserializable";
import { OfferPos } from "@app/shared/models/offer-pos.model";
import OperationPlan from "@app/shared/models/operation-plan.model";
import HeatTreatment from "@app/shared/models/heat-treatment.model";
import { TestingScope } from "@app/shared/models/testing-scope.model";

export class Calculations implements Deserializable {
	id?: number;
	specification_note: string = "";
	internal_note: string = "";
	sales_order: string = "";
	sales_order_pos: string = "";
	revision: string = "";
	strength_span_min?: number;
	strength_span_max?: number;
	min_hardness?: number;
	max_hardness?: number;
	charge: boolean = false;
	melting_process: boolean = false;
	cleanliness_of_the_charge: boolean = false;
	cleanliness_of_the_component: boolean = false;
	grainsize_of_the_charge: boolean = false;
	grainsize_of_the_component: boolean = false;
	piece_analysis: boolean = false;
	jominy: boolean = false;
	heattreamtment: boolean = false;
	heattreamtment_with_diagram: boolean = false;
	last_deformation: boolean = false;
	hardness_testing_hbw: boolean = false;
	hardness_testing_hbw_per_piece: boolean = false;
	conversion_acc_iso_18265_table_a_1: boolean = false;
	conversion_acc_iso_18265_table_b_2: boolean = false;
	pmi: boolean = false;
	visual_inspection: boolean = false;
	indication_of_the_surface_condition: boolean = false;
	dimension_control: boolean = false;
	dimension_protocol: boolean = false;
	residual_magnetic_field_strength: boolean = false;
	radioactivity_freedom_confirmation: boolean = false;
	confirmation_of_the_absence_of_flakes: boolean = false;
	create_forging_schedule: boolean = false;
	create_specimen_plan: boolean = false;
	create_us_test_instruction: boolean = false;
	create_mpe_test_instruction: boolean = false;
	create_fe_test_instruction: boolean = false;
	create_manufacturing_plan: boolean = false;
	create_heat_treatment_plan: boolean = false;
	test_sequence_plan: boolean = false;
	get_approval_from_the_client: boolean = false;
	initial_inspection: boolean = false;
	concentricity_check: boolean = false;
	create_furnace_position_plan: boolean = false;
	price?: number;
	lead_time_days?: number;
	text: string = "";
	text2: string = "";
	text3: string = "";
	text4: string = "";
	delivery_weight?: number;
	offerPos?: OfferPos;
	note_linked_operations?: string;
	operationPlan?: OperationPlan;
	heatTreatments?: HeatTreatment[];
	testingScope?: TestingScope;

	deserialize(input: any) {
		Object.assign(this, input);
		if (input.offerPos) {
			this.offerPos = new OfferPos().deserialize(input.offerPos);
		}

		if (input.offer_pos) {
			this.offerPos = new OfferPos().deserialize(input.offer_pos);
		}

		if (input.operationPlan) {
			this.operationPlan = new OperationPlan().deserialize(input.operationPlan);
		}

		if (input.operation_plan) {
			this.operationPlan = new OperationPlan().deserialize(input.operation_plan);
		}

		if (input.heatTreatments) {
			this.heatTreatments = input.heatTreatments.map((v: any) =>
				new HeatTreatment().deserialize(v)
			);
		}
    
		if (input.testingScope) {
      this.testingScope = new TestingScope().deserialize(input.testingScope);
    }

		return this;
	}

	toOdata(): Object {
		return {
			...this,
			id: this.id ?? undefined,
			operationPlan: undefined,
			metallography: undefined,
			documentation: undefined,
			testingScope: undefined,
			nonDestructiveTesting: undefined,
			usNorm: undefined,
			mtNorm: undefined,
			ptNorm: undefined,
			vtNorm: undefined,
			residualMaterial: undefined,
			specification: undefined,
			additionalHeatTreatments: undefined,
			calculationDocumentation: undefined,
			calculationResidualMaterial: undefined,
			calculationNonDestructiveTesting: undefined,
			calculationMetallography: undefined,
			calculationTestingScope: undefined,
			material: undefined,
			hardenabilityRange: undefined,
			materialAnalysis: undefined,
			deformation: undefined,
		};
	}
}
