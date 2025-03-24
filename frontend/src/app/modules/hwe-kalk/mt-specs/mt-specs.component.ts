import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { MtSpecDetailsComponent } from './mt-spec-details/mt-spec-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-mt-specs',
	templateUrl: './mt-specs.component.html',
	styleUrls: ['./mt-specs.component.scss']
})
export class MtSpecsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: MtSpecDetailsComponent,
		modalWidth: "80vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`MT Specifications`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)

		this.url = `MtSpecs?orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MtSpecs(${dataItem.id})`)
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
			},
			{
				name: "impact_test_type",
				title: $localize`Impact Test Type`,
				filterable: true
			}
		]
	}
}
