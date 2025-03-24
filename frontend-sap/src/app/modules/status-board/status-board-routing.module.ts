import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { StatusBoardComponent } from "./status-board.component";

const routes: Routes = [
	{
		path: "",
		component: StatusBoardComponent,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class StatusBoardRoutingModule {}
