import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MpOffersOverviewComponent } from './mp-offers-overview/mp-offers-overview.component';
import { MpOffersComponent } from './mp-offers.component';
import { DetailsComponent } from './mp-offer-details/mp-offer-details.component';
import { canActivate, canActivateChild } from "@app/auth.guard";

const routes: Routes = [
	{
		path: '', component: MpOffersComponent,
		canActivate: [canActivate],
		canActivateChild: [canActivateChild],
		children: [
			{
				path: '',
				redirectTo: 'overview',
				pathMatch: 'full'
			},
			{
				path: 'overview',
				component: MpOffersOverviewComponent
			},
			{
				path: 'detail/:id',
				component: DetailsComponent
				
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MpOffersRoutingModule { }
