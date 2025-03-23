import { Component, Renderer2 } from "@angular/core";

@Component({
	selector: "app-logistics",
	templateUrl: "./logistics.component.html",
	styleUrl: "./logistics.component.css",
})
export class LogisticsComponent {
	constructor(private renderer: Renderer2) {}
	ngOnInit(): void {
		this.renderer.addClass(document.body, "sapUiSizeCozy");
		this.renderer.removeClass(document.body, "sapUiSizeCompact");
	}

	ngOnDestroy(): void {
		this.renderer.removeClass(document.body, "sapUiSizeCozy");
		this.renderer.addClass(document.body, "sapUiSizeCompact");
	}
}
