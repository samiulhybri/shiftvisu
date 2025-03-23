import { Component, Input, OnInit } from '@angular/core';
import { VtNorm } from '@app/models/vt-norm';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { TestScopeClass } from '@app/modules/hwe-qs/enums/TestScope';
import { LuxMeterClass } from '@app/modules/hwe-qs/enums/LuxMeter';
import { VtNormRegistrationLimitClass } from '@app/modules/hwe-qs/enums/VtNormRegistrationLimit';
import { VtNormIlluminanceClass } from '@app/modules/hwe-qs/enums/VtNormIlluminance';
import { VtNormTestTechnique } from '@app/models/vt-norm-test-technique';
import { VtNormAuxiliaryMean } from '@app/models/vt-norm-auxiliary-mean';
import { VtNormTestTechniqueClass } from '@app/modules/hwe-qs/enums/VtNormTestTechnique';
import { VtNormAuxiliaryMeanClass } from '@app/modules/hwe-qs/enums/VtNormAuxiliaryMean';

@Component({
	selector: 'app-vt-norm-details',
	templateUrl: './vt-norm-details.component.html',
	styleUrls: ['./vt-norm-details.component.scss']
})
export class VtNormDetailsComponent implements OnInit {
	public vtNorm?: VtNorm;
	public previousFormData?: VtNorm;
	public gridInstance!: GridComponent;
	public isLoaderEnabled: boolean = false;
	public testTechniqueData!: VtNormTestTechnique[];
	public auxiliaryMeanData!: VtNormAuxiliaryMean[];
	public addSubscription!: Subscription;
	public oldData: any = {
		testTechniques: [],
		auxiliaryMeans: []
	}
	public testScopeData!: Array<{ value: string, text: string }>;
	public luxMeterData!: Array<{ value: string, text: string }>;
	public registrationLimitData!: Array<{ value: string, text: string }>;
	public illuminanceData!: Array<{ value: string, text: string }>;

	@Input() set data(dataItem: VtNorm) {
		this.vtNorm = new VtNorm().deserialize(dataItem);
		this.oldData.testTechniques = dataItem?.testTechniques?.map((value: any) => value.id) ?? [];
		this.oldData.auxiliaryMeans = dataItem?.auxiliaryMeans?.map((value: any) => value.id) ?? [];
	}
	@Input() isAllDisabled: boolean = false;

	constructor(protected _commonService: CommonService,
		protected _notification: Notification
	) {
		this.getEnums()
	}

	ngOnInit(): void {
		if (this.vtNorm == undefined) {
			this.vtNorm = new VtNorm();
			this.getNormId()
		}
	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		if (!this.vtNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.post(`VtNorms`, this.vtNorm?.toOdata())

	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (!this.vtNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		this.deleteRelationData()
		return this._commonService.put(`VtNorms(${this.vtNorm?.id})`, this.vtNorm?.toOdata())
	}

	getEnums() {
		this.testTechniqueData = VtNormTestTechniqueClass.getEnumArray().map((item: any) => {
			return {
				...item,
				test_technique: item.value,
			}

		});

		this.auxiliaryMeanData = VtNormAuxiliaryMeanClass.getEnumArray().map((item: any) => {
			return {
				...item,
				auxiliary_mean: item.value,
			}
		})

		this.testScopeData = TestScopeClass.getEnumArray();
		this.luxMeterData = LuxMeterClass.getEnumArray();
		this.registrationLimitData = VtNormRegistrationLimitClass.getEnumArray();
		this.illuminanceData = VtNormIlluminanceClass.getEnumArray();
	}

	deleteRelationData() {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.testTechniques.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/VtNormTestTechniques(${id})`)
			);
			i++;
		});
		this.oldData.auxiliaryMeans.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/VtNormAuxiliaryMeans(${id})`)
			);
			i++;
		})

		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {

			},
		})
	}

	async getNormId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('VtNorm')
			.catch(() => false)

		if (value) {
			this.vtNorm!.custom_id = value
		}
		this.isLoaderEnabled = false;
	}
}
