import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { CommonService } from '@app/shared/services/common.service';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { SpecificationDetailsComponent } from './specification-details/specification-details.component';

@Component({
	selector: 'app-specifications',
	templateUrl: './specifications.component.html',
	styleUrls: ['./specifications.component.scss']
})
export class SpecificationsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: SpecificationDetailsComponent,
		modalWidth: "50vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Specifications`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `Specifications?$expand=hweWorkPlan,metallography,documentation,testingScope,nonDestructiveTesting,material,hardenabilityRange($expand=materials),materialAnalysis($expand=materials),deformation,residualMaterial&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Specifications(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Custom ID`,
				filterable: true
			},
			{
				name: "name",
				title: $localize`Name`,
				filterable: true
			}
		]
	}
}
