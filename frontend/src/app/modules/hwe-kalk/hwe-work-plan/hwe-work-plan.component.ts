import { Component } from '@angular/core';
import {GridProperty} from "@shared/classes/grid-property";
import {CommonService} from "@shared/services/common.service";

import {
  HweWorkPlanDetailsComponent
} from "@app/modules/hwe-kalk/hwe-work-plan/hwe-work-plan-details/hwe-work-plan-details.component";

@Component({
  selector: 'app-hwe-work-plan',
  templateUrl: './hwe-work-plan.component.html',
  styleUrls: ['./hwe-work-plan.component.scss']
})
export class HweWorkPlanComponent extends GridProperty {
  public columns = this.getColumns();
  public editView = {
    actionButton: "edit",
    modalTemplate: HweWorkPlanDetailsComponent,
    modalWidth: "85vw",
    showCloseButton: false
  };
  public toolbarConfig = {
    title: $localize`Hwe Work Plan`,
    hasAddCommand: true,
    hasSearch: true
  }

  public addWindowEvent!: Event;

  constructor(_commonService: CommonService) {
    super(_commonService)
    this.state.take = 50;
    this.url = `HweWorkPlans?$expand=heatTreatments,additionalHeatTreatments&$orderby=id desc`;
    this.sendRequest();
  }

  deleteDataItem(dataItem: any) {
    this.onRemoveItem(`HweWorkPlans(${dataItem.id})`)
  }

  getColumns() {
    return [
      {
        name: "custom_id",
        title: $localize`Work Plan`,
        filterable: true,
      },
      {
        name: "name",
        title: $localize`Name`,
        filterable: true,
      },
    ]
  }
}
