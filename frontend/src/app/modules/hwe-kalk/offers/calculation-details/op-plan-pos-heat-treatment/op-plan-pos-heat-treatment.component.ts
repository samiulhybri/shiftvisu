import {Component, inject, Input, Output} from "@angular/core";
import { OperationPlanPos } from "@app/models/operation-plan-pos";
import { OperationPlanPosHeatTreatmeant } from "@app/models/operation_plan_pos_heat_treatments";
import { HweQuenchingMediumClass } from "@app/modules/hwe-kalk/enums/HweQuenchingMedium";
import { Notification } from '@app/shared/services/notification.service';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import { HweKalkService } from "@app/modules/hwe-kalk/hwe-kalk.service";

@Component({
	selector: "app-op-plan-pos-heat-treatment",
	templateUrl: "./op-plan-pos-heat-treatment.component.html",
	styleUrls: ["./op-plan-pos-heat-treatment.component.scss"],
})
export class OpPlanPosHeatTreatmentComponent {
	public isDeletedAll: boolean = false;
	@Input() opPlanPos?: OperationPlanPos;
	public hweQuenchingMediumDataSource!: Array<{ value: string, text: string }>;
	ngOnInit(): void {
	}
	public authService  = inject(AuthService)

	constructor(protected _notification: Notification,
				public hweService : HweKalkService
				) {
		this.hweQuenchingMediumDataSource = HweQuenchingMediumClass.getEnumArray();

	}

	addHeatTreatment() {
		this.opPlanPos?.operationPlanPosHeatTreatments.push(new OperationPlanPosHeatTreatmeant())

	}
	isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_HEAT_TREATMENT_EDIT)
	}
	checkHeatTreatMent() {
		let isDisable = false;
		this.opPlanPos?.operationPlanPosHeatTreatments.map((item: OperationPlanPosHeatTreatmeant) => {
			if (!item.isDeleted) isDisable = true;
		});
		return isDisable;
	}

	deleteOne(index: number) {
		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == 'next') {
				if (this.opPlanPos && this.opPlanPos.operationPlanPosHeatTreatments[index]) this.opPlanPos.operationPlanPosHeatTreatments[index].isDeleted = true;

			}
		});

	}
}
