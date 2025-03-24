import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from 'src/app/shared/components/kendo/grid/grid.component';
import { Notification } from 'src/app/shared/services/notification.service';

import { MaterialGroupTypeClass } from '@app/enums/material-group-type';
import { HardenabilityRange } from '@app/models/hardenability-range';
import { Material } from '@app/models/material';
import { JominyBatchClass } from '@app/modules/hwe-kalk/enums/JominyBatch';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import {ResidualMaterial} from "@app/models/residual-materials";
import {CalculationResidualMaterial} from "@app/models/calculation-rasidual-material";
import {CalculationHardenabilityRange} from "@app/models/calculation-hardenability-range";

@Component({
	selector: 'app-hardenability-range-details',
	templateUrl: './hardenability-range-details.component.html',
	styleUrls: ['./hardenability-range-details.component.scss']
})
export class HardenabilityRangeDetailsComponent implements OnDestroy, OnInit {
	public deletableId: number[] = [];
	public submitted: boolean = false;
	public gridInstance!: GridComponent;
	public cmbMaterials: any;
	public isLoaderEnabled: boolean = false;
	public customIdSubscription!: Subscription;
	public batchSubscription!: Subscription;
	public updateSubscription!: Subscription;
	public addSubscription!: Subscription;
	public cmbMeltingTypeData!: any;
	public materials?: Material[]
	public cmbClassifiedByData!: any;
	@Input() fromCalculationRange: boolean = false;
	public jominyBatchData!: Array<{ value: string, text: string }>;
	hardenabilityRange?:HardenabilityRange | CalculationHardenabilityRange;
	disabledCustomId	 = false
	@Input() set data(dataItem:HardenabilityRange | CalculationHardenabilityRange){
		this.hardenabilityRange  = dataItem;
		if (dataItem instanceof CalculationHardenabilityRange) {
			 this.disabledCustomId = true;
		 }
		this.setResidualMaterial();
	};
	@Input() isAllDisabled: boolean = false;
	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		protected _notification: Notification
	) {
		this.getEnums();
		this.getComboData();
	}

	ngOnInit() {
		if(!this.hardenabilityRange) this.setResidualMaterial();
	}
	setResidualMaterial(){
		if(!this.fromCalculationRange){
			if (this.hardenabilityRange == undefined) {
				this.hardenabilityRange = new HardenabilityRange();

				this.getCustomId();
			} else {
				this.hardenabilityRange = new HardenabilityRange().deserialize(this.hardenabilityRange);
			}
		}
	}

	getEnums() {

		this.jominyBatchData = JominyBatchClass.getEnumArray();

	}


	onUpdate(evt: PointerEvent, gridComponent: GridComponent) {
		if (this.isLoaderEnabled) return;
		this.submitted = true
		this.gridInstance = gridComponent
		let checkEmpty = this.checkEmpty();
		if (checkEmpty) {
			this._notification.showError($localize`Please select the required fields.`);
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
		this.updateSubscription = this._commonService.put(`HardenabilityRanges(${this.hardenabilityRange?.id})`, this.hardenabilityRange?.toOdata())
			.subscribe({
				next: (res: any) => {
					this.updateMaterials(this.hardenabilityRange?.id)
					this.showSuccess(0)
				},
				error: (e) => this.showError()
			})
	}

	onAdd(event: PointerEvent, gridComponent: GridComponent) {
		if (this.isLoaderEnabled) return;
		this.submitted = true
		this.gridInstance = gridComponent
		let checkEmpty = this.checkEmpty();
		if (checkEmpty) {
			this._notification.showError($localize`Please select the required fields.`);
			gridComponent.isWindowLoaderEnabled = false
			return;
		}

		this.addSubscription = this._commonService.post(`HardenabilityRanges`, this.hardenabilityRange?.toOdata())
			.subscribe({
				next: (res: any) => {
					this.updateMaterials(res.id)
					this.showSuccess(1)
				},
				error: (e) => this.showError()
			})
	}


	updateMaterials(hardenabilityRangeId: any) {
		
		let payload = {
			hardenability_range_id: hardenabilityRangeId,
			material_ids: this.hardenabilityRange?.materials?.map((m : any) => m.id) || []
		};

		this._commonService.post(`hwe-kalk/materials/update-harden-ability-range-material`,payload,false)
			.subscribe({
				next: (res: any) => {
					
				},
				error: (e) => this.showError()
			})
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('HardenabilityRange')
			.catch(() => false)
		if (value) {
			this.hardenabilityRange!.custom_id = value;
		}
		this.isLoaderEnabled = false;
	}
	getComboData() {
		this.isLoaderEnabled = true;
		let requests: ODataBatchCall[] = [];
	
		requests.push(new ODataBatchCall(
			0,
			"get",
			`\/odata\/Materials?select(id,custome_id,name)&$top=10000000`)
		)
	
	
		this.batchSubscription = this._commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.materials = response.responses[0].body.value;
				this.cmbMaterials = new ComboFilter(this.materials);
				this.isLoaderEnabled = false;
			},
			error: () => this.isLoaderEnabled = false
		})
	}
	ngOnDestroy() {
		if (this.customIdSubscription) this.customIdSubscription.unsubscribe();
		if (this.addSubscription) this.addSubscription.unsubscribe();
		if (this.updateSubscription) this.updateSubscription.unsubscribe();
		if (this.batchSubscription) this.batchSubscription.unsubscribe();
	}
	showError() {
		this.isLoaderEnabled = false;
		this.gridInstance.isWindowLoaderEnabled = false
		this._notification.showError($localize`Something went wrong`);
	}
	showSuccess(isNew: number) {
		this.isLoaderEnabled = false;
		this.gridInstance.isWindowLoaderEnabled = false;
		this.gridInstance.closeGridWindow = true;
		this.gridInstance.gridRefersh.emit();
		if (isNew) this._notification.showSuccess($localize`Data  created successfully`);
		else this._notification.showSuccess($localize`Data updated  successfully`);
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "materials":
				this.materials = this.cmbMaterials.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;

		}
	}

	isEmpty(value: any) {
		return (value === undefined || value == null || value.toString().trim().length <= 0);
	}

	
	
	checkEmpty() {

		return this.isEmpty(this.hardenabilityRange!.custom_id) ||
			this.isEmptyArray(this.hardenabilityRange?.materials);
	}

	isEmptyArray(value: any) {
		return !Array.isArray(value) || value.length == 0
	}

}