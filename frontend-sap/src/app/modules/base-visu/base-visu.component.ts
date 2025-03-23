import { Component, HostListener, OnInit } from "@angular/core";
import { SideBarRoute } from "./enums/SideBarRoute";
import { NavigationEnd, NavigationExtras, Router } from "@angular/router";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { Section } from "@app/shared/interfaces/section";
import SideNavigationItem from "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { filter } from "rxjs";

@Component({
	selector: "app-base-visu",
	templateUrl: "./base-visu.component.html",
	styleUrl: "./base-visu.component.css",
})
export class BaseVisuComponent implements OnInit {
	isLogOutDialogOpen = false;
	isBusy = false;
	isCapacityPlan = false;
	baseVisuMachineView = PermissionEnum.BASEVISU_MACHINES_VIEW;
	baseVisuPrintersView = PermissionEnum.BASEVISU_PRINTERS_VIEW;
	baseVisuTerminalsView = PermissionEnum.BASEVISU_TERMINALS_VIEW;
	baseVisuItemStatesView = PermissionEnum.BASEVISU_ITEM_STATES_VIEW;
	baseVisuMachineGroupView = PermissionEnum.BASEVISU_MACHINE_GROUPS_VIEW;
	baseVisuMachineStateView = PermissionEnum.BASEVISU_MACHINE_STATES_VIEW;
	baseVisuMachineStateGroupsView = PermissionEnum.BASEVISU_MACHINE_STATE_GROUPS_VIEW;
	baseVisuTPMGroupsView = PermissionEnum.BASEVISU_TPM_GROUPS_VIEW;
	baseVisuTPM_SUBGroupsView = PermissionEnum.BASEVISU_TPM_SUB_GROUPS_VIEW;
	baseVisuItemView = PermissionEnum.BASEVISU_ITEMS_VIEW;
	baseVisuItemGroupsView = PermissionEnum.BASEVISU_ITEM_GROUPS_VIEW;
	baseVisuToolsView = PermissionEnum.BASEVISU_TOOLS_VIEW;
	baseVisuUsersView = PermissionEnum.BASEVISU_USERS_VIEW;
	baseVisuUserGroupsView = PermissionEnum.BASEVISU_USER_GROUPS_VIEW;
	baseVisuQualificationsView = PermissionEnum.BASEVISU_QUALIFICATIONS_VIEW;
	baseVisuHallsView = PermissionEnum.BASEVISU_HALLS_VIEW;
	baseVisuPlantsView = PermissionEnum.BASEVISU_PLANTS_VIEW;
	baseVisuStorageLocationView = PermissionEnum.BASEVISU_STORAGE_LOCATION_VIEW;
	baseVisuWarehouseView = PermissionEnum.BASEVISU_WAREHOUSE_VIEW;
	baseVisuStorageTypeView = PermissionEnum.BASEVISU_STORAGE_TYPE_VIEW;
	baseVisuStorageSectionView = PermissionEnum.BASEVISU_STORAGE_SECTION_VIEW;
	baseVisuStorageBinView = PermissionEnum.BASEVISU_STORAGE_BIN_VIEW;
	baseVisuProductionSupplyAreaView = PermissionEnum.BASEVISU_PRODUCTION_SUPPLY_AREA_VIEW;
	baseVisuCustomersView = PermissionEnum.BASEVISU_CUSTOMERS_VIEW;
	baseVisuCustomerGroupsView = PermissionEnum.BASEVISU_CUSTOMER_GROUPS_VIEW;
	baseVisuSuppliersView = PermissionEnum.BASEVISU_SUPPLIERS_VIEW;
	baseVisuEnergyConsumersView = PermissionEnum.BASEVISU_ENERGY_CONSUMERS_VIEW;
	baseVisuEnergyMeterView = PermissionEnum.BASEVISU_ENERGY_METER_VIEW;
	baseVisuCruciblesView = PermissionEnum.BASEVISU_CRUCIBLES_VIEW;
	baseVisuSettingsView = PermissionEnum.BASEVISU_SETTINGS_VIEW;
	baseVisuRolesView = PermissionEnum.BASEVISU_ROLES_VIEW;
	baseVisuPermissionsView = PermissionEnum.BASEVISU_PERMISSIONS_VIEW;
	baseVisuShiftModelsView = PermissionEnum.BASEVISU_SHIFT_MODELS_VIEW;
	baseVisuShiftView = PermissionEnum.BASEVISU_SHIFT_VIEW;
	baseVisuCapacitiesView = PermissionEnum.BASEVISU_CAPACITIES_VIEW;
	baseVisuStandardValueKeyView = PermissionEnum.BASEVISU_STANDARD_VALUE_KEY_VIEW;
	baseVisuItemStateGroupView = PermissionEnum.BASEVISU_ITEM_STATE_GROUP_VIEW;
	baseVisuLanguagesView = PermissionEnum.BASEVISU_LANGUAGES_VIEW;
	baseVisuCountriesView = PermissionEnum.BASEVISU_COUNTRIES_VIEW;
	baseVisuNotificationGroupView = PermissionEnum.BASEVISU_NOTIFICATION_GROUPS_VIEW;
	baseVisuTransportOrderTypeView = PermissionEnum.BASEVISU_TRANSPORT_ORDER_TYPE_VIEW;
	baseVisuHallCapacitySettingView = PermissionEnum.BASEVISU_HALL_CAPACITY_SETTINGS_VIEW;
	baseVisuItemTypeView = PermissionEnum.BASEVISU_ITEM_TYPES_VIEW;
	permissionEnums = PermissionEnum;

