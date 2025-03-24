import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { CommonService } from '@app/shared/services/common.service';

import { AdditionalCostComponent } from './additional-cost/additional-cost.component';
import { HweCostTypeClass } from '../enums/hwe-cost-type';
import { HweCostCalcTypeClass } from '../enums/HweCostCalcType';
@Component({
	selector: 'app-additional-costs',
	templateUrl: './additional-costs.component.html',
	styleUrls: ['./additional-costs.component.scss']
})
export class AdditionalCostsComponent extends GridProperty {
	public columns = this.getColumns();
	public filterDate = new Date();
	public editView = {
		actionButton: "edit",
		modalTemplate: AdditionalCostComponent,
		modalWidth: "40vw",
		showCloseButton: false
	};

	public toolbarConfig = {
		title: $localize`Additional Costs`,
		hasAddCommand: true,
		hasSearch: true
	}

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.fetchData();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HweAdditionalCosts(${dataItem.id})`)
	}

	private getColumns(): GridColumn[] {
		return [
			{
				name: "hwe_cost_type",
				title: $localize`Cost Type`,
				filterable: true
			},
			{
				name: "cost_calc_type",
				title: $localize`Cost calc type`,
				filterable: true,
				filterType: 'enum',
				dropdownList: HweCostCalcTypeClass.getEnumArray(),
				dropdownFilterableList: HweCostCalcTypeClass.getEnumArray(),
				isCustomCell: true
			},
			{
				name: "price",
				title: $localize`Price`,
				filterable: true
			},
			{
				name: "valid_from",
				title: $localize`Valid From`,
				filterType: "date",
				filterable: true
			},
			{
				name: "valid_to",
				title: $localize`Valid To`,
				filterType: "date",
				filterable: true
			},
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum: string = '';
		if (column == 'hwe_cost_type') {
			transEnum = HweCostTypeClass.getStateTranslate(data);
		}
		if (column == 'cost_calc_type') {
			transEnum = HweCostCalcTypeClass.getStateTranslate(data);
		}
		return transEnum;
	}

	/**
	 * fetch grid data
	 */
	fetchData() {
		let date = this.getDate();
		this.state.take = 50;
		this.url = `HweAdditionalCosts?$expand=hweAdditionalCostTriggers,unitOfMeasure&orderby=id desc&$filter=valid_from le ${date.start} and valid_to ge ${date.end}`;
		this.sendRequest();
	}
	/**
	 *  format date for filter
	 * @returns 
	 */
	getDate() {
		let selectedDate = new Date(this.filterDate);
		let date = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
		return { 'start': `${date}T23:59:59Z`, 'end': `${date}T00:00:00Z` }
	}

	
}
