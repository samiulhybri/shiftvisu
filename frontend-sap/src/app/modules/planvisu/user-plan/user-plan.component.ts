import { Component, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DateFormatPipe } from "@app/shared/pipes/date-format.pipe";
import { CommonService } from "@app/shared/services/common.service";
import { TruncatePipe } from "@app/shared/pipes/truncate.pipe";
import { ToastService } from "@app/shared/services/toaster.service";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { AuthService } from "@app/shared/services/auth.service";
import { ToolRepairStatus } from "@app/modules/tool-visu/enums/ToolRepairStatus";
import { GenericTagType } from "@app/shared/components/generic-tag/generic-tag-type";
import { ProdOrderPosOperationStatusClass } from "@app/shared/enums/ProdOrderPosOperationStatus";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import { Machine } from "@app/shared/models/machine.model";
import moment from "moment";
import { Hall } from "@app/shared/models/hall.model";
import { User } from "@app/shared/models/user.model";

@Component({
	selector: "app-user-plan",
	templateUrl: "./user-plan.component.html",
	styleUrl: "./user-plan.component.css",
})
export class UserPlanComponent {
	searchedValue: string = "";

	startDate: Date = new Date();
	formatedCurrentDate: string = moment(this.startDate).format("YYYY-MM-DD");
	firstDayOfMonth = moment(this.startDate).subtract(1, "months").format("YYYY-MM-DD");
	lastDayOfMonth = moment(this.startDate).add(1, "months").format("YYYY-MM-DD");
	formatedEndDate: string = "";
	endDate?: Date;
	public dates: string[] = [];
	public numberOfDays: number = 7;

	machines: any[] = [];
	filteredMachines?: any[] = [];

	users: any[] = [];
	filteredUsers?: any[] = [];

	selectedHalls: number[] = [];
	halls: Hall[] = [];

	selectedUsers: number[] = [];
	comboBoxUsers: User[] = [];

	selectedMachines: number[] = [];
	comboBoxMachines: Machine[] = [];

	selectedOperation: ProdOrderPosOperation = new ProdOrderPosOperation().deserialize({
		prodOrderPos: { quantity: 0, prodOrder: { custom_id: "" } },
	});
	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;
	operationStart?: string = "";
	operationEnd?: string = "";
	backlogMachines: any[] = [];

	@ViewChild("orderDetailsDialog") orderDetailsDialog?: any;

