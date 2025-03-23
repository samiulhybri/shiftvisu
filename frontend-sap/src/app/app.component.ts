import { AfterViewInit, Component, ViewChild } from "@angular/core";

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
})
export class AppComponent implements AfterViewInit {
	title = "shopfloor-v12";

	@ViewChild("dialog") dialog: any;
	isDialogOpen = false;
	constructor() {}
	ngAfterViewInit(): void {}
	open() {
		this.isDialogOpen = true;
	}
	close() {
		this.isDialogOpen = false;
	}
}
