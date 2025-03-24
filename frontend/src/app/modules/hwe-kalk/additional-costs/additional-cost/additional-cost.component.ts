import { Component, Input, OnInit } from "@angular/core";
import { Observable, catchError, throwError } from "rxjs";

import { GridComponent } from "@app/shared/components/kendo/grid/grid.component";

// Models
import { UnitOfMeasure } from "@app/models/unite-of-measure";
import { HweAdditionalCost } from "@app/models/hwe-additional-cost";
import { HweCostTypeClass } from "@app/modules/hwe-kalk/enums/hwe-cost-type";

// Services
import { CommonService } from "@app/shared/services/common.service";
import { Notification } from "@app/shared/services/notification.service";
import { EnumStructure } from "@app/types/Enum";
import { ODataBatchCall } from "@app/models/odata-batch-call";
import { ComboFilter } from "@app/shared/classes/combo-filter";
import { HWEAdditionalCostTriggerClass } from "@app/modules/hwe-kalk/enums/HWEAdditionalCostTrigger";
import { HweCostCalcTypeClass } from "../../enums/HweCostCalcType";

@Component({
	selector: "app-additional-cost",
	templateUrl: "./additional-cost.component.html",
	styleUrls: ["./additional-cost.component.scss"],
})
export class AdditionalCostComponent implements OnInit {
	@Input("data") additionalCost?: HweAdditionalCost;
	public costTypesDataSource!: Array<EnumStructure>;
	public hweAdditionalCostTriggerData!: Array<EnumStructure>;
	public costCalcTypeData!: Array<EnumStructure>;
	public cmbHweAdditionalCostTriggerData!: any;
	public isLoaderEnabled: boolean = false;
	public oldData: any = {
		hweAdditionalCostTriggers: [],
	}
	constructor(
		public _commonService: CommonService,
		public notification: Notification
	) {

		this.getUnitOfMeasures();
		this.getEnums();
	}

	// Getting Initial Additional Cost from Grid
	private getAdditonalCost(): void {
		if (this.additionalCost === undefined) {
			this.additionalCost = new HweAdditionalCost();
		}else {
			this.additionalCost = new HweAdditionalCost().deserialize(this.additionalCost);
			this.oldData.hweAdditionalCostTriggers = this.additionalCost?.hweAdditionalCostTriggers?.map((value: any) => value.id) ?? []

		}
		this.prepareDate();
	}

	private prepareDate(): void {
		if (this.additionalCost) {
			this.additionalCost.valid_from = this.additionalCost.valid_from ? new Date(this.additionalCost?.valid_from) : new Date();
			this.additionalCost.valid_to = this.additionalCost.valid_to ? new Date(this.additionalCost?.valid_to) : new Date();
		}
	}

	// Get all unit of measure and prepare it for dropdown selection
	private getUnitOfMeasures(): void {
		this.isLoaderEnabled = false;
		this._commonService.get("UnitOfMeasures").subscribe({
			next: (res: any) => {
				this.isLoaderEnabled = false;
			},
			error: () => (this.isLoaderEnabled = false),
		});
	}

	ngOnInit(): void {
		this.getAdditonalCost();
	}

	private checkValidRange(): boolean {
		if (this.additionalCost?.valid_from && this.additionalCost.valid_to) {
			const validFrom = new Date(this.additionalCost?.valid_from);
			const validTo = new Date(this.additionalCost?.valid_to);

			return validFrom > validTo;
		} else
			return false;
	}

	onUpdate(e: any, grid: GridComponent) {
		if (this.checkValidRange()) {
			grid.isWindowLoaderEnabled = false;
			return new Observable(observer => {
				observer.error($localize`Valid From date cannot be greater than Valid To date`);
			});
		}

		if (!this.additionalCost?.price && this.additionalCost?.price !== 0) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Price is Required`);
			});
		}


		if (!this.additionalCost?.hwe_cost_type?.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Cost Type is Required`);
			});
		}

		const data = this.additionalCost.toOdata();
		// delete combobox data
		this.deleteRelationData();
		return this._commonService.put(`HweAdditionalCosts(${this.additionalCost?.id})`, data)
			.pipe(
				catchError(error => {
					// Handle HTTP request error
					// For example, log the error or show a user-friendly message
					console.error('Update error:', error);
					return throwError('Duplicate Entry!');
				})
			);
	}
	
	deleteRelationData() {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.hweAdditionalCostTriggers?.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/HweAdditionalCostTriggers(${id})`)
			);
			i++;
		});
		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {

			},
		})
	}
	onAdd(e: any, grid: GridComponent) {
		if (this.checkValidRange()) {
			grid.isWindowLoaderEnabled = false;
			return new Observable(observer => {
				observer.error($localize`Valid From date cannot be greater than Valid To date`);
			});
		}

		if (!this.additionalCost?.price && this.additionalCost?.price !== 0) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Price is Required`);
			});
		}

		

		if (!this.additionalCost?.hwe_cost_type?.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Cost Type is Required`);
			});
		}
		return this._commonService.post(`HweAdditionalCosts`, this.additionalCost.toOdata())
			.pipe(
				catchError(error => {
					// Handle HTTP request error
					// For example, log the error or show a user-friendly message
					console.error('Update error:', error);
					return throwError('Duplicate Entry!');
				})
			);
	}

	getEnums() {
		this.costTypesDataSource = HweCostTypeClass.getEnumArray();
		this.costCalcTypeData = HweCostCalcTypeClass.getEnumArray();
		this.hweAdditionalCostTriggerData = HWEAdditionalCostTriggerClass.getEnumArray().map((item: any) => {
			return {
				...item,
				trigger: item.value,
			}
		})
		console.log(this.hweAdditionalCostTriggerData)
		this.cmbHweAdditionalCostTriggerData = new ComboFilter(this.hweAdditionalCostTriggerData);
	}

	handleFilter(value: string, src: string) {
		switch (src) {
			case "trigger":
				this.hweAdditionalCostTriggerData = this.cmbHweAdditionalCostTriggerData.handleLocalDataFilter(
					value,
					"text"
				);
				break;

		}
	}
}
