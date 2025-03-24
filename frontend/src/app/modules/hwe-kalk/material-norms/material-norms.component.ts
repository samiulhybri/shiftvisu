import { Component, OnDestroy, OnInit } from '@angular/core';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { ChemAnalysisComponent } from './chem-analysis/chem-analysis.component';
import { Subscription } from 'rxjs';
import { HweKalkService } from '../hwe-kalk.service';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
	selector: 'app-material-norms',
	templateUrl: './material-norms.component.html',
	styleUrls: ['./material-norms.component.scss']
})
export class MaterialNormsComponent extends GridProperty implements OnInit {
	public editView = {
		actionButton: "chem_analysis",
		modalTemplate: ChemAnalysisComponent,
		modalWidth: "60vw",
		isCustomizedHandler: true,
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`Material Norms`,
		hasAddCommand: true,
		hasSearch: true
	}
	public columns = this.getColumns();

	constructor(_commonService: CommonService,
		protected hweKalkService: HweKalkService
	) {
		super(_commonService)
	}

	ngOnInit(): void {
		this.state.take = 20
		this.url = `Norms?expand=material,chemAnalyses&$orderby=id desc `
		this.sendRequest()

	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`Norms(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Material Norm`,
				filterable: true
			},
			{
				name: "material.custom_id",
				title: $localize`Materials`,
				filterable: true
			},
			{
				name: "name",
				title: $localize`Name`,
				filterable: true
			}
		]
	}
}