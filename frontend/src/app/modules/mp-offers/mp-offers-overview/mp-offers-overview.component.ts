import { Component, Inject, LOCALE_ID, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@app/models/user';
import { GridColumn } from '@app/shared/models/grid-column.model';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import { MPConstructionTypeClass } from 'src/app/enums/mp-construction-type';
import { MpOfferTypeClass } from 'src/app/enums/mp-offer-type';
import { MPToolTypeClass } from 'src/app/enums/mp-tool-type';
import { MPOffer } from 'src/app/models/mp-offer';
import { GridProperty } from 'src/app/shared/classes/grid-property';
import { CommonService } from 'src/app/shared/services/common.service';
import { MpOfferService } from '../services/mp-offer.service';
import { MPOfferLogTypeClass } from '@app/enums/mp-offer-log-type';
import { MPOfferPos } from '@app/models/mp-offer-pos';
import { MPCostSubGroup } from '@app/enums/mp-cost-sub-group';
import { MPCostType } from '@app/enums/mp-cost-type';
import { LocaleService } from "@app/shared/services/locale.service";

@Component({
	selector: 'app-mp-offers-overview',
	templateUrl: './mp-offers-overview.component.html',
	styleUrls: ['./mp-offers-overview.component.scss']
})
export class MpOffersOverviewComponent extends GridProperty implements OnInit {
	public gridDataFilterRadio: string = 'openOffers';
	public isLoaderEnabled: boolean = false;
	public projectWindowOpened: boolean = false;
	public cloneWindowOpened: boolean = false;
	public selectedOffer?: MPOffer;
	public cloneSelectedOffer?: MPOffer;
	public usersList?: User[];
	public columns = this.getColumns();
	public logColumns = this.getLogColumns();
	public editView = {
		actionButton: "Edit",
		actionColumnWidth: 173,
		custom: true,
		routeLink: "/mp-offers/detail/"
	};
	public toolbarConfig = {
		title: $localize`Offers`,
		hasAddCommand: false,
		hasRouteLink: true,
		hasSearch: true
	}
	private previousFilterQuery: string = '';
	public openLog: boolean = false;
	public offerLogs: any = [];

    public currentAuthUser: any;
	public showCopyPricesWarning: boolean = false;

	constructor(
		@Inject(LOCALE_ID) protected locale: string,
		_commonService: CommonService,
		protected router: Router,
		public intl: IntlService,
        private mpOfferSrv: MpOfferService,
		private localeSrv: LocaleService) {
		super(_commonService);
		this.localeSrv.setLocale(this.locale);
	}

    ngOnDestroy(): void {
        this._commonService.currentModule = '';
    }

	ngOnInit(): void {
		this._commonService.currentModule = 'mp-offers';
        this.currentAuthUser = this.authService.user ?? {};

		this.mpOfferSrv.updateValue(false);
		const tempState = this._commonService.getGridState('mp-offers');
		if(tempState) {
			this.state = tempState;
			if(tempState.filter.filters) {
				let temp = tempState.filter.filters;
				let filterFound = false;
				let filterType = '';
				for (var i = 0; i < temp.length; i++) {
					if (temp[i].field == 'is_closed') {
						filterFound = true;
						filterType = temp[i].value;
						break;
					}
				}
				if (filterFound && filterType) this.gridDataFilterRadio = 'closedOffers';
				else if(filterFound && !filterType) this.gridDataFilterRadio = 'openOffers';
				else this.gridDataFilterRadio = 'allOffers';
			}
		} else {
			this.state.take = 50;
			this.state.filter?.filters.push(
				{
					field: 'is_closed',
					operator: 'eq',
					value: false
				},
				{
					field: 'is_saved',
					operator: 'eq',
					value: true
				},
				{
					field: 'custom_id',
					operator: 'ne',
					value: null
				}
			);
			this.state.filter!.logic = 'and';
		}

		this.url = `MpOffers?expand=customer(select=id,name,custom_id),finalCustomer(select=id,name,custom_id),mpOfferPos(expand=mpMaterial),user&$orderby=id desc`; //SHOWING OPEN OFFERS
		this.sendRequest();
		this._commonService.get(`Users`).subscribe({
			next: (response: any) => {
				var raw_users = response.value;
				this.usersList = [];
				raw_users.forEach((user: any) => {
					if(user.is_active == 1) 
						this.usersList?.push(new User().deserialize(user));
				});
			},
			error: (e) => {
			}
		});

	}

	getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`No`,
				width: 100,
				filterable: true
			},
			{
				name: "version",
				title: $localize`Version`,
				width: 95,
				filterable: true
			},
			{
				name: "mp_offer_type",
				title: $localize`Type`,
				filterType: 'enum',
				dropdownList: new MpOfferTypeClass().getEnumArray(),
				dropdownFilterableList: new MpOfferTypeClass().getEnumArray(),
				isCustomCell: true,
				width: 100,
				filterable: true
			},
			{
				name: "date",
				title: $localize`Date`,
				isDateColumn: true,
				filterType: 'date',
				width: 100,
				filterable: true
			},
			{
				name: "customer.name",
				title: $localize`Customer`,
				filterType: 'multiLayer',
				filterable: true,
				sortable: false
			},
			{
				name: "name",
				title: $localize`Name`,
				width: 250,
				textAlign: "left",
				filterable: true
			},
			{
				name: "tool_type",
				title: $localize`Tool Type`,
				filterType: 'enum',
				dropdownList: new MPToolTypeClass().getEnumArray(),
				dropdownFilterableList: new MPToolTypeClass().getEnumArray(),
				isCustomCell: true,
				filterable: true
			},
			{
				name: "construction_type",
				title: $localize`Construction`,
				filterType: 'enum',
				dropdownList: new MPConstructionTypeClass().getEnumArray(),
				dropdownFilterableList: new MPConstructionTypeClass().getEnumArray(),
				isCustomCell: true,
				filterable: true
			},
			{
				name: "total",
				title: $localize`Amount`,
				isCustomCell: true,
				textAlign: "right",
				hideColumnMenu: true,
				filterable: false
			},
			{
				name: "is_closed",
				title: $localize`Closed`,
				booleanValue: true,
				width: 85,
				hideColumnMenu: true,
				filterable: false
			},
			{
				name: "project_nr",
				title: $localize`Order`,
				isCustomCell: true,
				filterable: true
			},
			{
				name: "log",
				title: $localize`Log`,
				isCustomCell: true,
				width: 80,
				hideColumnMenu: true,
				filterable: false
			}
		];
	}

	changeGridData() {
		this.isLoaderEnabled = true;
		let temp: any = this.state.filter?.filters;
		let filterFound = false;
		switch(this.gridDataFilterRadio){
			case 'openOffers':
				for (var i = 0; i < temp.length; i++) {
					if (temp[i].field == 'is_closed') {
						filterFound = true;
						temp[i].value = false;
						break;
					}
				}
				if (filterFound) this.state.filter!.filters = temp;
				else {
					this.state.filter?.filters.push({
						field: 'is_closed',
						operator: 'eq',
						value: false
					});
				}
				break;
			case 'closedOffers':
				for (var i = 0; i < temp.length; i++) {
					if (temp[i].field == 'is_closed') {
						filterFound = true;
						temp[i].value = true;
						break;
					}
				}
				if (filterFound) this.state.filter!.filters = temp;
				else {
					this.state.filter?.filters.push({
						field: 'is_closed',
						operator: 'eq',
						value: true
					});
				}
				break;
			case 'allOffers':
				for (var i = 0; i < temp.length; i++) {
					if (temp[i].field == 'is_closed') {
						filterFound = true;
						temp.splice(i, 1);
						break;
					}
				}
				if (filterFound) this.state.filter!.filters = JSON.stringify(temp) === '{}' ? [] : temp;
				break;
			default:
				break;
		}

		if (this.previousFilterQuery) this.sendRequest(this.previousFilterQuery);
		else this.sendRequest();
		this.isLoaderEnabled = false;
	}

	async createNewOffer(): Promise<any> {
		this.isLoadedEnabled = true;
		this._commonService['post']('mp-offers', [], false).subscribe({
			next: async (response: any) => {
				if(response && response.id) {
					let temppOffer = new MPOffer().deserialize(response);
					this.isLoaderEnabled = false;
					this._commonService.saveGridState(this.state, 'mp-offers');
					this.router.navigate(['mp-offers/detail', temppOffer.id]);
				} else this.notifications.showError($localize`Something went wrong.`);
			},
			error: (e: any) => {
				this.isLoaderEnabled = false;
				if(e == 'Unauthenticated.') this.mpOfferSrv.navigateToExternalUrl(this.mpOfferSrv.pathLink);
				else this.notifications.showError($localize`Something went wrong.See the backend logs.`);
			}
		});
	}

	getEnumTranslateGrid(column: string, data: String) {
		var transEnum: String = '';
		if (column == 'tool_type') {
			transEnum = new MPToolTypeClass().getStateTranslate(data);
		} else if (column == 'construction_type') {
			transEnum = new MPConstructionTypeClass().getStateTranslate(data);
		} else if (column == 'mp_offer_type') {
			transEnum = new MpOfferTypeClass().getStateTranslate(data);
		} else if (column == 'mp_offer_log') {
			transEnum = new MPOfferLogTypeClass().getStateTranslate(data);
		}

		return transEnum;
	}

	getOfferTotal(data: any) {
		let offerTotal = new MPOffer().deserialize(data).getTotalSalesPrice('overview');
		return offerTotal;
	}

	getLogColumns(): GridColumn[] {
		return [
			{
				name: "user",
				title: $localize`Collaborator`,
				width: 100
			},
			{
				name: "description",
				title: $localize`Description`,
				width: 250,
				filterType: 'enum'
			},
			{
				name: "log_date",
				title: $localize`Date`,
				width: 100,
				filterType: 'date'
			},
			{
				name: "project_order",
				title: $localize`Order`,
				width: 250
			},
			{
				name: "mp_offer",
				title: $localize`Offer`,
				width: 250
			}
		];
	}

	showOfferLog(item: any) { 
		this.isLoaderEnabled = true;
		this._commonService['get'](`MpOfferLogs?$filter=contains(mp_offer_id,'${ item.id }')&expand=mpOffer(select=id,custom_id,name),user(select=id,custom_id,name)&$orderby=log_date desc`).subscribe({
			next: async (response: any) => {
				if(response.value) {
					response.value.forEach((elem: any) => {
						const dateObject = new Date(elem.log_date.replace(/-/g, '/').replace('T', ' ').replace(/\+.+/, ''));
						const formattedDate = this.localeSrv.format(dateObject, 'yyyy-MM-dd HH:mm:ss');

						this.offerLogs.push({
							'user': elem.user ? elem.user.name : '',
							'description': elem.description,
							'log_date': formattedDate,
							'project_order': elem.project_order ? elem.project_order + ' - ' + elem.mpOffer.name : '',
							'mp_offer': elem.mpOffer.custom_id + ' - ' + elem.mpOffer.name
						});
					});
				}
				this.openLog = true;
				this.isLoaderEnabled = false;
			},
			error: (e: any) => {
				this.isLoaderEnabled = false;
			}
		});
	}

	closeLog() {
		this.openLog = false;
		this.offerLogs = [];
	}

	openProjectWindow(isOpen: any, item: any = null) {
		this.selectedOffer = item;
		this.projectWindowOpened = isOpen;
	}

	openCloneWindow(isOpen: any, item: any = null) {
		this.cloneSelectedOffer = item;
		this.cloneWindowOpened = isOpen;
	}

	async duplicateCloneOffer(type: string) {
		if (this.cloneSelectedOffer != null) {
			this.isLoaderEnabled = true;
			await this.checkFreeRows(this.cloneSelectedOffer.id);
			switch (type) {
				case "duplicate":
					this.mpOfferSrv.clonetype = 'duplicate';
					this.showCopyPricesWarning = true;
					break;
				case "clone":
					this.mpOfferSrv.clonetype = 'clone';
					this.createClones('mp-offers/' + this.cloneSelectedOffer.id + '/copy');
					break;
				default:
					break;
			}
		}
	}

	/**
	 * checking if parent has more than 3 free rows
	 * if so, then shows warning message while creating copying offers into new one
	 * @param offerId is the parent offer id
	 */
	checkFreeRows(offerId: any) {
		if(offerId != null) {
			this._commonService['get'](`MpOffers(${ offerId })?expand=mpOfferPos(filter=cost_type eq 'FIXED')`).subscribe({
				next: async (response: any) => {
					this.isLoaderEnabled = false;
					if(response.mpOfferPos) {
						var matPrimeCount = 0;
						var matAcqCount = 0;
						var extCount = 0;
						response.mpOfferPos.forEach((elm: MPOfferPos) => {
							if(elm.cost_sub_group == MPCostSubGroup.MATERIAL_INTERNAL && elm.cost_type == MPCostType.FIXED) matPrimeCount++;
							else if(elm.cost_sub_group == MPCostSubGroup.MATERIAL_ACQUIRED && elm.cost_type == MPCostType.FIXED) matAcqCount++;
							else if(elm.cost_sub_group == MPCostSubGroup.EXTERNAL && elm.cost_type == MPCostType.FIXED) extCount++;
						});

						if(matPrimeCount > 3 || matAcqCount > 3 || extCount > 3) this.mpOfferSrv.isCloneWarningMsg = true;
					}
				},
				error: (e: any) => {
					this.isLoaderEnabled = false;
				}
			});
		}
	}

	closeCloneOptionModal() {
		this.openCloneWindow(false);
		if(this.showCopyPricesWarning) this.closeCopyPricesWarningModal();
	}

	createClones(url: string) {
		this.isLoaderEnabled = true;
		this._commonService['post'](url, [], false).subscribe({
			next: async (response: any) => {
				if(response && response.offer) {
					let temppOffer = new MPOffer().deserialize(response.offer);
					this._commonService.saveGridState(this.state, 'mp-offers');
					this.openCloneWindow(false);
					if(this.showCopyPricesWarning) this.closeCopyPricesWarningModal();
					this.notifications.showSuccess($localize`Successfully copied to new offer.`);
					this.isLoaderEnabled = false;
					this.router.navigate(['mp-offers/detail', temppOffer.id]);
				} else {
					this.notifications.showError($localize`Something went wrong.`);
					this.openCloneWindow(false);
					if(this.showCopyPricesWarning) this.closeCopyPricesWarningModal();
				}
			},
			error: (e: any) => {
				this.isLoaderEnabled = false;
				if(e == 'Unauthenticated.') this.mpOfferSrv.navigateToExternalUrl(this.mpOfferSrv.pathLink);
				else {
					this.notifications.showError($localize`Something went wrong.See the backend logs.`);
					this.openCloneWindow(false);
					if(this.showCopyPricesWarning) this.closeCopyPricesWarningModal();
				}
			}
		});
	}

	printOfferDetails(data: any) {
		this.isLoadedEnabled = true;
		var locale = '';
        if (this.locale == 'en-EN' || this.locale == 'en') locale = 'en';
        else if (this.locale == 'de-DE' || this.locale == 'de') locale = 'de';
        else if (this.locale == 'it-IT' || this.locale == 'it') locale = 'it';

		this._commonService[`postFile`](`mp-offer-details/${data.id}/print/${locale}`, [], false).subscribe({
			next: async (response: any) => {
				const blob = new Blob([response], { type: 'application/pdf' });
				let printWindow = window.open(window.URL.createObjectURL(blob));
				printWindow?.document.close();
				printWindow?.focus();
				this.isLoadedEnabled = false;
			},
			error: (e: any) => {
				this.isLoadedEnabled = false;
				if(e == 'Unauthenticated.') this.mpOfferSrv.navigateToExternalUrl(this.mpOfferSrv.pathLink);
				else this.notifications.showError($localize`Something went wrong.See the backend logs.`);
			}
		});
	}

	getDisabledProperty(project: any) {
		if(this.currentAuthUser && this.currentAuthUser.mp_is_allowed_reoffer) {
			if (project && project.includes("_")) return true;
			else return false;
		}
		
		return true;
	}

	deleteDataItem(dataItem: any) {
		this.onRemoveItem(`MpOffers(${dataItem.id})`);
	}

	override changeGridFilter(data: any) {
		this.isLoaderEnabled = true;
		let stateQuery: string = typeof (data) != 'string' ? data.query : data;

		if (data.hasOwnProperty('state') && !data.hasOwnProperty('type')) this.state = data.state;
		else if(typeof (data) != 'string' && (data.type == 'relational-data' || data.type == 'fullGridSearch')) {
			if(data.hasOwnProperty('state') && this.state != data.state) {
				this.state = data.state;
			}
			let tempState: any = this.state.filter;
			const fieldsToKeep = ['is_closed', 'is_saved', 'custom_id'];
			const filteredFilters = tempState.filters.filter((item: any) => fieldsToKeep.includes(item.field));
			tempState.filters = filteredFilters;
			this.state.filter = tempState;
		}

		this.previousFilterQuery = stateQuery;
		if (stateQuery != '' && stateQuery != undefined) this.sendRequest(stateQuery);
		else this.sendRequest();
		this.isLoaderEnabled = false;
	}

	dataChangeEvt(evt: string) {
		switch (evt) {
			case "CLOSE":
				this.openProjectWindow(false);
				this.sendRequest();
				break;
		}
	}

	duplicateOffer() {
		this.createClones('mp-offers/' + this.cloneSelectedOffer!.id + '/duplicate');
	}

	closeCopyPricesWarningModal () {
		this.showCopyPricesWarning = false;
    }
}
