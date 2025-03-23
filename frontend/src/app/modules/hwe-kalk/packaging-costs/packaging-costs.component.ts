import { Component } from '@angular/core';
import { GridDataResult } from "@progress/kendo-angular-grid";
import { CommonService } from '@app/shared/services/common.service';
import { GridProperty } from '@app/shared/classes/grid-property';
import { PackagingCostDetailsComponent } from './packaging-cost-details/packaging-cost-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { OfferPosProductTypeClass } from '../enums/OfferPosProductType';
import { HwePackagingCostUnitClass } from '../enums/HwePackagingCostUnit';

@Component({
	selector: 'app-packaging-costs',
	templateUrl: './packaging-costs.component.html',
	styleUrls: ['./packaging-costs.component.scss']
})
export class PackagingCostsComponent extends GridProperty {
	public editView = {
		actionButton: "Offer",
		modalTemplate: PackagingCostDetailsComponent,
		modalWidth: "60vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Packaging Costs`,
		hasAddCommand: true,
		hasSearch: true
	}
	public columns = this.getColumns();

	constructor(_commonService: CommonService) {
		super(_commonService)
	}

	ngOnInit(): void {
		this.state.take = 50;
		this.url = `HwePackagingCosts?$expand=hwePackagingCostProductTypes&$orderby=id desc`
		this.sendRequest()

	}
	
	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HwePackagingCosts(${dataItem.id})`)
	}

	/**
	 * Fetch data form server  
	 * overriding main sendRequest function for nested object
	**/
	public override sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
			next: (response: GridDataResult) => {
				response.data = response.data.flatMap((item: any) => {
					let product_types: any = [];
					item?.hwePackagingCostProductTypes?.map((prodType: any) => {
						product_types.push(OfferPosProductTypeClass.getStateTranslate(prodType.product_type));
					});
					return {
						...item,
						product_types: product_types.join("/")
					}
				});
				this.gridItems = response;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		});
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "product_types",
				title: $localize`Type`,
				filterable: true
			},
			{
				name: "outer_diameter_min",
				title: $localize`Outer Diameter (min)`,
				filterable: true
			},
			{
				name: "outer_diameter_max",
				title: $localize`Outer Diameter (max)`,
				filterable: true
			},
			{
				name: "height_min",
				title: $localize`Height (min)`,
				filterable: true
			},
			{
				name: "height_max",
				title: $localize`Height (max)`,
				filterable: true
			},
			{
				name: "weight_min",
				title: $localize`Weight (min)`,
				filterable: true
			},
			{
				name: "weight_max",
				title: $localize`Weight (max)`,
				filterable: true
			},
			{
				name: "quantity_min",
				title: $localize`Quantity (min)`,
				filterable: true
			},
			{
				name: "quantity_max",
				title: $localize`Quantity (max)`,
				filterable: true
			},
			{
				name: "cost",
				title: $localize`Cost`,
				filterable: true
			},
			{
				name: "packaging_cost_unit",
				title: $localize`Packaging Cost Unit`,
				filterable: true,
				filterType: 'enum',
				dropdownList: HwePackagingCostUnitClass.getEnumArray(),
				dropdownFilterableList: HwePackagingCostUnitClass.getEnumArray(),
				isCustomCell: true,
			}
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		let transEnum: String = '';
		if (column == 'packaging_cost_unit') {
			transEnum = HwePackagingCostUnitClass.getStateTranslate(data);
		}
		return transEnum;
	}
}
