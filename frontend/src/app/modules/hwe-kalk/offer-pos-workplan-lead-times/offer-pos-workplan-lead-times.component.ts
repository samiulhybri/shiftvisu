import { Component } from '@angular/core';
import { GridProperty } from '@app/shared/classes/grid-property';
import { CommonService } from '@app/shared/services/common.service';
import { LeadTimeDetailsComponent } from './lead-time-details/lead-time-details.component';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { OfferPosWorkPlanNameClass } from '@app/modules/hwe-kalk/enums/OfferPosWorkPlanName';

@Component({
  selector: 'app-offer-pos-workplan-lead-times',
  templateUrl: './offer-pos-workplan-lead-times.component.html',
  styleUrls: ['./offer-pos-workplan-lead-times.component.scss']
})
export class OfferPosWorkplanLeadTimesComponent extends GridProperty {
	public editView = {
		actionButton: "lead Time",
		modalTemplate: LeadTimeDetailsComponent,
		modalWidth: "60vw",
		showCloseButton: false
	};
	public toolbarConfig = {
		title: $localize`offer pos work plan lead times`,
		hasAddCommand: true,
		hasSearch: true
	}
	public columns = this.getColumns();

	constructor(_commonService: CommonService) {
		super(_commonService)
	}

	ngOnInit(): void {
		this.state.take = 50;
		this.url = `HweOfferPosWorkPlanLeadTimes?$expand=machine&$orderby=id desc`
		this.sendRequest()

	}
	
	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HweOfferPosWorkPlanLeadTimes(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
      {
				name: "name",
				title: $localize`Name`,
				filterable: true,
				filterType: 'enum',
				dropdownList: OfferPosWorkPlanNameClass.getEnumArray(),
				dropdownFilterableList: OfferPosWorkPlanNameClass.getEnumArray(),
				isCustomCell: true,
			},
			{
				name: "machine.custom_id",
				title: $localize`Machine`,
				filterable: true
			},
      	{
				name: "lead_time_days",
				title: $localize`Lead time days`,
				filterable: true
			},
	
		]
	}

	getEnumTranslateGrid(column: string, data: String) {
		let transEnum: String = '';
		if (column == 'name') {
			transEnum = OfferPosWorkPlanNameClass.getStateTranslate(data);
		}
		return transEnum;
	}
}
