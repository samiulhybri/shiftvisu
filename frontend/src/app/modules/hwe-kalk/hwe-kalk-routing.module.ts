import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HweKalkComponent } from './hwe-kalk.component';
import { MaterialNormsComponent } from './material-norms/material-norms.component';
import { MaterialsComponent } from './materials/materials.component';
import { OffersComponent } from './offers/offers.component';
import { SalesOpportunityComponent } from './sales-opportunity/sales-opportunity.component';
import { DocumentationsComponent } from './documentations/documentations.component';
import { MtSpecsComponent } from './mt-specs/mt-specs.component';
import { ResidualMaterialsComponent } from './residual-materials/residual-materials.component';
import { TestingScopesComponent } from './testing-scopes/testing-scopes.component';
import { NonDestructiveTestingsComponent } from './non-destructive-testings/non-destructive-testings.component';
import { MetallographiesComponent } from './metallographies/metallographies.component';
import { ClientOrdersComponent } from './client-orders/client-orders.component';
import { EvaluationsComponent } from './evaluations/evaluations.component';
import { MaterialDatabaseComponent } from './material-database/material-database.component';
import { SpecificationsComponent } from './specifications/specifications.component';
import { AdditionalCostsComponent } from './additional-costs/additional-costs.component';
import { HeatTreatmentFactorsComponent } from './heat-treatment-factors/heat-treatment-factors.component';
import { RingRollingFactorsComponent } from './ring-rolling-factors/ring-rolling-factors.component';
import { PackagingCostsComponent } from './packaging-costs/packaging-costs.component';
import { HardenabilityRangeComponent } from './materials/hardenability-range/hardenability-range.component';
import { ChemicalAnalysisComponent } from './materials/chemical-analysis/chemical-analysis.component';
import { DeformationComponent } from './materials/deformation/deformation.component';
import {canActivate} from "@app/auth.guard";
import {canActivateRoute} from "@app/auth.guard";
import { PermissionEnum } from '@app/enums/permissions-enum'
import { HweHeatTreatmentCostComponent } from './hwe-heat-treatment-cost/hwe-heat-treatment-cost.component';
import {HweWorkPlanComponent} from "@app/modules/hwe-kalk/hwe-work-plan/hwe-work-plan.component";
import {OfferDetailsComponent} from "@app/modules/hwe-kalk/offers/offer-details/offer-details.component";
import { OfferPosWorkplanLeadTimesComponent } from './offer-pos-workplan-lead-times/offer-pos-workplan-lead-times.component';
import { CalculationDetailsComponent } from './offers/calculation-details/calculation-details.component';


const routes: Routes = [
	{
		path: '',
		component: HweKalkComponent,
		canActivate: [canActivate],
		children: [
			{
				path: '',
				redirectTo: 'sales-opportunity',
				pathMatch: 'full'
			}, {
				path: 'sales-opportunity',
				component: SalesOpportunityComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SALES_OPPORTUNITIES_VIEW)]
			},
			{
				path: 'offers',
				component: OffersComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_OFFER_VIEW)]
			},
			{
				path: 'offers/:phase',
				component: OffersComponent,
				pathMatch: 'full',
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_OFFER_VIEW)]
			},
			{
				path: 'base/materials',
				component: MaterialsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIALS_EDIT)]
			},
			{
				path: 'material/hardenability-ranges',
				component: HardenabilityRangeComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIALS_EDIT)]
			},
			{
				path: 'material/chemical-analyses',
				component: ChemicalAnalysisComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIALS_EDIT)]
			},
			{
				path: 'material/deformations',
				component: DeformationComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIALS_EDIT)]
			},
			{
				path: 'material-norms',
				component: MaterialNormsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIALS_EDIT)]
			},
			{
				path: 'documentations',
				component: DocumentationsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'metallographies',
				component: MetallographiesComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'mt-specs',
				component: MtSpecsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'testing-scopes',
				component: TestingScopesComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'non-destructive-testings',
				component: NonDestructiveTestingsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'residual-materials',
				component: ResidualMaterialsComponent
			},
			{
				path: 'client-orders',
				component: ClientOrdersComponent
			},
			{
				path: 'evaluations',
				component: EvaluationsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_EVALUATION_VIEW)]
			},
			{
				path: 'material-database',
				component: MaterialDatabaseComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_MATERIAL_DATABASES_EDIT)]
			},
			{
				path: 'specifications',
				component: SpecificationsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'additional-costs',
				component: AdditionalCostsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'heat-treatment-factors',
				component: HeatTreatmentFactorsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'ring-rolling-factors',
				component: RingRollingFactorsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'packaging-costs',
				component: PackagingCostsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'client-orders/:status',
				component: ClientOrdersComponent,
				pathMatch: 'full',
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_CLIENT_ORDER_VIEW)]

			},
			{
				path: 'heat-treatment-costs',
				component: HweHeatTreatmentCostComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'work-plan',
				component: HweWorkPlanComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_SPECIFICATIONS_EDIT)]
			},
			{
				path: 'offer-details/:id',
				component: OfferDetailsComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_OFFER_VIEW)]
			},
			{
				path: 'lead-times',
				component: OfferPosWorkplanLeadTimesComponent,
				canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
			{
				path: 'calculation/details/:id',
				component: CalculationDetailsComponent,
				//canActivate : [canActivateRoute(PermissionEnum.HWEKALK_COSTS_EDIT)]
			},
		]
	},

];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class HweKalkRoutingModule { }
