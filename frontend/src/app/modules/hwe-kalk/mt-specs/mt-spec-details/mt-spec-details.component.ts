import { Component, Input } from '@angular/core';
import { MTSpec } from 'src/app/models/mt-spec';
import { ImpactTestTypeClass } from '../../enums/ImpactTestType';
import { HardnessTestTypeClass } from '../../enums/HardnessTestType';
import { HardnessConversionClass } from '../../enums/HardnessConversion';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-mt-spec-details',
	templateUrl: './mt-spec-details.component.html',
	styleUrls: ['./mt-spec-details.component.scss']
})
export class MtSpecDetailsComponent {
	public isLoaderEnabled: boolean = false;
	public impactTestTypeDataSource!: Array<{ value: string, text: string }>;
	public hardnessTestTypeDataSource!: Array<{ value: string, text: string }>;
	public hardnessConversionDataSource!: Array<{ value: string, text: string }>;

	@Input('data') mtSpec?: MTSpec;

	constructor(public _commonService: CommonService) {
		this.impactTestTypeDataSource = ImpactTestTypeClass.getEnumArray();
		this.hardnessTestTypeDataSource = HardnessTestTypeClass.getEnumArray();
		this.hardnessConversionDataSource = HardnessConversionClass.getEnumArray();
	}

	ngOnInit() {
		if (!this.mtSpec) {
			this.mtSpec = new MTSpec()
			this.getCustomId()
		}
	}

	onAdd(e: any, grid: GridComponent) {
		if (!this.mtSpec?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.post(`MtSpecs`, this.mtSpec)
	}

	onUpdate(e: any, grid: GridComponent) {
		if (!this.mtSpec?.custom_id.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.put(`MtSpecs(${this.mtSpec?.id})`, this.mtSpec)
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('MtSpec').catch(() => false)
		if (value) this.mtSpec!.custom_id = value;
		this.isLoaderEnabled = false;
	}
}
