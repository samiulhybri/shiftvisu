import { Component } from "@angular/core";
import Dialog from "@ui5/webcomponents/dist/Dialog";

@Component({
	selector: "app-setup",
	templateUrl: "./setup.component.html",
})
export class SetupComponent {
	setupPage: string = $localize`Setup`;
	isDialogOpen = true;
}
