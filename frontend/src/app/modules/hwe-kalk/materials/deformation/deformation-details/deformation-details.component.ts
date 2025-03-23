import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from 'src/app/shared/components/kendo/grid/grid.component';
import { Notification } from 'src/app/shared/services/notification.service';
import { Material } from 'src/app/models/material';
import { ODataBatchCall } from '@app/models/odata-batch-call';


import { MaterialClassifiedBy } from '@app/models/material-classified_by';
import { ContinuousCastingClass } from '@app/modules/hwe-kalk/enums/ContinuousCasting';
import { IngotCastClass } from '@app/modules/hwe-kalk/enums/IngotCast';
import { DeformationClass } from '@app/modules/hwe-kalk/enums/Deformation';
import { StretchForgingDegreeClass } from '@app/modules/hwe-kalk/enums/StretchForgingDegree';
import { Deformation } from '@app/models/deformation';
import {CalculationDeformation} from "@app/models/calculation-deformation";
import {MaterialAnalysis} from "@app/models/material-analysis";
import {CalculationMaterialAnalysis} from "@app/models/calculation-material-analysis";
import {ChemAnalysis} from "@app/models/chem-analysis";




@Component({
  selector: 'app-deformation-details',
  templateUrl: './deformation-details.component.html',
  styleUrls: ['./deformation-details.component.scss']
})

export class DeformationDetailsComponent implements OnDestroy, OnInit {
	public deletableId: number[] = [];
	public submitted: boolean = false;
	public gridInstance!: GridComponent;

	public isLoaderEnabled: boolean = false;
	public customIdSubscription!: Subscription;
	public updateSubscription!: Subscription;
	public addSubscription!: Subscription;
	public previousFormData!: FormGroup;
	public cmbMeltingTypeData!: any;
	public classifiedByData!: MaterialClassifiedBy[];
	public cmbClassifiedByData!: any;

	public meQualityData!: Array<{ value: string, text: string }>;
	public jominyBatchData!: Array<{ value: string, text: string }>;
	public continuousCastingData!: Array<{ value: string, text: string }>;
	public ingotCastingData!: Array<{ value: string, text: string }>;
	public deformationData!: Array<{ value: string, text: string }>;
	public stretchForgingDegreeData!: Array<{ value: string, text: string }>;
	public warehouseMaterialData!: Array<{ value: string, text: string }>;
	public hweShrinkageData!: Array<{ value: string, text: string }>;
	public hweColorTypeData!: Array<{ value: string, text: string }>;
	@Input()fromCalculation = false

	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		protected _notification: Notification
	) {
		this.getEnums();
	}
	public calDeformation?: Deformation | CalculationDeformation
	disabledCustomId	 = false
    @Input() isAllDisabled:boolean = false;

	@Input() set data(dataItem:Deformation | CalculationDeformation ){
		this.calDeformation  = dataItem;
		if (dataItem instanceof CalculationDeformation) {
			 this.disabledCustomId = true;
		 }
		this.setResidualMaterial();
	};
	ngOnInit(): void {
		if(!this.calDeformation) this.setResidualMaterial();
	}
	setResidualMaterial(){
		if(!this.fromCalculation){
			if (this.calDeformation == undefined) {
				this.calDeformation = new Deformation();
				this.getCustomId();
			} else {
				this.calDeformation = new Deformation().deserialize(this.calDeformation);
			}
		}
	}

	getEnums() {
		this.continuousCastingData = ContinuousCastingClass.getEnumArray();
		this.ingotCastingData = IngotCastClass.getEnumArray();
		this.deformationData = DeformationClass.getEnumArray();
		this.stretchForgingDegreeData = StretchForgingDegreeClass.getEnumArray();

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
		
		let isValidate = true
		
        this.isLoaderEnabled = true;
	

		this.updateSubscription = this._commonService.put(`Deformations(${this.calDeformation?.id})`,this.calDeformation?.toOdata())
			.subscribe({
				next: (res: any) => {
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
		
		
		let requests: ODataBatchCall[] = [];
		let isValidate = true;
		
		
		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
		this.isLoaderEnabled = true;
	
		this.addSubscription = this._commonService.post(`Deformations`, this.calDeformation?.toOdata())
			.subscribe({
				next: (res: any) => {
					this.showSuccess(1)
				},
				error: (e) => this.showError()
			})
	}


	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('Deformation')
			.catch(() => false)
		if (value) {
			this.calDeformation!.custom_id = value;
		}
		this.previousFormData = JSON.parse(JSON.stringify(this.calDeformation));
		this.isLoaderEnabled = false;
	}

	ngOnDestroy() {
		if (this.customIdSubscription) this.customIdSubscription.unsubscribe();
		if (this.addSubscription) this.addSubscription.unsubscribe();
		if (this.updateSubscription) this.updateSubscription.unsubscribe();
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




	
	isEmpty(value: any) {
		return (value === undefined || value == null || value.toString().trim().length <= 0);
	}
	checkEmpty() {

		return this.isEmpty(this.calDeformation!.custom_id)
	}
}

