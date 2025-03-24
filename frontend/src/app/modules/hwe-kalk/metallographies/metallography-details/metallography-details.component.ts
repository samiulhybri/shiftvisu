import { Component, Input } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { catchError, Observable, switchMap } from 'rxjs';
import { Metallography } from '@app/models/metallography';
import { GrainSizeAccordingToDeterminationClass } from '../../enums/GrainSizeAccordingToDetermination';
import { GrainSizeAfterCarburizingClass } from '../../enums/GrainSizeAfterCarburizing';
import { CleanlinessAccordingToDeterminationClass } from '../../enums/CleanlinessAccordingToDetermination';
import { CleanlinessDeterminationClass } from '../../enums/CleanlinessDetermination';
import { Cleanliness50602Class } from '../../enums/Cleanliness50602';
import { Cleanliness4967Class } from '../../enums/Cleanliness4967';
import { MicrostructureAssessmentClass } from '../../enums/MicrostructureAssessment';
import { MicrostructureQuotaClass } from '../../enums/MicrostructureQuota';
import { NeedsAccordingToIcClass } from '../../enums/NeedsAccordingToIc';
import { CalculationMetallography } from '@app/models/calculation-metallography';
import { ODataBatchCall } from '@app/models/odata-batch-call';

@Component({
	selector: 'app-metallography-details',
	templateUrl: './metallography-details.component.html',
	styleUrls: ['./metallography-details.component.scss']
})
export class MetallographyDetailsComponent {
	public isLoaderEnabled: boolean = false;
	public grainSizeAccordingToDeterminationDataSource!: Array<{ value: string, text: string }>;
	public grainSizeAfterCarburizingDataSource!: Array<{ value: string, text: string }>;
	public cleanlinessAccordingToDeterminationDataSource!: Array<{ value: string, text: string }>;
	public cleanlinessDeterminationDataSource!: Array<{ value: string, text: string }>;
	public cleanliness50602DataSource!: Array<{ value: string, text: string }>;
	public microstructureAssessmentDataSource!: Array<{ value: string, text: string }>;
	public microstructureQuotaDataSource!: Array<{ value: string, text: string }>;
	public needsAccordingToIcDataSource!: Array<{ value: string, text: string }>;
	disabledCustomId	 = false

	metallography?:Metallography;
	public oldData: any = {
		cleanliness_determination_according_to: []
	};
	
	@Input() set data(dataItem:Metallography | CalculationMetallography){
		this.metallography  = dataItem;
		if (dataItem instanceof CalculationMetallography) {
			 this.disabledCustomId = true;
		 }
		this.setMetallography();
	};
	@Input() isAllDisabled: boolean = false;
	@Input() fromCalculationMetallography: boolean = false;

	constructor(public _commonService: CommonService) {
		this.grainSizeAccordingToDeterminationDataSource = GrainSizeAccordingToDeterminationClass.getEnumArray();
		this.grainSizeAfterCarburizingDataSource = GrainSizeAfterCarburizingClass.getEnumArray();
		this.cleanlinessAccordingToDeterminationDataSource = CleanlinessAccordingToDeterminationClass.getEnumArray();
		this.cleanlinessDeterminationDataSource = CleanlinessDeterminationClass.getEnumArray();
		this.cleanliness50602DataSource = Cleanliness50602Class.getEnumArray();
		this.microstructureAssessmentDataSource = MicrostructureAssessmentClass.getEnumArray();
		this.microstructureQuotaDataSource = MicrostructureQuotaClass.getEnumArray();
		this.needsAccordingToIcDataSource = NeedsAccordingToIcClass.getEnumArray();
	}

	setMetallography(){
		if(!this.fromCalculationMetallography){
			if (!this.metallography) {
				this.metallography = new Metallography();
				this.getCustomId();
			} else {
				this.metallography = new Metallography().deserialize(this.metallography);
				this.oldData.cleanlinessDeterminationAccordingTo = this.metallography?.cleanlinessDeterminationAccordingTo?.map((value: any) => value.id) ?? [];
			}
		}
	}

	ngOnInit() {
		if(!this.metallography) this.setMetallography();
	}

	onSubmitError() {
		if (
			!this.metallography?.custom_id?.trim() ||
			!this.metallography?.regulation?.trim() ||
			!this.metallography?.issue_revision?.trim() ||
			(
				this.metallography?.microstructure_quota &&
				(
					this.metallography?.microstructure_max_quota === undefined ||
					this.metallography?.microstructure_max_quota === null
				)
			)
		) {
			return true;
		}

		return false;
	}

	onAdd(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select all required fields.`);
			});
		}

		return this._commonService.post(`Metallographies`, this.metallography?.toOdata());
	}

	onUpdate(e: any, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false
			return new Observable(observer => {
				observer.error($localize`Please select all required fields.`);
			});
		}

		return this.deleteRelationData().pipe(
			switchMap(() => {
				return this._commonService.put(`Metallographies(${this.metallography?.id})`, this.metallography?.toOdata());
			}),
			catchError(err => {
				console.error('Error during delete or update:', err)
				throw err;
			})
		)
	}

	deleteRelationData() : Observable<any> {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.cleanlinessDeterminationAccordingTo.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/MetallographyCleanlinessDeterminationAccordings(${id})`)
			);
			i++;
		});

		return this._commonService.post(`$batch`, { requests })
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('Metallography').catch(() => false)
		if (value) this.metallography!.custom_id = value;
		this.isLoaderEnabled = false;
	}

}
