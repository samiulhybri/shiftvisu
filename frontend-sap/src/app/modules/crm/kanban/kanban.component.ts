import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, ElementRef, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { GenericTagType } from "@app/shared/components/generic-tag/generic-tag-type";
import { ProdOrderPosStatus } from "@app/shared/enums/ProdOrderPosStatus";
import { Country } from "@app/shared/models/country.model";
import { Customer } from "@app/shared/models/customer.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { MachineClassification } from "@app/shared/models/machine-classification.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { ProdOrderPos } from "@app/shared/models/prod-order-pos.model";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import { User } from "@app/shared/models/user.model";
import { DateFormatPipe } from "@app/shared/pipes/date-format.pipe";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import moment from "moment";
import { debounceTime, distinctUntilChanged, Subject, switchMap, tap } from "rxjs";

@Component({
	selector: "app-kanban",
	templateUrl: "./kanban.component.html",
	styleUrl: "./kanban.component.css",
})
export class KanbanComponent {
	public dates: string[] = [];
	public customers?: Customer[] = [];
	public numberOfDays: number = 7;
	public type = GenericTagType;
	@ViewChild("salesRef") salesRef: any;
	SALES_CUSTOM_ID = "317";
	searchedValue: string = "";
	filteredCustomers?: any = [];
	salesStatus: SalesStatus[] = [];
	salesStatusAll: SalesStatus[] = [];
	selectedSalesStatusList: any[] = [];
	prevSelectedSalesStatus?: any[] = [];
	startDate: Date = new Date();
	endDate?: Date;
	formatedEndDate: string = "";
	formatedCurrentDate: string = moment(this.startDate).format("YYYY-MM-DD");
	isLoading: boolean = false;
	customerLists?: any = [];
	firstDayOfMonth = moment(
		new Date(this.startDate.getFullYear(), this.startDate.getMonth(), 1)
	).format("YYYY-MM-DD");
	lastDayOfMonth = moment(
		new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 2, 0)
	).format("YYYY-MM-DD");
	isViewDialogOpen = false;
	public selectedOrder!: ProdOrderPos;
	public isWeek: boolean = true;
	selectedCustomer!: Customer;
	isDialogOpen: boolean = false;
	localization = Localization;
	dialogTitle: string = this.localization.edit;
	users: User[] = [];
	selectedUsersIds: string[] = [];
	countries: Country[] = [];
	selectedCountriesIds: string[] = [];
	revenueClassifications: RevenueClassification[] = [];
	selectedRClassificationsIds: string[] = [];
	employeeClassifications: EmployeeClassification[] = [];
	selectedEClassificationsIds: string[] = [];
	machineClassifications: MachineClassification[] = [];
	potentialClassifications: PotentialClassification[] = [];
	marketSegments: MarketSegment[] = [];
	selectedMSegmentsIds: string[] = [];
	skip: number = 0;
	top: number = 200;
	showPopOver: boolean = false;
	showheaderPopOver: boolean = false;
	opener: string = "";
	popoverText: string = "";

	@ViewChild("headerContainer", { static: true }) headerContainer!: ElementRef;
	@ViewChild("headerTitle", { static: true }) headerTitle!: ElementRef;
	@ViewChild("headerItems", { static: true }) headerItems!: ElementRef;
	@ViewChild("overflowButton", { static: true }) overflowButton!: ElementRef;
	@ViewChild("overflowPopover", { static: true }) overflowPopover!: any;
	@ViewChild("popoverList", { static: true }) popoverList!: any;

	private searchSubject = new Subject<string>(); // Subject to handle search input changes

	constructor(
		public route: ActivatedRoute,
		public commonService: CommonService,
		public dateFormatPipe: DateFormatPipe,
		private _toasterSrv: ToastService,
		private _authService: AuthService
	) {
		this.searchSubject
			.pipe(
				debounceTime(800),
				distinctUntilChanged(), // Only emit if the value has changed
				switchMap(async searchTerm => this.loadBacklogAndSchduleData()) // Make API call
			)
			.subscribe({
				next: () => {
					this.isLoading = false;
				},
				error: () => {
					this.isLoading = false;
				},
			});
	}

	ngOnInit(): void {
		this.generateDates();
		this.loadCachedFilters();
		this.loadData();
        this.loadBacklogAndSchduleData();
	}

	loadBacklogAndSchduleData() {
		this.setBacklogData();
		this.setScheduledData();
	}

	// Listen header items to detect overflow
	setupResizeObserver() {
		const container = this.headerContainer.nativeElement;
		const items = this.headerItems.nativeElement;
		const overflowButton = this.overflowButton.nativeElement;

		const observer = new ResizeObserver(() => {
			const containerWidth = container.clientWidth;
			const itemsWidth = items.scrollWidth;

			const hasOverflow = itemsWidth > containerWidth;
			if (hasOverflow) {
				overflowButton.classList.remove("hidden");
				this.moveOverflowItems();
			} else {
				overflowButton.classList.add("hidden");
				this.restoreItems();
			}
		});
		observer.observe(container);
	}

	moveOverflowItems() {
		const items = this.headerItems.nativeElement.children;
		const popoverListItems = this.popoverList.nativeElement.children;

		const containerWidth = this.headerContainer.nativeElement.clientWidth;
		const headerWidth = this.headerTitle.nativeElement.offsetWidth;

		const OVERFLOW_BTN_WIDTH = 50;
		let cumulativeWidth = headerWidth + OVERFLOW_BTN_WIDTH;
		let index = 0;
		for (let item of items) {
			cumulativeWidth += item.offsetWidth;

			if (cumulativeWidth > containerWidth) {
				item.style.display = "none";
				popoverListItems[index].style.display = "block";
			} else {
				item.style.display = "block";
			}
			index++;
		}
	}

	restoreItems() {
		const items = this.headerItems.nativeElement.children;
		const popoverListItems = this.popoverList.nativeElement.children;

		if (popoverListItems?.length) {
			for (let item of popoverListItems) {
				item.style.display = "none";
			}
		}

		for (let item of items) {
			item.style.display = "block";
		}
	}

	openFilterPopover(event: any) {
		this.showheaderPopOver = true;
	}
	headerPopOverClose(event: any) {
		this.showheaderPopOver = false;
	}

	generateDates(): string[] {
		this.dates = []; // Clear existing dates

		if (this.isWeek) {
			this.numberOfDays = 7; // Set to 7 days for weekly view
			const today = new Date();
			for (let i = 0; i < this.numberOfDays; i++) {
				const nextDate = new Date(today);
				nextDate.setDate(today.getDate() + i);
				this.dates.push(moment(nextDate).format("YYYY-MM-DD"));
			}
			this.endDate = new Date(this.dates[this.dates.length - 1]);
		} else {
			this.numberOfDays = 1; // Set to 1 day for daily view
			this.dates.push(moment().format("YYYY-MM-DD"));
			this.endDate = new Date(); // Today's date
		}

		this.formatedEndDate = moment(this.endDate).format("YYYY-MM-DD");
		return this.dates;
	}

	onLoadMore() {
		if (!this.searchedValue) {
			this.setBacklogData();
		}
	}


	onSearchInput(event: any) {
        this.skip = 0;
		if (event.target) {
			this.searchedValue = event.target.typedInValue;
			this.searchSubject.next(this.searchedValue); // Emit the search term to the Subject
			this.isLoading = true; // Show loading indicator immediately
		} else {
			this.searchedValue = "";
			this.searchSubject.next(this.searchedValue); // Emit empty string to clear results
			this.isLoading = true;
		}
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
			this.skip = 0;
			this.loadBacklogAndSchduleData();
		}
	}

	setBacklogData() {
		let url = `customer/backlog?$top=${this.top}&$skip=${this.skip}`;
		if (this.selectedCountriesIds.length) {
			url += ` &countries=${this.selectedCountriesIds.join(",")}`;
		}
		if (this.selectedRClassificationsIds.length) {
			url += ` &revenue_classifications=${this.selectedRClassificationsIds.join(",")}`;
		}
		if (this.selectedEClassificationsIds.length) {
			url += ` &employee_classifications=${this.selectedEClassificationsIds.join(",")}`;
		}
		if (this.selectedMSegmentsIds.length) {
			url += ` &market_segments=${this.selectedMSegmentsIds.join(",")}`;
		}
		if (this.selectedUsersIds.length) {
			url += ` &user_responsibles=${this.selectedUsersIds.join(",")}`;
		}

		if (this.selectedSalesStatusList.length) {
			url += ` &sales_statuses=${this.selectedSalesStatusList.map(sales => sales.id).join(",")}`;
		}

        if (this.searchedValue) {
			url += `&searchValue=${this.searchedValue}`;
		}

		this.isLoading = true;

		this.commonService.get(url, false).subscribe({
			next: (data: any) => {
				if (this.skip == 0) {
					this.customerLists = data;
				} else {
					this.customerLists = [...(this.customerLists as any), ...data];
				}
				this.skip += this.top;
				this.isLoading = false;
			},
		});
	}

	setScheduledData() {
		let url = `customer/schedule?date_follow_up_until=${moment(this.endDate).format("YYYY-MM-DD")}`;
		if (this.selectedCountriesIds.length) {
			url += ` &countries=${this.selectedCountriesIds.join(",")}`;
		}
		if (this.selectedRClassificationsIds.length) {
			url += ` &revenue_classifications=${this.selectedRClassificationsIds.join(",")}`;
		}
		if (this.selectedEClassificationsIds.length) {
			url += ` &employee_classifications=${this.selectedEClassificationsIds.join(",")}`;
		}
		if (this.selectedMSegmentsIds.length) {
			url += ` &market_segments=${this.selectedMSegmentsIds.join(",")}`;
		}
		if (this.selectedUsersIds.length) {
			url += ` &user_responsibles=${this.selectedUsersIds.join(",")}`;
		}

		if (this.selectedSalesStatusList.length) {
			url += ` &sales_statuses=${this.selectedSalesStatusList.map(sales => sales.id).join(",")}`;
		}

        if (this.searchedValue) {
            url += `&searchValue=${this.searchedValue}`;
        }

         this.isLoading = true;

		this.commonService.get(url, false).subscribe({
			next: (data: any) => {
				this.filteredCustomers = data;
				this.isLoading = false;
			},
		});
	}

	loadData() {
		this.isLoading = true;
		let requests: ODataBatchCall[] = [];
		const valueToBeAdded =
			(this.filteredCustomers?.length ?? 0) === 0
				? this.top
				: Math.max(this.filteredCustomers?.length ?? 0, this.top);

		let customerFilter = `is_active eq true and salesStatus/any(a:a/show_in_kanban eq true)`;
		// Update filter conditions
		customerFilter = this.updateFilterQuery(customerFilter);

		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata`
			)
		),
			requests.push(
				new ODataBatchCall(
					1,
					"get",
					`\/odata\/Areas?$expand=users($orderby=name)&$filter=is_active eq true and (custom_id eq '${this.SALES_CUSTOM_ID}')`
				)
			),
			requests.push(
				new ODataBatchCall(
					2,
					"get",
					`\/odata\/Countries?$expand=topCustomer($select=custom_id)`
				)
			),
			requests.push(
				new ODataBatchCall(
					3,
					"get",
					`\/odata\/RevenueClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
				)
			),
			requests.push(
				new ODataBatchCall(
					4,
					"get",
					`\/odata\/EmployeeClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
				)
			),
			requests.push(
				new ODataBatchCall(
					5,
					"get",
					`\/odata\/MachineClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
				)
			),
			requests.push(
				new ODataBatchCall(
					6,
					"get",
					`\/odata\/PotentialClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
				)
			);
		requests.push(
			new ODataBatchCall(
				7,
				"get",
				`\/odata\/MarketSegments?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				7,
				"get",
				`\/odata\/SalesStatuses?$orderby=sort_order`
			)
		);
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {

				if (
					response.responses[1].body.value.length &&
					response.responses[1].body.value[0].users
				) {
					this.users =
						response.responses[1].body.value.length &&
						response.responses[1].body.value[0].users.map((user: User) =>
							new User().deserialize(user)
						);
				} else {
					this.users = [];
				}

				this.countries = response.responses[2].body.value.map((country: Country) =>
					new Country().deserialize(country)
				);
				this.revenueClassifications = response.responses[3].body.value.map(
					(revenueClassification: RevenueClassification) =>
						new RevenueClassification().deserialize(revenueClassification)
				);
				this.employeeClassifications = response.responses[4].body.value.map(
					(employeeClassification: EmployeeClassification) =>
						new EmployeeClassification().deserialize(employeeClassification)
				);
				this.machineClassifications = response.responses[5].body.value.map(
					(machineClassification: MachineClassification) =>
						new MachineClassification().deserialize(machineClassification)
				);
				this.potentialClassifications = response.responses[6].body.value.map(
					(potentialClassification: PotentialClassification) =>
						new PotentialClassification().deserialize(potentialClassification)
				);
				this.marketSegments = response.responses[7].body.value.map(
					(marketSegment: MarketSegment) => new MarketSegment().deserialize(marketSegment)
				);
				this.salesStatus = response.responses[8].body.value
					.filter((salesStatus: SalesStatus) => salesStatus.show_in_kanban == true)
					.map((salesStatus: SalesStatus) => new SalesStatus().deserialize(salesStatus));
				this.salesStatusAll = response.responses[8].body.value.map(
					(salesStatus: SalesStatus) => new SalesStatus().deserialize(salesStatus)
				);
				this.syncFilterValues();
				this.isLoading = false;
			},

			error: e => {
				console.error(e);
				this.isLoading = false;
			},
		});
	}

	onSelectSaleStatus(event: any) {
		this.selectedSalesStatusList = event.items.map((el: any, i: number) => {
			return {
				id: +el.ariaValueText,
				text: el.text || el.textContent, // Get the text value
				index: i,
			};
		}) as { id: number; text: string }[];
		this.cacheFilterState();
        this.loadBacklogAndSchduleData();
	}

	dropCustomer(event: CdkDragDrop<any>, date?: any, status?: any) {
		const customerId = event?.item?.element?.nativeElement?.id;
		const newReleaseDate = moment.utc(date).format("yyyy-MM-DD");

		let currentCustomer: any = this.getCurrentCustomerFromSchedule(parseInt(customerId));
		if (!currentCustomer?.data) {
			currentCustomer = this.customerLists?.find(
				(customer:any) => customer.id == parseInt(customerId)
			);

			let currentCustomerIndex = this.customerLists?.findIndex(
				(customer:any) => customer.id == parseInt(customerId)
			);

			currentCustomer.salesStatus = status;
			currentCustomer.salesStatus.custom_id = status.text;
			currentCustomer.date_follow_up = newReleaseDate;

			this.setCustomerForSchedule(currentCustomer, status.id, date);
			this.customerLists?.splice(currentCustomerIndex!, 1);
		} else {
            this.filteredCustomers.data[currentCustomer.index[0]].salesStatuses[
				currentCustomer.index[1]
			].data.splice(currentCustomer.index[2], 1);
			currentCustomer.data.salesStatus = status;
			currentCustomer.data.date_follow_up = newReleaseDate;
            this.setCustomerForSchedule(currentCustomer.data,status.id,date);
		}

		this.commonService
			.put(`Customers(${customerId})`, {
				date_follow_up: newReleaseDate,
				sales_status_id: status?.id,
			})
			.subscribe({
				next: (response: any) => {
					this.skip = 0;
					this.searchedValue = "";
				},
				error: e => {
					console.error("Error Update ProdOrderPos: ", e);
				},
			});
	}

    setCustomerForSchedule(customer:any, salesStatusId:number, date:any) {

        this.filteredCustomers!.data!.forEach((element: any, index1: number) => {
			if (date == element.date) {
				element.salesStatuses.forEach((salesStatus: any, index2: number) => {
					if (salesStatus.id == salesStatusId) {
						salesStatus.data.push(customer);
					}
				});
			}
		});

    }

    getCurrentCustomerFromSchedule(id:number) {
        let customer;
        this.filteredCustomers!.data!.forEach((element: any, index1: number) => {
			element.salesStatuses.forEach((salesStatus: any, index2: number) => {
				salesStatus.data.forEach((cus: any, index3: number) => {
					if (cus.id == id) {
						customer = {
							data: cus,
							index: [index1, index2, index3],
						};
					}
				});
			});
		});

        return customer
    }

	weekDayChange() {
		this.isWeek = !this.isWeek;
		this.generateDates();
		this.skip = 0;
		this.searchedValue = "";
		this.loadBacklogAndSchduleData();
	}

	customerDetails(data: any) {
		this.selectedCustomer = data;
		this.isViewDialogOpen = true;
		this.isDialogOpen = true;
	}

	closeViewDialog() {
		this.isViewDialogOpen = false;
	}
	closeDialog() {
		this.isDialogOpen = false;
		this.selectedCustomer = <Customer>{};
		this.skip = 0;
		this.searchedValue = "";
	}

	onMouseEnter(opener: string, value?: string, customer?: Customer) {
		this.opener = opener + "-" + customer?.id + "-" + value;
		this.showPopOver = false;

		switch (this.opener) {
			case `customerName-${customer?.id}-${customer?.name}`:
				this.popoverText = customer?.name || ""; // Set popover text
				break;
			case `salesStatus-${customer?.id}-${customer?.salesStatus?.custom_id}`:
				this.popoverText = customer?.salesStatus?.custom_id || "";
				break;
			case `filteredCustomerName-${customer?.id}-${customer?.name}`:
				this.popoverText = customer?.name || "";
				break;
			case `filteredSalesStatus-${customer?.id}-${customer?.salesStatus?.custom_id}`:
				this.popoverText = customer?.salesStatus?.custom_id || "";
				break;
			default:
				this.popoverText = $localize`No Data`;
		}

		setTimeout(() => {
			this.showPopOver = true;
		}, 5);

        const elements = document.querySelectorAll("[tabindex]");

		elements.forEach(element => {
			element.removeAttribute("tabindex");
		});
	}

	onMouseLeave() {
		this.showPopOver = false;

        const elements = document.querySelectorAll("[tabindex]");

		elements.forEach(element => {
			element.removeAttribute("tabindex");
		});
	}

	handleCustomerUpdated(updatedCustomer: {
		id: number | undefined;
		date_follow_up: string | undefined;
		sales_status_id: number | null;
	}) {
        this.skip = 0;
        this.loadBacklogAndSchduleData()
	}

	updateFilterQuery(filter: string): string {
		if (this.selectedCountriesIds.length) {
			filter += ` and country_id in (${this.selectedCountriesIds.join(",")})`;
		}
		if (this.selectedRClassificationsIds.length) {
			filter += ` and revenue_classification_id in (${this.selectedRClassificationsIds.join(",")})`;
		}
		if (this.selectedEClassificationsIds.length) {
			filter += ` and employee_classification_id in (${this.selectedEClassificationsIds.join(",")})`;
		}
		if (this.selectedMSegmentsIds.length) {
			filter += ` and market_segment_id in (${this.selectedMSegmentsIds.join(",")})`;
		}
		if (this.selectedUsersIds.length) {
			filter += ` and user_id_responsible in (${this.selectedUsersIds.join(",")})`;
		}
		return filter;
	}

	selectCountry(event: any) {
		this.skip = 0;
		this.selectedCountriesIds = [];
		this.selectedCountriesIds = event.items.map((c: any) => c.id);
		this.cacheFilterState();
		this.loadBacklogAndSchduleData();
	}

	selectRevenueClassification(event: any) {
		this.skip = 0;
		this.selectedRClassificationsIds = [];
		this.selectedRClassificationsIds = event.items.map((c: any) => c.id);
		this.cacheFilterState();
		this.loadBacklogAndSchduleData();
	}

	selectEmployeeClassification(event: any) {
		this.skip = 0;
		this.selectedEClassificationsIds = [];
		this.selectedEClassificationsIds = event.items.map((c: any) => c.id);
		this.cacheFilterState();
		this.loadBacklogAndSchduleData();
	}

	selectMarketSegment(event: any) {
		this.skip = 0;
		this.selectedMSegmentsIds = [];
		this.selectedMSegmentsIds = event.items.map((c: any) => c.id);
		this.cacheFilterState();
		this.loadBacklogAndSchduleData();
	}

	selectResponsibleUser(event: any) {
		this.skip = 0;
		this.selectedUsersIds = [];
		this.selectedUsersIds = event.items.map((c: any) => c.id);
		this.cacheFilterState();
		this.loadBacklogAndSchduleData();
	}

	cacheFilterState() {
		const filterState = {
			selectedCountriesIds: this.selectedCountriesIds,
			selectedUsersIds: this.selectedUsersIds,
			selectedRClassificationsIds: this.selectedRClassificationsIds,
			selectedEClassificationsIds: this.selectedEClassificationsIds,
			selectedMSegmentsIds: this.selectedMSegmentsIds,
			selectedSalesStatusList: this.selectedSalesStatusList,
		};

		const urlKey = this.getUserSpecificKey();
		localStorage.setItem(urlKey, JSON.stringify(filterState));
	}

	loadCachedFilters() {
		const urlKey = this.getUserSpecificKey();
		const cachedState = localStorage.getItem(urlKey);

		if (cachedState) {
			const filters = JSON.parse(cachedState);

			this.selectedUsersIds = filters.selectedUsersIds || [];
			this.selectedCountriesIds = filters.selectedCountriesIds || [];
			this.selectedRClassificationsIds = filters.selectedRClassificationsIds || [];
			this.selectedEClassificationsIds = filters.selectedEClassificationsIds || [];
			this.selectedMSegmentsIds = filters.selectedMSegmentsIds || [];
			this.selectedSalesStatusList = filters.selectedSalesStatusList || [];
		}
		// Reset the cache
		this.cacheFilterState();
	}

	getUserSpecificKey(): string {
		const urlPath = window.location.pathname;
		const userId = this._authService.getUser().id;
		return `${urlPath}_${userId}`;
	}

	syncFilterValues() {
		this.selectedUsersIds = this.selectedUsersIds.filter((responsibleId: string | number) =>
			this.users.some(user => user.id == responsibleId)
		);
		this.selectedCountriesIds = this.selectedCountriesIds.filter((countryId: string | number) =>
			this.countries.some(country => country.id == countryId)
		);
		this.selectedRClassificationsIds = this.selectedRClassificationsIds.filter(
			(revenueClassId: string | number) =>
				this.revenueClassifications.some(revenueClass => revenueClass.id == revenueClassId)
		);
		this.selectedEClassificationsIds = this.selectedEClassificationsIds.filter(
			(employeeClassId: string | number) =>
				this.employeeClassifications.some(
					employeeClass => employeeClass.id == employeeClassId
				)
		);
		this.selectedMSegmentsIds = this.selectedMSegmentsIds.filter(
			(marketSegmentId: string | number) =>
				this.marketSegments.some(marketSegment => marketSegment.id == marketSegmentId)
		);
		this.selectedSalesStatusList = this.selectedSalesStatusList.filter((selectedStatus: any) =>
			this.salesStatus.some(status => status.id == selectedStatus.id)
		);
	}

	isIncludes(items: any, id: any) {
		return items.some((item: any) => item.id == id);
	}
}
