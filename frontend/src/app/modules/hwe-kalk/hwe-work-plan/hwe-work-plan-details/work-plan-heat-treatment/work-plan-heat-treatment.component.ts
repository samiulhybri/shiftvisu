import {Component, inject, Input} from '@angular/core';
import {OfferPos} from "@app/models/offer-pos";
import {CommonService} from "@shared/services/common.service";
import {Notification} from "@shared/services/notification.service";
import {HweQuenchingMediumClass} from "@app/modules/hwe-kalk/enums/HweQuenchingMedium";
import {CalculationHeatTreatmentTypeClass} from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import {ComboFilter} from "@shared/classes/combo-filter";
import {HweWorkPlanHeatTreatment} from "@app/models/hwe-work-plan-heat-treatment";
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";

@Component({
  selector: 'app-work-plan-heat-treatment',
  templateUrl: './work-plan-heat-treatment.component.html',
  styleUrls: ['./work-plan-heat-treatment.component.scss']
})
export class WorkPlanHeatTreatmentComponent {
  public isDeletedAll: boolean = false;
  public cmbHeatTreatmentType: any;
  public heatTreatmentTypeDataSource!: Array<{ value: string, text: string }>;
  public hweQuenchingMediumDataSource!: Array<{ value: string, text: string }>;

  @Input() heatTreatments!: HweWorkPlanHeatTreatment[];
  @Input() hasValidationErrorHeatTreatment: boolean = false;

  constructor(public _commonService: CommonService,
              protected _notification : Notification
  ) {
    this.hweQuenchingMediumDataSource = HweQuenchingMediumClass.getEnumArray();
    this.heatTreatmentTypeDataSource = CalculationHeatTreatmentTypeClass.getEnumArray();
    this.cmbHeatTreatmentType = new ComboFilter(this.heatTreatmentTypeDataSource);
  }

  handleFilter(value: string, src: string) {
    switch (src) {
      case "type":
        this.heatTreatmentTypeDataSource =
            this.cmbHeatTreatmentType.handleLocalDataFilter(
                value,
                "text"
            );
        break;
    }
  }

  add() {
    let heatTreatmentInstance = new HweWorkPlanHeatTreatment();
    heatTreatmentInstance.pos = this.isDeletedAll ? 10 : (!this.heatTreatments.length ? 10 : (this.heatTreatments[this.heatTreatments.length - 1].pos ?? 0) + 10)
    this.heatTreatments.push(heatTreatmentInstance);
    this.isDeletedAll = false;
  }

  deleteAll() {
    this._notification.deleteItem(true).subscribe((result: any) => {
      if(result.action == 'next'){
        this.isDeletedAll = true;
        this.heatTreatments.map((item: HweWorkPlanHeatTreatment) => {
          item.isDeleted = true;
        });
      }
    });

  }

  deleteOne(index: number) {
    this._notification.deleteItem().subscribe((result: any) => {
      if(result.action == 'next'){
        this.heatTreatments[index].isDeleted = true;
        this.isDeletedAll = this.heatTreatments.every(item => item.isDeleted);
      }
    });
  }
}
