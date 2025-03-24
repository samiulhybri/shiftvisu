import { Component, OnInit } from '@angular/core';
import { EnerVisuService } from '../../services/ener-visu.service';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
	selector: 'app-kpi-report',
	templateUrl: './kpi-report.component.html',
	styleUrls: ['./kpi-report.component.scss']
})
export class KpiReportComponent extends GridProperty implements OnInit {
	public editView = {
		actionButton: "Edit",
		custom: true
	};
	public toolbarConfig = {
		title: "",
		hasAddCommand: false,
		hasSearch: true
	}
	public isLoading: boolean = false;
	constructor(_commonService: CommonService,
		public enerVisuService: EnerVisuService
	) {
		super(_commonService)
	}
	ngOnInit(): void {
		this.state.take = 20;
		this.url = `Specifications?`;
		this.sendRequest()
	}
	
	public columns = this.getColumns();

	getColumns() {
		return [
			{
				name: "id",
				title: "ID"
			},
			{
				name: "WZV_temperature",
				title: "WZV_temp"
			},
			{
				name: "norm_id",
				title: "norm_id"
			}
		];
	}
}
