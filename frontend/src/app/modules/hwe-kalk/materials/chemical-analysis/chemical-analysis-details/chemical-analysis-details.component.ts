import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from 'src/app/shared/components/kendo/grid/grid.component';
import { Notification } from 'src/app/shared/services/notification.service';
import { Material } from 'src/app/models/material';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { ChemAnalysis } from '@app/models/chem-analysis';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { MaterialAnalysis } from '@app/models/material-analysis';
import { ChemicalAnalysisUnit, ChemicalAnalysisUnitClass } from '@app/modules/hwe-kalk/enums/ChemicalAnalysisUnit';
import {CalculationMaterialAnalysis} from "@app/models/calculation-material-analysis";

@Component({
	selector: 'app-chemical-analysis-details',
	templateUrl: './chemical-analysis-details.component.html',
	styleUrls: ['./chemical-analysis-details.component.scss']
})

export class ChemicalAnalysisDetailsComponent implements OnDestroy, OnInit {
	public deletableId: number[] = [];
	public submitted: boolean = false;
	public gridInstance!: GridComponent;
	public cmbMaterials: any;
	public batchSubscription!: Subscription;
	public materials?: Material[]
	public isLoaderEnabled: boolean = false;
	public customIdSubscription!: Subscription;
	public updateSubscription!: Subscription;
	public addSubscription!: Subscription;
	public previousFormData!: FormGroup;
	@Input()fromCalculation = false
	disabledCustomId	 = false
	emptyChemAnalysis	 = false
	public chemicalAnalysisUnitDataSource!: Array<{ value: string, text: string }>;

	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		protected _notification: Notification
	) {
		this.getComboData();
	}
	materialAnalysis?: MaterialAnalysis | CalculationMaterialAnalysis;
	
	@Input() set data(dataItem:MaterialAnalysis | CalculationMaterialAnalysis){
		this.materialAnalysis  = dataItem;
		this.disabledCustomId = false;
		 if (dataItem instanceof CalculationMaterialAnalysis) {
			 this.disabledCustomId = true;
		 }

		this.setResidualMaterial();
	};
	@Input() isAllDisabled: boolean = false;





	ngOnChanges(change: any) {
		if(change.isAllDisabled) this.isAllDisabled = change.isAllDisabled.currentValue;
	}

	ngOnInit() {
		if(!this.materialAnalysis) this.setResidualMaterial();
	}
	setResidualMaterial(){
			if(!this.fromCalculation){
				if (this.materialAnalysis == undefined) {
					this.materialAnalysis = new MaterialAnalysis();
					this.materialAnalysis.chemAnalyses.push(new ChemAnalysis());
					this.materialAnalysis.chemAnalyses.pop()
					this.getCustomId();
				} else {
					this.materialAnalysis = new MaterialAnalysis().deserialize(this.materialAnalysis);
				}
			}
	}

	addchemAnalysis(value?:string) {
		    let chem = new ChemAnalysis();
			if(value){
				chem.unit = this.getUnitTypeForElement(value);
				chem.name = value;
			}
			this.materialAnalysis?.chemAnalyses!.push(chem);
			this.previousFormData = JSON.parse(JSON.stringify(this.materialAnalysis));
	}

	onUpdate(evt: PointerEvent, gridComponent: GridComponent) {
		if (this.isLoaderEnabled) return;
		this.submitted = true
		this.emptyChemAnalysis = false;
		this.gridInstance = gridComponent

		let checkEmpty = this.checkEmpty();
		if (checkEmpty) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}

		let isValidate = true
		// Preparing data for odata batch request
		let idIncrement = 0;
		let chemAnalysesData: any = this.materialAnalysis?.chemAnalyses

		let requests: ODataBatchCall[] = [];


		chemAnalysesData.forEach((data: any, index: number) => {
			let unit = data.unit == undefined ||  data.unit == null || data.unit == '' ? false : true ;
			let min = data.min == undefined ||  data.min == null ? false : true ;
			let max = data.max == undefined ||  data.min == null ? false : true;
			if (!data.name || !data.name.trim() || !unit || !min || !max) {
				isValidate = false
				this.emptyChemAnalysis = true;
				return;
			}
			idIncrement += 1

			let requestData = new ODataBatchCall(
				idIncrement,
				data.hasOwnProperty('id') ? "patch" : "post",
				data.hasOwnProperty('id') ? `\/odata\/ChemAnalyses(${data.id})` : `\/odata\/ChemAnalyses`,
			);
			requestData.body = this.materialAnalysis?.chemAnalyses[index].toOdata();
			requests.push(requestData)
		});

		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
		this.isLoaderEnabled = true;
		let requestData = new ODataBatchCall(
			0,
			"patch",
			`\/odata\/MaterialAnalyses(${this.materialAnalysis?.id})`
		);
		requestData.body = this.materialAnalysis?.toOdata();
		requests.unshift(requestData)
		// delete data
		this.deletableId.forEach((id) => {
			idIncrement += 1
			requests.push(new ODataBatchCall(
				idIncrement,
				"delete",
				`\/odata\/ChemAnalyses(${id})`
			));
		})
		this.deleteRelationData()
		this.updateSubscription = this._commonService.post(`$batch`, { requests })
			.subscribe({
				next: (res: any) => {
					this.updateMaterials(this.materialAnalysis?.id)
					this.addUpdatePivot(res, 0)
				},
				error: (e) => this.showError()
			})
	}

	onAdd(event: PointerEvent, gridComponent: GridComponent) {
		if (this.isLoaderEnabled) return;
		this.submitted = true
		this.emptyChemAnalysis = false;
		this.gridInstance = gridComponent
		let checkEmpty = this.checkEmpty();
		if (checkEmpty) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}

		let chemAnalysesData: any = this.materialAnalysis?.chemAnalyses;
		let requests: ODataBatchCall[] = [];
		let isValidate = true;
		chemAnalysesData.forEach((data: any, index: number) => {
			let unit = data.unit == undefined ||  data.unit == null || data.unit == ''? false : true ;
			let min = data.min == undefined ||  data.min == null ? false : true ;
			let max = data.max == undefined ||  data.min == null ? false : true;
			if (!data.name || !data.name.trim() || !unit || !min || !max) {
				isValidate = false;
				this.emptyChemAnalysis = true;
				return;
			}
			let requestData = new ODataBatchCall(
				index + 1,
				"post",
				`\/odata\/ChemAnalyses`
			);
			requestData.body = this.materialAnalysis?.chemAnalyses[index].toOdata();

			requests.push(requestData);

		});

		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}
		this.isLoaderEnabled = true;
		let requestData = new ODataBatchCall(
			0,
			"post",
			`\/odata\/MaterialAnalyses`
		);
		requestData.body = this.materialAnalysis?.toOdata();
		requests.unshift(requestData)
		this.addSubscription = this._commonService.post(`$batch`, { requests })
			.subscribe({
				next: (res: any) => {
					this.updateMaterials(res.responses[0].body.id)
					this.addUpdatePivot(res, 1)	
				},
				error: (e) => this.showError()
			})
	}

	updateMaterials(materialAnalysisId : any) {
		let payload = {
			material_analysis_id: materialAnalysisId,
			material_ids: this.materialAnalysis?.materials?.map((m : any) => m.id) || []
		};

		this._commonService.post(`hwe-kalk/materials/update-material-analysis-material`,payload,false)
			.subscribe({
				next: (res: any) => {
				},
				error: (e) => this.showError()
			})
	}

	removeChemAnalyses(data: any, index: number) {

		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == 'next') {
				if (data?.hasOwnProperty('id')) this.deletableId.push(data?.id)
				this.materialAnalysis?.chemAnalyses.splice(index, 1)
			}
		});
	}
	/**
	 * update pivot table for many to many relationship
	 * @param response
	 * @param isNew
	 */
	addUpdatePivot(response: any, isNew: number) {
		let id!: number;
		let relatedId: number[] = []
		response.responses.forEach((value: any,) => {
			if (value.hasOwnProperty('body')) {
				if (value.id == 0) id = value.body.id
				else relatedId.push(value.body.id)
			}
		})
		if (id == undefined || !relatedId.length) {
			this.showSuccess(isNew)
			return;
		}
		this._commonService.post(`material-analysis-chem-analyses/${isNew}`, { id, relatedId }, false).subscribe({

			next: (res) => {
				this.showSuccess(isNew)
			},
			error: (e: any) => this.showError()

		})
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('MaterialAnalysis')
			.catch(() => false)
		if (value) {
			this.materialAnalysis!.custom_id = value;
		}
		this.previousFormData = JSON.parse(JSON.stringify(this.materialAnalysis));
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
	
	setDefaultValue() {
		let elements = [
			'C', 'Si', 'Mn', 'P', 'S', 'Al', 'N', 'Cr', 'Ni', 'Mo', 'Cu', 'Nb', 'Ti', 'V', 'B', 'Zr', 'Ca', 'H2', 'O2', 'Nb + V', 'C+Mn/6+(Cr+Mo+V)/5+(Ni+Cu)/15', 'Freie Angabe'
		];
		elements.forEach(value => this.addchemAnalysis(value))

	}

	deleteRelationData() {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {

			},
		})
	}
	isEmpty(value: any) {
		return (value === undefined || value == null || value.toString().trim().length <= 0);
	}
	isEmptyArray(value: any) {
		return !Array.isArray(value) || value.length == 0
	}
	checkEmpty() {

		return this.isEmpty(this.materialAnalysis!.custom_id) ||
			this.isEmpty(this.materialAnalysis?.regulation) ||
			this.isEmptyArray(this.materialAnalysis?.materials) ||
			this.isEmpty(this.materialAnalysis?.issue_revision);
	}

	getComboData() {
		this.isLoaderEnabled = true;
		this.chemicalAnalysisUnitDataSource = ChemicalAnalysisUnitClass.getEnumArray();
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

	handleFilter(value: String, src: String) {
		switch (src) {
			case "materials":
				this.materials =
					this.cmbMaterials.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
		}
	}

	getUnitTypeForElement(value: string) {
		if(['C', 'Si', 'Mn', 'P', 'S', 'Al', 'N', 'Cr', 'Ni', 'Mo', 'Cu', 'Nb', 'Ti', 'V', 'B', 'Zr', 'Ca', 'Nb + V', 'C+Mn/6+(Cr+Mo+V)/5+(Ni+Cu)/15', 'Freie Angabe'].includes(value)) {
			return ChemicalAnalysisUnit.PERCENTAGE;
		}
		else if (['H2', 'O2'].includes(value)) {
			return ChemicalAnalysisUnit.PPM;
		}
		else {
			return '';
		}
	}
}


