import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, lastValueFrom } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from 'src/app/shared/components/kendo/grid/grid.component';
import { Notification } from 'src/app/shared/services/notification.service';
import { Material } from 'src/app/models/material';
import { MaterialClassifiedBy } from '@app/models/material-classified_by';
import { AttestationEntityClass } from '../../enums/AttestationEntity';
import { JominyBatchClass } from '../../enums/JominyBatch';
import { ContinuousCastingClass } from '../../enums/ContinuousCasting';
import { IngotCastClass } from '../../enums/IngotCast';
import { DeformationClass } from '../../enums/Deformation';
import { StretchForgingDegreeClass } from '../../enums/StretchForgingDegree';
import { MaterialGroupTypeClass } from '@app/enums/material-group-type';
import { warehouseMaterialList } from '../../helper/warehouse-material-type';
import { HweShrinkage, HweShrinkageClass } from '@app/modules/hwe-kalk/enums/HweShrinkage';
import { HweColorTypeClass } from '@app/modules/hwe-kalk/enums/HweColorType';

@Component({
	selector: 'app-material-details',
	templateUrl: './material-details.component.html',
	styleUrls: ['./material-details.component.scss']
})
export class MaterialDetailsComponent implements OnDestroy, OnInit {
	public deletableId: number[] = [];
	public submitted: boolean = false;
	public gridInstance!: GridComponent;
	public materials: any;
	public cmbFltrMaterial: any;
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
	public mqQualityData!: Array<{ value: string, text: string }>;
	public stretchForgingDegreeData!: Array<{ value: string, text: string }>;
	public warehouseMaterialData!: Array<{ value: string, text: string }>;
	public hweShrinkageData!: Array<{ value: string, text: string }>;
	public hweColorTypeData!: Array<{ value: string, text: string }>;

	public materialGroupTypes: string[] = new MaterialGroupTypeClass().getEnumArray();

	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		protected _notification: Notification
	) {
		this.warehouseMaterialData = warehouseMaterialList;
		this.getEnums();
	}
	@Input() data?: Material;
	@Input() isAllDisabled: boolean = false;

	public form: FormGroup = this.formBuilder.group({
		id: null,
		custom_id: [null, Validators.required],
		name: [null, Validators.required],
		note: null,
		density: [null, Validators.required],
		is_eu_material: null,
		check_starting_material: null,
		material_group_type: [null, Validators.required],
		forging_temperature_min: null,
		forging_temperature_max: null,
		put_in_cold_oven: null,
		shrinkage: [HweShrinkage.ONE_AND_HALF_PERCENT, Validators.required],
		color_type: null,
		warehouse_material: [null, Validators.required],
		chem_text_field: null,
	})

	get chemAnalyses(): FormArray {
		return this.form.controls["chemAnalyses"] as FormArray
	}

	ngOnInit(): void {
		if (this.data == undefined) {
			this.data = new Material();
			this.getCustomId();
		} else {
			this.data = new Material().deserialize(this.data);
		}
	}

	getEnums() {
		this.jominyBatchData = JominyBatchClass.getEnumArray();
		this.continuousCastingData = ContinuousCastingClass.getEnumArray();
		this.ingotCastingData = IngotCastClass.getEnumArray();
		this.deformationData = DeformationClass.getEnumArray();
		this.stretchForgingDegreeData = StretchForgingDegreeClass.getEnumArray();
		this.hweShrinkageData = HweShrinkageClass.getEnumArray();
		this.hweColorTypeData = HweColorTypeClass.getEnumArray();

		;

		this.classifiedByData = AttestationEntityClass.getEnumArray().map((item: any) => {
			return {
				...item,
				classified_by: item.value,
			}
		})
		

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
		
		let isValidate = true;
		
		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
        this.isLoaderEnabled = true;
		
		this.updateSubscription = this._commonService.put(`Materials(${this.data?.id})`,this.data?.toOdata())
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
		let isValidate = true;
		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
		this.isLoaderEnabled = true;
		
		this.addSubscription = this._commonService.post(`/Materials`, this.data?.toOdata())
			.subscribe({
				next: (res: any) => {
					this.showSuccess(1)
				},
				error: (e) => this.showError()
			})
	}




	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('Material')
			.catch(() => false)
		if (value) {
			this.data!.custom_id = value;
		}
		this.previousFormData = JSON.parse(JSON.stringify(this.data));
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

		return this.isEmpty(this.data!.custom_id) ||
			this.isEmpty(this.data?.name) ||
			this.isEmpty(this.data?.material_group_type) ||
			this.isEmpty(this.data?.warehouse_material) ||
			this.isEmpty(this.data?.density);
	}
}
