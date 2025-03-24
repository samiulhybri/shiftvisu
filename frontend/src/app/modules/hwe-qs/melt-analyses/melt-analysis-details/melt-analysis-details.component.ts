import { Component } from "@angular/core";
import { HweMeltAnalysis } from "@app/models/hwe-melt-analysis";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "@shared/services/common.service";
import { Notification } from "@shared/services/notification.service";
import { ODataBatchCall } from "@app/models/odata-batch-call";

@Component({
    selector: 'app-melt-analysis-details',
    templateUrl: './melt-analysis-details.component.html',
    styleUrls: ['./melt-analysis-details.component.scss'],
})
export class MeltAnalysisDetailsComponent {
    public meltAnalysis?: HweMeltAnalysis;
    public isLoaderEnabled: boolean = false;
    public oldData: any = {
        hweMeltTypes: [],
    }
    public meltAnalysisId?: number

    constructor(protected route: ActivatedRoute,
        protected _commonService: CommonService,
        protected router: Router,
        protected _notification: Notification
    ) {
    }

    ngOnInit() {
        this.meltAnalysisId = this.route.snapshot.params["id"] as number;
        if (this.meltAnalysisId) {
            this.isLoaderEnabled = true;
            const url = `HweMeltAnalyses(${this.meltAnalysisId})?$expand=materialAnalysis,item($expand=hweClassificationBlockGeometrie(select=value_string),hweClassificationBlockTyp(select=value_string),hweClassificationGiesstyp(select=value_string),hweClassificationLieferant(select=value_string),hweClassificationLieferantnr(select=value_string))`
            this._commonService.get(url).subscribe({
                next: (response: any) => {
                    this.isLoaderEnabled = false
                    //   this.oldData.hweMeltTypes = response?.meltTypes.map((value: any) => value.id) ?? [];
                    this.meltAnalysis = new HweMeltAnalysis().deserialize(response);
                }
            })
        } else {
            this.meltAnalysis = new HweMeltAnalysis().deserialize({});
        }
    }

    saveOrUpdate() {
        this.isLoaderEnabled = true
        // if (this.meltAnalysisId && this.oldData.hweMeltTypes.length) this.deleteOldMetlTypes()
        // else {
            this.saveUpdateCall()
        // }
    }

    saveUpdateCall() {
        const url: string = this.meltAnalysisId ? `HweMeltAnalyses(${this.meltAnalysisId})` : 'HweMeltAnalyses'
        const method = this.meltAnalysisId ? `put` : 'post'
        const data = this.meltAnalysis?.toOdata();
        
        this._commonService[method](url, data).subscribe({
            next: (response) => {
                this.router.navigate(['hwe-qs/melt-analyses']);
                if (!this.meltAnalysisId) this._notification.showSuccess($localize`Data created successfully`);
                else this._notification.showSuccess($localize`Data updated successfully`);
            },
            error: (e: any) => {
                this.isLoaderEnabled = false
                this._notification.showError($localize`Something went wrong`);
            }
        })
    }

    deleteOldMetlTypes() {
        const requests: ODataBatchCall[] = [];
        this.oldData.hweMeltTypes.forEach((id: number, index: number) => {
            requests.push(new ODataBatchCall(index, 'delete', `/odata/HweMeltTypes(${id})`))
        });
        this._commonService.post('$batch', { requests }).subscribe({
            next: (response: any) => {
                this.saveUpdateCall()
            }, error: (e: any) => {
                this.isLoaderEnabled = false
                this._notification.showError($localize`Something went wrong`);
            }
        });
    }
}
