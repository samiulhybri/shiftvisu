import { Component, Input, OnInit, Renderer2 } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
	MachineBoardSideBar,
	MachineBoardSideBarClass,
} from "@app/shared/enums/MachineBoardSideBar";
import { Machine } from "@app/shared/models/machine.model";
import { AuthService } from "@app/shared/services/auth.service";
import "@ui5/webcomponents-icons/dist/person-placeholder.js";
import "@ui5/webcomponents-icons/dist/personnel-view.js";
import { filter, take } from "rxjs/operators";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { PermissionEnum } from "@app/shared/enums/PermissionEnum";
import { ProdOrderPosOperation } from "@app/shared/models/prod-order-pos-operation.model";
import {MachineStateType, MachineStateTypeClass} from "@app/shared/enums/MachineStateType";
import { ToastService } from "@app/shared/services/toaster.service";
import { Subscription, timer } from "rxjs";
import { MachineboardService } from "@app/modules/machine-board/services/machineboard.service";
import { convertToMS } from "@app/shared/utils/calculate-time";
import { DataService } from "@app/shared/services/data.service";
import { ProdInspectionOperation } from "@app/shared/models/prod-inspection-operation.model";

@Component({
	selector: "app-machine-board-sidebar",
	templateUrl: "./machine-board-sidebar.component.html",
	styleUrl: "./machine-board-sidebar.component.css",
})
export class MachineBoardSidebarComponent implements OnInit {
	@Input() display?: string;
	@Input() machine?: Machine;
	@Input() operationId?: number;
    @Input() translationType: 'DEFAULT' | 'BEN' = 'DEFAULT';
	
	isClicked: boolean = false;
	machineBoardButtonNames = MachineBoardSideBar;
	isClockInBusy: boolean = false;
	totalClockedInUsers = 0;
	selectedButton?: MachineBoardSideBar | undefined;
	isComingFromClockIn = false;
	clockInSubscription?: any;
	permissionEnums = PermissionEnum;
	hasQualifiedUsers: boolean = false;
	isDialogOpen: boolean = false;
	isQualiVisuWarningDialogOpen: boolean = false;
	openInspectionTimer: Subscription = new Subscription();
	operationIds: number[] = [];
	numberOfOpenInspections: number = 0;
	isInMachineboardMain: boolean = false;
	isBlockedForInspectionPoints : boolean = false;

	constructor(
		private route: ActivatedRoute,
		public machineboardService: MachineboardService,
		private router: Router,
		public authService: AuthService,
		private machineBoardEventService: MachineBoardEventHandleService,
		public _toasterSrv: ToastService,
		private dataService: DataService
	) {}

	ngOnInit() { 
		this.loadMachineUserTimes();
		this.checkRoute();
		this.loadQualificationUser();
		this.checkOpenInspectionOperations();
		this.machineboardService.operationsBehaviorObservable()
			.pipe(
				filter(operations => operations && operations.length > 0),
				take(1)
			)
			.subscribe((operations: any) => {
				this.operationIds = operations.map((o: any) => o.id);
				this.fetchInspectionOperationsInitially();
			});
		document.addEventListener('keydown', this.onKeyDown.bind(this));
	}

	loadMachineUserTimes() {
		this.isClockInBusy = true;
		const id = this.route.snapshot.params["id"];
		this.machineboardService
			.get(
				`MachineUserTimes?$filter=machine_id eq ${id} and end eq null&$expand=machine,user`
			)
			.subscribe({
				next: (data: any) => {
					this.isClockInBusy = false;
					this.totalClockedInUsers = data.value.length;
					this.authService.totalClockedInUsers = this.totalClockedInUsers;
				},
			});
	}

	loadQualificationUser() {
		const id = this.route.snapshot.params["id"];
		this.machineboardService
			.get(`machines/${id}/check-qualified-clockin-users`, false)
			.subscribe(
				(res: any) => (this.authService.hasQualifiedUsers = this.hasQualifiedUsers = res.hasQualifiedUsers ? true : false)
			);
	}

