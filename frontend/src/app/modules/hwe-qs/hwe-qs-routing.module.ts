import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HweQsComponent } from '@app/modules/hwe-qs/hwe-qs.component';
import { SampleNumbersComponent } from '@app/modules/hwe-qs/sample-numbers/sample-numbers.component';
import { UsNormsComponent } from '@app/modules/hwe-qs/us-norms/us-norms.component';
import { MtNormsComponent } from '@app/modules/hwe-qs/mt-norms/mt-norms.component';
import { PtNormsComponent } from '@app/modules/hwe-qs/pt-norms/pt-norms.component';
import { VtNormsComponent } from '@app/modules/hwe-qs/vt-norms/vt-norms.component';
import {MeltAnalysesComponent} from "@app/modules/hwe-qs/melt-analyses/melt-analyses.component";
import {
	MeltAnalysisDetailsComponent
} from "@app/modules/hwe-qs/melt-analyses/melt-analysis-details/melt-analysis-details.component";
import { CertificatesComponent } from "@app/modules/hwe-qs/certificates/certificates.component";

const routes: Routes = [
	{
		path: '',
		component: HweQsComponent,
		children: [
			{
				path: '',
				redirectTo: 'sample-numbers',
				pathMatch: 'full'
			},
			{
				path: 'sample-numbers',
				component: SampleNumbersComponent
			},
			{
				path: 'us-norms',
				component: UsNormsComponent
			},
			{
				path: 'mt-norms',
				component: MtNormsComponent
			},
			{
				path: 'pt-norms',
				component: PtNormsComponent
			},
			{
				path: 'vt-norms',
				component: VtNormsComponent
			},
			{
				path: 'melt-analyses',
				component: MeltAnalysesComponent
			},
			{
				path: 'melt-analyses/:id/details',
				component: MeltAnalysisDetailsComponent
			},
			{
				path: 'melt-analyses/new',
				component: MeltAnalysisDetailsComponent
			},
			{
				path: 'hwe-certificates',
				component: CertificatesComponent
			},
		]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HweQsRoutingModule { }
