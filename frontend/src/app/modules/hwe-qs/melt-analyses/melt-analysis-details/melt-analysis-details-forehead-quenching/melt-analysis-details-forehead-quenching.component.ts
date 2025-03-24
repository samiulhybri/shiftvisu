import { Component, Input } from '@angular/core';
import { HweMeltAnalysis } from '@app/models/hwe-melt-analysis';
import { MeltAnalysisVariant, MeltAnalysisVariantClass } from '@app/modules/hwe-qs/enums/MeltAnalysisVariant';


@Component({
  selector: 'app-melt-analysis-details-forehead-quenching',
  templateUrl: './melt-analysis-details-forehead-quenching.component.html',
  styleUrls: ['./melt-analysis-details-forehead-quenching.component.scss']
})
export class MeltAnalysisDetailsForeheadQuenchingComponent {
  @Input() meltAnalysis?: HweMeltAnalysis;
  public variantData: Array<{ value: string, text: string }>=MeltAnalysisVariantClass.getEnumArray();
  public variant=MeltAnalysisVariant;
}
