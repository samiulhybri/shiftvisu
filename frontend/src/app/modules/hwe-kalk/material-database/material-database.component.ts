import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { CommonService } from '@app/shared/services/common.service';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { MaterialDatabaseDetailsComponent } from './material-database-details/material-database-details.component';
import { CalculationHeatTreatmentTypeClass } from '../enums/CalculationHeatTreatmentType';

@Component({
	selector: 'app-material-database',
	templateUrl: './material-database.component.html',
	styleUrls: ['./material-database.component.scss']
})
export class MaterialDatabaseComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: MaterialDatabaseDetailsComponent,
		modalWidth: "50vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Material Databases`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50
		this.url = `MaterialDatabases?$expand=material&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MaterialDatabases(${dataItem.id})`)
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
				title: $localize`Database Name`,
				filterable: true
			},
			{
				name: "heat_treatment",
				title: $localize`Heat Treatment`,
				filterable: true,
				filterType: 'enum',
				dropdownList: CalculationHeatTreatmentTypeClass.getEnumArray(),
				dropdownFilterableList: CalculationHeatTreatmentTypeClass.getEnumArray(),
				isCustomCell: true,
			},
			{
				name: "hardness",
				title: $localize`Hardness`,
				filterable: true
			}
		]
	}
	getEnumTranslateGrid(column: string, data: String) {
		let transEnum: String = '';
		if (column == 'heat_treatment') {
			transEnum =  CalculationHeatTreatmentTypeClass.getStateTranslate(data);
		}
		return transEnum;
	}
}
