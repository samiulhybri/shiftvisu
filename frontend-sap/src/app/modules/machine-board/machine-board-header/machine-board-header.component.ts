import { MachineBoardEventHandleService } from '@app/modules/machine-board/services/machine-board-event-handle.service';
import { Component, ViewChild, AfterViewInit} from "@angular/core";
import { ActivatedRoute,  Router } from "@angular/router";
import LanguageState from "@app/shared/models/language-state.model";
import MachineUserTime from "@app/shared/models/machine-user-time.model";
import { CommonService } from "@app/shared/services/common.service";
import { forkJoin } from 'rxjs';
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";


@Component({
	selector: "app-machine-board-header",
	templateUrl: "./machine-board-header.component.html",
	styleUrl: "./machine-board-header.component.css",
})
export class MachineBoardHeaderComponent implements AfterViewInit {
	selectedLanguageName?: string;
	selectedLanguageCode?: string = "EN";
	isBusy = false;
	@ViewChild("popover", { static: false }) popover: any;
	@ViewChild("menu", { static: false }) menu: any;
	@ViewChild("hoverText") hoverText?: any;
	selectedLanguage: any = new LanguageState().deserialize({});
	clockInSubscription?:any;

	selectedMachineUserTimes: any = new MachineUserTime().deserialize({});
	constructor(
		public commonService: CommonService,
		public router: Router,
		public route: ActivatedRoute,
		private machineBoardEventService: MachineBoardEventHandleService,
		private machineBoardService: MachineboardService
	) {
		this.selectedMachineUserTimes = new MachineUserTime().deserialize({});
	}

	ngAfterViewInit() {
		if (this.hoverText && this.popover) {
			this.hoverText.nativeElement.addEventListener("mouseover", () => {
				this.popover.elementRef.nativeElement.opener = "hoverTexts";
				this.popover.elementRef.nativeElement.open = true;
			});

			this.hoverText.nativeElement.addEventListener("mouseout", () => {
				this.popover.elementRef.nativeElement.open=false;
				this.popover.elementRef.nativeElement.opener = "";
			});
		}
	}

	ngOnInit() {
		this.loadMachineUserTimes();
		this.loadLanguage();
		this.checkRoute();
	}

	checkRoute() {
		this.clockInSubscription = this.machineBoardEventService.clockInChangeEvent.subscribe(() => {
			this.loadMachineUserTimes();
		});
	}

	ngOnDestroy(): void {
		this.clockInSubscription.unsubscribe();
	}

	loadMachineUserTimes(){
		this.isBusy = true;
		const id = this.route.snapshot.params["id"];
		const machineUserTimes$ = this.getMachineUserTimesByMachineId(id);
		const qualifiedClockinUserIds$ = this.getQualifiedClockinUsersByMId(id);

		forkJoin([machineUserTimes$, qualifiedClockinUserIds$]).subscribe({
			next: (data:any) => {
				const [machineUserTimes, qualifiedClockinUserIds] = data;
				this.isBusy = false;
				this.selectedMachineUserTimes = [];
				this.selectedMachineUserTimes = machineUserTimes.value.map((machineUserTime: any) =>{
					const mUserTime = new MachineUserTime().deserialize(machineUserTime);
					mUserTime.qualified_clockin_user_ids = qualifiedClockinUserIds.success ? qualifiedClockinUserIds.qualified_clockin_user_ids : [];
					return mUserTime
				});

				this.machineBoardService.sendClockedInData(this.selectedMachineUserTimes);
			}
		})
	}

	getMachineUserTimesByMachineId(id: string) {
		return this.commonService.get(`MachineUserTimes?$filter=machine_id eq ${id} and end eq null&$expand=machine,user`);
	}

	getQualifiedClockinUsersByMId(mId: string) {
		return this.commonService.get(`machines/${mId}/qualified-clockin-users`,false);
	}

	loadLanguage() {
		this.commonService.get("Languages").subscribe({
			next: (data: any) => {
				this.selectedLanguage = data.value.map((language: any) =>
					new LanguageState().deserialize(language)
				);
			},
		});
	}

	languageMenu() {
		this.menu.elementRef.nativeElement.open = true;
	}

	getUserNames(): string {
		if (
			!Array.isArray(this.selectedMachineUserTimes) ||
			this.selectedMachineUserTimes.length === 0
		) {
			return "";
		}
		const firstTwoMachines = this.selectedMachineUserTimes
			.slice(0, 2)
			.map((data: any) => `${data.user.name} - ${data.qualified_clockin_user_ids.includes(data.user.id) ? "Q" : "NQ"}`);

		return firstTwoMachines.join(", ");
	}

	onMenuItemSelect(event: any): void {
		this.selectedLanguageName = event.detail.item.getAttribute("text");

		const selectedLanguage = this.selectedLanguage.find(
			(lang: any) => lang.name === this.selectedLanguageName
		);
		if (selectedLanguage) {
			this.selectedLanguageCode = selectedLanguage.code;
		}
	}
}
