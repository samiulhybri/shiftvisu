import { NonDestructiveTestingClass } from '@app/modules/hwe-kalk/enums/NonDestructiveTesting';
import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { NonDestructiveTestingDetailsComponent } from './non-destructive-testing-details/non-destructive-testing-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-non-destructive-testings',
	templateUrl: './non-destructive-testings.component.html',
	styleUrls: ['./non-destructive-testings.component.scss']
})
export class NonDestructiveTestingsComponent extends GridProperty {
	public nonDestructiveTesting = new NonDestructiveTestingClass();
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: NonDestructiveTestingDetailsComponent,
		modalWidth: "70vw",
		isCustomizedHandler: true,
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Non Destructive Testings`,
		hasAddCommand: true,
		hasSearch: true
	}
	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `NonDestructiveTestings?$expand=usNorm,attestationEntities,nonDestructiveNorm&orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`NonDestructiveTestings(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		 let columns = [
			{
				name: "custom_id",
				title: $localize`Custom ID`,
				filterable: true,
				isCustomCell: false
			},
			{
				name: "name",
				title: $localize`Name`,
				filterable: true,
				isCustomCell: false
			},
			{
				name: "non_destructive_testing",
				title: $localize`Non Destructive Testing`,
				filterable: true,
				filterType: 'enum',
				dropdownList: NonDestructiveTestingClass.getEnumArray(),
				dropdownFilterableList: NonDestructiveTestingClass.getEnumArray(),
				isCustomCell: true

			},
			{
				name: "surface_crack_test_method",
				title: $localize`Surface Crack Test Method`,
				filterable: true,
				isCustomCell: false
			}
		]
		return columns
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum;
		if (column == 'non_destructive_testing') {
			transEnum = NonDestructiveTestingClass.getStateTranslate(data);
		}
		return transEnum;
	}
}
