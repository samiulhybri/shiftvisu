import { Component, Input } from '@angular/core';
import { HweOfferPosWorkPlanLeadTime } from '@app/models/hwe-offer-pos-work-plan-lead-time';
import { OfferPosWorkPlanNameClass } from '../../enums/OfferPosWorkPlanName';
import { Machine } from '@app/models/machine';
import { CommonService } from '@app/shared/services/common.service';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { Observable } from 'rxjs';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';

@Component({
  selector: 'app-lead-time-details',
  templateUrl: './lead-time-details.component.html',
  styleUrls: ['./lead-time-details.component.scss']
})
export class LeadTimeDetailsComponent {
	public hweOfferPosWorkPlanLeadTime?: HweOfferPosWorkPlanLeadTime;
    public machines:Machine[] = [];
    public cmbMachines:any;
    public isLoaderEnabled:boolean = false;
	
    offerPosWorkPlans = OfferPosWorkPlanNameClass.getEnumArray();
    cmbOfferPosWorkPlans:any = new ComboFilter(this.offerPosWorkPlans);

    @Input() set data(dataItem: HweOfferPosWorkPlanLeadTime) {
		this.hweOfferPosWorkPlanLeadTime = new HweOfferPosWorkPlanLeadTime().deserialize(dataItem);
	}
	constructor(protected _commonService : CommonService) {
		
	}

	ngOnInit(): void {
		if (!this.hweOfferPosWorkPlanLeadTime) {
			this.hweOfferPosWorkPlanLeadTime = new HweOfferPosWorkPlanLeadTime().deserialize({})
		}
        this.getComboBoxData();
	}
    getComboBoxData(){
        const odataBatchCalls = [
			new ODataBatchCall(0, "get", `/odata/Machines?top=10000000`)
		];
		this.isLoaderEnabled = true;
		this._commonService.post("$batch", { requests: odataBatchCalls }).subscribe({
			next: (response: any) => {
				if (response && response.responses) {
					this.machines = response.responses[0].body.value;
					this.cmbMachines = new ComboFilter(this.machines);
					this.isLoaderEnabled = false;
				}
			},
			error: (err: any) => {
				console.error("Failed to fetch dropdown data", err);
				this.isLoaderEnabled = false;
			},
		});
    }
    onAdd(event: PointerEvent, grid: GridComponent) {
		if (!this.hweOfferPosWorkPlanLeadTime?.name) {
			grid.isWindowLoaderEnabled = false;
			return new Observable((observer) => {
				observer.error($localize`Name Type is required.`);
			});
		}

		return this._commonService.post(`HweOfferPosWorkPlanLeadTimes`, this.hweOfferPosWorkPlanLeadTime?.toOdata())
	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (!this.hweOfferPosWorkPlanLeadTime?.name) {
			grid.isWindowLoaderEnabled = false;
			return new Observable((observer) => {
				observer.error($localize`Name Type is required.`);
			});
		}
		
		return this._commonService.put(`HweOfferPosWorkPlanLeadTimes(${this.hweOfferPosWorkPlanLeadTime?.id})`, this.hweOfferPosWorkPlanLeadTime?.toOdata())
	}

    handleFilter(value: String, src: String) {
		switch (src) {
			case "machine":
				this.machines = this.cmbMachines.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
                case "name":
                    this.offerPosWorkPlans = this.cmbOfferPosWorkPlans.handleLocalDataFilter(
                        value,
                        "text"
                    );
                    break;    
		}
	}
}
