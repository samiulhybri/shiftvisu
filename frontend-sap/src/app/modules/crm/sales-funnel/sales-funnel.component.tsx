import { AfterViewInit, Component, Inject, NgZone, OnInit, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

// amCharts imports
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent"; // Import for Funnel Chart
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

import { MultiComboBoxSelectionChangeEventDetail } from "@ui5/webcomponents/dist/MultiComboBox";

import { CommonService } from "@app/shared/services/common.service";
import { SalesStatus } from "@app/shared/models/sales-status.model";
import { AuthService } from "@app/shared/services/auth.service";
import { LogicalOperator } from "@app/shared/enums/LogicalOperator";
import { ODataBatchCall } from "@app/shared/models/odata-batch-call";
import { User } from "@app/shared/models/user.model";
import { Country } from "@app/shared/models/country.model";
import { EmployeeClassification } from "@app/shared/models/employee-classification.model";
import { RevenueClassification } from "@app/shared/models/revenue-classification.model";
import { MarketSegment } from "@app/shared/models/market-segment.model";

@Component({
	selector: "app-sales-funnel",
	templateUrl: "./sales-funnel.component.html",
	styleUrls: ["./sales-funnel.component.css"],
})
export class SalesFunnelComponent implements OnInit, AfterViewInit {
	SALES_CUSTOM_ID = "317";
	private root!: am5.Root;
	isLoading = false;
	salesFunnel: any = [];

	isHeaderLoading: boolean = true;

	filterTableNames = [
		"Countries",
		"Users",
		"RevenueClassifications",
		"EmployeeClassifications",
		"MarketSegments",
	];

	allCountries: Country[] = [];
	selectedCountries: (number | string)[] = [];

	allResponsibles: User[] = [];
	selectedResponsibles: (number | string)[] = [];

	allRevenueClasses: RevenueClassification[] = [];
	selectedRevenueClasses: (number | string)[] = [];

	allEmployeeClasses: EmployeeClassification[] = [];
	selectedEmployeeClasses: (number | string)[] = [];

	allMarketSegments: MarketSegment[] = [];
	selectedMarketSegments: (number | string)[] = [];

	baseQuery = "SalesStatuses?$orderby=sort_order desc&$expand=customers";
	query = "";
	customerSelectQuery =
		"$select=id,custom_id,country_id,user_id_responsible,revenue_classification_id,employee_classification_id,market_segment_id";
	constructor(
		@Inject(PLATFORM_ID) private platformId: Object,
		private zone: NgZone,
		public commonService: CommonService,
		private auth: AuthService
	) {}

	ngOnInit(): void {
		this.loadAllDropdownData();
	}

	get user() {
		return this.auth.getUser();
	}

	get defaultCountry() {
		return this.allCountries.find(c => c.name == "Deutschland"); //Default country is Germany now
	}

	buildCondition = (values: (number | string)[] | undefined, field: string) => {
		if (values && values.length > 0) {
			const stringValueQuery = values.map(
				(val: number | string) => `(${field} ${LogicalOperator.EQ} ${val})`
			);
			return stringValueQuery.length > 1
				? `(${stringValueQuery.join(" or ")})`
				: stringValueQuery[0];
		}
		return "";
	};

	loadAllDropdownData() {
		let requests: ODataBatchCall[] = [];

		this.filterTableNames.forEach((item, index) => {
			if (index == 0) {
				requests.push(new ODataBatchCall(index, "get", `\/odata\/${item}`));
			}
			else if (index == 1) {
				requests.push(new ODataBatchCall(index, "get", `\/odata\/Areas?$expand=users($orderby=name)&$filter=is_active eq true and (custom_id eq '${this.SALES_CUSTOM_ID}')`));
			}
			else {
				requests.push(new ODataBatchCall(index, "get", `\/odata\/${item}?$orderby=sort_order`));
			}
		});

		this.commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.allCountries = response.responses[0].body.value.map((country: Country) =>
					new Country().deserialize(country)
				);

				if (response.responses[1].body.value.length && response.responses[1].body.value[0].users) {
					this.allResponsibles = response.responses[1].body.value.length && response.responses[1].body.value[0].users.map((user: User) =>
						new User().deserialize(user)
					);
				}
				else {
					this.allResponsibles = [];
				}

				this.allRevenueClasses = response.responses[2].body.value.map(
					(revenueClassification: RevenueClassification) =>
						new RevenueClassification().deserialize(revenueClassification)
				);
				this.allEmployeeClasses = response.responses[3].body.value.map(
					(employeeClassification: EmployeeClassification) =>
						new EmployeeClassification().deserialize(employeeClassification)
				);
				this.allMarketSegments = response.responses[4].body.value.map(
					(marketSegment: MarketSegment) => new MarketSegment().deserialize(marketSegment)
				);

				this.loadCachedFilters();
				this.generateQuery();
				this.isHeaderLoading = false;
			},
			error: e => {
				console.error(e);
				this.isHeaderLoading = false;
			},
		});
	}

	selectCountry(event: MultiComboBoxSelectionChangeEventDetail) {
		this.selectedCountries = [];
		event.items.forEach((c: any) => {
			this.selectedCountries.push(c.id);
		});
		this.cacheFilterState();
		this.generateQuery();
	}

	selectResponsible(event: MultiComboBoxSelectionChangeEventDetail) {
		this.selectedResponsibles = [];
		event.items.forEach((c: any) => {
			this.selectedResponsibles.push(c.id);
		});
		this.cacheFilterState();
		this.generateQuery();
	}

	selectRevenueClass(event: MultiComboBoxSelectionChangeEventDetail) {
		this.selectedRevenueClasses = [];
		event.items.forEach((c: any) => {
			this.selectedRevenueClasses.push(c.id);
		});

		this.cacheFilterState();
		this.generateQuery();
	}

	selectEmployeeCLass(event: MultiComboBoxSelectionChangeEventDetail) {
		this.selectedEmployeeClasses = [];
		event.items.forEach((c: any) => {
			this.selectedEmployeeClasses.push(c.id);
		});

		this.cacheFilterState();
		this.generateQuery();
	}

	selectMarketSegment(event: MultiComboBoxSelectionChangeEventDetail) {
		this.selectedMarketSegments = [];
		event.items.forEach((c: any) => {
			this.selectedMarketSegments.push(c.id);
		});
		this.cacheFilterState();
		this.generateQuery();
	}

	generateQuery() {
		let customerFilterQuery = "";
		const conditions: string[] = [];

		const countryCondition = this.buildCondition(this.selectedCountries, "country_id");

		const responsibleCondition = this.buildCondition(
			this.selectedResponsibles,
			"user_id_responsible"
		);

		const revenueClassCondition = this.buildCondition(
			this.selectedRevenueClasses,
			"revenue_classification_id"
		);

		const employeeClassCondition = this.buildCondition(
			this.selectedEmployeeClasses,
			"employee_classification_id"
		);

		const marketSegmentCondition = this.buildCondition(
			this.selectedMarketSegments,
			"market_segment_id"
		);

		[
			countryCondition,
			responsibleCondition,
			revenueClassCondition,
			employeeClassCondition,
			marketSegmentCondition,
		].forEach(condition => {
			if (condition) conditions.push(condition);
		});

		if (conditions.length > 0) {
			customerFilterQuery = conditions.join(" and ");
		}

		let customerQuery =
			this.customerSelectQuery +
			(customerFilterQuery ? `;filter=${customerFilterQuery}` : "");
		this.query = this.baseQuery + `(${customerQuery})` + "&$filter=show_in_sales_funnel eq true";

		this.loadData();
	}

	// Run the function only in the browser
	browserOnly(f: () => void) {
		if (isPlatformBrowser(this.platformId)) {
			this.zone.runOutsideAngular(() => {
				f();
			});
		}
	}

	loadData() {
		this.isLoading = true;
		this.commonService.get(this.query).subscribe({
			next: (res: any) => {
				this.salesFunnel = [];

				const value = res.value;

				value?.forEach((salesStatus: SalesStatus) => {
					if (salesStatus.customers?.length) {
						this.salesFunnel.push({
							value: salesStatus.customers?.length || 0,
							category: salesStatus.custom_id,
							color: `#${salesStatus.color}`,
						});
					}
				});

				this.ngAfterViewInit();
				this.isLoading = false;
			},
			error: err => {
				console.error(err);
				this.isLoading = false;
			},
		});
	}

	ngAfterViewInit() {
		this.browserOnly(() => {
			if (this.root) {
				this.root.dispose();
			}

			// Create root element
			const root = am5.Root.new("chartdiv");
			this.root = root;

			root?._logo?.dispose();

			// Set themes
			root.setThemes([am5themes_Animated.new(root)]);

			// Create chart
			const chart = root.container.children.push(
				am5percent.SlicedChart.new(root, {
					layout: root.verticalLayout,
				})
			);

			// Create series
			const series = chart.series.push(
				am5percent.FunnelSeries.new(root, {
					orientation: "vertical",
					valueField: "value",
					categoryField: "category",
				})
			);

			// Update labels to show only the value
			series.labels.template.set("text", "{category}: {value}");
			series.labels.template.set("fontSize", "20px");

			//TODO: Will be added later
			// Set custom colors for each slice
			// series.slices.template.adapters.add("fill", (fill, target) => {
			// 	const dataItem: any = target.dataItem;
			// 	return dataItem?.dataContext?.color || fill; // Use color from dataContext
			// });

			// Set data
			series.data.setAll(this.salesFunnel.reverse());

			// Play initial series animation
			series.appear();

			// Create legend
			const legend = chart.children.push(
				am5.Legend.new(root, {
					centerX: am5.percent(50),
					x: am5.percent(50),
					marginTop: 15,
					marginBottom: 15,
				})
			);

			legend.data.setAll(am5.array.copy(series.dataItems).reverse());

			// Make stuff animate on load
			chart.appear(1000, 100);
		});
	}

	ngOnDestroy() {
		this.browserOnly(() => {
			if (this.root) {
				this.root.dispose();
			}
		});
	}

	cacheFilterState() {
		const filterState = {
			selectedCountries: this.selectedCountries,
			selectedResponsibles: this.selectedResponsibles,
			selectedRevenueClasses: this.selectedRevenueClasses,
			selectedEmployeeClasses: this.selectedEmployeeClasses,
			selectedMarketSegments: this.selectedMarketSegments,
		};
	
		const urlKey = this.getUserSpecificKey();
		localStorage.setItem(urlKey, JSON.stringify(filterState));
	}

	loadCachedFilters() {
		const urlKey = this.getUserSpecificKey();
		const cachedState = localStorage.getItem(urlKey);
	
		if (cachedState) {
			const filters = JSON.parse(cachedState);

			this.selectedCountries = (filters.selectedCountries?.length ? filters.selectedCountries : this.defaultCountry ? [`${this.defaultCountry?.id}`] : []).filter(
				(countryId: string | number) =>
					this.allCountries.some(country => country.id == countryId)
			);
	
			this.selectedResponsibles = (filters.selectedResponsibles || []).filter(
				(responsibleId: string | number) =>
					this.allResponsibles.some(user => user.id == responsibleId)
			);

			this.selectedRevenueClasses = (filters.selectedRevenueClasses || []).filter(
				(revenueClassId: string | number) =>
					this.allRevenueClasses.some(revenueClass => revenueClass.id == revenueClassId)
			);

	
			this.selectedEmployeeClasses = (filters.selectedEmployeeClasses || []).filter(
				(employeeClassId: string | number) =>
					this.allEmployeeClasses.some(employeeClass => employeeClass.id == employeeClassId)
			);
	
			this.selectedMarketSegments = (filters.selectedMarketSegments || []).filter(
				(marketSegmentId: string | number) =>
					this.allMarketSegments.some(marketSegment => marketSegment.id == marketSegmentId)
			);
		}
		else {
			this.selectedCountries = this.defaultCountry ? [`${this.defaultCountry?.id}`] : [];
		}
		// Reset the cache
		this.cacheFilterState();
	}

	getUserSpecificKey(): string {
		const urlPath = window.location.pathname;
		const userId = this.auth.getUser().id;
		return `${urlPath}_${userId}`;
	}
	
}
