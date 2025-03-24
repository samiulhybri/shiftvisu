import { Component, Input } from '@angular/core';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable } from 'rxjs';
import { ResidualMaterial } from "@app/models/residual-materials";
import { CommonService } from '@app/shared/services/common.service';
import { ResidualMaterialFrequencyClass } from '@app/modules/hwe-kalk/enums/ResidualMaterialFrequency';
import { CrossSectionTypeClass } from '../../enums/CrossSectionType';
import { MarkingClass } from '../../enums/Marking';
import { CalculationResidualMaterial } from '@app/models/calculation-rasidual-material';

@Component({
	selector: 'app-residual-material-details',
	templateUrl: './residual-material-details.component.html',
	styleUrls: ['./residual-material-details.component.scss']
})
export class ResidualMaterialDetailsComponent {
	residualMaterial?:ResidualMaterial | CalculationResidualMaterial;
	disabledCustomId	 = false
	@Input() set data(dataItem:ResidualMaterial | CalculationResidualMaterial){
		this.residualMaterial  = dataItem;
		if (dataItem instanceof CalculationResidualMaterial) {
			 this.disabledCustomId = true;
		}
		if (this.residualMaterial) {
			this.residualMaterial.quantity_sample_geometries = Number(this.residualMaterial.quantity_sample_geometries) || undefined;
		}
		this.setResidualMaterial();
	};
	@Input() isAllDisabled: boolean = false;
	@Input() fromCalculationResidualMaterial: boolean = false;

	public isLoaderEnabled = false;
	public frequencyDataSource!: Array<{ value: string, text: string }>;
	public markingData!: Array<{ value: string, text: string }>;
	public crossSectionTypeData!: Array<{ value: string, text: string }>;

	constructor(public _commonService: CommonService) {
		this.frequencyDataSource = ResidualMaterialFrequencyClass.getEnumArray();
		this.markingData = MarkingClass.getEnumArray();
		this.crossSectionTypeData = CrossSectionTypeClass.getEnumArray();
	}

	setResidualMaterial(){
		if(!this.fromCalculationResidualMaterial){
			if (!this.residualMaterial) {
				this.residualMaterial = new ResidualMaterial();
				this.getCustomId();
			} else {
				this.residualMaterial = new ResidualMaterial().deserialize(this.residualMaterial);
			}
		}
	}
	ngOnInit() {
		if(!this.residualMaterial) this.setResidualMaterial();
	}

	onSubmitError() {
		if (
			!this.residualMaterial?.custom_id?.trim() ||
			!this.residualMaterial?.quantity_sample_geometries ||
			!this.residualMaterial?.free_text.trim()
		) {
			return true;
		}

		return false;
	}

	onAdd(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.post(`ResidualMaterials`, this.residualMaterial?.toOdata())
	}

	onUpdate(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select the required fields.`);
			});
		}

		return this._commonService.put(`ResidualMaterials(${this.residualMaterial?.id})`, this.residualMaterial?.toOdata())
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('ResidualMaterial').catch(() => false)
		if (value) this.residualMaterial!.custom_id = value;
		this.isLoaderEnabled = false;
	}
}
