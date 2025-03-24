import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { PtNormDetailsComponent } from './pt-norm-details/pt-norm-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-pt-norms',
	templateUrl: './pt-norms.component.html',
	styleUrls: ['./pt-norms.component.scss']
})
export class PtNormsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: PtNormDetailsComponent,
		modalWidth: "60vw"
	};
	public toolbarConfig = {
		title: $localize`PT Norms`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.url = `PtNorms?orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`PtNorms(${dataItem.id})`)
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
				name: "specification",
				title: $localize`Specification`,
				filterable: true
			},
			{
				name: "quality_class",
				title: $localize`Quality Class`,
				filterable: true
			}
		]
	}
}