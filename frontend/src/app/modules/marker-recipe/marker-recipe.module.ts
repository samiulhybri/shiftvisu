import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarkerRecipeRoutingModule } from './marker-recipe-routing.module';
import { MarkerRecipeComponent } from './marker-recipe.component';
import { SharedModule } from '@app/shared/shared.module';
import { MarkerPosComponent } from './marker-pos/marker-pos.component';
import { MarkerBlockComponent } from './marker-block/marker-block.component';


@NgModule({
	declarations: [
		MarkerRecipeComponent,
		MarkerPosComponent,
		MarkerBlockComponent
	],
	imports: [
		CommonModule,
		MarkerRecipeRoutingModule,
		SharedModule
	]
})
export class MarkerRecipeModule { }