	isLoading: boolean = false;
	isDialogOpen: boolean = false;
	selecteItem?: string = "";
	dialogTitle: string = "";
	public type = GenericTagType;
	truncatePipe = new TruncatePipe();

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
			this.loadData();
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
					mach.prodOrderPosOperations?.some((operation: any) =>
						operation?.prodOrderPos?.prodOrder?.custom_id
							.toLowerCase()
							.includes(this.searchedValue)
					) ||
					mach.prodOrderPosOperations.some(
						(operation: any) =>
							operation?.itemTool?.custom_id
								.toLowerCase()
								.includes(this.searchedValue) ||
							operation?.itemTool?.name.toLowerCase().includes(this.searchedValue)
					)
				);
			}
			return false;
		});
	}

	getComboBoxData() {
		
		return new Promise((resolve, reject) => {
			this.isLoading = true;
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
					this.halls = response.responses[0].body.value.map((data: Hall) => {
						const hall = new Hall().deserialize(data);
						hall.isSelected = true;
						return hall;
					});

					if (this.halls.length > 0) {
						const cachedHall = JSON.parse(localStorage.getItem("Hall") || "[]");
						if (cachedHall.length) {
							this.halls.forEach(hall => {
								hall.isSelected = cachedHall.includes(hall.id);
							});
							this.selectedHalls = cachedHall;
						} else {
							this.selectedHalls = [this.halls[0].id!];
							localStorage.setItem("Hall", JSON.stringify(this.selectedHalls));
						}
					}
					this.getHallMachine();
					this.getHallUsers();
					this.isLoading = false;
					resolve(true);
				},
				error: e => {
					console.log(e);
					this.isLoading = false;
				},
			});
		});
	}

	getHallMachine(){
		this.commonService.get(this.getLodataMachineQuery()).subscribe({
			 next:(res:any)=>{
				 this.comboBoxMachines = res.value?.filter(
					 (d: any) =>
						 d.sectionActivatables.length > 0 &&
						 d.sectionActivatables[0].is_active == true
				 ).map(
					(machine: Machine) => {
						machine.isSelected = false;
						return machine;
					}
				);
			 }
		})
	 }
	 getHallUsers(){
		this.commonService.get(this.getLodataUserQuery()).subscribe({
			 next:(res:any)=>{
				 this.comboBoxUsers = res.value?.map((data: User) => {
					data.isSelected = false
					return data;
				});
			 }
		})
	 }

	 getLodataMachineQuery() {
		return `Machines?$filter=is_active eq true${this.getSelectedMachineQuery()} ${this.selectedHalls.length > 0 ? `and ${this.getHallQuery()}` : ""}&$expand=sectionActivatables($filter=section eq 'PLANVISU' and is_active eq true)&$top=1000&orderby=sort_order asc`;
	}
	getLodataUserQuery() {
		return `Users?$filter=is_active eq true ${this.selectedHalls.length > 0 ? `and ${this.getHallQuery()}` : ""}`;
	}
	getHallQuery() {
		
		return this.selectedHalls.length ? `hall_id in (${this.selectedHalls.join(",")})` : "";
	}
	getSelectedMachineQuery(){
		const query =  this.selectedMachines.join(",");
	    return  this.selectedMachines.length ? ` and id in (${query})` : ""
	}

	selectHall(event: any) {
		this.selectedHalls = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
		localStorage.setItem("Hall", JSON.stringify(this.selectedHalls) || "");
		this.getHallMachine();
		this.getHallUsers();
	}

	selectUser(event: any) {
		this.selectedUsers = event.srcElement.selectedValues.map((el: any) => +el.id) as number[];
	}

	selectMachine(event: any) {
		this.selectedMachines = event.srcElement.selectedValues.map(
			(el: any) => +el.id
		) as number[];
	}

	changeStartDate(event: Event) {
		this.startDate = new Date((event as any).target.dateValue);
	}

	changeEndDate(event: Event) {
		this.endDate = new Date((event as any).target.dateValue);
	}

	dateFilter() {
		if (this.startDate && this.endDate) {
			this.dates = this.generateDatesBetween(this.startDate, this.endDate);
			this.searchedValue = "";
			this.loadData();
		}
	}

	processDateFormat(date: string) {
		return moment(date).format("ddd MMM DD YYYY");
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

	closeDialog() {
		this.isDialogOpen = false;
	}

	loadData() {
		this.isLoading = true;
		this.setOpertions()
			.then(() => {
				this.isLoading = false;
			})
			.catch(error => {
				console.error("Error loading data: ", error);
				this.isLoading = false;
			});
	}

	getTitleWithValue(machineUserTime: any, title: string) {
		const machineName = machineUserTime?.machine?.name ?? "";
		switch (title) {
			case "Machine":
				return `${$localize`Machine`}: ${machineUserTime?.machine?.custom_id ?? ""} - ${this.truncatePipe.transform(machineName, 25)}`;
			case "Start Date":
				return `${$localize`Start`}: ${machineUserTime?.start_time ? moment.utc(machineUserTime?.start_time).local().format("DD.MM.YYYY, HH:mm") : ""} `;
			case "End Date":
				return `${$localize`Start`}: ${machineUserTime?.end_time ? moment.utc(machineUserTime?.end_time).local().format("DD.MM.YYYY, HH:mm") : ""} `;
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

	setOpertions() {
		this.isLoading = true;
		const body = {};
		return new Promise<void>((resolve, reject) => {
			const hall = this.halls
				.filter((hall: any) => hall?.isSelected)
				.map((hall: any) => hall.id);
			const selectedHallIds = this.selectedHalls.length > 0 ? this.selectedHalls : hall;
			const selectedUsers = this.selectedUsers.length > 0 ? this.selectedUsers : [];
			const selectedMachines = this.selectedMachines.length > 0 ? this.selectedMachines : [];
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
				hall_ids: selectedHallIds,
				user_ids: selectedUsers,
				machine_ids: selectedMachines,
			};

			this.commonService
				.post(`plan_visu/get-machine-user-plan-times`, payload, false)
				.subscribe({
					next: (data: any) => {
						this.users = data;
						this.filteredUsers = [...this.users];
						this.isLoading = false;
						resolve();
					},
					error: (error: any) => {
						console.error("Error fetching machine operations: ", error);
						this.isLoading = false;
						reject();
					},
				});
		});
	}
}
