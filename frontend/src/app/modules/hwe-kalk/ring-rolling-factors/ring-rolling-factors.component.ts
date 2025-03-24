import { Component } from '@angular/core';
import { RingRollingFactorDetailComponent } from './ring-rolling-factor-detail/ring-rolling-factor-detail.component';
import { CommonService } from '@app/shared/services/common.service';
import { GridProperty } from '@app/shared/classes/grid-property';
import { GridColumn } from '@app/shared/models/grid-column.model';

@Component({
  selector: 'app-ring-rolling-factors',
  templateUrl: './ring-rolling-factors.component.html',
  styleUrls: ['./ring-rolling-factors.component.scss']
})
export class RingRollingFactorsComponent extends GridProperty {
  public columns = this.getColumns();
	public editView = {
		actionButton: "edit",
		modalTemplate: RingRollingFactorDetailComponent,
		modalWidth: "30vw",
		showCloseButton: false
	};
  
	public toolbarConfig = {
		title: $localize`Ring Rolling Factors`,
		hasAddCommand: true,
		hasSearch: true
	}

  constructor(_commonService: CommonService) {
		super(_commonService)
		this.state.take = 50;
    this.url = `HweRingRollingFactors?$orderby=id`;
		this.sendRequest();
	}

  deleteDataItem(dataItem: any) {
		this.onRemoveItem(`HweRingRollingFactors(${dataItem.id})`);
	}

  private getColumns(): GridColumn[] {
		return [
			{
				name: "weight_from",
				title: $localize`Weight From`,
				filterable: true
			},
      {
				name: "weight_to",
				title: $localize`Weight To`,
				filterable: true
			},
      {
				name: "factor",
				title: $localize`Factor`,
				filterable: true
			}
		]
	}
}
