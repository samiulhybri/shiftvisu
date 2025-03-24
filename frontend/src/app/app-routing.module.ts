import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './modules/home-page/home-page.component';

const routes: Routes = [
    {
        path: '',
        component: HomePageComponent,
        pathMatch: 'full'
    },
    {
        path: 'home-page',
        loadChildren: () => import('./modules/home-page/home-page.module').then(m => m.HomePageModule)
    },
    {
        path: 'chat',
        loadChildren: () => import('./modules/chat/chat.module').then(m => m.ChatModule)
    },
    {
        path: 'hwe-kalk',
        loadChildren: () => import('./modules/hwe-kalk/hwe-kalk.module').then(m => m.HweKalkModule)
    },
    {
        path: 'hwe-qs',
        loadChildren: () => import('./modules/hwe-qs/hwe-qs.module').then(m => m.HweQsModule)
    },
    {
        path: 'plan-visu',
        loadChildren: () => import('./modules/plan-visu/plan-visu.module').then(m => m.PlanVisuModule)
    },
    {
        path: 'mp-offers',
        loadChildren: () => import('./modules/mp-offers/mp-offers.module').then(m => m.MpOffersModule)
    },
	{
		path: 'melt-visu',
		loadChildren: () => import('./modules/melt-visu/melt-visu.module').then(m => m.MeltVisuModule)
	},
	{
        path: 'ener-visu',
        loadChildren: () => import('./modules/ener-visu/ener-visu.module').then(m => m.EnerVisuModule)
    },
    {
        path: 'task-visu',
        loadChildren: () => import('./modules/task-visu/task-visu.module').then(m => m.TaskVisuModule)
    },
    {
        path: 'marker-recipe',
        loadChildren: () => import('./modules/marker-recipe/marker-recipe.module').then(m => m.MarkerRecipeModule)
    },
    {
        path: 'absence-manager',
        loadChildren: () => import('./modules/absence-manager/absence-manager.module').then(m => m.AbsenceManagerModule)
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
