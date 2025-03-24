import { Component, OnInit } from "@angular/core";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { Router } from "@angular/router";
import { Section } from "@app/shared/interfaces/section";
import { SideBarRoute } from "@app/modules/tool-visu/enums/SideBarRoute";
import { environment } from "@app/environments/environment";
import { User } from "@app/shared/models/user.model";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";

@Component({
	selector: "app-tool-visu",
	templateUrl: "./tool-visu.component.html",
	styleUrl: "./tool-visu.component.css",
})
export class ToolVisuComponent implements OnInit {
	public dynamicHomeRouteLink = environment.homeLink;
	public sidenav: Element | null | undefined;
	public sections: Section[] = [];
	public isLogOutDialogOpen = false;
	public isBusy:boolean= false;
	private authUser!: User;
	public isSideNavCollapsed: boolean = false;
	public sidebar: any[] = [
		{
			id: "toolRepair",
			text: $localize`Add Tool Repair`,
			icon: "add-equipment",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_REPAIR_VIEW),
			selected_condition: this.router.url === '/tool-visu' || this.router.url === '/tool-visu/tool-repair', 
		},
		{
			id: "plannedOrders",
			text: $localize`Planned Orders`,
			icon: "request",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_PLANNED_ORDERS_VIEW),
			selected_condition: this.router.url === '/tool-visu/planned-orders', 
		},
		{
			id: "orderHistory",
			text: $localize`Order History`,
			icon: "customer-history",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_ORDER_HISTORY_VIEW),
			selected_condition: this.router.url === '/tool-visu/order-history', 
		},
		{
			id: "toolOverview",
			text: $localize`Tool Overview`,
			icon: "org-chart",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_OVERVIEW_VIEW),
			selected_condition: this.router.url === '/tool-visu/overview', 
		},
		{
			id: "toolSchedule",
			text: $localize`Tool Repair Schedule`,
			icon: "appointment",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_TOOL_SCHEDULE_VIEW),
			selected_condition: this.router.url === '/tool-visu/tool-schedule', 
		},
		{
			id: "settings",
			text: $localize`Settings`,
			icon: "settings",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TOOLVISU_SETTINGS_VIEW),
			selected_condition: this.router.url === '/tool-visu/settings', 
		},
	];

	constructor(
		public router: Router,
		public authService: AuthService,
		public commonService: CommonService
	) {}

	ngAfterViewInit(): void {
		if(this.router.url == '/tool-visu') this.router.navigate(["tool-visu", "tool-repair"]);
	}

	ngOnInit() {
		this.authUser = this.authService.getUser();
	}

	public navigateSection(sectionName: string) {
		switch (sectionName) {
			case SideBarRoute.ToolRepair:
				this.router.navigate(["tool-visu", "tool-repair"]);
				break;
			case SideBarRoute.PlannedOrders:
				this.router.navigate(["tool-visu", "planned-orders"]);
				break;
			case SideBarRoute.OrderHistory:
				this.router.navigate(["tool-visu", "order-history"]);
				break;
			case SideBarRoute.ToolOverview:
				this.router.navigate(["tool-visu", "overview"]);
				break;
			case SideBarRoute.ToolSchedule:
				this.router.navigate(["tool-visu", "tool-schedule"]);
				break;
			case SideBarRoute.Settings:
				this.router.navigate(["tool-visu", "settings"]);
				break;
			default:
				this.router.navigate(["tool-visu", ""]);
				break;
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
				if(environment.isV10enable || environment.isV9enable){

					window.location.href = environment.homeLink
				}else{
					this.router.navigate(["/login"], { replaceUrl: true });
				}
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	onChangeSidebar() {
		this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
}
