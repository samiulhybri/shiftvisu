import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GenericTagType } from "@app/shared/components/generic-tag/generic-tag-type";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ProdOrderPosStatus } from "@app/shared/enums/ProdOrderPosStatus";
import { ProdOrderType } from "@app/shared/enums/ProdOrderType";
import { Item } from "@app/shared/models/item.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { User } from "@app/shared/models/user.model";
import { DateFormatPipe } from "@app/shared/pipes/date-format.pipe";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import moment from "moment";

@Component({
	selector: "app-tool-schedule",
	templateUrl: "./tool-schedule.component.html",
	styleUrl: "./tool-schedule.component.css",
})
export class ToolScheduleComponent {
	private authUser!: User;
	private hasAuth: boolean = true;
	public dates: string[] = [];
	public items?: Item[] = [];
	public numberOfDays: number = 7;
	public type = GenericTagType;
	searchedValue: string = "";
	filteredItems?: Item[] = [];
	startDate: Date = new Date();
	endDate?: Date;
	formatedEndDate: string = "";
	formatedCurrentDate: string = moment(this.startDate).format("YYYY-MM-DD");
	isLoading: boolean = false;
	backlogItems?: Item[] = [];
	firstDayOfMonth = moment(
		new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1)
	).format("YYYY-MM-DD");
	lastDayOfMonth = moment(
		new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 2, 0)
	).format("YYYY-MM-DD");
	isViewDialogOpen = false;
	public selectedOrder!: ProdOrderPos;
    itemId?: number;

	constructor(
		public route: ActivatedRoute,
		public commonService: CommonService,
		public dateFormatPipe: DateFormatPipe,
		private _toasterSrv: ToastService,
		private _authSrv: AuthService
	) {}

	ngOnInit(): void {
		this.authUser = this._authSrv.getUser();
		const checkAuth = this.authUser.roleString?.includes('SUPERADMIN') || 
							this.authUser.roleString?.includes('ADMIN_TOOLVISU') || 
							this._authSrv.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_SCHEDULE_EDIT);
		if(checkAuth) this.hasAuth = true;
		else this.hasAuth = false;

		this.generateNextSevenDays();
		this.loadData();
	}

	generateNextSevenDays(): string[] {
		const today = new Date();
		for (let i = 0; i < this.numberOfDays; i++) {
			const nextDate = new Date(today);
			nextDate.setDate(today.getDate() + i);
			this.dates.push(nextDate.toDateString());
		}
		this.endDate = new Date(this.dates[this.dates.length - 1]);
		this.formatedEndDate = moment(this.endDate).format("YYYY-MM-DD");

		return this.dates;
	}

	onSearchInput(event: any) {
		if (event.target) {
			this.searchedValue = event.target.typedInValue;
		} else {
			this.searchedValue = "";
		}
		this.filteredItems = this.items?.filter((item: any) => {
            if (item.prodOrderPos.length > 0) {
                return (
                    (item.name && item.name.includes(this.searchedValue)) ||
                    (item.custom_id && item.custom_id.includes(this.searchedValue)) ||
                    (item.prodOrderPos?.some((pos: any) =>
                        pos.prodOrder.custom_id && pos.prodOrder.custom_id.includes(this.searchedValue)
                    ))
                );
            }
            return false; 
        });
	}

	changeStartDate(event: Event) {
		this.startDate = new Date((event as any).target.dateValue);
	}
	changeEndDate(event: Event) {
		this.endDate = new Date((event as any).target.dateValue);
	}

	generateDatesBetween(startDate: Date, endDate: Date): string[] {
		const dateRange: string[] = [];
		let current = moment(startDate);
		const end = moment(endDate);

		while (current.isSameOrBefore(end, "day")) {
			dateRange.push(current.format("YYYY-MM-DD"));
			current.add(1, "days");
		}

		return dateRange;
	}

	dateFilter() {
		if (this.startDate && this.endDate) {
			this.dates = this.generateDatesBetween(this.startDate, this.endDate);
			this.searchedValue = "";
			this.loadData();
		}
	}

	loadData() {
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
                	`\/odata\/Items?$select=id,custom_id,name,is_tool,is_active&$filter=is_tool eq true and is_active eq true and prodOrderPos/any(a:a/id ge 0)&$expand=prodOrderPos($expand=prodOrder($select=id,custom_id,order_type);filter=((status ne '${ProdOrderPosStatus.DELETED}' and status ne '${ProdOrderPosStatus.CLOSED}') or (status_plan ne '${ProdOrderPosStatus.DELETED}' and status_plan ne '${ProdOrderPosStatus.CLOSED}')) and prodOrder/any(x:x/order_type eq '${ProdOrderType.MAINTENANCE}');select=id,prod_order_id,item_id,start,status,release_date,status_plan,estimated_hours,is_production_possible)`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.items = response.responses[0]?.body?.value?.map((item: Item) =>
					new Item().deserialize(item)
				);
				this.backlogProdOrderPos(this.items);
				this.filteredItems = this.items?.filter((a: any) => a.prodOrderPos.length > 0);
				this.isLoading = false;
			},

			error: e => {
				console.error(e);
				this.isLoading = false;
			},
		});
	}

	backlogProdOrderPos(data: any) {
		//min time for a day
		const startDateWithTime = moment(this.startDate)
			.set({
				hour: 0,
				minute: 0,
				second: 0,
			})
			.format("YYYY-MM-DDTHH:mm:ss");

		const copiedData = JSON.parse(JSON.stringify(data));
		this.backlogItems =
			copiedData.filter((item: any) => {
				item.prodOrderPos = item.prodOrderPos.filter((prodOrder: any) => {
					const prodOrderDate = new Date(prodOrder.start);
					const startDateWithTimeAsDate = moment(
						startDateWithTime,
						"YYYY-MM-DDTHH:mm:ss"
					).toDate();

					return prodOrderDate < startDateWithTimeAsDate;
				});
				return item.prodOrderPos?.length > 0;
			}) || [];
	}
	getTotalHours(prodOrderPos: ProdOrderPos[], date: any) {
		let totalHours = 0;
		prodOrderPos.forEach((prodOrderPos: ProdOrderPos) => {
			const start = moment(prodOrderPos.start).format("DD.MM.yyyy");
			if (start == date) {
				totalHours += prodOrderPos.estimated_hours || 0;
			}
		});
		return totalHours;
	}

	dropOrder(event: CdkDragDrop<any[]>, date: any) {
		if(this.hasAuth) {
			const prodOrderPosId = event.item.element.nativeElement.id;
			const newReleaseDate = new Date(date);
			this.items?.forEach((list: any) => {
				const item = list.prodOrderPos?.find((pos: any) => pos.id == prodOrderPosId);
				if (item) {
					item.start = newReleaseDate;
	
					if (event.previousContainer === event.container) {
						moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
					} else {
						transferArrayItem(
							event.previousContainer.data,
							event.container.data,
							event.previousIndex,
							event.currentIndex
						);
					}
	
					this.commonService
						.put(`ProdOrderPos/${prodOrderPosId}`, { start: newReleaseDate })
						.subscribe({
							next: (response: any) => {
								this.loadData();
							},
							error: e => {
								console.error("Error Update ProdOrderPos: ", e);
							},
						});
				}
			});
		} else this._toasterSrv.showToast($localize`You are not authorized to do the action!`, '');
	}

	orderDetails(data: any) {
		this.isLoading = true;
		try {
			this.commonService
				.get(
					`ProdOrderPos(${data.id})?$expand=media($select=id),userCreator($select=id,name,custom_id),userResponsible($select=id,name,custom_id),toolSupplier($select=id,name,custom_id),item($select=id,name,custom_id,is_active,is_tool),prodOrder($select=id,custom_id,order_type),prodOrderPosOperations($expand=operationPlan($select=id,custom_id),operationPlanPos($select=id,name))`
				)
				.subscribe({
					next: (response: any) => {
						this.selectedOrder = new ProdOrderPos().deserialize(response);
        					this.itemId = data.id;
						this.isViewDialogOpen = true;
						this.isLoading = false;
					},
					error: e => {
						console.error("Error while getting ProdOrderPos: ", e);
						this.isLoading = false;
						this._toasterSrv.showToast(
							$localize`Data loading issue. Check log`,
							"error"
						);
					},
				});
		} catch (error) {
			console.log("error");
			this.isLoading = false;
			this._toasterSrv.showToast($localize`Data loading issue. Check log`, "error");
		}
	}

	closeViewDialog() {
		this.isViewDialogOpen = false;
	}
}
