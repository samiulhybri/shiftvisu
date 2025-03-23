import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GenericTagType } from "@app/shared/components/generic-tag/generic-tag-type";
import { Item } from "@app/shared/models/item.model";
import { Machine } from "@app/shared/models/machine.model";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { User } from "@app/shared/models/user.model";
import { DateFormatPipe } from "@app/shared/pipes/date-format.pipe";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { ToolRepairStatus } from "@app/modules/tool-visu/enums/ToolRepairStatus";
import moment from "moment";
import { ProdOrderPosOperationStatusClass } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { Hall } from "@app/shared/models/hall.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { TruncatePipe } from "@app/shared/pipes/truncate.pipe";

@Component({
	selector: "app-setup-plan",
	templateUrl: "./setup-plan.component.html",
	styleUrl: "./setup-plan.component.css",
})
export class SetupPlanComponent {
	private authUser!: User;
	private hasAuth: boolean = true;
	public dates: string[] = [];
	public items?: Item[] = [];
	public numberOfDays: number = 7;
	searchedValue: string = "";
	filteredMachines?: any[] = [];
	startDate: Date = new Date();
	endDate?: Date;
	formatedEndDate: string = "";
	formatedCurrentDate: string = moment(this.startDate).format("YYYY-MM-DD");
	isLoading: boolean = false;
	backlogItems?: Item[] = [];
	firstDayOfMonth = moment(this.startDate).subtract(1, "months").format("YYYY-MM-DD")
	lastDayOfMonth = moment(this.startDate).add(1, "months").format("YYYY-MM-DD")
	isViewDialogOpen = false;
	public selectedOrder!: ProdOrderPos;
	itemId?: number;
	isDialogOpen: boolean = false;
	dialogTitle: string = "";
	selectedOperation: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({
		prodOrderPos: { quantity: 0, prodOrder: { custom_id: "" } },
	});
	selecteItem?: string = "";
	machines: any[] = [];
	backlogMachines: any[] = [];
	opTotal?: number = 0;
	operationStart?: string = "";
	operationEnd?: string = "";
	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;
	@ViewChild("orderDetailsDialog") orderDetailsDialog?: any;
	halls: Hall[] = [];
	selectedHalls: number[] = [];
	truncatePipe = new TruncatePipe();
	public type = GenericTagType;

	constructor(
		public route: ActivatedRoute,
		public commonService: CommonService,
		public dateFormatPipe: DateFormatPipe,
		private _toasterSrv: ToastService,
		private _authSrv: AuthService
	) {}

	ngOnInit(): void {
		this.generateNextSevenDays();
	}