	checkRoute() {
		this.checkIfInMachineboardMain();
		this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((val: any) => {
			const lastPoint = val.url.split("/");

			if (lastPoint[lastPoint.length - 2] == "machine-board") {
				this.unselectButtons();
			}

			this.checkIfInMachineboardMain();
		});

		this.clockInSubscription = this.machineBoardEventService.clockInChangeEvent.subscribe(
			() => {
				this.loadMachineUserTimes();
				this.loadQualificationUser();
			}
		);

		this.dataService.orderDetails$.subscribe(data=>{
			this.loadQualificationUser();
		})
	}

	checkIfInMachineboardMain() {
		let urlSegments = this.router.parseUrl(this.router.url).root.children["primary"].segments;

		if (urlSegments[urlSegments.length - 2]?.path == "machine-board") {
			this.isInMachineboardMain = true;
		} else {
			this.isInMachineboardMain = false;
		}
	}

	checkOpenInspectionOperations(restartTimer: boolean = false) {
		let startTime: number = 0;
		let timeInterval = convertToMS(1, "Minute");
		this.machineboardService.operationsBehaviorObservable().subscribe(operations => {
			this.operationIds = operations?.map(o => o.id);
		});

		if (restartTimer) {
			startTime = timeInterval;
		}

		this.openInspectionTimer?.unsubscribe();

		this.openInspectionTimer = timer(startTime, timeInterval)
			.subscribe(() => {
				if (this.isQualiVisuWarningDialogOpen) {
					return;
				}

				if (this.operationIds.length == 0) {
					return;
				}

				let payload = {
					prod_order_pos_operation_ids: this.operationIds,
				};
				
				this.machineboardService
					.post(`quali-visu/get-inspections-by-operations`, payload, false)
					.subscribe({
						next: (response: any) => {
							this.isBlockedForInspectionPoints = response.is_blocking;
							this.updateBlockedState(this.isBlockedForInspectionPoints);
							let urlSegments = this.router.parseUrl(this.router.url).root.children[
								"primary"
							].segments;

							if (
								urlSegments[urlSegments.length - 3]?.path == "machine-board" &&
								urlSegments[urlSegments.length - 1]?.path == "quali-visu"
							) {
								return;
							}


                            let inspectionOperations: ProdInspectionOperation[] = response.inspection_operations.map(
                                (inspection_operation: any) => {
                                    return new ProdInspectionOperation().deserialize(inspection_operation);
                                }
                            );

							this.numberOfOpenInspections = inspectionOperations.reduce((openInspectionPoints, inspectionOperation) => {
                                return openInspectionPoints + inspectionOperation.numberOfOpenInspectionPoints();
                            }, 0);

							if (this.numberOfOpenInspections > 0) {
								this.isQualiVisuWarningDialogOpen = true;
							}
						},

						error: (error: any) => {},
					});
			});
	}

	fetchInspectionOperationsInitially() {
		let payload = {
			prod_order_pos_operation_ids: this.operationIds,
		};

		this.machineboardService.post(`quali-visu/get-inspections-by-operations`, payload, false)
			.subscribe({
				next: (response: any) => {
					this.isBlockedForInspectionPoints = response.is_blocking;
					this.updateBlockedState(this.isBlockedForInspectionPoints);

					let urlSegments = this.router.parseUrl(this.router.url).root.children["primary"].segments;

					if (
						urlSegments[urlSegments.length - 3]?.path == "machine-board" &&
						urlSegments[urlSegments.length - 1]?.path == "quali-visu"
					) {
						return;
					}

                    let inspectionOperations: ProdInspectionOperation[] = response.inspection_operations.map(
                        (inspection_operation: any) => {
                            return new ProdInspectionOperation().deserialize(inspection_operation);
                        }
                    );

                    this.numberOfOpenInspections = inspectionOperations.reduce((openInspectionPoints, inspectionOperation) => {
                        return openInspectionPoints + inspectionOperation.numberOfOpenInspectionPoints();
                    }, 0);

					if (this.numberOfOpenInspections > 0) {
						this.isQualiVisuWarningDialogOpen = true;
					}
				},
				error: (error: any) => {},
			});
	}

