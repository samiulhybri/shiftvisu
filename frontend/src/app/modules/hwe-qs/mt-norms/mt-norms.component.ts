import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { MtNormsDetailsComponent } from './mt-norms-details/mt-norms-details.component';
import { CommonService } from '@app/shared/services/common.service';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-mt-norms',
	templateUrl: './mt-norms.component.html',
	styleUrls: ['./mt-norms.component.scss']
})
export class MtNormsComponent extends GridProperty {
	public editView = {
		actionButton: "Offer",
		modalTemplate: MtNormsDetailsComponent,
		modalWidth: "73vw"


	};
	public toolbarConfig = {
		title: $localize`Mt Norms`,
		hasAddCommand: true,
		hasSearch: true
	}

	public columns = this.getColumns();
	constructor(_commonService: CommonService
	) {
		super(_commonService)
	}

	ngOnInit(): void {
		this.state.take = 20;
		this.url = `MtNorms?$orderby=id desc`
		this.sendRequest()

	}
	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MtNorms(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Mt Norms`,
				filterable: true
			},
			{
				name: "specification",
				title: $localize`Specification`,
				filterable: true
			},
			{
				name: "revision",
				title: $localize`Revision`,
				filterable: true
			},
			{
				name: "test_class",
				title: $localize`Test Class`,
				filterable: true
			},
		]
	}
}