	ngAfterViewInit(): void {
		this.getComboBoxData().then(() => {
			this.loadData() ;
		});
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
			this.searchedValue = event.target?.typedInValue?.trim().toLowerCase();
		} else {
			this.searchedValue = "";
		}
		if (!this.searchedValue) {
			this.filteredMachines = [...this.machines];
			return;
		}
		this.filteredMachines = this.machines?.filter((mach: any) => {
			if (mach.prodOrderPosOperations.length > 0) {
				return (
					(mach?.name && mach?.name?.toLowerCase().includes(this.searchedValue)) ||
					(mach.prodOrderPosOperations?.some((operation: any) =>
						operation?.prodOrderPos?.prodOrder?.custom_id.toLowerCase().includes(this.searchedValue)) ||
					mach.prodOrderPosOperations.some((operation: any) =>
						operation?.itemTool?.custom_id.toLowerCase().includes(this.searchedValue) ||
						operation?.itemTool?.name.toLowerCase().includes(this.searchedValue)))
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
		this.setOpertions().then(() => {
			this.isLoading = false;
		}).catch((error) => {
			console.error("Error loading data: ", error);
			this.isLoading = false;
		});
	}

	getTotalHours(prodOrderPosOperations: any[], date: any) {
		let totalHours = 0;
		prodOrderPosOperations.forEach((operation: any) => {
			const start = moment(operation.start).format("DD.MM.yyyy");
			if (start == date) {
				totalHours += operation.estimated_hours || 0;
			}
		});
		return totalHours;
	}

	orderDetails(data: any, isBacklog: boolean = false) {
		this.isDialogOpen = true;
		this.selectedOperation = new ProdOrderPosOperation().deserialize(data);
		if (isBacklog) {
			this.selectedOperation.machine = new Machine().deserialize(
				JSON.parse(JSON.stringify(this.backlogMachines.find((m: any) => m.id === data.machine_id)))
			);
		} else {
			this.selectedOperation.machine = new Machine().deserialize(
				JSON.parse(JSON.stringify(this.machines.find((m: any) => m.id === data.machine_id)))
			);
		}

		this.dialogTitle = `${this.selectedOperation.name} | ${this.selectedOperation.prodOrderPos?.item?.name}`;
		if (this.selectedOperation.prodOrderPos?.item && this.selectedOperation.prodOrderPos) {
			this.selecteItem = `${this.selectedOperation.prodOrderPos?.item?.custom_id} - ${this.selectedOperation.prodOrderPos?.item?.name}`;
		}

		this.operationStart = moment
			.utc(this.selectedOperation?.start)
			.local()
			.format("DD.MM.YYYY, HH:mm");
		this.operationEnd = moment
			.utc(this.selectedOperation?.end)
			.local()
			.format("DD.MM.YYYY, HH:mm");
		this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
			"none";
		this.checkForMaintenance();
		this.commonService
			.get(
				`ProdOrderPosOperationQuantities?filter=prod_order_pos_operation_id eq ${this.selectedOperation.id}`
			)
			.subscribe({
				next: (data: any) => {
					if (data.value.length) {
						(this.selectedOperation as any).produced_quantity = data.value.reduce(
							(sum: number, item: any) => sum + item.quantity,
							0
						);
					} else (this.selectedOperation as any).produced_quantity = 0;
					this.isLoading = false;
				},
				error: (err) => {
					console.error("Error fetching prod order pos operation quantities: ", err);
					this.isLoading = false;
				},
			});
	}

	checkForMaintenance() {
		const body = {};
		if (this.orderDetailsDialog.selectedOperation.tool_id) {
				if (
					this.orderDetailsDialog.selectedOperation.restrictions?.tool_status?.status ==
					ToolRepairStatus.NOT_READY_FOR_USE
				) {
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
						"block";

					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.textContent = $localize`Tool is not ready for Production`;
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.remove(
						"text-orange-600"
					);
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.add(
						"text-red-600"
					);

				} else if (
					this.orderDetailsDialog.selectedOperation.restrictions?.tool_status?.status ==
					ToolRepairStatus.MAINTENANCE_REQUIRED
				) {
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
						"block";
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.textContent = $localize`Tool can be used for Production but needs maintenance`;
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.remove(
						"text-red-600"
					);
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement.classList.add(
						"text-orange-600"
					);

				} else {
					this.orderDetailsDialog.maintenanceText!.elementRef!.nativeElement!.style!.display! =
						"none";
				}
			}
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	setOpertions() {
		const body = {};
		return new Promise<void>((resolve, reject) => {
			const hall =this.halls.filter((hall: any) => hall?.isSelected).map((hall: any) => hall.id);
			const selectedHallIds = (this.selectedHalls.length > 0 ? this.selectedHalls : hall);
			const startDate = moment(this.startDate).startOf("day");
			const endDate = moment(this.endDate).endOf("day");
			if (endDate.isBefore(startDate)) {
				this._toasterSrv.showToast($localize`Invalid Date Range`, "warning");
				this.isLoading = false;
				return;
			}
			const payload = {
				start: startDate.toISOString(),
				end: endDate.toISOString(),
				hall_id: selectedHallIds
			};

			this.commonService.post(`machine-operation`, payload, false).subscribe({
				next: (value: any) => {
					this.machines = value.data.map((item: any) => item.filteredMachines);
					
					this.filteredMachines = this.machines.flatMap((mach: any) => mach);
					
					const itemIdTools = Array.from(new Set(
						value.data
							.flatMap((item: any) => item.filteredMachines)
							.flatMap((machine: any) => machine.prodOrderPosOperations)
							.map((operation: any) => operation.item_id_tool)
							.filter((item_id_tool: any) => item_id_tool !== null)
					));
					if (value.data) {
						this.commonService.post(
						`items/[${itemIdTools}]/tool-repair-status`,
						body, false).subscribe({
							next: (value: any) => {
								this.machines.forEach((machine:any, index:number)=>{
									machine?.prodOrderPosOperations?.forEach((operation: any, operationIndex: number) => {
										const statusData = value.find((data: any) => data.tool == operation.itemTool?.id);

										if (statusData?.status == ToolRepairStatus.NOT_READY_FOR_USE) {
											this.machines[index].prodOrderPosOperations[operationIndex].type = GenericTagType.ProductionError;
										}
										else if (statusData?.status == ToolRepairStatus.MAINTENANCE_REQUIRED) {
											this.machines[index].prodOrderPosOperations[operationIndex].type = GenericTagType.Warning;
										}
										else if (statusData?.status == ToolRepairStatus.READY_FOR_USE) {
											this.machines[index].prodOrderPosOperations[operationIndex].type = GenericTagType.Success;
										}
										else {
											this.machines[index].prodOrderPosOperations[operationIndex].type = GenericTagType.None;
										}
									})
								})
							}
						})
					}
					resolve();
				},
				error: (error: any) => {
					console.error("Error fetching machine operations: ", error);
					reject();
				},
			});
		});
	}

	processDateFormat(date: string) {
		return moment(date).format("ddd MMM DD YYYY");
	}


	getTitleWithValue(operation: ProdOrderPosOperation, title: string) {
		const toolName = operation?.itemTool?.name ?? "";
		switch (title) {
			case "Order":
				return `${$localize`Order`}: ${operation.prodOrderPos?.prodOrder?.custom_id}`;
			case "Tool":
				return `${$localize`Tool`}: ${operation?.itemTool?.custom_id ?? ''} - ${this.truncatePipe.transform(toolName, 25)}`;
			case "Status":
				return `${$localize`Status`}:  ${this.getStatusText(operation.status)} `;
			case "Date":
				return `${$localize`Start`}: ${operation?.start 
					? moment.utc(operation?.start ).local().format("DD.MM.YYYY, HH:mm")
					: ""} `;
			default:
				return "";
		}
	}
	getStatusText(status: string) {
		return status == "TERMINATED"
			? $localize`Planned`
			: status == "PLANNED"
				? $localize`Released`
				: this.prodOrderPosOperationStatusClass.getStateTranslate(status);
	}

	getComboBoxData() {
		return new Promise((resolve, reject) => {
			let requests: ODataBatchCall[] = [];
			requests.push(
				new ODataBatchCall(
					0,
					"get",
					`\/odata\/Halls?$filter=is_active eq true and is_enabled_plan_visu eq true`
				)
			);
			this.commonService.post("$batch", { requests }).subscribe({
				next: (response: any) => {
					this.halls = response.responses[0].body.value.map(
						(data: Hall) => {
							const hall = new Hall().deserialize(data);
							hall.isSelected = true;
							return hall;
						}
					);
					if (this.halls.length > 0) {
						const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
						if (cachedHall.length) {
							this.halls.forEach(hall => {
								hall.isSelected = cachedHall.includes(hall.id);
							});
						} else {
							this.selectedHalls = [this.halls[0].id!];
							localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
						}
					}

					resolve(true);
				},
				error: e => {},
			});
		});
	}

	selectHall(event: any) {
		this.selectedHalls = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || '');
	}
}
