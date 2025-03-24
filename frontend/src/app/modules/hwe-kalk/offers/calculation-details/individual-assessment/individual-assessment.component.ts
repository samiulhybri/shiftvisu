import {Component, inject, Input} from '@angular/core';
import { Calculation } from '@app/models/calculation';
import { Deformation } from '@app/models/deformation';
import { NonDestructiveTesting } from '@app/models/non-destructive-testing';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import { HweKalkService } from "@app/modules/hwe-kalk/hwe-kalk.service";
import {tap, timer} from "rxjs";
@Component({
	selector: 'app-individual-assessment',
	templateUrl: './individual-assessment.component.html',
	styleUrls: ['./individual-assessment.component.scss']
})
export class IndividualAssessmentComponent {
	public nonDestructiveTestings: NonDestructiveTesting[] = [];
	public deformations: Deformation[] = [];
	public cmbNonDestructiveTestings: any;
	public cmbDeformations: any;
	public infoPopupWidth: string = '90vw';
	public infoPopupModel: any = undefined;
	public selectedAssessmentType: string = '';
	public isInfoPopupClosed: boolean = false;
	@Input() isWindowLoaderEnabled: boolean = false;
	@Input() calculation?: Calculation;
	public authService  = inject(AuthService)
	@Input() set indIeformations(deformations: Deformation[]) {
		this.deformations = [...deformations]
		this.cmbDeformations = new ComboFilter(this.deformations);
	};
	@Input() set indNonDestructiveTestings(nonDestructiveTestings: NonDestructiveTesting[]) {
		this.nonDestructiveTestings = [...nonDestructiveTestings]
		this.cmbNonDestructiveTestings = new ComboFilter(
			this.nonDestructiveTestings
		);
	}
	constructor(public hweKalkService : HweKalkService) {
	}
isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_INDIVIDUAL_ASSESSMENT_EDIT)
	}
	handleFilter(value: String, src: String) {
		switch (src) {
			case "non_destructive_testing":
				this.nonDestructiveTestings =
					this.cmbNonDestructiveTestings.handleLocalDataFilter(
						value,
						"custom_id"
					);
				break;
			case "deformation":
				this.deformations =
					this.cmbDeformations.handleLocalDataFilter(
						value,
						"custom_id"
					);
				break;
		}
	}
	openInfoPopup(type: string) {
		switch (type) {
			case 'individualNonDestructiveTesting':
				this.infoPopupWidth = '90vw';
				break;
			case 'individualDeformation':
				this.infoPopupWidth = '50vw';
				break;
		}

		this.selectedAssessmentType = type;
		this.infoPopupModel = {};

	}
	onInfoPopupCancel() {
		this.isInfoPopupClosed = true;
		this.infoPopupModel = undefined;
	}

	protected readonly permissionEnum = PermissionEnum;
}
