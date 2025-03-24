import { Component, OnDestroy, OnInit, inject } from '@angular/core';

import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { Notification } from 'src/app/shared/services/notification.service';
import { OfferDetailsComponent } from '@app/modules/hwe-kalk/offers/offer-details/offer-details.component';
import { retry } from 'rxjs';
import { GridColumn } from '@app/shared/models/grid-column.model';
import {PermissionEnum} from "@app/enums/permissions-enum";
@Component({
	selector: 'app-sales-opportunity',
	templateUrl: './sales-opportunity.component.html',
	styleUrls: ['./sales-opportunity.component.scss']
})

export class SalesOpportunityComponent extends GridProperty implements OnInit {
	public permissionEnum = PermissionEnum
	public editView = {
		actionButton: "Offer",
		modalTemplate: OfferDetailsComponent,
		modalWidth: "95vw",
		hasRemoveCommand: this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_SALES_OPPORTUNITIES_DELETE),
		hasEditCommandIcon: false,
		editCommandTitle: $localize`New Offer`,
		editCommandCustomColumn: "offer",
		isCustomizedHandler: true,
		isOnPageFilter:true,
		showCloseButton: false,
		hasEditCommand: this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER),
		isHiddenActionColumn: !this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER),
	};

	public toolbarConfig = {
		title: $localize`Sales Opportunities`,
		hasAddCommand: false,
		hasSearch: this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_SALES_OPPORTUNITIES_CREATE_OFFER)
	}
	public columns = this.getColumns();
	constructor(_commonService: CommonService,
		public _notification: Notification,
		
	) {
		super(_commonService)
	}
    checkPermission(permission:string){
		return this.authService.isPermissionValidate(permission)
	}
	ngOnInit(): void {
		this.state.take = 50
		this.url = `hwe-kalk/get/sales-opportunities`
		this.sendRequest()
	}
	override sendRequest() {
		this.isLoadedEnabled = true;
		this._commonService.get(this.url, false).subscribe({
			next: (response: any) => {
				this.gridItems = response.salesOpportunities;
				this.isLoadedEnabled = false;
			},
			error: (e) => this.isLoadedEnabled = false
		})
	}
	import() {

		this.isLoadedEnabled = true;
		this._commonService.get('import/sales-opportunity', false)
			.pipe(
				retry(1)
			)
			.subscribe({
				next: (response: any) => {
					this.sendRequest();
					this._notification.showSuccess($localize`Sales opportunities import succesfully`);

				},
				error: (error) => {
					this.isLoadedEnabled = false;
					this._notification.showError($localize`Something went wrong`);
				}
			})
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`SalesOpportunities(${dataItem.id})`)
	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Sales Opportunity`,
				filterable: true
			},
			{
                name: "sales_area.name",
                title: $localize`Sales Area`,
                filterable: true,
                filterType: 'multiLayer'
            },
			{
				name: "customer.name",
				title: $localize`Customer`,
				filterable: true,
				filterType: 'multiLayer'
			},
			{
				name: "contact_person",
				title: $localize`Contact Person`,
				filterable: true
			},
			{
				name: "version",
				title: $localize`Version`,
				filterable: true
			},
			{
				name: "request_date",
				title: $localize`Request Date`,
				filterType: "date"
			},
			{
				name: "offer_until_date",
				title: $localize`Offer Until Date`,
				filterType: "date"
			}
		]
	}
}