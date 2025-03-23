import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { TestingScopeDetailsComponent } from './testing-scope-details/testing-scope-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-testing-scopes',
	templateUrl: './testing-scopes.component.html',
	styleUrls: ['./testing-scopes.component.scss']
})
export class TestingScopesComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: TestingScopeDetailsComponent,
		modalWidth: "80vw",
		showCloseButton: false,
		isCustomizedHandler: true,
	};
	public toolbarConfig = {
		title: $localize`Testing Scopes`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `TestingScopes?$expand=sampleDepths,attestationEntities,accordingToTensileTests,accordingToImpactTests,meltingTypes,classifiedBies&orderby=id desc`; 
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`TestingScopes(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Custom ID `,
				filterable: true
			},
			{
				name: "name",
				title: $localize`Spezifikation`,
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