	public isSideNavCollapsed = false;

	private expandCounter = 0;
	private sidenav: Element | null | undefined;
	private sections: Section[] = [];
	private sideNavObservers: MutationObserver[] = [];
	private isCtrlOrCmdPressed = false;

	constructor(
		public router: Router,
		public authService: AuthService,
		public commonService: CommonService
	) {}

	ngAfterViewInit(): void {
		this.sidenav = document.querySelector("ui5-side-navigation");
		this.findAllSections();

		// Call once on initialization to set the initial state
		this.handleResizeOrLoad();
		this.removeFocusableFromHiddenElements();
		this.router.url === "/base-visu"
			? this.autoSelectFirstChildNav()
			: this.expandSectionWithUrl();

		if (
			this.router.url === "/base-visu/capacity-plan" ||
			this.router.url === "/base-visu/shift-model"
		)
			this.isCapacityPlan = true;

		const navItems : NodeListOf<HTMLElement> = this.sidenav?.querySelectorAll('ui5-side-navigation-item') as NodeListOf<HTMLElement>;
		this.sideNavItemExpandListener(navItems);
	}

	ngOnInit(): void {
		window.addEventListener("resize", () => this.handleResizeOrLoad);
		window.addEventListener("load", () => this.handleResizeOrLoad);
		window.addEventListener('focus', (event) => { this.removeFocusableFromHiddenElements(); },true);		 
		this.router.events
		.pipe(filter(event => event instanceof NavigationEnd))
		.subscribe((event: any) => {
			this.expandSectionWithUrl();
		});

		// Listen for keydown events
		window.addEventListener('keydown', (event: KeyboardEvent) => {
			this.isCtrlOrCmdPressed = event.ctrlKey || event.metaKey;
		});

		// Listen for keyup events to reset the flag
		window.addEventListener('keyup', () => {
			this.isCtrlOrCmdPressed = false;
		});
	}
	
	ngOnDestroy(): void {
		this.sideNavObservers.forEach(observer => observer.disconnect());
	}

	@HostListener("window:resize", ["$event"])
	onResize() {
		this.handleResizeOrLoad();
	}

	public handleResizeOrLoad() {
		const screenWidth = window.innerWidth;
		if (screenWidth <= 1124) {
			// Increase the breakpoint because of FNA's 10-inch tab
			this.collapseNavItem();
		} else {
			this.expandNavItem();
		}
	}

	public removeFocusableFromHiddenElements(): void {
		const hiddenElements = document.querySelectorAll('[aria-hidden="true"]');
		hiddenElements.forEach((item) => {
			item.setAttribute('aria-hidden', 'false');
			item.removeAttribute('aria-hidden');
		});
	}
	public findAllSections() {
		if (!this.sidenav) return [];
		const navItems = this.sidenav.querySelectorAll("ui5-side-navigation-item");

		navItems.forEach(item => {
			const mainSection: Section = {
				id: item.id,
				text: item.getAttribute("text") || "",
				icon: item.getAttribute("icon") || "",
				subItems: [],
			};

			const subItems = item.querySelectorAll("ui5-side-navigation-sub-item");
			subItems.forEach(subItem => {
				mainSection.subItems.push({
					id: subItem.id,
					text: subItem.getAttribute("text") || "",
				});
			});
			this.sections.push(mainSection);
		});
		return this.sections;
	}

	expandSectionWithUrl() {
		const url = window.location.href;
		const basevisuIndex = url.indexOf("/base-visu/");
		if (basevisuIndex >= 0) {
			const parameter = url.substring(basevisuIndex + "/base-visu/".length);
			const parameterParts = parameter.split("/");
			let matchedSection: Section | null = null;
			for (let section of this.sections) {
				for (let subSection of section.subItems) {
					const name = subSection.id;
					const urlString = parameterParts[0];
					const newStr = name.replace("SubItem", "");
					const str = newStr.replace(/([A-Z])/g, "-$1").toLowerCase();
					if (str === urlString) {
						matchedSection = section;
						break;
					}
				}
				if (matchedSection) {
					break;
				}
			}
			if (matchedSection) {
				const navItems = this.sidenav?.querySelectorAll("ui5-side-navigation-item");
				navItems?.forEach((item, i) => {
					const openItem = navItems[i] as SideNavigationItem;
					if (item.id === matchedSection?.id) {
						openItem.expanded = true;
					} else openItem.expanded = false;
				});
			}
			return parameterParts[0];
		}
		return null;
	}

