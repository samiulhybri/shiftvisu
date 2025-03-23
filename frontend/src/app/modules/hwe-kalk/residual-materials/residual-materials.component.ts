import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { ResidualMaterialDetailsComponent } from './residual-material-details/residual-material-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-residual-materials',
	templateUrl: './residual-materials.component.html',
	styleUrls: ['./residual-materials.component.scss']
})
export class ResidualMaterialsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: ResidualMaterialDetailsComponent,
		modalWidth: "40vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Residual Materials`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `ResidualMaterials?orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`ResidualMaterials(${dataItem.id})`)
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
				name: "revision",
				title: $localize`Revision`,
				filterable: true
			}
		]
	}
}
