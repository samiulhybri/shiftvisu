import { Component, ElementRef, ViewChild } from "@angular/core";
import {
	CustomReactGridTable,
	GridTableColumnDataType,
} from "@app/shared/components/CustomGridTable";
import { CommonService } from "@app/shared/services/common.service";
import { AuthService } from "@app/shared/services/auth.service";
import { Country } from "@app/shared/models/country.model";
import { CustomerGroup } from "@app/shared/models/customer-group.model";
import { Customer } from "@app/shared/models/customer.model";
import { DeliveryTerm } from "@app/shared/models/delivery-term.model";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { PaymentTerm } from "@app/shared/models/payment-term.model";
import { SalesArea } from "@app/shared/models/sales-area.model";
import { SalesGroup } from "@app/shared/models/sales-group.model";
import { Sector } from "@app/shared/models/sector.model";
import { ConfigService } from "@app/shared/services/config.service";
import { ToastService } from "@app/shared/services/toaster.service";
import ValueState from "@ui5/webcomponents-base/dist/types/ValueState";
import { Localization } from "@app/shared/utils/common-localize";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { MachineClassification } from "@app/shared/models/machine-classification.model";
import { PotentialClassification } from "@app/shared/models/potential-classification.model";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import { User } from "@app/shared/models/user.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";
import React from "react";
import { Button, FlexBox, Form, Text  } from "@ui5/webcomponents-react";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import moment, { Moment } from "moment";
import { CustomerCategory } from "@app/shared/models/customer-category.model";

@Component({
	selector: "app-crm-page",
	templateUrl: "./crm-page.component.html",
	styleUrl: "./crm-page.component.css",
})
export class CrmPageComponent {
	private lastClickTime: number = 0;
	private clickCount: number = 0;
	private singleClickTimeout: any;
	idText: string = Localization.id;
	nameText: string = Localization.name;
	activeText: string = Localization.active;
	addText: string = Localization.add;
	editText: string = Localization.edit;
	isUpdate?: boolean = false;
	isDialogOpen: boolean = false;
	dialogTitle: string = Localization.add;
	customId?: string;
	deletItemId = "";
	filterQuery = "";
	isLoading: boolean = false;
	isUpdateDialog?: boolean;
	value!: string;
	autoIncrementId!: string;
	deliveryTerm: DeliveryTerm[] = [];
	paymentTerm: PaymentTerm[] = [];
	salesAreas: SalesArea[] = [];
	salesGroup: SalesGroup[] = [];
	country: Country[] = [];
	customerGroup: CustomerGroup[] = [];
	sector: Sector[] = [];
	revenueClassifications: RevenueClassification[] = [];
	employeeClassifications: EmployeeClassification[] = [];
	machineClassifications: MachineClassification[] = [];
	potentialClassifications: PotentialClassification[] = [];
	salesStatus: SalesStatus[] = [];
	marketSegment: MarketSegment[] = [];
	category: CustomerCategory[] = [];
	createdDates:any = [];
	followUpDates:any = [];
	users: User[] = [];
	customIdState: keyof typeof ValueState = "None";
	customIdValueStateText: string = Localization.idIsRequired;
	isLoadingCustomId: boolean = false;
	errorDialogCustomer: boolean = false;
	deleteDialogCustomer: boolean = false;
	customerConfig?: any = {};
	isPreviewDialogOpen: boolean = false;
	selectedResponsible = [];
	selectedCountry = [];
	selectedCategory= [];
	selectedDateActivity!: Moment;
	selectedSizeOfCompany = [];
	public fileCount: number = 0;
	localization = Localization;
	isNoteDialogOpen:boolean = false;
  	customerNote: string = '';
	SALES_CUSTOM_ID = "317";
	@ViewChild("errorDialogTPMSubGroups", { static: false }) errorDialogTPMSubGroups: any;
	@ViewChild("gridTable") gridTable?: CustomReactGridTable;
	@ViewChild("childComponentRef", { static: false }) childComponent:
		| CustomReactGridTable
		| undefined;
	
