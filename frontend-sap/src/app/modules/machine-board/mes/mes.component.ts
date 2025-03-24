import { Component } from "@angular/core";

@Component({
	selector: "app-mes",
	templateUrl: "./mes.component.html",
})
export class MesComponent {
	mesPage: string = $localize`MES`;
	isDialogOpen = true;
}
