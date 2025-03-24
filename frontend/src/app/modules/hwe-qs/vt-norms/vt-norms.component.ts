import { Component } from '@angular/core';
import { VtNormDetailsComponent } from './vt-norm-details/vt-norm-details.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { Notification } from 'src/app/shared/services/notification.service';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-vt-norms',
	templateUrl: './vt-norms.component.html',
	styleUrls: ['./vt-norms.component.scss']
})
export class VtNormsComponent extends GridProperty {
	public editView = {
		actionButton: "Offer",
		modalTemplate: VtNormDetailsComponent,
		modalWidth: "60vw"
	};
	public toolbarConfig = {
		title: $localize`VT Norms`,
		hasAddCommand: true,
		hasSearch: true
	}

	public columns = this.getColumns();
	constructor(_commonService: CommonService,
		public _notification: Notification
	) {
		super(_commonService)
	}

	ngOnInit(): void {
		this.state.take = 20;
		this.url = `VtNorms?$expand=auxiliaryMeans,testTechniques&$orderby=id desc`
		this.sendRequest()

	}
	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`VtNorms(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`VT Norm`,
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