	selectedCustomer: Customer = new Customer().deserialize({});
	columns: any = [
		{
			Header: this.activeText,
			accessor: "is_active",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Center",
			dataType: GridTableColumnDataType.Boolean,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: this.idText,
			accessor: "custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: this.nameText,
			accessor: "name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Address`,
			accessor: "address",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Postal Code`,
			accessor: "postal_code",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Country`,
			accessor: "country.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 30,
			autoResizable: true,
		},
		{
			Header: $localize`City`,
			accessor: "city",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Telephone`,
			accessor: "telephone",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Website`,
			accessor: "website",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.String,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Date Follow Up`,
			accessor: "date_follow_up",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.MultipleDate,
			minWidth: 30,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData?.date_follow_up ? moment(rowData.date_follow_up).format("DD.MM.YYYY") : null}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Revenue Classification`,
			accessor: "revenueClassification.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			width: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Machine Classification`,
			accessor: "machineClassification.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			width: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Employee Classification`,
			accessor: "employeeClassification.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Potential Classification`,
			accessor: "potentialClassification.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			width: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Sales Status`,
			accessor: "salesStatus.custom_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			width: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Responsible User`,
			accessor: "responsibleUser.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Market Segment`,
			accessor: "marketSegment.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: true,
			dataType: GridTableColumnDataType.NestedString,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`External id`,
			accessor: "external_id",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.String,
			minWidth: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Customer Category`,
			accessor: "category.name",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.NestedString,
			width: 50,
			autoResizable: true,
		},
		{
			Header: $localize`Created Date`,
			accessor: "created_at",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			isSelected: false,
			dataType: GridTableColumnDataType.MultipleDate,
			minWidth: 30,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
					<React.StrictMode>
						<FlexBox>
							<Text>{rowData?.created_at ? moment(rowData.created_at).format("DD.MM.YYYY") : null}</Text>
						</FlexBox>
					</React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Note`,
			accessor: "note",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			dataType: GridTableColumnDataType.String,
			minWidth: 50,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				return (
				  <React.StrictMode>
					<div className="w-full text-center">
						<Button design='Transparent' icon='hint' onClick={() => this.openNoteModal(rowData.note)}></Button>
					</div>
				  </React.StrictMode>
				);
			},
		},
		{
			Header: $localize`Attachment`,
			accessor: "...",
			disableFilters: false,
			disableGroupBy: true,
			disableSortBy: false,
			hAlign: "Left",
			minWidth: 50,
			autoResizable: true,
			Cell: (instance: { cell: any; row: any; webComponentsReactProperties: any }) => {
				const { row } = instance;
				const rowData = row.original;
				let totalAttachments: any[] = [];

				rowData?.media?.map((item: any) => {
					totalAttachments.push(item.id);
				});
				if (totalAttachments.length > 0) {
					return (
						<React.StrictMode>
							<div className="w-full text-center">
								<Button
									icon="attachment"
									onClick={() => this.showPreview(rowData, totalAttachments.length)}>
									{totalAttachments.length + $localize` Files`}
								</Button>
							</div>
						</React.StrictMode>
					);
				} else return null;
			},
		},
	];

	disableButtonDuringRequest: boolean = false;

	constructor(
		public commonService: CommonService,
		public authService: AuthService,
		private configService: ConfigService,
		public _toasterSrv: ToastService
	) {
		this.customerConfig = this.configService.getConfigValue("customers");
	}

	public filterHandler(
		fieldName: string = "",
		value: string = "",
		filterOperator: string = "Contain"
	) {
		this.childComponent?.onFilterAndSorting(fieldName, value, filterOperator);
	}

	responsible = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};
	countries = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};
	categories = {
		textAccessor: "name",
		idAccessor: "id",
		data: [],
	};
	sizeOfCompany = {
		textAccessor: "name",
		idAccessor: "id",
		data: [] as EmployeeClassification[],
	};

	statusMode = "active";

	ngAfterViewInit(): void {
		this.batchCall();
	}

	ngOnInit() {
		this.loadResponsible();
		this.loadCountries();
		this.loadCompany();
		this.loadCategory();
	}

	refreshButtonClick() {
		this.loadResponsible();
		this.loadCountries();
		this.loadCompany();
		this.loadCategory();
		this.batchCall();

		if (this.gridTable) {
			this.gridTable.skip = 0;
			this.gridTable.top = 40; 
		}
		this.gridTable?.onPagination(true);
	}

	ngOnDestroy() {
		if (this.singleClickTimeout) clearTimeout(this.singleClickTimeout);
	}

	multiSelectOneSelectionChange(event: any) {
		this.selectedResponsible = event.detail.items.map((item: any) => item.id);
		this.generateQuery();
	}
	multiSelectTwoSelectionChange(event: any) {
		this.selectedSizeOfCompany = event.detail.items.map((item: any) => item.id);
		this.generateQuery();
	}
	multiSelectThreeSelectionChange(event: any) {
		this.selectedCountry = event.detail.items.map((item: any) => item.id);
		this.generateQuery();
	}
	multiSelectFourSelectionChange(event: any) {
		this.selectedCategory = event.detail.items.map((item: any) => item.id);
		this.generateQuery();
	}

	generateQuery() {
		this.filterQuery = ``;
		const conditions: string[] = [];

		const buildCondition = (values: string[] | undefined, field: string) => {
			if (values && values.length > 0) {
				const stringValueQuery = values.map(
					(val: string) => `(${field} ${LogicalOperator.EQ} ${val})`
				);
				return stringValueQuery.length > 1
					? `(${stringValueQuery.join(" or ")})`
					: stringValueQuery[0];
			}
			return "";
		};

		const responsibleCondition = buildCondition(
			this.selectedResponsible,
			"user_id_responsible"
		);
		const sizeCondition = buildCondition(
			this.selectedSizeOfCompany,
			"employee_classification_id"
		);
		const countryCondition = buildCondition(this.selectedCountry, "country_id");
		const categoryCondition = buildCondition(this.selectedCategory, "customer_category_id");

		const activityLogCondition = this.selectedDateActivity?.isValid() ? `(customerCrmActionLogs/any(a:a/updated_at le '${this.selectedDateActivity.endOf('day').format('YYYY-MM-DD HH:mm:ss')}'))` : '';

		[responsibleCondition, sizeCondition, countryCondition, activityLogCondition, categoryCondition].forEach(condition => {
			if (condition) conditions.push(condition);
		});

		if (conditions.length > 0) {
			this.filterQuery = conditions.join(" and ");
		}
		
		this.gridTable!.filterQuery = this.filterQuery;
		this.gridTable?.onFilterAndSorting();
	}

	loadResponsible() {
		this.commonService.get(`Areas?$expand=users($orderby=name)&$filter=is_active eq true and (custom_id eq '${this.SALES_CUSTOM_ID}')`).subscribe({
			next: (data: any) => {
				this.responsible.data = data.value.length && data.value[0].users ? data.value[0].users : [];
				this.gridTable?.render();
			},
		});
	}

	loadCompany() {
		this.commonService
			.get("EmployeeClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)")
			.subscribe({
				next: (data: any) => {
					this.sizeOfCompany.data = data.value;
					this.gridTable?.render();
				},
			});
	}
	loadCountries() {
		this.commonService.get("Countries?$filter=is_active eq true&$orderby=name asc").subscribe({
			next: (data: any) => {
				this.countries.data = data.value;
				this.gridTable?.render();
			},
		});
	}
	loadCategory() {
		this.commonService.get("CustomerCategories?$filter=is_active eq true").subscribe({
			next: (data: any) => {
				this.categories.data = data.value;
				this.gridTable?.render();
			},
		});		
	}

	batchCall() {
		let requests: ODataBatchCall[] = [];
		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/Countries?$orderby=name&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/RevenueClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/EmployeeClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				3,
				"get",
				`\/odata\/MachineClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				4,
				"get",
				`\/odata\/PotentialClassifications?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(
				5,
				"get",
				`\/odata\/SalesStatuses?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		requests.push(
			new ODataBatchCall(6, "get", `\/odata\/Areas?$expand=users($orderby=name)&$filter=is_active eq true and (custom_id eq '${this.SALES_CUSTOM_ID}')`)
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
				8,
				"get",
				`\/odata\/CustomerCategories?$orderby=sort_order&$expand=topCustomer($select=custom_id)`
			)
		);
		this.commonService.get("crm/get-dates?table_name=customers&column_name=created_at", false).subscribe({
			next:(res)=>{
				this.createdDates = res;
			}
		})
		this.commonService.get("crm/get-dates?table_name=customers&column_name=date_follow_up", false).subscribe({
			next:(res)=>{
				this.followUpDates = res;
			}
		})
		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.country = response.responses[0]?.body.value.map((country: Country) =>
					new Country().deserialize(country)
				);

				this.revenueClassifications = response.responses[1]?.body.value.map(
					(revenueClassification: RevenueClassification) =>
						new RevenueClassification().deserialize(revenueClassification)
				);
				this.employeeClassifications = response.responses[2]?.body.value.map(
					(employeeClassification: EmployeeClassification) =>
						new EmployeeClassification().deserialize(employeeClassification)
				);
				this.machineClassifications = response.responses[3]?.body.value.map(
					(machineClassification: MachineClassification) =>
						new MachineClassification().deserialize(machineClassification)
				);
				this.potentialClassifications = response.responses[4]?.body.value.map(
					(potentialClassification: PotentialClassification) =>
						new PotentialClassification().deserialize(potentialClassification)
				);
				this.salesStatus = response.responses[5]?.body.value.map(
					(salesStatus: SalesStatus) => new SalesStatus().deserialize(salesStatus)
				);

				if (response.responses[6]?.body?.value[0]?.users?.length) {
					this.users = response.responses[6].body.value[0].users.map((user: User) =>
						new User().deserialize(user)
					);
				}

				this.marketSegment = response.responses[7]?.body.value.map(
					(marketSegment: MarketSegment) => new MarketSegment().deserialize(marketSegment)
				);
				this.category = response.responses[8]?.body.value.map(
					(category: CustomerCategory) => new CustomerCategory().deserialize(category)
				);

				this.columns[5].comboBoxValues = this.country.map((country: Country) => country.name);
				this.columns[10].comboBoxValues = this.revenueClassifications.map((revenueClassification: RevenueClassification) => revenueClassification.name);
				this.columns[11].comboBoxValues = this.machineClassifications.map((machineClassification: MachineClassification) => machineClassification.name);
				this.columns[12].comboBoxValues = this.employeeClassifications.map((employeeClassification: EmployeeClassification) => employeeClassification.name);
				this.columns[13].comboBoxValues = this.potentialClassifications.map((potentialClassification: PotentialClassification) => potentialClassification.name);
				this.columns[14].comboBoxValues = this.salesStatus.map((salesStatus: SalesStatus) => salesStatus.custom_id);
				this.columns[15].comboBoxValues = this.users.map((user: User) => user.name);
				this.columns[16].comboBoxValues = this.marketSegment.map((marketSegment: MarketSegment) => marketSegment.name);
				this.columns[18].comboBoxValues = this.category.map((category: CustomerCategory) => category.name);
				this.columns[19].comboBoxValues = this.createdDates;
				this.columns[9].comboBoxValues = this.followUpDates;

			},
			error: () => {},
		});
	}

	showPreview(customer: Customer, totalFiles: number) {
		this.fileCount = totalFiles;
		this.selectedCustomer = new Customer().deserialize(customer);
		this.isPreviewDialogOpen = true;
	}

	closeAttachmentDialog() {
		this.isPreviewDialogOpen = false;
	}

	async newButtonClick() {
		this.selectedCustomer = new Customer().deserialize({});
		this.isUpdate = false;
		this.dialogTitle = Localization.add;
		this.selectedCustomer.custom_id = this.customId;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;

		if (!this.customId) {
			this.selectedCustomer.custom_id = "";
		}
		this.isDialogOpen = true;
	}

	deleteClick(value: any): void {
		this.deletItemId = value.id;
		this.deleteDialogCustomer = true;
	}

	deleteSubmit() {
		this.disableButtonDuringRequest = true;
		this.isLoading = true;
		this.commonService.delete(`/Customers(${this.deletItemId})`).subscribe({
			next: () => {
				this.closeDialogDelete();
				this.isLoading = false;
				this.filterHandler();
				this.disableButtonDuringRequest = false;

				this._toasterSrv.showToast(this.localization.recordDeleted, "success");
			},
			error: () => {
				this.disableButtonDuringRequest = false;
				this.isLoading = false;
				this.closeDialogDelete();
				this.errorDialogCustomer = true;
			},
		});
	}

	closeErrorDialog() {
		this.errorDialogCustomer = false;
	}

	closeDialogDelete() {
		this.deleteDialogCustomer = false;
	}

	editClick(value: any) {
		this.dialogTitle = Localization.edit;
		this.selectedCustomer = new Customer().deserialize(value);

		this.isDialogOpen = true;
		this.isUpdate = true;
		this.customIdState = "None";
		this.disableButtonDuringRequest = false;
	}

	closeDialog() {
		this.isDialogOpen = false;
	}

	openNoteModal(note:any){
		this.isNoteDialogOpen = true;
		this.customerNote = note;
	}

	closeNoteDialog(){
		this.isNoteDialogOpen = false;
	}

	/**
 	* Handle row click to detect single and double clicks
 	* @param event
 	*/
	handleRowClick(event: any): void {
		const DOUBLE_CLICK_DELAY = 300;
		const now = Date.now();
		this.clickCount++;

		if (this.clickCount === 1) {
			this.singleClickTimeout = setTimeout(() => {
				if (this.clickCount === 1) {
					const rowData: Customer = event?.detail?.row?.original;
					this.handleSingleClick(rowData);
				}
				// Reset the click count after timeout
				this.clickCount = 0;
			}, DOUBLE_CLICK_DELAY);
		} else if (this.clickCount === 2) {
			clearTimeout(this.singleClickTimeout);
			// Reset click count
			this.clickCount = 0; 

			const rowData: Customer = event?.detail?.row?.original;
			this.handleDoubleClick(rowData);
		}
		this.lastClickTime = now;
	}
	/**
	 * On row single-click
	 * @param rowData
	 */
	handleSingleClick(rowData: Customer): void {
		
	}
	
	/**
	 * On row double-click
	 * @param rowData
	 */
	handleDoubleClick(rowData: Customer): void {
		this.dialogTitle = 'Edit';
		this.selectedCustomer = new Customer().deserialize(rowData);
		this.isDialogOpen = true;
		this.isUpdate = true;
		this.customIdState = 'None';
		this.disableButtonDuringRequest = false;
	}

	onChangeDatePicker(event: any) {
		this.selectedDateActivity = moment(event.detail.value);
		this.generateQuery();
	}
  
}
