import {Component, inject, Input} from '@angular/core';
import { CalculationHeatTreatment } from '@app/models/calculation-heat-treatment';
import { CalculationHeatTreatmentTypeClass } from '@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType';
import { CommonService } from '@app/shared/services/common.service';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { OfferPos } from '@app/models/offer-pos';
import { Notification } from '@app/shared/services/notification.service';
import { HweQuenchingMediumClass } from '@app/modules/hwe-kalk/enums/HweQuenchingMedium';
import {AuthService} from "@app/services/auth.service";
import {PermissionEnum} from "@app/enums/permissions-enum";
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";
import { HweKalkService } from '@app/modules/hwe-kalk/hwe-kalk.service';

@Component({
	selector: 'app-heat-treatments',
	templateUrl: './heat-treatments.component.html',
	styleUrls: ['./heat-treatments.component.scss']
})
export class HeatTreatmentsComponent {
	public isDeletedAll: boolean = false;
	public cmbHeatTreatmentType: any;
	public heatTreatmentTypeDataSource!: Array<{ value: string, text: string }>;
	public hweQuenchingMediumDataSource!: Array<{ value: string, text: string }>;
   public authService  = inject(AuthService)
	@Input() heatTreatments!: CalculationHeatTreatment[];
	@Input() offerPos!: OfferPos;
	@Input() hasValidationErrorHeatTreatment: boolean = false;

	constructor(public _commonService: CommonService,
		        protected _notification : Notification,
				public hweService : HweKalkService
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
		let heatTreatmentInstance = new CalculationHeatTreatment();
		heatTreatmentInstance.pos = this.isDeletedAll ? 10 : (!this.heatTreatments.length ? 10 : (this.heatTreatments[this.heatTreatments.length - 1].pos ?? 0) + 10)
		this.heatTreatments.push(heatTreatmentInstance);
		this.isDeletedAll = false;
	}

	deleteAll() {
		this._notification.deleteItem(true).subscribe((result: any) => {
			if(result.action == 'next'){
				this.isDeletedAll = true;
				this.heatTreatments.map((item: CalculationHeatTreatment) => {
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
				if(this.heatTreatments[index].pos === 10) this.offerPos.calculation_heat_treatments_type = ''
			}
		});
		
	}

	heatTreatmentType(data: CalculationHeatTreatment) {
        if(data.pos === 10) this.offerPos.calculation_heat_treatments_type = data.type
	}

	isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_HEAT_TREATMENT_EDIT)
	}
}
