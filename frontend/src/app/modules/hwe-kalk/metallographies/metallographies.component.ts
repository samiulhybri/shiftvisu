import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { MetallographyDetailsComponent } from './metallography-details/metallography-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-metallographies',
	templateUrl: './metallographies.component.html',
	styleUrls: ['./metallographies.component.scss']
})
export class MetallographiesComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: MetallographyDetailsComponent,
		modalWidth: "80vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Metallographies`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `Metallographies?$expand=cleanlinessDeterminationAccordingTo&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Metallographies(${dataItem.id})`)
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
				name: "regulation",
				title: $localize`Regulation`,
				filterable: true
			}
		]
	}
}
