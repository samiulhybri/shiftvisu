import { Component, Input } from '@angular/core';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { CommonService } from '@app/shared/services/common.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable, Subscription } from 'rxjs';
import { Material } from '@app/models/material';
import { MaterialDatabase } from '@app/models/material-database';
import { MaterialDatabaseTemperatureClass } from '@app/enums/material-database-temperature.enum';
import { CalculationHeatTreatmentTypeClass } from '../../enums/CalculationHeatTreatmentType';

@Component({
	selector: 'app-material-database-details',
	templateUrl: './material-database-details.component.html',
	styleUrls: ['./material-database-details.component.scss']
})
export class MaterialDatabaseDetailsComponent {
	public isLoaderEnabled: boolean = false;
	public materials: Material[] = [];
	public cmbMaterials: any;
	public batchSubscription!: Subscription;
	public heatTreatmentTypeDataSource!: Array<{ value: string, text: string }>;

	@Input('data') materialDatabase?: MaterialDatabase;

	public materialTemperatureTypes: string[] = new MaterialDatabaseTemperatureClass().getEnumArray();

	constructor(public _commonService: CommonService) {
		this.batchCall();
		this.heatTreatmentTypeDataSource = CalculationHeatTreatmentTypeClass.getEnumArray();
	}

	ngOnInit() {
		if (!this.materialDatabase) {
			this.materialDatabase = new MaterialDatabase();
			this.getCustomId()
		}
	}

	onAdd(e: any, grid: GridComponent) {
		if (!this.materialDatabase?.custom_id?.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		return this._commonService.post(`MaterialDatabases`, this.materialDatabase.toOdata())
	}

	onUpdate(e: any, grid: GridComponent) {
		if (!this.materialDatabase?.custom_id?.trim()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Custom ID is required.`);
			});
		}

		const data = new MaterialDatabase().deserialize(this.materialDatabase).toOdata();

		return this._commonService.put(`MaterialDatabases(${this.materialDatabase?.id})`, data)
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('MaterialDatabase').catch(() => false)
		if (value) this.materialDatabase!.custom_id = value;
		this.isLoaderEnabled = false;
	}

	batchCall() {
		this.isLoaderEnabled = true;
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(
			0,
			"get",
			`\/odata\/Materials`
		));

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
			case "material":
				this.materials =
					this.cmbMaterials.handleLocalDataFilter(
						value,
						"custom_id"
					);
				break;
		}
	}
}
