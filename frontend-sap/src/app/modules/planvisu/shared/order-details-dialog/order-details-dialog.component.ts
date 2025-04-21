import { MachineConstraintTypeClass } from '@app/shared/enums/MachineConstraintType';
import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { environment } from "@app/environments/environment";
import { ProdOrderPosOperationStatus, ProdOrderPosOperationStatusClass } from "@app/shared/enums/ProdOrderPosOperationStatus";
import ComboBox from "@ui5/webcomponents/dist/ComboBox";
import Button from "@ui5/webcomponents/dist/Button";
import moment from "moment";

@Component({
	selector: "app-order-details-dialog",
	templateUrl: "./order-details-dialog.component.html",
	styleUrl: "./order-details-dialog.component.css",
})
export class OrderDetailsDialogComponent {
	@Input() dialogTitle: string = "";
	@Input() showfields: any;
	@Input() isDialogEditable: boolean = false;
	@Input() isTEeditable: boolean = false;
	@Input() open: boolean = false;
	@Input() isLoading: boolean = false;
	@Input() isSaveButton: boolean = false;
	@Input() isStatusChanged: boolean = false;
	@Input() isPlanVisuGanttRestrictionRemove: boolean = false;
	@Input() isEndBusy: boolean = false;
	@Input() isBusy: boolean = false;
	@Input() selectedOperation: any;
	@Input() opeartionMachines: any;
	@Input() operationStart: any;
	@Input() selecteItem?: string = "";
	@Input() operationEndValue?: string = "";
	@Input() tr: any;
	@Input() isToolPreparedForRelease?: boolean;
	@Input() prodOrderPosOperationStatusData?: any = [];
	@Input() machineConstraints?: any = MachineConstraintTypeClass.getEnumArray();
	@Input() isOperationReadyRealease = false;
    @Output() recalculateOperation = new EventEmitter<any>();
	@Output() public changeIsDialogOpen = new EventEmitter<any>();
	@Output() public changeMachine = new EventEmitter<any>();
	@Output() public machineInputChange = new EventEmitter<any>();
	@Output() public changeStartDate = new EventEmitter<any>();
	@Output() public statusChange = new EventEmitter<any>();
	@Output() public changeTE = new EventEmitter<any>();
	@Output() public calculateEnd = new EventEmitter<any>();
	@Output() public changeTool = new EventEmitter<any>();
	@Output() public planOperation = new EventEmitter<any>();
	@Output() public saveEvent = new EventEmitter<any>();
	@Output() public constraintChange = new EventEmitter<any>();
	@Output() onSubmit: EventEmitter<any> = new EventEmitter();
	@ViewChild("maintenanceText") maintenanceText?: any;
	@ViewChild("saveButton") saveButton?: Button;
	@ViewChild("toolsComboBox") toolsComboBox?: ComboBox;
	@ViewChild("constraintComboBox") constraintComboBox?: ComboBox;
    clientName = environment.clientName;
	prodOrderPosOperationStatusClass = ProdOrderPosOperationStatusClass;
	prodOrderPosOperationStatus = ProdOrderPosOperationStatus;
	toastMessage: string = "";

	@Input() public set operationEnd(date: string) {
		if (date) {
			this.operationEndValue = date;
		} else {
			this.operationEndValue = "";
		}
	}

	@Input() public set saveButtonEnable(state: boolean) {
		this.saveButton!.disabled = state;
	}

	@ViewChild("teInput") teInput?: any;

	closeDialog() {
		this.closeMainDialog();
	}

	public closeMainDialog() {
		if (this.changeIsDialogOpen) {
			this.changeIsDialogOpen.emit(false);
		}
	}

	onSubmitForm(event: any) {
		this.onSubmit.emit(event);
	}

	onChangeMachine(event: any) {
		this.changeMachine.emit(event);
	}

	onMachineInputChange(event: any) {
		this.machineInputChange.emit(event);
	}

	onConstraintInputChange(event: any) {
		this.machineInputChange.emit(event);
	}

	onChangeStartDate() {
		this.changeStartDate.emit();
	}

	onStatusChange(event: any) {
		this.statusChange.emit(event);
	}

    onConstraintChange(event: any) {
        this.constraintChange.emit(event)
    }

	onChangeTE(event: any) {
		this.changeTE.emit(this.teInput.elementRef.nativeElement.value);
	}

	onChangeTool(event: any) {
		this.changeTool.emit(event);
	}

	onPlanOperation() {
		this.planOperation.emit();
	}

	calculateEndValue() {
		this.calculateEnd.emit();
	}

	onSave() {
		this.saveEvent.emit();
	}

	getAlternativeMachines() {
		return this.selectedOperation.prodOrderPosOperationAltMachines?.length
			? this.selectedOperation.prodOrderPosOperationAltMachines
					.map((alt: any) => `${alt.machine?.name}`)
					.join()
			: "";
	}

	getStatusText(status: string) {
		return status == "TERMINATED"
			? $localize`Planned`
			: status == "PLANNED"
				? $localize`Released`
				: this.prodOrderPosOperationStatusClass.getStateTranslate(status);
	}

	getConstraintText(event:any) {
		return MachineConstraintTypeClass.getStateTranslate(event);
	}

	statusTextChange(status: string) {
		if (status == $localize`Terminated`) return $localize`Planned`;
		if (status == $localize`Planned`) return $localize`Released`;
		return status;
	}

	getUsageFactor() {
		try {
			if (!this.selectedOperation.machine?.usage_factor) {
				return "0%";
			}
			const usageFactor =
				parseFloat(this.selectedOperation.machine?.usage_factor.split("%")[0]) * 100;
			return `${usageFactor}%`;
		} catch (e) {
			return "0%";
		}
	}

	getDueDate() {
		return this.selectedOperation?.prodOrderPos?.due_date
			? moment
					.utc(this.selectedOperation.prodOrderPos.due_date)
					.local()
					.format("DD.MM.YYYY HH:mm")
			: "";
	}
	getReleasedDate() {
		return this.selectedOperation?.prodOrderPos?.release_date
			? moment
					.utc(this.selectedOperation.prodOrderPos.release_date)
					.local()
					.format("DD.MM.YYYY HH:mm")
			: "";
	}
	copyToClipboard() {
		if (!navigator.clipboard) {
			this.toastMessage = $localize`Browser don't have support for native clipboard.`;
		} else {
			navigator.clipboard.writeText(this.selectedOperation.prodOrderPos.prodOrder.custom_id);
			this.toastMessage = `${this.selectedOperation.prodOrderPos.prodOrder.custom_id} ${$localize`copied to clipboard`}`;
		}
	}

    onChangeComponentAvailability(event:any) {
        if(event.target.checked) {
            this.selectedOperation.component_availability = "FULL";
        }else {
            this.selectedOperation.component_availability = "NONE";
        }
    }

    onReCalculateOperation() {
        this.recalculateOperation.emit();
    }
}
