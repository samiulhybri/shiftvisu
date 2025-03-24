import { Component, Input } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { PtNorm } from 'src/app/models/pt-norm';
import { TestScopeClass } from '../../enums/TestScope';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable } from 'rxjs';
import { PtNormIntermediateCleanerClass } from '../../enums/PtNormIntermediateCleaner';
import { PtNormCleanerClass } from '../../enums/PtNormCleaner';
import { PtNormDeveloperClass } from '../../enums/PtNormDeveloper';
import { PtNormPenetrantClass } from '../../enums/PtNormPenetrant';
import { PtNormTestEquipmentSystemClass } from '../../enums/PtNormTestEquipmentSystem';
import { PtNormTestTemperatureClass } from '../../enums/PtNormTestTemperature';
import { LuxMeterClass } from '../../enums/LuxMeter';
import { PtNormControlUnitClass } from '../../enums/PtNormControlUnit';
import { PtNormRegistrationLimitClass } from '../../enums/PtNormRegistrationLimit';
import { PtNormIlluminanceClass } from '../../enums/PtNormIlluminance';

@Component({
	selector: 'app-pt-norm-details',
	templateUrl: './pt-norm-details.component.html',
	styleUrls: ['./pt-norm-details.component.scss']
})
export class PtNormDetailsComponent {
	public ptNorm?: PtNorm;
	public isLoaderEnabled: boolean = false;
	public testScopeDataSource!: Array<{ value: string, text: string }>;
	public intermediateCleanerDataSource!: Array<{ value: string, text: string }>;
	public cleanerDataSource!: Array<{ value: string, text: string }>;
	public developerDataSource!: Array<{ value: string, text: string }>;
	public penetrantDataSource!: Array<{ value: string, text: string }>;
	public testEquipmentSystemDataSource!: Array<{ value: string, text: string }>;
	public testTemperatureDataSource!: Array<{ value: string, text: string }>;
	public luxMeterDataSource!: Array<{ value: string, text: string }>;
	public controlUnitDataSource!: Array<{ value: string, text: string }>;
	public registrationLimitData!: Array<{ value: string, text: string }>;
	public illuminanceLuxData!: Array<{ value: string, text: string }>;

	@Input() set data (dataItem: PtNorm) {
		this.ptNorm = new PtNorm().deserialize(dataItem);
	}
	@Input() isAllDisabled: boolean = false;

	constructor(public _commonService: CommonService) {
		this.testScopeDataSource = TestScopeClass.getEnumArray();
		this.intermediateCleanerDataSource = PtNormIntermediateCleanerClass.getEnumArray();
		this.cleanerDataSource = PtNormCleanerClass.getEnumArray();
		this.developerDataSource = PtNormDeveloperClass.getEnumArray();
		this.penetrantDataSource = PtNormPenetrantClass.getEnumArray();
		this.testEquipmentSystemDataSource = PtNormTestEquipmentSystemClass.getEnumArray();
		this.testTemperatureDataSource = PtNormTestTemperatureClass.getEnumArray();
		this.luxMeterDataSource = LuxMeterClass.getEnumArray();
		this.controlUnitDataSource = PtNormControlUnitClass.getEnumArray();
		this.registrationLimitData = PtNormRegistrationLimitClass.getEnumArray();
		this.illuminanceLuxData = PtNormIlluminanceClass.getEnumArray();
	}

	ngOnInit() {
		if (!this.ptNorm) {
			this.ptNorm = new PtNorm();
			this.getCustomId()
		}
	}

	onAdd(e: any, grid: GridComponent) {
		if (!this.ptNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.post(`PtNorms`, this.ptNorm?.toOdata())
	}

	onUpdate(e: any, grid: GridComponent) {
		if (!this.ptNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.put(`PtNorms(${this.ptNorm?.id})`, this.ptNorm?.toOdata())
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('PtNorm').catch(() => false)
		if (value) this.ptNorm!.custom_id = value;
		this.isLoaderEnabled = false;
	}
}
