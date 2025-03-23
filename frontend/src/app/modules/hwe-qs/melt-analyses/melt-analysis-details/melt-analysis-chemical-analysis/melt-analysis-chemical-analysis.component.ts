import { Component, Input } from "@angular/core";
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";

@Component({
	selector: "app-melt-analysis-chemical-analysis",
	templateUrl: "./melt-analysis-chemical-analysis.component.html",
	styleUrls: ["./melt-analysis-chemical-analysis.component.scss"],
})
export class MeltAnalysisChemicalAnalysisComponent {
	@Input() meltAnalysis?: HweMeltAnalysis;

	getCeqSw() {
		return (this.meltAnalysis?.element_c || 0) +
			((this.meltAnalysis?.element_mn || 0) / 6) +
			((this.meltAnalysis?.element_cr || 0) + (this.meltAnalysis?.element_mo || 0) + (this.meltAnalysis?.element_v || 0)) / 5 +
			((this.meltAnalysis?.element_ni || 0) + (this.meltAnalysis?.element_cu || 0)) / 15
			;
	}

	getCeqHwe() {
		return ((this.meltAnalysis?.element_c_hwe) || 0) +
			(((this.meltAnalysis?.element_mn_hwe) || 0) / 6) +
			(((this.meltAnalysis?.element_cr_hwe) || 0) + ((this.meltAnalysis?.element_mo_hwe) || 0) + ((this.meltAnalysis?.element_v_hwe) || 0)) / 5 +
			(((this.meltAnalysis?.element_ni_hwe) || 0) + ((this.meltAnalysis?.element_cu_hwe) || 0)) / 15
			;
	}
}
