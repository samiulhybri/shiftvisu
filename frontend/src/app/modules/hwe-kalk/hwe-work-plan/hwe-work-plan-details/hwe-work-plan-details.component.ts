import {Component, Input} from '@angular/core';
import {CommonService} from "@shared/services/common.service";
import {GridComponent} from "@shared/components/kendo/grid/grid.component";
import {Observable} from "rxjs";
import {HweWorkPlan} from "@app/models/hwe-work-plan";
import {ODataBatchCall} from "@app/models/odata-batch-call";
import {HweWorkPlanHeatTreatment} from "@app/models/hwe-work-plan-heat-treatment";
import {HweWorkPlanAdditionalHeatTreatment} from "@app/models/hwe-work-plan-additional-heat-treatment";

@Component({
    selector: 'app-hwe-work-plan-details',
    templateUrl: './hwe-work-plan-details.component.html',
    styleUrls: ['./hwe-work-plan-details.component.scss']
})
export class HweWorkPlanDetailsComponent {
    public isLoaderEnabled: boolean = false

    @Input('data') hweWorkPlan?: HweWorkPlan;
    @Input() isAllDisabled:boolean = false;
    public hasValidationErrorHeatTreatment: boolean = false;
    public hasValidationErrorAdditionalHeatTreatment: boolean = false;

    constructor(public _commonService: CommonService) {
    }

    ngOnInit() {
        if (!this.hweWorkPlan) {
            this.hweWorkPlan = new HweWorkPlan();
            this.getCustomId();
        } else {
            this.hweWorkPlan = new HweWorkPlan().deserialize(this.hweWorkPlan);
        }
    }

    onAdd(e: any, grid: GridComponent) {
        this.hasValidationErrorHeatTreatment = false;
        this.hasValidationErrorAdditionalHeatTreatment = false;
        this.hweWorkPlan?.heatTreatments?.map((data: HweWorkPlanHeatTreatment, index: number) => {
            if ((!data.pos || !data.type) && !data.isDeleted) this.hasValidationErrorHeatTreatment = true

        });
        this.hweWorkPlan?.additionalHeatTreatments?.map((data: HweWorkPlanAdditionalHeatTreatment, index: number) => {
            if ((!data.pos || !data.type) && !data.isDeleted) this.hasValidationErrorAdditionalHeatTreatment = true

        });

        if (this.checkValidate() || this.hasValidationErrorHeatTreatment || this.hasValidationErrorAdditionalHeatTreatment) {
            grid.isWindowLoaderEnabled = false
            return new Observable(observer => {
                observer.error($localize`Please select the required fields.`);
            });
        }
        return this._commonService.post(`HweWorkPlans`, this.hweWorkPlan?.toOdata())
    }

    onUpdate(e: any, grid: GridComponent) {
        this.hasValidationErrorHeatTreatment = false;
        this.hasValidationErrorAdditionalHeatTreatment = false;
        let idIncrement = 0;
        let requests: ODataBatchCall[] = [];
        let hweWorkPlan = new ODataBatchCall(
            idIncrement,
            "patch",
            `\/odata\/HweWorkPlans(${this.hweWorkPlan?.id})`,
        );
        hweWorkPlan.body = this.hweWorkPlan?.toOdata(false)

        requests.push(hweWorkPlan)
        idIncrement += 1
        this.hweWorkPlan?.heatTreatments?.map((data: HweWorkPlanHeatTreatment, index: number) => {
            if (!data.isDeleted) {
                let heatTreatmentData = new ODataBatchCall(
                    idIncrement,
                    data.hasOwnProperty('id') ? "patch" : "post",
                    data.hasOwnProperty('id') ? `\/odata\/HweWorkPlanHeatTreatments(${data.id})` : `\/odata\/HweWorkPlanHeatTreatments`,
                );
                heatTreatmentData.body = {
                    ...data.toOdata(),
                    hwe_work_plan_id: this.hweWorkPlan?.id
                };
                requests.push(heatTreatmentData)
                idIncrement += 1
            } else if (data.isDeleted && data.id) {
                let requestData = new ODataBatchCall(
                    idIncrement,
                    "delete",
                    `\/odata\/HweWorkPlanHeatTreatments(${data.id})`,
                )
                requests.push(requestData)
                idIncrement += 1
            }
            if ((!data.pos || !data.type) && !data.isDeleted) this.hasValidationErrorHeatTreatment = true

        });
        this.hweWorkPlan?.additionalHeatTreatments?.map((data: HweWorkPlanAdditionalHeatTreatment, index: number) => {
            if (!data.isDeleted) {
                let heatTreatmentData = new ODataBatchCall(
                    idIncrement,
                    data.hasOwnProperty('id') ? "patch" : "post",
                    data.hasOwnProperty('id') ? `\/odata\/HweWorkPlanAdditionalHeatTreatments(${data.id})` : `\/odata\/HweWorkPlanAdditionalHeatTreatments`,
                );
                heatTreatmentData.body = {
                    ...data.toOdata(),
                    hwe_work_plan_id: this.hweWorkPlan?.id
                };
                requests.push(heatTreatmentData)
                idIncrement += 1
            } else if (data.isDeleted && data.id) {
                let requestData = new ODataBatchCall(
                    idIncrement,
                    "delete",
                    `\/odata\/HweWorkPlanAdditionalHeatTreatments(${data.id})`,
                )
                requests.push(requestData)
                idIncrement += 1
            }
            if ((!data.pos || !data.type) && !data.isDeleted ) this.hasValidationErrorAdditionalHeatTreatment = true

        });

        if (this.checkValidate() || this.hasValidationErrorHeatTreatment || this.hasValidationErrorAdditionalHeatTreatment) {
            grid.isWindowLoaderEnabled = false
            return new Observable(observer => {
                observer.error($localize`Please select the required fields.`);
            });
        }


        return this._commonService.post(`$batch`, {requests} )
    }

    checkValidate() {
        return !this.hweWorkPlan?.custom_id
    }

    async getCustomId(): Promise<void> {
        this.isLoaderEnabled = true;
        let value = await this._commonService.getEntity('HweWorkPlan')
            .catch(() => false)

        if (value) {
            this.hweWorkPlan!.custom_id = value
        }
        this.isLoaderEnabled = false;
    }
}
