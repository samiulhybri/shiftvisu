import { Component, Input } from "@angular/core";
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";

@Component({
  selector: 'app-melt-analysis-details-purity-determination',
  templateUrl: './melt-analysis-details-purity-determination.component.html',
  styleUrls: ['./melt-analysis-details-purity-determination.component.scss']
})
export class MeltAnalysisDetailsPurityDeterminationComponent {
  @Input() meltAnalysis?: HweMeltAnalysis
}
