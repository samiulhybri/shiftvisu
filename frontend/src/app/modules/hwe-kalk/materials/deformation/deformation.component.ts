

import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { DeformationDetailsComponent } from './deformation-details/deformation-details.component';
import { Component } from '@angular/core';
import { ContinuousCastingClass } from '@app/modules/hwe-kalk/enums/ContinuousCasting';
import { IngotCastClass } from '@app/modules/hwe-kalk/enums/IngotCast';
import { DeformationClass } from '@app/modules/hwe-kalk/enums/Deformation';
import { StretchForgingDegreeClass } from '@app/modules/hwe-kalk/enums/StretchForgingDegree';

@Component({
	selector: 'app-deformation',
	templateUrl: './deformation.component.html',
	styleUrls: ['./deformation.component.scss']
})



export class DeformationComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: DeformationDetailsComponent,
		modalWidth: "50vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Deformations`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `Deformations?&$orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Deformations(${dataItem.id})`)
	}

	getColumns() {
		return [
			{
				name: "custom_id",
				title: $localize`Name`,
				filterable: true
			}, 
			{
				name: "ingot_casting",
				title: $localize`Ingot casting`,
				filterType: 'enum',
				dropdownList: IngotCastClass.getEnumArray(),
				dropdownFilterableList: IngotCastClass.getEnumArray(),
				isCustomCell: true,
				filterable: true,
				
			}, 
			{
				name: "deformation",
				title: $localize`Deformation`,
				filterable: true
				
			}, 
			{
				name: "stretch_forging_degree",
				title: $localize`Stretch forging degree`,
				filterType: 'enum',
				dropdownList: StretchForgingDegreeClass.getEnumArray(),
				dropdownFilterableList: StretchForgingDegreeClass.getEnumArray(),
				isCustomCell: true,
				filterable: true,
				
			}, 
			{
				name: "continuous_casting",
				title: $localize`Continues casting`,
				filterType: 'enum',
				dropdownList: ContinuousCastingClass.getEnumArray(),
				dropdownFilterableList: ContinuousCastingClass.getEnumArray(),
				isCustomCell: true,
				filterable: true
			}
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum: String = '';
		if (column == 'continuous_casting') {
			transEnum = ContinuousCastingClass.getStateTranslate(data);
		} else if (column == 'ingot_casting') {
			transEnum = IngotCastClass.getStateTranslate(data);
		} else if (column == 'stretch_forging_degree') {
			transEnum = StretchForgingDegreeClass.getStateTranslate(data);
		}
		return transEnum;
	}
}

