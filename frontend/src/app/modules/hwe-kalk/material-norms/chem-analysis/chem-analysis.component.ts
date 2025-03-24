import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GridComponent } from 'src/app/shared/components/kendo/grid/grid.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { Subscription } from 'rxjs';
import { Notification } from 'src/app/shared/services/notification.service';
import { ComboFilter } from 'src/app/shared/classes/combo-filter';
import { Norm } from 'src/app/models/norm';
import { ChemAnalysis } from '@app/models/chem-analysis';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { Material } from '@app/models/material';

@Component({
	selector: 'app-chem-analysis',
	templateUrl: './chem-analysis.component.html',
	styleUrls: ['./chem-analysis.component.scss']
})
export class ChemAnalysisComponent implements OnDestroy, OnInit {

	public deletableId: number[] = [];
	public submitted: boolean = false;
	public gridInstance!: GridComponent;
	public materials: Material[] = [];
	public cmbFltrMaterial: any;
	public isLoaderEnabled: boolean = false;
	public customIdSubscription!: Subscription;
	public updateSubscription!: Subscription;
	public addSubscription!: Subscription;
	public materialsSubscription!: Subscription;
	public previousFormData?: Norm;
	@Input() data?: Norm;
	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		protected _notification: Notification
	) { }
	
	public form: FormGroup = this.formBuilder.group({
		id: null,
		custom_id: [null, Validators.required],
		name: null,
		note: null,
		material_id: [null, Validators.required],
		chemAnalyses: this.formBuilder.array([])
	})



	get chemAnalyses(): FormArray {
		return this.form.controls["chemAnalyses"] as FormArray
	}

	ngOnInit(): void {
		this.isLoaderEnabled = true;
		if (this.data == undefined) {
			this.data = new Norm();
			this.data.chemAnalyses.push(new ChemAnalysis());
			this.data.chemAnalyses.pop()
			this.getNormCustomId();
		} else {
			this.data = new Norm().deserialize(this.data);
			this.addchemAnalysis(this.data.chemAnalyses);
			this.previousFormData = JSON.parse(JSON.stringify(this.data));
		}
		this.getMaterials();
	}
	addchemAnalysis(chemAnalyses: any, isNew: boolean = false) {
		if (isNew) {
			this.submitted = false;
			this.chemAnalyses.push(this.formBuilder.group({
				name: [null, Validators.required],
				min: [null, Validators.required],
				max: [null, Validators.required],
			}))
			this.data?.chemAnalyses!.push(new ChemAnalysis());
		} else {
			chemAnalyses.forEach((element: any) => {
				const chemAnalysis = this.formBuilder.group({
					id: element.id,
					name: [element.name, Validators.required],
					min: [element.min, Validators.required],
					max: [element.max, Validators.required],
				});
				this.chemAnalyses.push(chemAnalysis);
			});
		}
		
	}

	onUpdate(evt: PointerEvent, gridComponent: GridComponent) {
		this.submitted = true
		this.gridInstance = gridComponent

		if (!this.data?.custom_id || !this.data?.custom_id.trim() || !this.data?.material) {
			gridComponent.isWindowLoaderEnabled = false;
			return;
		}
		let isValidate = true
		// Preparing data for odata batch request
		let idIncrement = 0;
		let chemAnalysesData: any = this.data?.chemAnalyses

		let requests: ODataBatchCall[] = [];


		chemAnalysesData.forEach((data: any, index: number) => {
			if (!data.name || !data.name.trim() || !data.min || !data.max) {
				isValidate = false;
				return;
			}
			idIncrement += 1

			let requestData = new ODataBatchCall(
				idIncrement,
				data.hasOwnProperty('id') ? "patch" : "post",
				data.hasOwnProperty('id') ? `\/odata\/ChemAnalyses(${data.id})` : `\/odata\/ChemAnalyses`,
			);
			requestData.body = this.data?.chemAnalyses[index].toOdata();
			requests.push(requestData)
		});
		const chem = this.chemAnalyses;
		for (let i = 0; i < chem.controls.length; i++) {
			chem.controls[i].markAsTouched();
		}
		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false
			return;
		}

		let requestData = new ODataBatchCall(
			0,
			"patch",
			`\/odata\/Norms(${this.data?.id})`
		);
		requestData.body = this.data?.toOdata();
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

		this.updateSubscription = this._commonService.post(`$batch`, { requests })
			.subscribe({
				next: (res: any) => {
					this.addUpdatePivot(res, 0)
				},
				error: (e) => this.showError()
			})
	}

	onAdd(event: PointerEvent, gridComponent: GridComponent) {
		this.submitted = true
		this.gridInstance = gridComponent

		if (!this.data?.custom_id || !this.data?.custom_id.trim() || !this.data?.material) {
			gridComponent.isWindowLoaderEnabled = false;
			return;
		}
		let chemAnalysesData: any = this.data?.chemAnalyses
		let requests: ODataBatchCall[] = [];
		let isValidate = true;
		chemAnalysesData.forEach((data: any, index: number) => {
			if (!data.name || !data.name.trim() || data.min == null || data.max == null) {
				isValidate = false
				return;
			}
			let requestData = new ODataBatchCall(
				index + 1,
				"post",
				`\/odata\/ChemAnalyses`
			);
			requestData.body = this.data?.chemAnalyses[index].toOdata();

			requests.push(requestData);

		});
		const chem = this.chemAnalyses;
		for (let i = 0; i < chem.controls.length; i++) {
			chem.controls[i].markAsTouched();
		}
		if (!isValidate) {
			gridComponent.isWindowLoaderEnabled = false;
			return;
		}
		let requestData = new ODataBatchCall(
			0,
			"post",
			`\/odata\/Norms`
		);
		requestData.body = this.data?.toOdata();
		requests.unshift(requestData)
		this.addSubscription = this._commonService.post(`$batch`, { requests })
			.subscribe({
				next: (res: any) => {
					this.addUpdatePivot(res, 1)
				},
				error: (e) => this.showError()
			})
	}

	removeChemAnalyses(data: any, index: number) {
		if (data?.hasOwnProperty('id')) this.deletableId.push(data?.id)
		this.chemAnalyses.removeAt(index)
		this.data?.chemAnalyses.splice(index, 1)
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
		this._commonService.post(`norm-chem-analyses/${isNew}`, { id, relatedId }, false).subscribe({

			next: (res) => {
				this.showSuccess(isNew)
			},
			error: (e: any) => this.showError()

		})
	}

	async getNormCustomId() {
		let value = await this._commonService.getEntity('Norm')
			.catch(() => false)
		if (value) {
			this.data!.custom_id = value;
		}
		this.previousFormData = JSON.parse(JSON.stringify(this.data));
		this.isLoaderEnabled = false;
	}

	getMaterials() {
		this.materialsSubscription = this._commonService.get('Materials')
			.subscribe({
				next: (res: any) => {
					this.materials = res.value;
					this.cmbFltrMaterial = new ComboFilter(this.materials);
					this.isLoaderEnabled = false;
				},
				error: () => this.isLoaderEnabled = false
			})

	}

	ngOnDestroy() {
		if (this.materialsSubscription) this.materialsSubscription.unsubscribe();
		if (this.customIdSubscription) this.customIdSubscription.unsubscribe();
		if (this.addSubscription) this.addSubscription.unsubscribe();
		if (this.updateSubscription) this.updateSubscription.unsubscribe();
	}
	showError() {
		this.gridInstance.isWindowLoaderEnabled = false
		this._notification.showError($localize`Something went wrong`);
	}
	showSuccess(isNew: number) {
		this.gridInstance.isWindowLoaderEnabled = false;
		this.gridInstance.closeGridWindow = true;
		this.gridInstance.gridRefersh.emit();
		if (isNew) this._notification.showSuccess($localize`Data  created successfully`);
		else this._notification.showSuccess($localize`Data updated  successfully`);
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "material":
				this.materials = this.cmbFltrMaterial.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
		}
	}
}