	ngOnDestroy(): void {
		this.clockInSubscription.unsubscribe();
		this.openInspectionTimer.unsubscribe();
		document.removeEventListener('keydown', this.onKeyDown.bind(this));
	}

	onKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && this.isBlockedForInspectionPoints && this.isQualiVisuWarningDialogOpen) {
			event.preventDefault();
			event.stopPropagation();
        	event.stopImmediatePropagation();
		}
	}

	updateBlockedState(isUserBlocked: boolean) {
		this.machineboardService.isUserBlockedForInspectionPoint = isUserBlocked;
	}

	getStateTranslate(state: MachineBoardSideBar): string {
		return MachineBoardSideBarClass.getStateTranslate(state, this.translationType);
	}

	onButtonClick(machineBoardButtonNames: MachineBoardSideBar, qualiPopUpRedirection: boolean = false) {
		switch (machineBoardButtonNames) {
			case MachineBoardSideBar.CLOCK_IN_OUT:
				this.selectedButton = machineBoardButtonNames;
				this.goToLogin();
				break;
			case MachineBoardSideBar.PRODUCTION_PLAN:
				this.selectedButton = machineBoardButtonNames;

				if (
					this.authService.isPermissionValid(PermissionEnum.MACHINEBOARD_PRODUCTION_PLAN_VIEW)
				) {
					this.goToProductionPlan();

				} else {
					this.navigateIfQualified(
						"MACHINEBOARD_PRODUCTION_PLAN_EDIT",
						this.goToProductionPlan.bind(this)
					);
				}

				break;

			case MachineBoardSideBar.MACHINE_STATE:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_MACHINE_STATE_CHANGE_VIEW",
					this.goToStates.bind(this)
				);
				break;
			case MachineBoardSideBar.MACHINE_STATE_HISTORY:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_MACHINE_STATE_HISTORY_VIEW",
					this.goToMachineStateHistory.bind(this)
				);
				break;
			case MachineBoardSideBar.QUANTITY:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_QUANTITY_EDIT",
					this.goToQuantity.bind(this)
				);
				break;
			case MachineBoardSideBar.MATERIAL_CONSUMPTION:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_MATERIAL_CONSUMPTION_EDIT",
					this.openMaterialConsumptionDialog.bind(this)
				);
				break;
			case MachineBoardSideBar.PACKAGING:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_PACKAGING_EDIT",
					this.openPackagingDialog.bind(this)
				);
				break;
			case MachineBoardSideBar.DEFAULT_PACKAGING:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_DEFAULT_PACKAGING_EDIT",
					this.openDefaultPackagingDialog.bind(this)
				);
				break;
			case MachineBoardSideBar.PRINT_HU:
				this.selectedButton = machineBoardButtonNames;
				this.openPrintHUDialog();
				break;
			case MachineBoardSideBar.QUALI_VISU:
				this.selectedButton = machineBoardButtonNames;
				if(qualiPopUpRedirection) {
					this.navigateIfQualified(
						"MACHINEBOARD_QUALIVISU_EDIT",
						this.goToQualiVisu.bind(this,true)
					);
				} else {
					this.navigateIfQualified(
						"MACHINEBOARD_QUALIVISU_EDIT",
						this.goToQualiVisu.bind(this)
					);
				}
				break;
			case MachineBoardSideBar.STATUS_BOARD:
				this.selectedButton = machineBoardButtonNames;
				this.goToStatusBoard();
				break;
			case MachineBoardSideBar.RESET_PROPOSAL:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_RESET_PROPOSAL_EDIT",
					this.resetProposedQuantities.bind(this)
				);
				break;
			case MachineBoardSideBar.PAINTING_LINE:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_PAINTING_LINE_EDIT",
					this.openPaintingLineDialog.bind(this)
				);
				break;
			case MachineBoardSideBar.DOC_VISU:
				this.selectedButton = machineBoardButtonNames;
				this.navigateIfQualified(
					"MACHINEBOARD_DOCVISU_EDIT",
					this.goToDocVisu.bind(this)
				);
				break;
			default:
				console.error($localize`Wrong Button Press`);
		}
	}

	resetProposedQuantities() {
		const machine_id = this.route.snapshot.params["id"];
		// TODO: payload will be change
		const payload = {
			operation_id: 0,
			last_proposed_id: 0,
		};
		this.machineboardService.post(`quantity/reset_machine_cycles/${machine_id}`, payload, false).subscribe({
				next: (response: any) => {
					this._toasterSrv.showToast($localize`Successfully Reset Proposal`, "success");
				},
			error: (error) => {
					this._toasterSrv.showToast($localize`Reset Proposal Failed`, "error");
			  }
			});
	}

	navigateIfQualified(permissionKey: string, navigateCallback: () => void) {
		if (this.authService.isPermissionValid(permissionKey)) {
			navigateCallback();
		} else {
			if (this.hasQualifiedUsers && this.totalClockedInUsers) {
				navigateCallback();
			} else {
				this.isDialogOpen = true;
			}
		}
	}
	closeDialog(flag: string) {
		if (flag == "clock-in") {
			this.isDialogOpen = false;
		} else if (flag == "quali-visu") {
			this.isQualiVisuWarningDialogOpen = false;
			this.checkOpenInspectionOperations(true);
		}
	}

	openMaterialConsumptionDialog() {
		this.router.navigate(["material-consumption"], { relativeTo: this.route });
	}

	openPackagingDialog() {
		this.router.navigate([`packaging/${this.operationId}`], { relativeTo: this.route });
	}

	openDefaultPackagingDialog() {
		this.router.navigate(["next-packaging"], { relativeTo: this.route });
	}

	goToLogin() {
		this.router.navigate(["clock-in"], { relativeTo: this.route });
	}

	goToMES() {
		this.router.navigate(["mes"], { relativeTo: this.route });
	}

	goToStates() {
		this.router.navigate(["machine-states"], { relativeTo: this.route });
	}

	goToMachineStateHistory() {
		this.router.navigate(["machine-state-history"], { relativeTo: this.route });
	}

	goToSetup() {
		this.router.navigate(["setup"], { relativeTo: this.route });
	}

	goToQuantity() {
		this.router.navigate([`quantity/${this.operationId}`], { relativeTo: this.route });
	}

	goToDocVisu() {
		this.router.navigate(["doc-visu"], { relativeTo: this.route });
	}

	goToProductionPlan() {
        this.router.navigate(["production-plan"], { relativeTo: this.route });
	}

	goToStatusBoard() {
		this.router.navigate(["statusboard"]);
	}

	goToLogIn() {
		this.router.navigate(["login"], { relativeTo: this.route });
	}

	goToQualiVisu(openFromPopUp: boolean = false) {
		if (openFromPopUp) {
			this.isQualiVisuWarningDialogOpen = false;
			this.router.navigate(["quali-visu"], {
				relativeTo: this.route,
				queryParams: { type: "popUp" },
			});
		} else this.router.navigate(["quali-visu"], { relativeTo: this.route, queryParams: {} });
	}

	openPrintHUDialog() {
		this.router.navigate([`print-handling-unit/${this.operationId}`], {
			relativeTo: this.route,
		});
	}

	openPaintingLineDialog() {
		this.router.navigate(["painting-line"], { relativeTo: this.route });
	}

	unselectButtons() {
		this.selectedButton = undefined;
	}

	hasQualiVisuMachineBoardPermission() {
		return this.authService.isPermissionValid(this.permissionEnums.MACHINEBOARD_QUALIVISU_EDIT) || (this.authService.isPermissionValid(this.permissionEnums.MACHINEBOARD_QUALIVISU_EDIT_IF_QUALIFIED) && this.hasQualifiedUsers && this.totalClockedInUsers);
	}

	protected readonly MachineStateTypeClass = MachineStateTypeClass;
	protected readonly MachineStateType = MachineStateType;
}
