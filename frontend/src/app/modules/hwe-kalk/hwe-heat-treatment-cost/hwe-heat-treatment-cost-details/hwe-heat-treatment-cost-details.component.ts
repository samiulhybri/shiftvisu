import { Component, Input } from '@angular/core';
import { CommonService } from '@app/shared/services/common.service';
import { CalculationHeatTreatmentTypeClass } from '@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType';
import { HweHeatTreatmentCost } from '@app/models/hwe-heat-treatment-cost';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable } from 'rxjs';
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";

@Component({
	selector: 'app-hwe-heat-treatment-cost-details',
	templateUrl: './hwe-heat-treatment-cost-details.component.html',
	styleUrls: ['./hwe-heat-treatment-cost-details.component.scss']
})
export class HweHeatTreatmentCostDetailsComponent {
	public submitted: boolean = false;

	public typeData!: Array<{ value: string, text: string }>;

	@Input('data') hweHeatTreatmentCost?: HweHeatTreatmentCost;

	constructor(public _commonService: CommonService) {
		this.getEnums();
	}

	getEnums() {
		this.typeData = OfferPosWorkPlanNameClass.getEnumArray();

	}

	ngOnInit() {
		if (!this.hweHeatTreatmentCost) {
			this.hweHeatTreatmentCost = new HweHeatTreatmentCost();
		} else {
			this.hweHeatTreatmentCost = new HweHeatTreatmentCost().deserialize(this.hweHeatTreatmentCost);
		}
	}
	onAdd(e: any, grid: GridComponent) {
		if (this.checkValidate()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.post(`HweHeatTreatmentCosts`, this.hweHeatTreatmentCost?.toOdata())
	}

	onUpdate(e: any, grid: GridComponent) {
		if (this.checkValidate()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.put(`HweHeatTreatmentCosts(${this.hweHeatTreatmentCost?.id})`, this.hweHeatTreatmentCost?.toOdata())
	}

	checkValidate() {
		return !this.hweHeatTreatmentCost?.type ||
			!(this.hweHeatTreatmentCost?.cost === 0 ? true : this.hweHeatTreatmentCost?.cost) ||
			!(this.hweHeatTreatmentCost?.min_cost === 0 ? true : this.hweHeatTreatmentCost?.min_cost)
	}
}
