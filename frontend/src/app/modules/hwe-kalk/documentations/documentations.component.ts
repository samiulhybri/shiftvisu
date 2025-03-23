import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { DocumentationDetailsComponent } from './documentation-details/documentation-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-documentations',
	templateUrl: './documentations.component.html',
	styleUrls: ['./documentations.component.scss']
})
export class DocumentationsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: DocumentationDetailsComponent,
		modalWidth: "75vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Documentations`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `Documentations?$expand=certificates&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Documentations(${dataItem.id})`)
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
			},
			{
				name: "text",
				title: $localize`Text`,
				filterable: true
			}
		]
	}
}
