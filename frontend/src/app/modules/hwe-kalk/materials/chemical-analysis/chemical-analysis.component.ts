import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { ChemicalAnalysisDetailsComponent } from './chemical-analysis-details/chemical-analysis-details.component';
import {GridDataResult} from "@progress/kendo-angular-grid";
import { Material } from '@app/models/material';

@Component({
  selector: 'app-chemical-analysis',
  templateUrl: './chemical-analysis.component.html',
  styleUrls: ['./chemical-analysis.component.scss']
})
export class ChemicalAnalysisComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: ChemicalAnalysisDetailsComponent,
		modalWidth: "70vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Material Analyses`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `MaterialAnalyses?expand=chemAnalyses,materials&$orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MaterialAnalyses(${dataItem.id})`)
	}

	getColumns() {
		return [
			{
				name: "custom_id",
				title: $localize`DIN-Norm`,
				filterable: true
			},
			{
				name: "materials_concated",
				title: $localize`Material Id`,
				filterable: true,
				filterType: 'multiLayer'
			},
			{
				name: "regulation",
				title: $localize`Regulation`,
				filterable: true
			},
			{
				name: "issue_revision",
				title: $localize`Issue/revision`,
				filterable: true
			},
		]
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
