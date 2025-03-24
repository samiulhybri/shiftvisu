import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
	selector: "app-module-card",
	templateUrl: "./module-card.component.html",
	styleUrl: "./module-card.component.css",
})
export class ModuleCardComponent {
	@Input() moduleData!: { module_name: string; icon: string; route: string };
}