	autoSelectFirstChildNav() {
		const navItems = this.sidenav?.querySelectorAll("ui5-side-navigation-item");
		if (navItems && navItems[0]) {
			const first = navItems[0] as SideNavigationItem;
			first.expanded = true;

			const firstChildId = this.sections[0].subItems[0].id;
			this.navigateSection(firstChildId, { replaceUrl: true });
		}
	}

	public sideNavigationSelectionChange(event: Event): void {
		if (this.isCtrlOrCmdPressed) { 
			event.preventDefault();
		}
		const selectedItemId = (<CustomEvent>event).detail.item.id;
		const item = (<CustomEvent>event).detail.item as any;
		item.expanded = true;
		this.navigateSection(selectedItemId);
		item.toggleAttribute("expanded", "true");

		for (let section of this.sections) {
			if (section.id === selectedItemId) setTimeout(() => item.removeAttribute("selected"));
		}
	}

	transformString(input: string) {
		const lowerCased = input.toLowerCase();
		const transformed = lowerCased.replace(/-/g, " ");
		return transformed;
	}

	navigateSection(sectionName: string, extras?: NavigationExtras) {
		this.isCapacityPlan = false;

		// Define a mapping for section routes
		const sectionRoutes: { [key: string]: string } = {
			[SideBarRoute.MachineSubItem]: "machine",
			[SideBarRoute.MachineGroupSubItem]: "machine-group",
			[SideBarRoute.MachineStateSubItem]: "machine-state",
			[SideBarRoute.MachineStateGroupsSubItem]: "machine-state-groups",
			[SideBarRoute.ItemStatesSubItem]: "item-states",
			[SideBarRoute.TpmGroupsSubItem]: "tpm-groups",
			[SideBarRoute.ToolsSubItem]: "tools",
			[SideBarRoute.ItemSubItem]: "item",
			[SideBarRoute.itemGroupSubItem]: "item-group",
			[SideBarRoute.itemTypeSubItem]: "item-type",
			[SideBarRoute.ItemSerialNumberSubItem]: "serial-number-profile",
			[SideBarRoute.SuppliersSubItem]: "suppliers",
			[SideBarRoute.CustomerSubItem]: "customer",
			[SideBarRoute.CustomerGroupSubItem]: "customer-group",
			[SideBarRoute.RevenueClassificationsSubItems]: "revenue-classifications",
			[SideBarRoute.EmployeeClassificationsSubItem]: "employee-classifications",
			[SideBarRoute.PotentialClassificationsSubItem]: "potential-classifications",
			[SideBarRoute.MachineClassificationsSubItem]: "machine-classifications",
			[SideBarRoute.SalesStatusSubItems]: "sales-status",
			[SideBarRoute.MarketSegmentsSubItems]: "market-segments",
			[SideBarRoute.CrmActionsSubItem]: "crm-actions",
			[SideBarRoute.EnergyConsumerSubItem]: "energy-consumer",
			[SideBarRoute.EnergyConsumerGroupsSubItems]: "energy-consumer-groups",
			[SideBarRoute.CrucibleSubItem]: "crucible",
			[SideBarRoute.PrinterSubItem]: "printer",
			[SideBarRoute.TerminalSubItem]: "terminal",
			[SideBarRoute.Permission]: "permission",
			[SideBarRoute.Role]: "role",
			[SideBarRoute.Qualifications]: "qualifications",
			[SideBarRoute.UserSubItem]: "user",
			[SideBarRoute.UserGroupSubItem]: "user-group",
			[SideBarRoute.UserCapacitiesSubItem]: "user-capacities",
			[SideBarRoute.ShiftModelSubItem]: "shift-model",
			[SideBarRoute.NotificationGroupSubItem]: "notification-group",
			[SideBarRoute.TransportOrderTypeSubItem]: "transport-order-types",
			[SideBarRoute.ShiftSubItem]: "shift",
			[SideBarRoute.CapacitiesSubItem]: "capacities",
			[SideBarRoute.HallCapacitySettingSubItem]: "hall-capacity-setting",
			[SideBarRoute.SettingsSubItem]: "settings",
			[SideBarRoute.LanguagesSubItem]: "languages",
			[SideBarRoute.CountriesSubItem]: "countries",
			[SideBarRoute.HallSubItem]: "hall",
			[SideBarRoute.PlantSubItem]: "plant",
			[SideBarRoute.StorageLocationSubItem]: "storage-location",
			[SideBarRoute.WarehouseSubItem]: "warehouse",
			[SideBarRoute.StorageTypeSubItem]: "storage-type",
			[SideBarRoute.StorageSectionSubItem]: "storage-section",
			[SideBarRoute.StorageBinSubItem]: "storage-bin",
			[SideBarRoute.ProductionSupplyAreaSubItem]: "production-supply-area",
			[SideBarRoute.TPMSubGroupsSubItem]: "tpm-sub-groups",
			[SideBarRoute.StandardValueKeySubItem]: "standard-value-key",
			[SideBarRoute.ItemStateGroupSubItem]: "item-state-group",
			[SideBarRoute.ItemOpsControlProfilesSubItem]: "operation-control-profiles",
			[SideBarRoute.EnergyMeterSubItem]: "energy-meter",
			[SideBarRoute.CategoriesSubItem]: "customer-categories",
			[SideBarRoute.AreaSubItem]: "areas",
		};

		const nestedSections: { [key: string]: string } = {
			[SideBarRoute.Machine]: "machine",
			[SideBarRoute.Logistics]: "logistics",
			[SideBarRoute.Tools]: "tools",
			[SideBarRoute.Parts]: "parts",
			[SideBarRoute.Suppliers]: "suppliers",
			[SideBarRoute.Customer]: "customer",
			[SideBarRoute.Energy]: "energy",
			[SideBarRoute.Crucible]: "crucible",
			[SideBarRoute.Printing]: "printer",
			[SideBarRoute.User]: "user",
			[SideBarRoute.Settings]: "settings",
			[SideBarRoute.Capacity]: "capacity",
		};

		// Navigate based on route mapping
		if (sectionRoutes[sectionName]) {
			const url = ["base-visu", sectionRoutes[sectionName]];

			if (this.isCtrlOrCmdPressed) {
				const CurrentLanguage = localStorage.getItem("CurrentLanguage") || "en";
				const newUrl = [...url];
				newUrl.unshift(CurrentLanguage);
				const fullUrl = this.router.serializeUrl(this.router.createUrlTree(newUrl, extras));			
				window.open(fullUrl, '_blank')
			} else {
				this.router.navigate(url, extras);
			}
		} else if (nestedSections[sectionName]) {
			const nestedSection = this.sections.find((item) => item.id === nestedSections[sectionName]);
			if (nestedSection) {
				this.navigateSection(nestedSection.subItems[0].id, extras);
			}
		}

		if (
			sectionName === SideBarRoute.ShiftModelSubItem ||
			sectionName === SideBarRoute.CapacitiesSubItem
		) {
			this.isCapacityPlan = true;
		}
	}

