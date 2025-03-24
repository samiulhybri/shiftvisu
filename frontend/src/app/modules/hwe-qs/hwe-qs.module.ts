import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HweQsRoutingModule } from './hwe-qs-routing.module';
import { HweQsComponent } from './hwe-qs.component';
import { SharedModule } from '@app/shared/shared.module';
import { SampleNumbersComponent } from './sample-numbers/sample-numbers.component';
import { SampleNumberDetailComponent } from './sample-numbers/sample-number-detail/sample-number-detail.component';
import { UsNormsComponent } from './us-norms/us-norms.component';
import { MtNormsComponent } from './mt-norms/mt-norms.component';
import { PtNormsComponent } from './pt-norms/pt-norms.component';
import { VtNormsComponent } from './vt-norms/vt-norms.component';
import { UsNormsDetailsComponent } from './us-norms/us-norms-details/us-norms-details.component';
import { MtNormsDetailsComponent } from './mt-norms/mt-norms-details/mt-norms-details.component';
import { VtNormDetailsComponent } from './vt-norms/vt-norm-details/vt-norm-details.component';
import { PtNormDetailsComponent } from './pt-norms/pt-norm-details/pt-norm-details.component';
import { MeltAnalysesComponent } from './melt-analyses/melt-analyses.component';
import { MeltAnalysisDetailsComponent } from './melt-analyses/melt-analysis-details/melt-analysis-details.component';
import { MeltAnalysisDetailsHeaderComponent } from './melt-analyses/melt-analysis-details/melt-analysis-details-header/melt-analysis-details-header.component';
import { MeltAnalysisDetailsGrainSizeComponent } from './melt-analyses/melt-analysis-details/melt-analysis-details-grain-size/melt-analysis-details-grain-size.component';
import { MeltAnalysisDetailsPurityDeterminationComponent } from './melt-analyses/melt-analysis-details/melt-analysis-details-purity-determination/melt-analysis-details-purity-determination.component';
import { MeltAnalysisDetailsForeheadQuenchingComponent } from './melt-analyses/melt-analysis-details/melt-analysis-details-forehead-quenching/melt-analysis-details-forehead-quenching.component';
import { MeltAnalysisNoteComponent } from './melt-analyses/melt-analysis-details/melt-analysis-note/melt-analysis-note.component';
import { MeltAnalysisChemicalAnalysisComponent } from './melt-analyses/melt-analysis-details/melt-analysis-chemical-analysis/melt-analysis-chemical-analysis.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { CertificatesDetailsComponent } from './certificates/certificates-details/certificates-details.component';


@NgModule({
  declarations: [
    HweQsComponent,
    SampleNumbersComponent,
    SampleNumberDetailComponent,
    UsNormsComponent,
		MtNormsComponent,
		PtNormsComponent,
		VtNormsComponent,
    UsNormsDetailsComponent,
    MtNormsDetailsComponent,
    VtNormDetailsComponent,
    PtNormDetailsComponent,
    MeltAnalysesComponent,
    MeltAnalysisDetailsComponent,
    MeltAnalysisDetailsHeaderComponent,
    MeltAnalysisDetailsGrainSizeComponent,
    MeltAnalysisDetailsPurityDeterminationComponent,
    MeltAnalysisDetailsForeheadQuenchingComponent,
    MeltAnalysisNoteComponent,
    MeltAnalysisChemicalAnalysisComponent,
    CertificatesComponent,
    CertificatesDetailsComponent
    
  ],
  imports: [
    CommonModule,
    HweQsRoutingModule,
    SharedModule
  ]
})
export class HweQsModule { }
