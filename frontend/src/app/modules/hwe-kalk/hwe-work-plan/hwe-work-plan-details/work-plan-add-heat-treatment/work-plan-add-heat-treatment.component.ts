import {Component, inject, Input} from '@angular/core';
import {CalculationAdditionalHeatTreatment} from "@app/models/calculation-additional-heat-treatment";
import {CommonService} from "@shared/services/common.service";
import {Notification} from "@shared/services/notification.service";
import {
  CalculationAdditionalHeatTreatmentTypeClass
} from "@app/modules/hwe-kalk/enums/CalculationAdditionalHeatTreatmentType";
import {ComboFilter} from "@shared/classes/combo-filter";
import {HweWorkPlanAdditionalHeatTreatment} from "@app/models/hwe-work-plan-additional-heat-treatment";

@Component({
  selector: 'app-work-plan-add-heat-treatment',
  templateUrl: './work-plan-add-heat-treatment.component.html',
  styleUrls: ['./work-plan-add-heat-treatment.component.scss']
})
export class WorkPlanAddHeatTreatmentComponent {
  public isDeletedAll: boolean = false;
  public cmbAdditionalHeatTreatmentType: any;
  public additionalHeatTreatmentTypeDataSource!: Array<{ value: string, text: string }>;
  @Input() additionalHeatTreatments!: HweWorkPlanAdditionalHeatTreatment[];
  @Input() hasValidationErrorAdditionalHeatTreatment: boolean = false;

  constructor(public _commonService: CommonService,
              protected _notification : Notification
  ) {
    this.additionalHeatTreatmentTypeDataSource = CalculationAdditionalHeatTreatmentTypeClass.getEnumArray();
    this.cmbAdditionalHeatTreatmentType = new ComboFilter(this.additionalHeatTreatmentTypeDataSource);
  }

  handleFilter(value: string, src: string) {
    switch (src) {
      case "type":
        this.additionalHeatTreatmentTypeDataSource =
            this.cmbAdditionalHeatTreatmentType.handleLocalDataFilter(
                value,
                "text"
            );
        break;
    }
  }

  add() {
    let heatAdditionalTreatmentInstance = new HweWorkPlanAdditionalHeatTreatment();
    heatAdditionalTreatmentInstance.pos = this.isDeletedAll ? 10 : (!this.additionalHeatTreatments.length ? 10 : (this.additionalHeatTreatments[this.additionalHeatTreatments.length - 1].pos ?? 0) + 10)
    this.additionalHeatTreatments.push(heatAdditionalTreatmentInstance);
    this.isDeletedAll = false;
  }

  deleteAll() {
    this._notification.deleteItem(true).subscribe((result: any) => {
      if(result.action == 'next'){
        this.isDeletedAll = true;
        this.additionalHeatTreatments.map((item: HweWorkPlanAdditionalHeatTreatment) => {
          item.isDeleted = true;
        });
      }
    });

  }

  deleteOne(index: number) {
    this._notification.deleteItem().subscribe((result: any) => {
      if(result.action == 'next'){
        this.additionalHeatTreatments[index].isDeleted = true;
        this.isDeletedAll = this.additionalHeatTreatments.every(item => item.isDeleted);
      }
    });
  }
}
