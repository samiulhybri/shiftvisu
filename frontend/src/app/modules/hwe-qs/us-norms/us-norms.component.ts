import { Component } from '@angular/core';
import { UsNormsDetailsComponent } from './us-norms-details/us-norms-details.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { Notification } from 'src/app/shared/services/notification.service';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-us-norms',
	templateUrl: './us-norms.component.html',
	styleUrls: ['./us-norms.component.scss']
})
export class UsNormsComponent extends GridProperty {
	isLoaderEnabled: boolean = false;
	public editView = {
		actionButton: "Offer",
		modalTemplate: UsNormsDetailsComponent,
		modalWidth: "90vw"
	};
	public toolbarConfig = {
		title: $localize`US Norms`,
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
		this.url = `UsNorms?$expand=adjustments,usNormTestScopes,usNormTestSections,usNormRatings,&$orderby=id desc`
		this.sendRequest()

	}
	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`UsNorms(${dataItem.id})`)
	}


	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Us Norms`,
				filterable: true
			},
			{
				name: "name",
				title: $localize`Name`,
				filterable: true
			},
			{
				name: "coupling",
				title: $localize`Coupling`,
				filterable: true
			},
			{
				name: "amplification",
				title: $localize`Amplification`,
				filterable: true
			},
			{
				name: "issue",
				title: $localize`Issue`,
				filterable: true
			},
			{
				name: "specification",
				title: $localize`Specification`,
				filterable: true
			},
			
		]
	}
}
