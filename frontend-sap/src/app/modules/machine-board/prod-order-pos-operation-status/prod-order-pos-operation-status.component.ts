import { Component, Input } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { Machine } from "@app/shared/models/machine.model";
import { MachineStateStateType } from "@app/shared/enums/MachineStateStateType";
import moment from "moment";
import { secondsToHms } from "@app/shared/utils/seconds-to-hms";
import { OrderDetails } from "@app/shared/interfaces/OrderDetails";
import { DataService } from "@app/shared/services/data.service";
import { ReplaySubject, takeUntil } from "rxjs";
import { MachineBoardStateType } from "@app/shared/enums/MachineBoardStateType";
import {
	ProdOrderPosOperationStatus,
	ProdOrderPosOperationStatusClass,
} from "@app/shared/enums/ProdOrderPosOperationStatus";

@Component({
	selector: "app-prod-order-pos-operation-status",
	templateUrl: "./prod-order-pos-operation-status.component.html",
	styleUrl: "./prod-order-pos-operation-status.component.css",
})
export class ProdOrderPosOperationStatusComponent {
	private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
	@Input() public set selectedOperation(operation: any) {
		this.currentOperation = operation;

		if ((this.stateType = MachineBoardStateType.OPERATION_STATE)) {
			this.ngOnInit();
		}
	}

	currentOperation?: OrderDetails | undefined;
	isBusy = false;
	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;
	prodOrderPosOperationStatus = ProdOrderPosOperationStatus;

	elapsedTime = "00:00:00";
	residualTime = "00:00:00";
	noStateText: string = $localize`No State`;
	currentMachine: Machine | undefined;
	stateType: string = "";
	startDateText = $localize`Start Date`;
	startTimeText = $localize`Start Time`;

	constructor(
		public commonService: CommonService,
		private dataService: DataService
	) {}

	ngOnInit(): void {
		this.dataService.machine$.pipe(takeUntil(this.destroyed$)).subscribe(res => {
			this.currentMachine = res;

			setInterval(() => {
				this.setElaspedTime();
				this.setResidualTime();
			}, 1000);
		});
	}

	isInProduction() {
		return this.currentOperation?.status == ProdOrderPosOperationStatus.IN_PRODUCTION;
	}

	isInSetup() {
		return (
			this.currentOperation?.status == ProdOrderPosOperationStatus.IN_SETUP ||
			this.currentOperation?.status == ProdOrderPosOperationStatus.IN_TEARDOWN
		);
	}

	isOff() {
		return !this.currentOperation?.status;
	}

	getCurrentStartTime() {
		if (!this.currentOperation?.operationTimeStart) return "00:00:00";

		if (this.showStartTimewithDate()) {
			return moment
				.utc(this.currentOperation?.operationTimeStart)
				.local()
				.format("DD.MM.YYYY");
		} else {
			return moment.utc(this.currentOperation?.operationTimeStart).local().format("HH:mm:ss");
		}
	}

	showStartTimewithDate() {
		const duration = moment().diff(
			moment.utc(this.currentOperation?.operationTimeStart).local(),
			"hours"
		);

		return duration > 24;
	}

	setElaspedTime() {
		if (!this.currentOperation?.operationTimeStart) {
			this.elapsedTime = "00:00:00";
			return;
		}

		const duration = this.getElapsedSeconds();

		this.elapsedTime = secondsToHms(duration);
	}

	getElapsedSeconds() {
		if (this.currentOperation?.status == ProdOrderPosOperationStatus.IN_TEARDOWN || this.currentOperation?.status == ProdOrderPosOperationStatus.IN_SETUP) {
			return this.currentOperation.tearDownTime.reduce((total, op) => {
				const start = moment.utc(op.start);
				const end = op.end ? moment.utc(op.end) : moment.utc();
				return total + end.diff(start, "seconds");
			}, 0);
		} else {
			return moment
				.utc()
				.diff(moment.utc(this.currentOperation?.operationTimeStart).local(), "seconds");
		}
	}

	setResidualTime() {
		const tr = this.currentOperation?.setupTime ?? 0;
		const elapsedTime = this.getElapsedSeconds();
		const residualTimeIsSeconds = Math.abs(tr - elapsedTime);
		const time = secondsToHms(residualTimeIsSeconds);

		this.residualTime = tr < elapsedTime ? "00:00:00" : time;
	}
}
