import { Component, Input } from '@angular/core';
import { HwePackagingCost } from '@app/models/hwe-packaging-cost';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { CommonService } from '@app/shared/services/common.service';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { HwePackagingCostUnitClass } from '../../enums/HwePackagingCostUnit';
import { HwePackagingCostProductType } from '@app/models/hwe-packaging-cost-product-type';
import { OfferPosProductTypeClass } from '../../enums/OfferPosProductType';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-packaging-cost-details',
	templateUrl: './packaging-cost-details.component.html',
	styleUrls: ['./packaging-cost-details.component.scss']
})
export class PackagingCostDetailsComponent {
	public packagingCost?: HwePackagingCost;
	public gridInstance!: GridComponent;
	public isLoaderEnabled: boolean = false;
	public packagingCostUnitData!: Array<{ value: string, text: string }>;
	public packagingCostProductTypeData!: HwePackagingCostProductType[];
	public cmbPackagingCostProductTypeData!: any;

	public oldData: any = {
		hwePackagingCostProductTypes: [],
	}

	@Input() set data(dataItem: HwePackagingCost) {
		this.packagingCost = new HwePackagingCost().deserialize(dataItem);
	}

	constructor(protected _commonService: CommonService) {
		this.getEnums()
	}

	ngOnInit(): void {
		if (this.packagingCost == undefined) {
			this.packagingCost = new HwePackagingCost();
		} else {
			this.packagingCost = new HwePackagingCost().deserialize(this.packagingCost);
			this.oldData.hwePackagingCostProductTypes = this.packagingCost?.hwePackagingCostProductTypes.map((value: any) => value.id) ?? [];
		}
	}

	getEnums() {
		this.packagingCostUnitData = HwePackagingCostUnitClass.getEnumArray();
		this.packagingCostProductTypeData = OfferPosProductTypeClass.getEnumArray().map((item: any) => {
			return {
				...item,
				product_type: item.value,
			}
		});
		this.cmbPackagingCostProductTypeData = new ComboFilter(this.packagingCostProductTypeData);
	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		if (!this.packagingCost?.hwePackagingCostProductTypes?.length) {
			grid.isWindowLoaderEnabled = false;
			return new Observable((observer) => {
				observer.error($localize`Product Type is required.`);
			});
		}

		return this._commonService.post(`HwePackagingCosts`, this.packagingCost?.toOdata())
	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (!this.packagingCost?.hwePackagingCostProductTypes?.length) {
			grid.isWindowLoaderEnabled = false;
			return new Observable((observer) => {
				observer.error($localize`Product Type is required.`);
			});
		}
		
		this.deleteRelationData();
		return this._commonService.put(`HwePackagingCosts(${this.packagingCost?.id})`, this.packagingCost?.toOdata())
	}

	deleteRelationData() {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.hwePackagingCostProductTypes.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/HwePackagingCostProductTypes(${id})`)
			);
			i++;
		});
		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {
			},
		})
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "product_type":
				this.packagingCostProductTypeData = this.cmbPackagingCostProductTypeData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
		}
	}
}
