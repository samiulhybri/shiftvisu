import {Component, inject, Input} from '@angular/core';
import { CalculationAdditionalHeatTreatment } from '@app/models/calculation-additional-heat-treatment';
import { CalculationAdditionalHeatTreatmentTypeClass } from '@app/modules/hwe-kalk/enums/CalculationAdditionalHeatTreatmentType';
import { CommonService } from '@app/shared/services/common.service';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { Notification } from '@app/shared/services/notification.service';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import { HweKalkService } from '@app/modules/hwe-kalk/hwe-kalk.service';
@Component({
	selector: 'app-heat-additional-treatments',
	templateUrl: './heat-additional-treatments.component.html',
	styleUrls: ['./heat-additional-treatments.component.scss']
})
export class HeatAdditionalTreatmentsComponent {
	public isDeletedAll: boolean = false;
	public cmbAdditionalHeatTreatmentType: any;
	public additionalHeatTreatmentTypeDataSource!: Array<{ value: string, text: string }>;
    public authService  = inject(AuthService)
	@Input() heatAdditionalTreatments!: CalculationAdditionalHeatTreatment[];
	@Input() hasValidationErrorAdditionalHeatTreatment: boolean = false;

	constructor(public _commonService: CommonService,
		    protected _notification : Notification,
			public hweService : HweKalkService
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
		let heatAdditionalTreatmentInstance = new CalculationAdditionalHeatTreatment();
		heatAdditionalTreatmentInstance.pos = this.isDeletedAll ? 10 : (!this.heatAdditionalTreatments.length ? 10 : (this.heatAdditionalTreatments[this.heatAdditionalTreatments.length - 1].pos ?? 0) + 10)
		this.heatAdditionalTreatments.push(heatAdditionalTreatmentInstance);
		this.isDeletedAll = false;
	}

	deleteAll() {
		this._notification.deleteItem(true).subscribe((result: any) => {
			if(result.action == 'next'){
					this.isDeletedAll = true;
					this.heatAdditionalTreatments.map((item: CalculationAdditionalHeatTreatment) => {
					item.isDeleted = true;
	        	});
			}
		});
		
	}

	deleteOne(index: number) {
		this._notification.deleteItem().subscribe((result: any) => {
			if(result.action == 'next'){
				this.heatAdditionalTreatments[index].isDeleted = true;
				this.isDeletedAll = this.heatAdditionalTreatments.every(item => item.isDeleted);
			}
		});	
	}
	isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_HEAT_TREATMENT_EDIT)
	}
}
