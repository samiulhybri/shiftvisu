import { Component, Input } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable, Subscription, switchMap, catchError, tap, throwError } from 'rxjs';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { AttestationEntity } from '@app/models/attestation-entity';
import { AttestationEntityClass } from '@app/modules/hwe-kalk/enums/AttestationEntity';
import { NonDestructiveTesting } from '@app/models/non-destructive-testing';
import { NonDestructiveTestingClass } from '@app/modules/hwe-kalk/enums/NonDestructiveTesting';
import { MaxResidualFieldStrengthUnitClass } from '@app/modules/hwe-kalk/enums/MaxResidualFieldStrengthUnit';
import { SurfaceCrackTestMethod, SurfaceCrackTestMethodClass } from '@app/modules/hwe-kalk/enums/SurfaceCrackTestMethod';
import { CalculationNonDestructiveTesting } from '@app/models/calculation-non-destructive-testing';
import { UsNorm } from '@app/models/us-norm';
import { PtNorm } from '@app/models/pt-norm';
import { VtNorm } from '@app/models/vt-norm';
import { MtNorm } from '@app/models/mt-norm';
import { Notification } from '@app/shared/services/notification.service';

@Component({
	selector: 'app-non-destructive-testing-details',
	templateUrl: './non-destructive-testing-details.component.html',
	styleUrls: ['./non-destructive-testing-details.component.scss']
})
export class NonDestructiveTestingDetailsComponent {
	public isLoaderEnabled: boolean = false;
	public nonDestructiveTestingData!: Array<{ value: string, text: string }>;
	public maxResidualFieldStrengthUnitData!: Array<{ value: string, text: string }>;
	public surfaceCrackTestMethodData!: Array<{ value: string, text: string }>;
	public surfaceCrackTestMethod = SurfaceCrackTestMethod;
	public attestationEntityData!: AttestationEntity[];
	public batchSubscription!: Subscription;
	public cmbAttestationEntityData!: any;
	public gridInstance!: GridComponent;
	public usNorms?: UsNorm[];
	public cmbUsNorms?: any;
	public ptNorms?: PtNorm[];
	public cmbPtNorms?: any;
	public vtNorms?: VtNorm[];
	public cmbVtNorms?: any;
	public mtNorms?: MtNorm[];
	public cmbMtNorms?: any;
	public oldData: any = {
		attestationEntities: []
	}
	nonDestructiveTesting?: NonDestructiveTesting | CalculationNonDestructiveTesting;
	disabledCustomId	 = false
	@Input() set data(dataItem: NonDestructiveTesting | CalculationNonDestructiveTesting) {
		this.nonDestructiveTesting = dataItem;
		if (dataItem instanceof CalculationNonDestructiveTesting) {
			 this.disabledCustomId = true;
		 }
		this.setNondestructivetesting();
	};
	@Input() isAllDisabled: boolean = false;
	@Input() fromCalculationNonDestructiveTesting: boolean = false;

	constructor(protected _commonService: CommonService,
		protected _notification: Notification) {
		this.getEnums();
		this.getComboData();
	}
	setNondestructivetesting() {
		if (!this.fromCalculationNonDestructiveTesting) {
			if (this.nonDestructiveTesting == undefined) {
				this.nonDestructiveTesting = new NonDestructiveTesting().deserialize({});
				this.getCustomId()
			} else {
				this.nonDestructiveTesting = new NonDestructiveTesting().deserialize(this.nonDestructiveTesting);
				this.oldData.attestationEntities = this.nonDestructiveTesting?.attestationEntities?.map((value: any) => value.id) ?? []
				if (this.nonDestructiveTesting?.nonDestructiveNorm?.id) this.getNormData(this.nonDestructiveTesting?.nonDestructiveNorm?.id);
			}
		}
	}

	getNormData(nonDestructiveNormId: Number) {
       if(!this.fromCalculationNonDestructiveTesting){
		   this._commonService.get(`hwe-kalk/non-destructive-testing/norm/${nonDestructiveNormId}`, false).subscribe({
			   next: (response: any) => {
				   if (response.norm) this.setNorm(response.norm)

			   }, error: () => this.isLoaderEnabled = false
		   })
	   }

	}

	setNorm(norm: PtNorm | VtNorm | MtNorm) {
		switch (this.nonDestructiveTesting?.surface_crack_test_method) {
			case SurfaceCrackTestMethod.PT:
				this.nonDestructiveTesting.ptNorm = norm as PtNorm;
				break;
			case SurfaceCrackTestMethod.VT:
				this.nonDestructiveTesting.vtNorm = norm as VtNorm;
				break;
			case SurfaceCrackTestMethod.MT:
				this.nonDestructiveTesting.mtNorm = norm as MtNorm;
				break;
		}
	}

	ngOnInit() {
		if (!this.nonDestructiveTesting) this.setNondestructivetesting();
	}

