import { Component, Input } from "@angular/core";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { Tools } from "@app/shared/models/tools.model";
import { CommonService } from "@app/shared/services/common.service";

@Component({
	selector: "app-tool-details",
	templateUrl: "./tool-details.component.html",
	styleUrl: "./tool-details.component.css",
})
export class ToolDetailsComponent {
	constructor(public commonService: CommonService) {}
	toolDetails: Tools = new Tools().deserialize({});
	public isLoading: boolean = false;

	@Input() public set toolbarId(dataItem: number | undefined) {
		if (dataItem) this.loadData(dataItem);
		else this.toolDetails = new Tools().deserialize({});
	}

	loadData(toolbarId: number) {
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(0, "get", `\/odata\/Tools(${toolbarId})`));

		this.isLoading = true;
		try {
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.toolDetails = new Tools().deserialize(response.responses[0]?.body || {});
					this.isLoading = false;
				},
				error: e => {
					this.isLoading = false;
				},
			});
		} catch (error) {
			this.isLoading = false;
			console.log(error);
		}
	}
}
