import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { CommonService } from 'src/app/shared/services/common.service';

import { GridProperty } from '@app/shared/classes/grid-property';
import { HardenabilityRangeDetailsComponent } from './hardenability-range-details/hardenability-range-details.component';
import { JominyBatchClass } from '@app/modules/hwe-kalk/enums/JominyBatch';
import { Material } from '@app/models/material';
import {GridDataResult} from "@progress/kendo-angular-grid";

@Component({
	selector: 'app-hardenability-range',
	templateUrl: './hardenability-range.component.html',
	styleUrls: ['./hardenability-range.component.scss']
})
export class HardenabilityRangeComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: HardenabilityRangeDetailsComponent,
		modalWidth: "70vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Hardenability Ranges`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `HardenabilityRanges?$orderby=id desc&$expand=materials`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HardenabilityRanges(${dataItem.id})`)
	}

	getColumns() {
		return [
			{
				name: "custom_id",
				title: $localize`Custom id`,
				filterable: true,
			},
			{
				name: "materials_concated",
				title: $localize`Material`,
				filterable: true,
				filterType: 'multiLayer'

			},
			{
				name: "jominy_batch",
				title: $localize`Jominy Batch`,
				filterType: 'enum',
				dropdownList: JominyBatchClass.getEnumArray(),
				dropdownFilterableList: JominyBatchClass.getEnumArray(),
				isCustomCell: true,
				filterable: true
			},
			
			{
				name: "with_applicable_standard",
				title: $localize`With Applicable Standard`,
				filterable: true
			}
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum: String = '';
		if (column == 'jominy_batch') {
			transEnum = JominyBatchClass.getStateTranslate(data);
		}
		return transEnum;
	}

	public override sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
			next: (response: GridDataResult) => {
				response.data =  response.data.map((data:any)=>{
					return {
						...data,
						materials_concated: this.getMaterial(data?.materials)
					}
				})
				this.gridItems = response;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}
	
	getMaterial(materials:Material[]){
		return materials?.map((data: Material) => `${data.custom_id}`)?.join(', ')
	}
}
