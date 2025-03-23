import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarkerRecipeComponent } from './marker-recipe.component';

const routes: Routes = [
	{
		path: '', component: MarkerRecipeComponent,
		children: []
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MarkerRecipeRoutingModule { }