	menuButtonClicked() {
		if (this.sidenav) {
			this.sidenav.toggleAttribute("collapsed");
		}
	}

	collapseNavItem(): void {
		if (this.sidenav) {
			this.sidenav.setAttribute("collapsed", "");
		}
	}

	expandNavItem(): void {
		if (this.sidenav) {
			this.sidenav.removeAttribute("collapsed");
		}
	}

	logoutDialogOpen() {
		this.isLogOutDialogOpen = true;
	}

	closeDialog() {
		this.isLogOutDialogOpen = false;
	}

	logOut() {
		this.isBusy = true;
		this.authService.logout().then(
			() => {
				this.isBusy = false;
				this.closeDialog();
				this.router.navigate(["/login"], { replaceUrl: true });
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	/**
	 * Sets up an observer to listen for expand/collapse changes on the given SideNavigationItems.
	 * When an item is expanded, navigate to the corresponding section.
	 * @param {NodeListOf<HTMLElement>} items - The SideNavigationItems to observe.
	 */
	private sideNavItemExpandListener(items : NodeListOf<HTMLElement>) {
		items.forEach((item: HTMLElement) => {
			const observer = new MutationObserver(() => {
				this.expandCounter++;
				if (this.expandCounter < 2) return;
				const screenWidth = window.innerWidth;
				// Check if the screen width is less than or equal to 1124px
				if (screenWidth > 1124 && item.hasAttribute('expanded')) {
					// Navigate to the section associated with the expanded item
					this.navigateSection(item.children[0].id, { replaceUrl: true });
				}
			});

			observer.observe(item, {
				attributes: true, // Monitor attribute changes
				attributeFilter: ['expanded'], // Specifically monitor the 'expanded' attribute
			});
			this.sideNavObservers.push(observer);
		});
	}
	
	sideNavItemCollapse(expandOnly: boolean = false) {
		if (expandOnly) this.isSideNavCollapsed = false;
        else this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
	
}
