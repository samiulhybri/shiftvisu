import { Component, Input } from '@angular/core';
import { MtNorm } from '@app/models/mt-norm';
import { MtNormControlUnit } from '@app/models/mt-norm-control-unit';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { CommonService } from '@app/shared/services/common.service';
import { MtNormTestingFacilityClass } from '../../enums/MtNormTestingFacility';
import { MtNormCurrentTypeClass } from '../../enums/MtNormCurrentType';
import { MtNormTestRangeClass } from '../../enums/MtNormTestRange';
import { MtNormControlUnitClass } from '../../enums/MtNormControlUnit';
import { Observable } from 'rxjs';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { MtNormTestEquipmentClass } from '../../enums/MtNormTestEquipment';
import { MtNormUvLampClass } from '../../enums/MtNormUvLamp';
import { MtNormUvMeterClass } from '../../enums/MtNormUvMeter';
import { LuxMeterClass } from '../../enums/LuxMeter';
import { MtNormMagnetizationClass } from '../../enums/MtNormMagnetization';
import { MtNormFieldStrengthMeterClass } from '../../enums/MtNormFieldStrengthMeter';
import { MtNormResidualMagnetismClass } from '../../enums/MtNormResidualMagnetism';
import { MtNormRegistrationLimitClass } from '../../enums/MtNormRegistrationLimit';
import { MtNormIlluminanceClass } from '../../enums/MtNormIlluminance';
import { MtNormIrradianceClass } from '../../enums/MtNormIrradiance';

@Component({
	selector: 'app-mt-norms-details',
	templateUrl: './mt-norms-details.component.html',
	styleUrls: ['./mt-norms-details.component.scss']
})
export class MtNormsDetailsComponent {
	public mtNorm?: MtNorm;
	public isLoaderEnabled: boolean = false;
	public mtNormCurrentTypeData!: Array<{ value: string, text: string }>;
	public mtNormTestingFacilityData!: Array<{ value: string, text: string }>;
	public mtNormTestEquipmentData!: Array<{ value: string, text: string }>;
	public mtNormTestRangeData!: Array<{ value: string, text: string }>;
	public mtNormUvLampData!: Array<{ value: string, text: string }>;
	public mtNormUvMeterData!: Array<{ value: string, text: string }>;
	public luxMeterData!: Array<{ value: string, text: string }>;
	public mtNormMagnetizationData!: Array<{ value: string, text: string }>;
	public mtNormFieldStrengthMeterData!: Array<{ value: string, text: string }>;
	public mtNormResidualMagnetismData!: Array<{ value: string, text: string }>;
	public mtNormRegistrationLimitData!: Array<{ value: string, text: string }>;
	public mtNormIlluminanceData!: Array<{ value: string, text: string }>;
	public mtNormIrradianceData!: Array<{ value: string, text: string }>;

	public mtNormControlUnitData!: MtNormControlUnit[];
	
	@Input() set data(dataItem: MtNorm) {
		this.mtNorm = new MtNorm().deserialize(dataItem);
	}
	@Input() isAllDisabled: boolean = false;
	constructor(protected _commonService: CommonService
	) {
		this.getEnums()
	}

	ngOnInit(): void {
		if (this.mtNorm == undefined) {
			this.mtNorm = new MtNorm();
			this.getNormId()
		}
	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		if (!this.mtNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.post(`MtNorms`, this.mtNorm?.toOdata())

	}
	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (!this.mtNorm?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.put(`MtNorms(${this.mtNorm?.id})`, this.mtNorm?.toOdata())
	}
	getEnums() {
		this.mtNormCurrentTypeData = MtNormCurrentTypeClass.getEnumArray()
		this.mtNormTestingFacilityData = MtNormTestingFacilityClass.getEnumArray();
		this.mtNormTestEquipmentData = MtNormTestEquipmentClass.getEnumArray();
		this.mtNormTestRangeData = MtNormTestRangeClass.getEnumArray();
		this.mtNormUvLampData = MtNormUvLampClass.getEnumArray();
		this.mtNormUvMeterData = MtNormUvMeterClass.getEnumArray();
		this.luxMeterData = LuxMeterClass.getEnumArray();
		this.mtNormMagnetizationData = MtNormMagnetizationClass.getEnumArray();
		this.mtNormFieldStrengthMeterData = MtNormFieldStrengthMeterClass.getEnumArray();
		this.mtNormResidualMagnetismData = MtNormResidualMagnetismClass.getEnumArray();
		this.mtNormRegistrationLimitData = MtNormRegistrationLimitClass.getEnumArray();
		this.mtNormIlluminanceData = MtNormIlluminanceClass.getEnumArray();
		this.mtNormIrradianceData = MtNormIrradianceClass.getEnumArray();
		this.mtNormControlUnitData = MtNormControlUnitClass.getEnumArray();
	}

	async getNormId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('MtNorm')
			.catch(() => false)

		if (value) {
			this.mtNorm!.custom_id = value
		}
		this.isLoaderEnabled = false;
	}
}
