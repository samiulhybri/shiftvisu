import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	OnDestroy,
	OnInit,
	ViewChild,
} from "@angular/core";
import "@ui5/webcomponents/dist/Dialog";
import { ClockInButtons } from "@app/modules/machine-board/enums/ClockInButtons";
import { ActivatedRoute, Router } from "@angular/router";
import { ReplaySubject, Subject, debounceTime, switchMap, takeUntil, tap } from "rxjs";
import { CommonService } from "@app/shared/services/common.service";
import { User } from "@app/shared/models/user.model";
import MachineUserTime from "@app/shared/models/machine-user-time.model";
import { Machine } from "@app/shared/models/machine.model";
import { Shift } from "@app/shared/models/shift.model";
import { DataService } from "@app/shared/services/data.service";
import Toast from "@ui5/webcomponents/dist/Toast";
import { MachineBoardEventHandleService } from "@app/modules/machine-board/services/machine-board-event-handle.service";
import { ToastService } from "@app/shared/services/toaster.service";
import { Localization } from "@app/shared/utils/common-localize";
import {
	BrowserCodeReader,
	BrowserMultiFormatReader,
	BarcodeFormat,
	IScannerControls,
} from "@zxing/browser";
import { Plant } from "@app/shared/models/plant.model";
import Button from "@ui5/webcomponents/dist/Button";

@Component({
	selector: "app-clock-in",
	templateUrl: "./clock-in.component.html",
	styleUrl: "./clock-in.component.css",
})
export class ClockInComponent implements OnInit, OnDestroy {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	private inputSubject: Subject<string> = new Subject<string>();
	@ViewChild("clockedInToastRef") clockedInToastRef!: Toast;
	@ViewChild("clockinNotEnabledRef") clockinNotEnabledRef!: Toast;
	@ViewChild("inputRef") inputRef!: ElementRef;
	@ViewChild("codeScannerDialog", { static: false }) codeScannerDialog: any;
	@ViewChild("clockOutErrorDialog", { static: false }) clockOutErrorDialog: any;
	isDialogOpen: boolean = true;
	clockInOutDialog: string = $localize`Clock In / Clock Out`;
	buttons = [
		ClockInButtons.ONE,
		ClockInButtons.TWO,
		ClockInButtons.THREE,
		ClockInButtons.FOUR,
		ClockInButtons.FIVE,
		ClockInButtons.SIX,
		ClockInButtons.SEVEN,
		ClockInButtons.EIGHT,
		ClockInButtons.NINE,
		ClockInButtons.DASH,
		ClockInButtons.ZERO,
		ClockInButtons.BACKSPACE,
	];
	dialerButtonValue: string = "";
	showMachineBoard: boolean = false;
	showTableDiv: boolean = false;
	customIdValueStateText: string = $localize`Error during the verification of clockin data`;
	warningPopup = false;
	selectedUser: User | null = null;
	isLoadingUserId: boolean = false;
	machineUserTimes: MachineUserTime[] = [];
	isErrorMessage: boolean = false;
	userMachineList: Machine[] = [];

	currentMachineShifts: Shift[] = [];
	allShiftList: Shift[] = [];
	currentMachine: Machine = new Machine().deserialize({});
	selectedMachineIds: number[] = [];
	initialSelectedMachineIds: number[] = [];
	clockedInMachineIds: number[] = [];
	selectedShift: Shift = new Shift().deserialize({});
	machineLoggedUsers: User[] = [];
	isIndicator: boolean = false;
	isCloseWarning: boolean = false;
	isLoadingClockedUser: boolean = false;
	isConfirmAction: boolean = false;
	isBackAction: boolean = false;
	isOnSave: boolean = false;
	initialActivityTypes: { [key: number]: string } = {};
	selectedActivityTypes: { [key: number]: string } = {};
	isShiftClockedRequired: boolean = true;
	disabled: boolean = true;
	scannerControls: IScannerControls | undefined;
	videoInputDevices: MediaDeviceInfo[] = [];
	currentPlant: Plant | undefined;
	isEnabledForClockin: boolean = false;
	showClockOutErrorDialog = false;
	clockOutErrorMachines: any[] = [];

