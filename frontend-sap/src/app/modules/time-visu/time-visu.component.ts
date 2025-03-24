import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { Section } from "@app/shared/interfaces/section";
import { AuthService } from "@app/shared/services/auth.service";
import { CommonService } from "@app/shared/services/common.service";
import { environment } from "@app/environments/environment";
import { User } from "@app/shared/models/user.model";

@Component({
	selector: "app-time-visu",
	templateUrl: "./time-visu.component.html",
	styleUrl: "./time-visu.component.css",
})
export class TimeVisuComponent implements OnInit {
	private authUser!: User;
	PermissionEnum = PermissionEnum;
	public isLogOutDialogOpen: boolean = false;
	isBusy: boolean = false;
	public sections: Section[] = [];
	public dynamicHomeRouteLink = environment.homeLink;
	public isSideNavCollapsed = false;
	public sidebar: any[] = [
		{
			id: "time-record",
			text: $localize`Time Record`,
			icon: "gantt-bars",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TIMEVISU_TIME_RECORD_VIEW),
			selected_condition: this.router.url === 'time-visu' || this.router.url === '/time-visu/time-record', 
		},
		{
			id: "toolvisu-hours-report",
			text: $localize`Report Hours ToolVisu`,
			icon: "manager-insight",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TIMEVISU_REPORT_HOURS_TOOLVISU),
			selected_condition: this.router.url === 'time-visu/report-hours-toolvisu', 
		},
		{
			id: "employee-hours-report",
			text: $localize`Report Hours Employee`,
			icon: "manager-insight",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TIMEVISU_REPORT_HOURS_EMPLOYEE),
			selected_condition: this.router.url === 'time-visu/report-hours-employee', 
		},
		{
			id: "project-hours-report",
			text: $localize`Report Hours Projects (TaskVisu)`,
			icon: "manager-insight",
			subItems: [],
			show_condition: this.authService.isPermissionValid(PermissionEnum.TIMEVISU_REPORTS_HOURS_PROJECTS),
			selected_condition: this.router.url === 'time-visu/report-hours-project-tasks', 
		},
	];

	constructor(
		public router: Router,
		private route: ActivatedRoute,
		public authService: AuthService
	) {}

	ngOnInit(): void {
		this.authUser = this.authService.getUser();
		if (this.authService.isPermissionValid(PermissionEnum.TIMEVISU_VIEW)) {
			this.router.navigate(["time-record"], {
				relativeTo: this.route,
				replaceUrl: true,
			});
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
				if (environment.isV10enable || environment.isV9enable) {
					window.location.href = environment.homeLink;
				} else {
					this.router.navigate(["/login"], { replaceUrl: true });
				}
			},
			err => {
				this.isBusy = false;
				alert(err);
			}
		);
	}

	public navigateSection(sectionName: string) {
		switch (sectionName) {
			case 'time-record':
				this.router.navigate(["time-visu", "time-record"]);
				break;
			case 'toolvisu-hours-report':
				this.router.navigate(["time-visu", "report-hours-toolvisu"]);
				break;
			case 'employee-hours-report':
				this.router.navigate(["time-visu", "report-hours-employee"]);
				break;
			case 'project-hours-report':
				this.router.navigate(["time-visu", "report-hours-project-tasks"]);
				break;
			default:
				this.router.navigate(["time-visu", ""]);
				break;
		}
	}
	
	onChangeSidebar() {
		this.isSideNavCollapsed = !this.isSideNavCollapsed;
	}
}
