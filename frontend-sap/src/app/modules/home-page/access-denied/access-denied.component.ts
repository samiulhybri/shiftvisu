import { Component } from "@angular/core";
import { Router } from "@angular/router";

@Component({
	selector: "app-access-denied",
	templateUrl: "./access-denied.component.html",
	styleUrl: "./access-denied.component.css",
})
export class AccessDeniedComponent {
	public isLoading: boolean = false;
	constructor(private router: Router) {}

	navigateToHomePage() {
		this.isLoading = true;
		return this.router.navigate(["/"], { replaceUrl: true });
	}
}