	localization = Localization;

	columns: any = [
		{
			Header: $localize`Machine Id`,
			accessor: "machine.custom_id",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Machine Name`,
			accessor: "machine.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Start`,
			accessor: "startTime",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Hours`,
			accessor: "machineHours",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
		{
			Header: $localize`Shifts`,
			accessor: "shift.name",
			disableFilters: true,
			disableGroupBy: true,
			disableSortBy: true,
		},
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private toastService: ToastService,
		private commonService: CommonService,
		private dataService: DataService,
		private machineBoardEventService: MachineBoardEventHandleService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.isIndicator = true;
		this.isLoadingClockedUser = true;
		this.getCurrentMachine();
		this.getUserById();
		this.getLoggedUserMachineList();
	}

	initializeDefaultSelections() {
		this.userMachineList.forEach(machine => {
			if (machine.clockInActivityTypes.length === 1) {
				this.initialActivityTypes[machine.id!] =
					machine.clockInActivityTypes[0].id!.toString();
				this.selectedActivityTypes[machine.id!] =
					machine.clockInActivityTypes[0].id!.toString();
			} else {
				this.initialActivityTypes[machine.id!] = "0";
				this.selectedActivityTypes[machine.id!] = "0";
			}
		});
		this.cdr.detectChanges();
	}

	ngAfterViewInit(): void {
		this.focusInput();
	}

	getMachineUserTimesByMachineId() {
		this.isLoadingClockedUser = true;
		this.isIndicator = true;
		const apiUrl = `MachineUserTimes?$filter=machine_id eq ${this.currentMachine.id} and end eq null&expand=user`;
		this.commonService
			.get(apiUrl)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res: any) => {
					const result = res.value as any[];
					this.machineLoggedUsers = result.map(el => el.user);
					this.isIndicator = false;
					this.isLoadingClockedUser = false;
				},
				error: err => {
					this.isIndicator = false;
					this.isLoadingClockedUser = false;
				},
				complete: () => {},
			});
	}

	getCurrentMachine() {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;

			this.getCurrentPlant(res?.plant?.id);

			if (this.currentMachine.id) {
				this.getShiftList();
				this.getMachineUserTimesByMachineId();
			}
		});
	}

	getCurrentPlant(plantId: number | undefined) {
		this.commonService.get("Plants/" + plantId).subscribe({
			next: (res: any) => {
				this.currentPlant = res;
				this.isShiftClockedRequired = res.is_shift_for_clockin_required;
			},
			error: (e: any) => {
				console.log(e);
			},
		});
	}

	getShiftList() {
		this.commonService
			.get(`capacity-plan/clockin/shift/${this.currentMachine.id}/30`, false)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res: any) => {
					const { allShift, machineCurrentShiftList } = res;
					this.allShiftList = allShift.map((el: any) => new Shift().deserialize(el));
					this.currentMachineShifts = machineCurrentShiftList.map((el: any) =>
						new Shift().deserialize(el)
					);
				},
				error: error => {},
				complete: () => {},
			});
	}

	getLoggedUserMachineList() {
		this.commonService
			.get("machines", false)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res: any) => {
					this.userMachineList = res.map((machine: any) => {
						return new Machine().deserialize(machine);
					});
					this.initializeDefaultSelections();
				},
				error: error => {},
				complete: () => {},
			});
	}

	getUserById() {
		this.inputSubject
			.pipe(
				debounceTime(800),
				tap(() => {
					this.isLoadingUserId = true;
					this.isIndicator = true;
				}),
				switchMap(userID => {
					const userApiUrl = `Users?$filter=(custom_id eq '${userID}' or chip_number eq '${userID}') and is_active eq true&$expand=userGroup($filter=is_enabled_for_clockin eq true),machineUserTime($expand=machine($expand=standardValueKey($expand=standardValueKeyActivityTypes)),shift;filter=end eq null)`;
					return this.commonService.get(userApiUrl);
				})
			)
			.subscribe({
				next: (res: any) => {
					const result = res.value;
					if (result.length) {
						this.selectedUser = new User().deserialize(result[0]);
						this.isEnabledForClockin = this.checkIfUserGroupIsEnabled();
						if(!this.isEnabledForClockin) this.clockinNotEnabledRef.open = true;
						this.showTableDiv = true;
						this.isErrorMessage = false;

						this.machineUserTimes = this.selectedUser.machineUserTime.map(
							(machine: MachineUserTime) => {
								return new MachineUserTime().deserialize(machine);
							}
						);
						this.setSelectedMachineIds();
					} else {
						this.selectedUser = null;
						this.showTableDiv = false;
						this.isErrorMessage = true;
					}
					this.isLoadingUserId = false;
					this.isIndicator = false;
				},
				error: error => {
					this.isLoadingUserId = false;
				},
				complete: () => {},
			});
	}

	checkIfUserGroupIsEnabled() {
		if (this.selectedUser && this.selectedUser.user_group && this.selectedUser.user_group.length > 0) {
			return true;
		}
		return false;
	}

	setSelectedMachineIds() {
		const clockedInMachineIds = this.machineUserTimes.map(el => el.machine?.id!);
		this.selectedMachineIds = this.userMachineList
			.filter(el => clockedInMachineIds.includes(el.id!))
			.map(m => m.id!);

		this.clockedInMachineIds = [...clockedInMachineIds];

		if (this.machineUserTimes.length) {
			this.machineUserTimes.forEach(mt => {
				if (
					this.selectedMachineIds.includes(mt.machine?.id!) &&
					mt.standard_value_key_activity_type_id
				) {
					this.selectedActivityTypes[mt.machine?.id!] =
						mt.standard_value_key_activity_type_id!.toString();
				} else {
					if (this.initialActivityTypes[mt.machine?.id!]) {
						this.selectedActivityTypes[mt.machine?.id!] =
							this.initialActivityTypes[mt.machine?.id!];
					}
				}
			});
		} else {
			this.selectedActivityTypes = { ...this.initialActivityTypes };
		}

		if (!this.selectedMachineIds.includes(this.currentMachine.id!)) {
			this.selectedMachineIds.push(this.currentMachine.id!);
		}
		this.initialSelectedMachineIds = [...this.selectedMachineIds];
	}

	dialerButton(event: any) {
		if (event.target.innerText != ClockInButtons.BACKSPACE)
			this.dialerButtonValue += event.target.innerText;
		else {
			if (this.dialerButtonValue.length > 0) {
				this.dialerButtonValue = this.dialerButtonValue.slice(0, -1);
			}
		}
		this.inputValue("", this.dialerButtonValue);
	}

	inputValue(event: any, value: string = "") {
		this.dialerButtonValue = value ? value : event.target ? event.target.typedInValue : "";
		this.isErrorMessage = false;
		this.isLoadingUserId = false;
		if (this.dialerButtonValue) {
			this.inputSubject.next(this.dialerButtonValue);
		}
	}

	matcher(event: any) {
		const allowedRegex = /^[0-9\b-]+$/;
		if (!event.key.match(allowedRegex) && event.key != "Backspace") {
			event.preventDefault();
		}
	}

	confirmClicked() {
		this.showMachineBoard = true;
		this.warningPopup = false;
		this.selectedMachineIds = this.initialSelectedMachineIds;
	}

	closeDialog() {
		const isSame =
			this.selectedMachineIds.length === this.initialSelectedMachineIds.length &&
			JSON.stringify(this.selectedMachineIds.slice().sort()) ===
				JSON.stringify(this.initialSelectedMachineIds.slice().sort());
		if (this.showMachineBoard && (!isSame || this.selectedShift.id)) {
			this.isDialogOpen = true;
			this.warningPopup = true;
			this.isCloseWarning = true;
			this.isConfirmAction = this.selectedShift.id
				? false
				: this.selectedMachineIds.length
					? true
					: false;
		} else {
			this.closeAndNavigate();
		}
	}

	closeAndNavigate() {
		if (!this.isBackAction) {
			this.isDialogOpen = false;
			this.showMachineBoard = false;

			this.machineBoardEventService.triggerMachineStateChange();
			this.machineBoardEventService.machineKPI1ChangeEvent();
			this.machineBoardEventService.machineKPI2ChangeEvent();

			this.router.navigate(["../"], { relativeTo: this.route }).catch(() => {
				this.router.navigate(["../../"], { relativeTo: this.route });
			});
			this.warningPopup = false;
			this.isCloseWarning = false;
			this.isConfirmAction = false;
		} else {
			this.isDialogOpen = true;
			this.warningPopup = false;
			this.showMachineBoard = false;
			this.isBackAction = false;
		}
		this.selectedShift = new Shift().deserialize({});
	}

	onCancelWarning() {
		this.warningPopup = false;
		this.isConfirmAction = false;
	}

	onSave() {
		const saveBtn = document.getElementById("saveButton") as Button;
		saveBtn.disabled = true;
		this.isOnSave = true;
		this.isIndicator = true;
		this.warningPopup = false;
		const mappedSelectedMachines = this.selectedMachineIds.map(machineId => {
			const activityTypeId = this.selectedActivityTypes[machineId];
			return {
				machine_id: machineId,
				activity_type_id: activityTypeId === "0" ? null : parseInt(activityTypeId),
			};
		});

		// will modified or delete later
		/*const requestData = {
			user_id: this.selectedUser?.id,
			shift_id: this.selectedShift.id,
			machine_ids: this.selectedMachineIds,
		};*/
		const requestData = {
			user_id: this.selectedUser?.id,
			shift_id: this.selectedShift.id,
			machines: mappedSelectedMachines,
		};

		this.commonService
			.post(`machine-clockin-clockout`, requestData, false)
			.pipe(takeUntil(this.destroyed$))
			.subscribe({
				next: (res: any) => {
					this.isIndicator = false;
					const { clocked_in_machines, clocked_out_machines, clocked_out_error_machines } = res;

					this.machineUserTimes = clocked_in_machines.map((machine: MachineUserTime) => {
						return new MachineUserTime().deserialize(machine);
					});

					const errorMachines = clocked_out_error_machines.map((machine: Machine) => {
						return new Machine().deserialize(machine);
					});

					this.initialSelectedMachineIds = this.machineUserTimes.map(
						el => el.machine?.id!
					);
					this.isIndicator = false;
					if (this.machineUserTimes.length) {
						this.toastService.showToast(
							"Selected machines are successfully Clocked In",
							"success"
						);
					} else {
						this.toastService.showToast(
							"Machines are successfully Clocked Out",
							"success"
						);
					}
					if (errorMachines.length) {
						this.clockOutErrorMachines = [];
						for (let i = 0; i < errorMachines.length; ++i) {
							const machine = errorMachines[i];
							this.clockOutErrorMachines.push(machine);
						}

						this.showClockOutErrorDialog = true;
						this.clockOutErrorDialog.elementRef.nativeElement.open = true;
					} else {
						if (this.isBackAction) {
							this.clockedInToastRef.open = true;
							this.isDialogOpen = true;
							this.showMachineBoard = false;
							this.isBackAction = false;
						} else {
							this.closeAndNavigate();
						}
					}

					this.selectedShift = new Shift().deserialize({});
					this.machineBoardEventService.triggerClockInChangeEvent();
				},
				error: err => {
					this.isIndicator = false;
					this.isOnSave = false;
					this.isDialogOpen = true;
					this.warningPopup = true;
					this.isCloseWarning = false;
				},
				complete: () => {
					this.isOnSave = false;
					saveBtn.disabled = false;
				},
			});
	}

	closeClockOutError() {
		this.showClockOutErrorDialog = false;
		this.clockOutErrorDialog.elementRef.nativeElement.open = false;
	}

	onShiftSelect(shift: Shift) {
		if (this.selectedShift?.id === shift?.id) {
			this.selectedShift = new Shift().deserialize({});
		} else this.selectedShift = shift;
	}

	onMachineSelect(machine: Machine) {
		if (this.selectedMachineIds.includes(machine.id!)) {
			this.selectedMachineIds = this.selectedMachineIds.filter(el => el !== machine.id);
		} else {
			this.selectedMachineIds.push(machine.id!);
		}
	}

	onBack() {
		this.isBackAction = true;
		const isSame =
			this.selectedMachineIds.length === this.initialSelectedMachineIds.length &&
			JSON.stringify(this.selectedMachineIds.slice().sort()) ===
				JSON.stringify(this.initialSelectedMachineIds.slice().sort());
		if (this.showMachineBoard && (!isSame || this.selectedShift.id)) {
			this.isDialogOpen = true;
			this.warningPopup = true;
			this.isCloseWarning = true;
			this.isConfirmAction = this.selectedShift.id
				? false
				: this.selectedMachineIds.length
					? true
					: false;
		} else {
			this.showMachineBoard = false;
			this.isBackAction = false;
		}
		this.focusInput();
	}

	focusInput() {
		setTimeout(() => {
			if (this.inputRef && (this.inputRef as any).elementRef.nativeElement) {
				(this.inputRef as any).elementRef.nativeElement.focus();
			}
		}, 10);
	}

	OnDeselectAll() {
		this.selectedMachineIds = [];
	}

	onActivityTypeChange(e: any, machineId: number) {
		const selectedValue = e.selectedOption.value;
		this.selectedActivityTypes[machineId] = selectedValue;
	}

	onClickSelectionDiv(event: Event) {
		event.stopPropagation();
	}

	ngOnDestroy(): void {
		this.destroyed$.next(true);
		this.destroyed$.complete();
	}

	openCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.codeScannerDialog.elementRef.nativeElement.open = true;
			this.startCodeScanning();
		}
	}
	closeCodeScannerDialog() {
		if (this?.codeScannerDialog?.elementRef.nativeElement) {
			this.scannerControls?.stop();
			this.codeScannerDialog.elementRef.nativeElement.open = false;
		}
	}

	private async startCodeScanning() {
		const codeReader = new BrowserMultiFormatReader();
		codeReader.possibleFormats = [
			BarcodeFormat.AZTEC,
			BarcodeFormat.CODABAR,
			BarcodeFormat.CODE_39,
			BarcodeFormat.CODE_93,
			BarcodeFormat.CODE_128,
			BarcodeFormat.DATA_MATRIX,
			BarcodeFormat.EAN_8,
			BarcodeFormat.EAN_13,
			BarcodeFormat.ITF,
			BarcodeFormat.MAXICODE,
			BarcodeFormat.PDF_417,
			BarcodeFormat.QR_CODE,
			BarcodeFormat.RSS_14,
			BarcodeFormat.RSS_EXPANDED,
			BarcodeFormat.UPC_A,
			BarcodeFormat.UPC_E,
			BarcodeFormat.UPC_EAN_EXTENSION,
		];

		this.videoInputDevices = await BrowserCodeReader.listVideoInputDevices();

		if (this.videoInputDevices.length === 0) {
			return;
		}

		const backCamera = this.videoInputDevices.find(camera =>
			/back|rear|environment/i.test(camera.label)
		);
		const selectedDeviceId = backCamera
			? backCamera.deviceId
			: this.videoInputDevices[0].deviceId;

		const previewElem: HTMLVideoElement = document.querySelector(
			"#codeScannerClockDialog > video"
		) as HTMLVideoElement;
		this.scannerControls = await codeReader.decodeFromVideoDevice(
			selectedDeviceId,
			previewElem,
			(result, _) => {
				if (result && result.getText()) {
					this.dialerButtonValue = result.getText();
					this.inputValue("", this.dialerButtonValue);

					this.scannerControls?.stop();
					this.closeCodeScannerDialog();
				}
			}
		);
	}
}
