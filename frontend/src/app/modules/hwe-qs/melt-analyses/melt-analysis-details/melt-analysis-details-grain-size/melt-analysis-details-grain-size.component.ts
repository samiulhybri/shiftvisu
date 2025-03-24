import { Component, Input } from "@angular/core";
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";
import { UsNormSoundAttenuationOperatorClass } from "@app/modules/hwe-qs/enums/UsNormSoundAttenuationOperator";
import { GrainSizeSpecification, GrainSizeSpecificationClass } from "@app/modules/hwe-qs/enums/GrainSizeSpecification";
import { GrainSizeProcedureClass } from "@app/modules/hwe-qs/enums/GrainSizeProcedure";
import { GrainSizeTestingScope, GrainSizeTestingScopeClass } from "@app/modules/hwe-qs/enums/GrainSizeTestingScope";

@Component({
    selector: 'app-melt-analysis-details-grain-size',
    templateUrl: './melt-analysis-details-grain-size.component.html',
    styleUrls: ['./melt-analysis-details-grain-size.component.scss']
})
export class MeltAnalysisDetailsGrainSizeComponent {
    @Input() meltAnalysis?: HweMeltAnalysis
    public soundAttenuationOperatorData!: Array<{ value: string, text: string }>;
    public grainSizeSpecificationData!: Array<{ value: string, text: string }>;
    public grainSizeProcedureData!: Array<{ value: string, text: string }>;
    public grainSizeTestingScopeData!: Array<{ value: string, text: string }>;
    public grainSizeData: Array<{id:number, grain_size_value :number}> = [];

    ngOnInit() {
        this.soundAttenuationOperatorData = UsNormSoundAttenuationOperatorClass.getEnumArray();
        this.grainSizeSpecificationData = GrainSizeSpecificationClass.getEnumArray();
        this.grainSizeProcedureData = GrainSizeProcedureClass.getEnumArray();
        this.grainSizeTestingScopeData = GrainSizeTestingScopeClass.getEnumArray();
        this.initializeGrainSizeData ();
        console.log(this.grainSizeSpecificationData)
    }

    initializeGrainSizeData () : void {
        for(let i =18; i >= 1; i--) {
            const grainSizeValue = this.meltAnalysis ? (this.meltAnalysis as any)[`class_${i}`] || 0 : 0;
            this.grainSizeData.push({
                id : i,
                grain_size_value: grainSizeValue
            })
        }
        this.grainSizeData.sort((a, b) => a.id - b.id);
    }

    updateMeltAnalysisValues(row: { id: number; grain_size_value: number }): void {
        const value = Number(row.grain_size_value);
        
        this.meltAnalysis = this.meltAnalysis ?? new HweMeltAnalysis();
        
        switch (row.id) {
            case 1:
                this.meltAnalysis.class_1 = value;
                break;
            case 2:
                this.meltAnalysis.class_2 = value;
                break;
            case 3:
                this.meltAnalysis.class_3 = value;
                break;
            case 4:
                this.meltAnalysis.class_4 = value;
                break;
            case 5:
                this.meltAnalysis.class_5 = value;
                break;
            case 6:
                this.meltAnalysis.class_6 = value;
                break;
            case 7:
                this.meltAnalysis.class_7 = value;
                break;
            case 8:
                this.meltAnalysis.class_8 = value;
                break;
            case 9:
                this.meltAnalysis.class_9 = value;
                break;
            case 10:
                this.meltAnalysis.class_10 = value;
                break;
            case 11:
                this.meltAnalysis.class_11 = value;
                break;
            case 12:
                this.meltAnalysis.class_12 = value;
                break;
            case 13:
                this.meltAnalysis.class_13 = value;
                break;
            case 14:
                this.meltAnalysis.class_14 = value;
                break;
            case 15:
                this.meltAnalysis.class_15 = value;
                break;
            case 16:
                this.meltAnalysis.class_16 = value;
                break;
            case 17:
                this.meltAnalysis.class_17 = value;
                break;
            case 18:
                this.meltAnalysis.class_18 = value;
                break;
            default:
                console.error('Invalid class ID:', row.id);
        }
    }
    
    
}
