import { NgModule } from '@angular/core';

import { HweKalkRoutingModule } from './hwe-kalk-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { HweKalkComponent } from './hwe-kalk.component';

import { SalesOpportunityComponent } from './sales-opportunity/sales-opportunity.component';
import { OffersComponent } from './offers/offers.component';
import { OfferDetailsComponent } from './offers/offer-details/offer-details.component';
import { HweKalkService } from './hwe-kalk.service';
import { CalculationDetailsComponent } from './offers/calculation-details/calculation-details.component';
import { MaterialNormsComponent } from './material-norms/material-norms.component';
import { ChemAnalysisComponent } from './material-norms/chem-analysis/chem-analysis.component';
import { MaterialsComponent } from './materials/materials.component';
import { MaterialDetailsComponent } from './materials/material-details/material-details.component';
import { DocumentationsComponent } from './documentations/documentations.component';
import { MtSpecsComponent } from './mt-specs/mt-specs.component';
import { ResidualMaterialsComponent } from './residual-materials/residual-materials.component';
import { MtSpecDetailsComponent } from './mt-specs/mt-spec-details/mt-spec-details.component';
import { DocumentationDetailsComponent } from './documentations/documentation-details/documentation-details.component';
import { ResidualMaterialDetailsComponent } from './residual-materials/residual-material-details/residual-material-details.component';
import { TestingScopesComponent } from './testing-scopes/testing-scopes.component';
import { TestingScopeDetailsComponent } from './testing-scopes/testing-scope-details/testing-scope-details.component';
import { NonDestructiveTestingsComponent } from './non-destructive-testings/non-destructive-testings.component';
import { NonDestructiveTestingDetailsComponent } from './non-destructive-testings/non-destructive-testing-details/non-destructive-testing-details.component';
import { MetallographiesComponent } from './metallographies/metallographies.component';
import { MetallographyDetailsComponent } from './metallographies/metallography-details/metallography-details.component';
import { ClientOrdersComponent } from './client-orders/client-orders.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { MaterialDatabaseComponent } from './material-database/material-database.component';
import { MaterialDatabaseDetailsComponent } from './material-database/material-database-details/material-database-details.component';
import { MaterialDimensionComponent } from './offers/calculation-details/material-dimension/material-dimension.component';
import { SpecificationsComponent } from './specifications/specifications.component';
import { SpecificationDetailsComponent } from './specifications/specification-details/specification-details.component';
import { TabstripComponent } from './offers/calculation-details/tabstrip/tabstrip.component';
import { IndividualAssessmentComponent } from './offers/calculation-details/individual-assessment/individual-assessment.component';
import { HeatTreatmentsComponent } from './offers/calculation-details/heat-treatments/heat-treatments.component';
import { HeatAdditionalTreatmentsComponent } from './offers/calculation-details/heat-additional-treatments/heat-additional-treatments.component';
import { MechanicalProcessingComponent } from './offers/calculation-details/mechanical-processing/mechanical-processing.component';
import { AdditionalCostsComponent } from './additional-costs/additional-costs.component';
import { AdditionalCostComponent } from './additional-costs/additional-cost/additional-cost.component';
import { HeatTreatmentFactorsComponent } from './heat-treatment-factors/heat-treatment-factors.component';
import { HeatTreatmentFactorDetailComponent } from './heat-treatment-factors/heat-treatment-factor-detail/heat-treatment-factor-detail.component';
import { RingRollingFactorsComponent } from './ring-rolling-factors/ring-rolling-factors.component';
import { RingRollingFactorDetailComponent } from './ring-rolling-factors/ring-rolling-factor-detail/ring-rolling-factor-detail.component';
import { OfferPosCostsComponent } from './offers/offer-details/offer-pos-costs/offer-pos-costs.component';
import { PackagingCostsComponent } from './packaging-costs/packaging-costs.component';
import { PackagingCostDetailsComponent } from './packaging-costs/packaging-cost-details/packaging-cost-details.component';
import { HardenabilityRangeComponent } from './materials/hardenability-range/hardenability-range.component';
import { ChemicalAnalysisComponent } from './materials/chemical-analysis/chemical-analysis.component';
import { DeformationComponent } from './materials/deformation/deformation.component';
import { HardenabilityRangeDetailsComponent } from './materials/hardenability-range/hardenability-range-details/hardenability-range-details.component';
import { ChemicalAnalysisDetailsComponent } from './materials/chemical-analysis/chemical-analysis-details/chemical-analysis-details.component';
import { DeformationDetailsComponent } from './materials/deformation/deformation-details/deformation-details.component';
import { OpPlanPosHeatTreatmentComponent } from './offers/calculation-details/op-plan-pos-heat-treatment/op-plan-pos-heat-treatment.component';
import { SummaryComponent } from '@app/modules/hwe-kalk/offers/calculation-details/summary/summary.component';
import { HweHeatTreatmentCostComponent } from './hwe-heat-treatment-cost/hwe-heat-treatment-cost.component';
import { HweHeatTreatmentCostDetailsComponent } from './hwe-heat-treatment-cost/hwe-heat-treatment-cost-details/hwe-heat-treatment-cost-details.component';
import { HweWorkPlanComponent } from './hwe-work-plan/hwe-work-plan.component';
import { HweWorkPlanDetailsComponent } from './hwe-work-plan/hwe-work-plan-details/hwe-work-plan-details.component';
import { WorkPlanHeatTreatmentComponent } from './hwe-work-plan/hwe-work-plan-details/work-plan-heat-treatment/work-plan-heat-treatment.component';
import { WorkPlanAddHeatTreatmentComponent } from './hwe-work-plan/hwe-work-plan-details/work-plan-add-heat-treatment/work-plan-add-heat-treatment.component';
import { OfferPosWorkplanLeadTimesComponent } from './offer-pos-workplan-lead-times/offer-pos-workplan-lead-times.component';
import { LeadTimeDetailsComponent } from './offer-pos-workplan-lead-times/lead-time-details/lead-time-details.component';
import { RingCalculationComponent } from '@app/modules/hwe-kalk/offers/calculation-details/ring-calculation/ring-calculation.component'
import { OfferPosCopyPopupComponent } from './offers/offer-pos-copy-popup/offer-pos-copy-popup.component';

