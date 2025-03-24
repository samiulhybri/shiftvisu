import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { CommonService } from '@app/shared/services/common.service';
import { HeatTreatmentFactorDetailComponent } from './heat-treatment-factor-detail/heat-treatment-factor-detail.component';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { MaterialGroupTypeClass } from '@app/enums/material-group-type';

@Component({
	selector: 'app-heat-treatment-factors',
	templateUrl: './heat-treatment-factors.component.html',
	styleUrls: ['./heat-treatment-factors.component.scss']
})
export class HeatTreatmentFactorsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: HeatTreatmentFactorDetailComponent,
		modalWidth: "30vw",
		showCloseButton: false
	};

	public toolbarConfig = {
		title: $localize`Heat Treatment Factors`,
		hasAddCommand: true,
		hasSearch: true
	}

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `HweHeatTreatmentFactors?$orderby=id`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HweHeatTreatmentFactors(${dataItem.id})`);
	}

	private getColumns(): GridColumn[] {
		return [
			{
				name: "weight_from",
				title: $localize`Weight From`,
				filterable: true
			},
			{
				name: "weight_to",
				title: $localize`Weight To`,
				filterable: true
			},
			{
				name: "factor",
				title: $localize`Factor`,
				filterable: true
			},
			{
				name: "material_group_type",
				title: $localize`Material Group Type`,
				filterable: true,
				filterType: 'enum',
				dropdownList: new MaterialGroupTypeClass().getEnumArray(),
				dropdownFilterableList: new MaterialGroupTypeClass().getEnumArray(),
				isCustomCell: true
			}
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum: String = '';
		if (column == 'material_group_type') transEnum = new MaterialGroupTypeClass().getStateTranslate(data);

		return transEnum;
	}
}
