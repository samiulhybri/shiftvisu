import { Component } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { MaterialDetailsComponent } from './material-details/material-details.component';
import {OfferStatusClass} from "@app/modules/hwe-kalk/enums/offer-status";
import {OfferPhaseClass} from "@app/modules/hwe-kalk/enums/offer-phase";
import {materialData, warehouseMaterialList} from "@app/modules/hwe-kalk/helper/warehouse-material-type";
import {MaterialGroupTypeClass} from "@app/enums/material-group-type";

@Component({
	selector: 'app-materials',
	templateUrl: './materials.component.html',
	styleUrls: ['./materials.component.scss']
})
export class MaterialsComponent extends GridProperty {
	public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: MaterialDetailsComponent,
		modalWidth: "50vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Materials`,
		hasAddCommand: true,
		hasSearch: true
	}

	public addWindowEvent!: Event;

	constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
		this.url = `Materials?&$orderby=id desc`;
		this.sendRequest();
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Materials(${dataItem.id})`)
	}

	getColumns() {
		return [
			{
				name: "custom_id",
				title: $localize`Material Id`,
				filterable: true
			},
			{
				name: "name",
				title: $localize`Material`,
				filterable: true
			},
			{
				name: "density",
				title: $localize`Density`,
				filterable: true
			},{
				name: `warehouse_material`,
				title: $localize`Warehouse Material`,
				filterable: true,
				filterType: 'enum',
				dropdownList: warehouseMaterialList,
				dropdownFilterableList: warehouseMaterialList,
				isCustomCell: true
			},
			{
				name: "material_group_type",
				title: $localize`Material Group Type`,
				filterable: true,
				filterType: 'enum',
				dropdownList: new MaterialGroupTypeClass().getEnumArray(),
				dropdownFilterableList: new MaterialGroupTypeClass().getEnumArray(),
				isCustomCell: true
			},
		
		]
	}

	getEnumTranslateGrid(column: string, data: string) {
		let transEnum: String = '';
		if (column == 'warehouse_material') {
			transEnum = materialData(data);
		} else if (column == 'material_group_type') {
			transEnum = new MaterialGroupTypeClass().getStateTranslate(data);
		}
		return transEnum;
	}
}
