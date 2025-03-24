import { Component, Renderer2 } from "@angular/core";

@Component({
	selector: "app-logi-visu",
	templateUrl: "./logi-visu.component.html",
	styleUrl: "./logi-visu.component.css",
})
export class LogiVisuComponent {
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
