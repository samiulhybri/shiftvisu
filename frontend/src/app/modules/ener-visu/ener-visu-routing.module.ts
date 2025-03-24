import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { KpiReportComponent } from './components/kpi-report/kpi-report.component';

import { EnerVisuComponent } from './ener-visu.component';
import { MaterialConsumptionComponent } from './components/material-consumption/material-consumption.component';
import { EnerygyConsumptionComponent } from './components/enerygy-consumption/enerygy-consumption.component';

const routes: Routes = [
	{
		path: '',
		component: EnerVisuComponent,
		children: [
			{
				path: '',
				redirectTo: 'enerygy-consumption',
				pathMatch: 'full',
			},
			{
				path: 'enerygy-consumption',
				component: EnerygyConsumptionComponent,
			},
			{
				path: 'kpi-report',
				component: KpiReportComponent,
			},
			{
				path: 'material-consumption',
				component: MaterialConsumptionComponent,
			},
		],
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnerVisuRoutingModule { }
