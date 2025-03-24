import { Component, ViewChild, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import HandlingUnit from "@app/shared/models/handling-unit.model";
import { CommonService } from "@app/shared/services/common.service";
import { DataService } from "@app/shared/services/data.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import moment from "moment";
import {forkJoin, of, ReplaySubject, switchMap, takeUntil } from "rxjs";

@Component({
	selector: "app-print-handling-unit",
	templateUrl: "./print-handling-unit.component.html",
	styleUrl: "./print-handling-unit.component.css",
})
export class PrintHandlingUnitComponent {
	isLoading = false;
	isDialogOpen = true;
	selectedHU: string = "";
	selectedHUCustomId: string = '';
	localization = Localization;
	allHU: HandlingUnit[] = [];
	isPrintDialogOpen = false;
	printDialogType = ValueState.Positive;
	printDialogMessage = "";
	printDialogHeaderText = "";
	dynamicSearch: string = "";
	isValueHelpDialog: boolean = false;
	skip: number = 0;
	top: number = 200;
	selectedField: string = "";
	noDataText: string = $localize`No data found`;
	selectedOperationId: number = 0;
	disableButtonDuringRequest: boolean = false;
	selectableHUCustomIds: string[] = [];
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	selectedOrderDetails: OrderDetails | null = null;

	constructor(
		private router: Router,
		private activeRoute: ActivatedRoute,
		private commonService: CommonService,
		public _toasterSrv: ToastService,
		private dataService: DataService,
	) {
		this.loadStockData();
		this.selectedOperationId = parseInt(this.activeRoute?.snapshot.params?.['operationId']);
	}

	loadStockData(){
		this.dataService.selectedOrderDetails$
		.pipe(
			takeUntil(this.destroyed$),
			switchMap(res=> {
				if (res) {
					this.selectedOrderDetails = res;
					return forkJoin({
						selectableHU: this.commonService.get(`stock/${this.selectedOrderDetails.id}/stocks/handling-units?itemPlantId=${this.selectedOrderDetails?.itemPlantId}`, false)
					});
				}
				return of(null);
			})
		).subscribe((res: any)=>{
			if (res) {
				this.selectableHUCustomIds = res.selectableHU as string[];				
				this.loadData(this.dynamicSearch ?? "", this.skip, this.top);
			}
		});

	}
	
	loadData(
		query: string = "",
		skip: number = this.skip,
		top: number = this.top ): any{
		this.isLoading = true;
		let url = "";
		const idString = this.selectableHUCustomIds.map(id => `'${id}'`).join(',');	
		const filterQuery = query ? `$filter=${query} and custom_id in (${idString})&` : `$filter=custom_id in (${idString})&`;
		url = `HandlingUnits?${filterQuery}&$orderby=created_at desc &$skip=${skip}&$top=${top}`;

		this.commonService.get(url).subscribe({
			next: (res: any) => {
				this.isLoading = false;
				this.allHU = skip === 0 ? res.value : [...this.allHU, ...res.value];
				this.skip += top;
			},
			error: (e: any) => {
				console.error('Error fetching data:', e);
				this.isLoading = false;
			},
		});

	}

	private getSearchQuery(input: string): string {
		const datePatternRegex = /^\d{2}\.\d{2}\.\d{4}$/;
		const datetimePatternRegex = /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/;

		let query = '';

		if (datetimePatternRegex.test(input)) {
			const formattedDate = moment(input, "DD.MM.YYYY HH:mm").utc().format("YYYY-MM-DD HH:mm");
			query = `(created_at ${LogicalOperator.GE} '${formattedDate}:00' and created_at ${LogicalOperator.LE} '${formattedDate}:59')`;
		} else if (datePatternRegex.test(input)) {
			const formattedDate = moment(input, "DD.MM.YYYY").utc().format("YYYY-MM-DD");
			query = `(created_at ${LogicalOperator.GE} '${formattedDate} 00:00:00' and created_at ${LogicalOperator.LE} '${formattedDate} 23:59:59')`;
		} else {
			query = `contains(custom_id, '${input}')`;
		}

		return query;
	}
	

	onSearch(query: any): Promise<void> {
		if (query.target.typedInValue.length == 0) {
			this.disableButtonDuringRequest = true;
		}
		const searchQuery = this.getSearchQuery(query.target.typedInValue.trim());

		return new Promise((resolve, reject) => {
			this.isLoading = true;
			this.skip = 0; // Reset skip for new search
			this.loadData(searchQuery, this.skip, this.top);		
		});
	}

	openDropdown(){
		this.isValueHelpDialog = true;
	}

	closeDropdown() {
		this.isValueHelpDialog = false;
	}

    onLoadMore(dataField: any): Promise<void> {
        if (this.isLoading) return Promise.resolve();
        return new Promise((resolve, reject) => {
            if (dataField.length > this.top - 1) {
                this.loadData(this.dynamicSearch ?? "", this.skip, this.top).subscribe({
                    next: () => resolve(),
                    error: (err:any) => reject(err),
                });
            } else {
                resolve();
            }
        });
    }

	printSubmit() {
		this.disableButtonDuringRequest = true;

		this.commonService.get(`warehouse/${this.selectedOperationId}/${this.selectedHU}/print`, false).subscribe({
			next: res => {
				this.disableButtonDuringRequest = false;
				this.closeDialog();
				this._toasterSrv.showToast($localize`Print Successfully!`, "success");
			},
			error: (e: any) => {
				this.isPrintDialogOpen = true;
				this.disableButtonDuringRequest = false;
				this.printDialogType = ValueState.Negative;
				this.printDialogHeaderText = $localize`Error`;
				this.printDialogMessage = $localize`Print Failed!`;
				console.error(e);
			},
		});
	}

	closePrintDialog() {
		this.isPrintDialogOpen = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
		this.router.navigate(["../../"], { relativeTo: this.activeRoute });
	}

	onChangeHU(e: any) {
		this.selectedHU = e.detail.item.id;
		this.disableButtonDuringRequest = this.selectedHU ? false : true;
		this.selectedHUCustomId = e.detail.item.innerText.trim();
		this.isValueHelpDialog = false;
	}
}
