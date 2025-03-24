import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeltVisuComponent } from "./melt-visu.component";
import { OverviewComponent, EntryComponent } from "./components";

import { EntryGuard } from './guards/entry.guard';

const routes: Routes = [{
	path: '',
	component: MeltVisuComponent,
	children: [
			{
				path: '',
				redirectTo: 'overview',
				pathMatch: 'full'
			},
			{
				path: 'overview',
				component: OverviewComponent
			},
			{
				path: 'entry',
				component: EntryComponent
			},
			{
				path: 'edit/:id',
				component: EntryComponent,
				canActivate: [EntryGuard]
			},
			{
				path: '**',
				redirectTo: 'overview',
				pathMatch: 'full'
			}
		]
	},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeltVisuRoutingModule { }
