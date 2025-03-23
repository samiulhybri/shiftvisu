import { Component } from '@angular/core';
import { CommonService } from '@app/shared/services/common.service';
import { HweHeatTreatmentCostDetailsComponent } from './hwe-heat-treatment-cost-details/hwe-heat-treatment-cost-details.component';
import { GridProperty } from '@app/shared/classes/grid-property';
import { CalculationHeatTreatmentTypeClass } from '../enums/CalculationHeatTreatmentType';
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";

@Component({
    selector: 'app-hwe-heat-treatment-cost',
    templateUrl: './hwe-heat-treatment-cost.component.html',
    styleUrls: ['./hwe-heat-treatment-cost.component.scss']
})
export class HweHeatTreatmentCostComponent extends GridProperty {
    public columns = this.getColumns();
    public editView = {
        actionButton: "edit",
        modalTemplate: HweHeatTreatmentCostDetailsComponent,
        modalWidth: "50vw",
        showCloseButton: false
    };
    public toolbarConfig = {
        title: $localize`Hwe Heat Treatment Cost`,
        hasAddCommand: true,
        hasSearch: true
    }

    public addWindowEvent!: Event;

    constructor(_commonService: CommonService) {
        super(_commonService)
        this.state.take = 50
        this.url = `HweHeatTreatmentCosts?&$orderby=id desc`;
        this.sendRequest();
    }

    deleteDataItem(dataItem: any) {
        this.onRemoveItem(`HweHeatTreatmentCosts(${dataItem.id})`)
    }

    getColumns() {
        return [
            {
                name: "type",
                title: $localize`Treatment cost Type`,
                filterable: true,
                filterType: 'enum',
                dropdownList: OfferPosWorkPlanNameClass.getEnumArray(),
                dropdownFilterableList: OfferPosWorkPlanNameClass.getEnumArray(),
                isCustomCell: true
            },
            {
                name: "min_cost",
                title: $localize`Min Cost`,
                filterable: true,
            },
            {
                name: "cost",
                title: $localize`cost`,
                filterable: true,
            },
        ]
    } 
    getEnumTranslateGrid(column: string, data: string) {
        let transEnum: string = '';
        if (column == 'type') {
            transEnum = OfferPosWorkPlanNameClass.getStateTranslate(data);
        }
        return transEnum;
    }
}
