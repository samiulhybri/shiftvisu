import { Component, Input } from "@angular/core";
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";

@Component({
  selector: 'app-melt-analysis-note',
  templateUrl: './melt-analysis-note.component.html',
  styleUrls: ['./melt-analysis-note.component.scss']
})
export class MeltAnalysisNoteComponent {
  @Input() meltAnalysis?: HweMeltAnalysis
}