	onSubmitError() {
		if (
			!this.nonDestructiveTesting?.custom_id?.trim() ||
			!this.nonDestructiveTesting?.non_destructive_testing
		) {
			return true;
		}
		return false;
	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		grid.isWindowLoaderEnabled = true;
		this.gridInstance = grid;
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Please select the required fields.`);
		}

		return this._commonService.post(`NonDestructiveTestings`, this.nonDestructiveTesting?.toOdata())
			.subscribe({
				next: (response: any) => {
					if (this.nonDestructiveTesting?.getNormId() && this.nonDestructiveTesting?.surface_crack_test_method) this.createOrUpdateMorph(response.id)
					else {
						this.gridInstance.isWindowLoaderEnabled = false;
						this.gridInstance.gridRefersh.emit();
						this.gridInstance.closeGridWindow = true;
						this._notification.showSuccess($localize`Data created successfully`);
					}
					
				},
				error: () => {
					grid.isWindowLoaderEnabled = false;
					this._notification.showError($localize`Something went wrong`);
				}
			});
	}

	createOrUpdateMorph(nonDestructiveTestingId: number) {
		let payload = {
			norm_type: this.nonDestructiveTesting?.surface_crack_test_method,
			norm_id: this.nonDestructiveTesting?.getNormId()
		}
		return this._commonService.post(`hwe-kalk/non-destructive-testing/create-update/morph/${nonDestructiveTestingId}`, { ...payload }, false).subscribe({
			next: (response: any) => {
				this.gridInstance.isWindowLoaderEnabled = false;
				this.gridInstance.gridRefersh.emit();
				this.gridInstance.closeGridWindow = true;
				this._notification.showSuccess($localize`Data updated successfully`)
			}, error: () => {
				this.gridInstance.isWindowLoaderEnabled = false;
				this._notification.showError($localize`Something went wrong`);
			}
		})
	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		this.gridInstance = grid;
		grid.isWindowLoaderEnabled = true;
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Please select the required fields.`);
		}
		if (this.nonDestructiveTesting?.id) this.createOrUpdateMorph(this.nonDestructiveTesting.id)
		
		this.processRelationDataUpdate()
	}

	processRelationDataUpdate() {
		const updateNonDestructiveTesting = () => 
			this._commonService.put(
				`NonDestructiveTestings(${this.nonDestructiveTesting?.id})`, 
				this.nonDestructiveTesting?.toOdata()
			);
	
		const handleSuccess = () => {
			this.gridInstance.isWindowLoaderEnabled = false;
			this.gridInstance.closeGridWindow = true;
			this.gridInstance.gridRefersh.emit();
		};
	
		const handleError = (err: any) => {
			console.error('Error during delete or update:', err);
			this.gridInstance.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Something went wrong`);
			return throwError(() => err);
		};
	
		if (this.oldData.attestationEntities.length > 0) {
			return this.deleteRelationData().pipe(
				switchMap(() => updateNonDestructiveTesting()),
				tap(handleSuccess),
				catchError(handleError)
			);
		} else {
			return updateNonDestructiveTesting().subscribe({
				next: handleSuccess,
				error: (err) => {
					console.error('Error during update:', err);
					this.gridInstance.isWindowLoaderEnabled = false;
					this._notification.showError($localize`Something went wrong`);
				}
			});
		}
	}

	getEnums() {
		this.nonDestructiveTestingData = NonDestructiveTestingClass.getEnumArray();
		this.maxResidualFieldStrengthUnitData = MaxResidualFieldStrengthUnitClass.getEnumArray();
		this.surfaceCrackTestMethodData = SurfaceCrackTestMethodClass.getEnumArray();
		this.attestationEntityData = AttestationEntityClass.getEnumArray().map((item: any) => {
			return {
				...item,
				attestation_entity: item.value,
			}
		});
		this.cmbAttestationEntityData = new ComboFilter(this.attestationEntityData);
	}

	deleteRelationData() :Observable<any> {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		
		this.oldData.attestationEntities.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/NonDestructiveTestingAttestationEntities(${id})`)
			);
			i++;
		});
		return this._commonService.post(`$batch`, { requests })
	}

	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('NonDestructiveTesting')
			.catch(() => false)
		if (value) {
			this.nonDestructiveTesting!.custom_id = value
		}
		this.isLoaderEnabled = false;
	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "attestation_entity":
				this.attestationEntityData = this.cmbAttestationEntityData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
			case "us_norm":
				this.usNorms = this.cmbUsNorms.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
			case "pt_norm":
				this.ptNorms = this.cmbPtNorms.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
			case "vt_norm":
				this.vtNorms = this.cmbVtNorms.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
			case "mt_norm":
				this.mtNorms = this.cmbMtNorms.handleLocalDataFilter(
					value,
					"custom_id"
				);
				break;
		}


	}

	getComboData() {
		this.isLoaderEnabled = true;
		let requests: ODataBatchCall[] = [];

		requests.push(new ODataBatchCall(
			0,
			"get",
			`\/odata\/UsNorms?select(id,custom_id,name)&$top=10000000`)
		)
		requests.push(new ODataBatchCall(
			1,
			"get",
			`\/odata\/PtNorms?select(id,custom_id,name)&$top=10000000`)
		)
		requests.push(new ODataBatchCall(
			2,
			"get",
			`\/odata\/VtNorms?select(id,custom_id,name)&$top=10000000`)
		)
		requests.push(new ODataBatchCall(
			3,
			"get",
			`\/odata\/MtNorms?select(id,custom_id,name)&$top=10000000`)
		)

		this.batchSubscription = this._commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {

				this.usNorms = response.responses[0].body.value;
				this.cmbUsNorms = new ComboFilter(this.usNorms);
				this.ptNorms = response.responses[1].body.value;
				this.cmbPtNorms = new ComboFilter(this.ptNorms);
				this.vtNorms = response.responses[2].body.value;
				this.cmbVtNorms = new ComboFilter(this.vtNorms);
				this.mtNorms = response.responses[3].body.value;
				this.cmbMtNorms = new ComboFilter(this.mtNorms);
				this.isLoaderEnabled = false;
			},
			error: () => this.isLoaderEnabled = false
		})
	}
}
