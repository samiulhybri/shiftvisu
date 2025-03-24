import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MpOffersRoutingModule } from './mp-offers-routing.module';
import { MpOffersComponent } from './mp-offers.component';
import { MpOffersOverviewComponent } from './mp-offers-overview/mp-offers-overview.component';

import { SharedModule } from 'src/app/shared/shared.module';
import { RootItemComponent } from './mp-offer-details/sub-details/root-item/root-item.component';
import { NotesComponent } from './mp-offer-details/notes/notes.component';
import { SummaryComponent } from './mp-offer-details/summary/summary.component';
import { DetailsComponent } from './mp-offer-details/mp-offer-details.component';
import { TypeFixedComponent } from './mp-offer-details/sub-details/type-components/type-fixed/type-fixed.component';
import { TypeWeightComponent } from './mp-offer-details/sub-details/type-components/type-weight/type-weight.component';
import { TypeOfferComponent } from './mp-offer-details/sub-details/type-components/type-offer/type-offer.component';
import { TypeDimensionComponent } from './mp-offer-details/sub-details/type-components/type-dimension/type-dimension.component';
import { TypeHoursComponent } from './mp-offer-details/sub-details/type-components/type-hours/type-hours.component';
import { TypePieceComponent } from './mp-offer-details/sub-details/type-components/type-piece/type-piece.component';
import { SubDetailsComponent } from './mp-offer-details/sub-details/sub-details.component';
import { SubDetailsHeaderComponent } from './mp-offer-details/sub-details/sub-details-header/sub-details-header.component';
import { TypeFixedNameComponent } from './mp-offer-details/sub-details/type-components/type-fixed-name/type-fixed-name.component';
import { TypeHoursFixedComponent } from './mp-offer-details/sub-details/type-components/type-hours-fixed/type-hours-fixed.component';
import { TypePfPmComponent } from './mp-offer-details/sub-details/type-components/type-pf-pm/type-pf-pm.component';
import { TypeMouldflowComponent } from './mp-offer-details/sub-details/type-components/type-mouldflow/type-mouldflow.component';
import { AttachmentsComponent } from './mp-offer-details/attachments/attachments.component';
import { TypeFixedWeightComponent } from './mp-offer-details/sub-details/type-components/type-fixed-weight/type-fixed-weight.component';
import { ProjectWindowComponent } from './mp-offers-overview/project-window/project-window.component';

@NgModule({
	declarations: [
		MpOffersComponent,
		DetailsComponent,
		MpOffersOverviewComponent,
		RootItemComponent,
		NotesComponent,
		SummaryComponent,
		TypeFixedComponent,
		TypeWeightComponent,
		TypeOfferComponent,
		TypeDimensionComponent,
		TypeHoursComponent,
		TypePieceComponent,
		SubDetailsComponent,
		SubDetailsHeaderComponent,
		TypeFixedNameComponent,
		TypeHoursFixedComponent,
		TypePfPmComponent,
		TypeMouldflowComponent,
		TypeFixedWeightComponent,
		AttachmentsComponent,
		ProjectWindowComponent
	],
	imports: [
		CommonModule,
		MpOffersRoutingModule,
		SharedModule
	]
})
export class MpOffersModule { }