@NgModule({
	declarations: [
		HweKalkComponent,
		SalesOpportunityComponent,
		OffersComponent,
		OfferDetailsComponent,
		CalculationDetailsComponent,
		MaterialNormsComponent,
		ChemAnalysisComponent,
		MaterialsComponent,
		MaterialDetailsComponent,
		DocumentationsComponent,
		MtSpecsComponent,
		ResidualMaterialsComponent,
		MtSpecDetailsComponent,
		DocumentationDetailsComponent,
		ResidualMaterialDetailsComponent,
		TestingScopesComponent,
		TestingScopeDetailsComponent,
		NonDestructiveTestingsComponent,
		NonDestructiveTestingDetailsComponent,
		MetallographiesComponent,
		MetallographyDetailsComponent,
		ClientOrdersComponent,
		EvaluationsComponent,
		MaterialDatabaseComponent,
		MaterialDatabaseDetailsComponent,
		MaterialDimensionComponent,
		SpecificationsComponent,
		SpecificationDetailsComponent,
		TabstripComponent,
		IndividualAssessmentComponent,
		HeatTreatmentsComponent,
		HeatAdditionalTreatmentsComponent,
		MechanicalProcessingComponent,
		AdditionalCostsComponent,
		AdditionalCostComponent,
		HeatTreatmentFactorsComponent,
		RingRollingFactorsComponent,
		RingRollingFactorDetailComponent,
		HeatTreatmentFactorDetailComponent,
		OfferPosCostsComponent,
		PackagingCostsComponent,
		PackagingCostDetailsComponent,
		HardenabilityRangeComponent,
		ChemicalAnalysisComponent,
		DeformationComponent,
		HardenabilityRangeDetailsComponent,
		ChemicalAnalysisDetailsComponent,
		DeformationDetailsComponent,
		OpPlanPosHeatTreatmentComponent,
		SummaryComponent,
        HweHeatTreatmentCostComponent,
        HweHeatTreatmentCostDetailsComponent,
        HweWorkPlanComponent,
        HweWorkPlanDetailsComponent,
        WorkPlanHeatTreatmentComponent,
        WorkPlanAddHeatTreatmentComponent,
        LeadTimeDetailsComponent,
        OfferPosWorkplanLeadTimesComponent,
		RingCalculationComponent,
        OfferPosCopyPopupComponent
	],
	imports: [
		HweKalkRoutingModule,
		SharedModule,
	],
	providers: [
		HweKalkService
	]
})
export class HweKalkModule { }
