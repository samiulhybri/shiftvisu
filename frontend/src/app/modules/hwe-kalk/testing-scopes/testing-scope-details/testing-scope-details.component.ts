import { Component, Input } from '@angular/core';
import { CommonService } from 'src/app/shared/services/common.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { Observable } from 'rxjs';
import { TestingScope } from '@app/models/testing-scope';
import { ODataBatchCall } from '@app/models/odata-batch-call';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { TestingScopeAttestationEntity } from '@app/models/testing-scope-attestation-entity';
import { TestingScopeAccordingToTensileTest } from '@app/models/testing-scope-according-to-tensile-test';
import { TestingScopeAccordingToImpactTest } from '@app/models/testing-scope-according-to-impact-test';
import { AttestationEntityClass } from '@app/modules/hwe-kalk/enums/AttestationEntity';
import { TestingScopeAccordingToTensileTestClass } from '@app/modules/hwe-kalk/enums/TestingScopeAccordingToTensileTest';
import { TestingScopeAccordingToImpactTestClass } from '@app/modules/hwe-kalk/enums/TestingScopeAccordingToImpactTest';
import { AttestationClass } from '@app/modules/hwe-kalk/enums/Attestation';
import { FrequencyClass } from '@app/modules/hwe-kalk/enums/Frequency';
import { SpecimenMaterialClass } from '@app/modules/hwe-kalk/enums/SpecimenMaterial';
import { BhpDimensionClass } from '@app/modules/hwe-kalk/enums/BhpDimension';
import { SpecimenLocationClass } from '@app/modules/hwe-kalk/enums/SpecimenLocation';
import { ImpactTestTypeClass } from '@app/modules/hwe-kalk/enums/ImpactTestType';
import { TensileTestWarmAccordingToClass } from '@app/modules/hwe-kalk/enums/TensileTestWarmAccordingTo';
import { HardnessTestAccordingToClass } from '@app/modules/hwe-kalk/enums/HardnessTestAccordingTo';
import { HardnessTestLocationClass } from '@app/modules/hwe-kalk/enums/HardnessTestLocation';
import { HardnessTestTypeClass } from '@app/modules/hwe-kalk/enums/HardnessTestType';
import { SpecimenDimensionClass } from '@app/modules/hwe-kalk/enums/SpecimenDimension';
import { ExtendedSampleSizeClass } from '@app/modules/hwe-kalk/enums/ExtendedSampleSize';
import { TestingScopeMeQualityClass } from '@app/modules/hwe-kalk/enums/TestingScopeMeQuality';
import { TestingScopeMqQualityClass } from '@app/modules/hwe-kalk/enums/MaterialAnalysisMqQuality';
import { TestingScopeMeltingType } from '@app/models/testing-scope-melting-type';
import { TestingScopeMeltingTypeClass } from '@app/modules/hwe-kalk/enums/TestingScopeMeltingType';
import { TestingClassifiedBy } from '@app/models/testing_scopes_classified_bies';
import {CalculationTestingScope} from '@app/models/calculation-testing-scope';
import { TestingScopeSampleDepthClass } from '@app/modules/hwe-kalk/enums/TestingScopeSampleDepth';
import {Notification} from "@shared/services/notification.service";
import {Documentation} from "@app/models/documentation";
import {CalculationDocumentation} from "@app/models/calculation-documentation";

@Component({
	selector: 'app-testing-scope-details',
	templateUrl: './testing-scope-details.component.html',
	styleUrls: ['./testing-scope-details.component.scss']
})
export class TestingScopeDetailsComponent {
	// public previousFormData?: TestingScope;
	public isLoaderEnabled: boolean = false;
	public attestationData!: Array<{ value: string, text: string }>;
	public frequencyData!: Array<{ value: string, text: string }>;
	public specimenMaterialData!: Array<{ value: string, text: string }>;
	public bhpDimensionData!: Array<{ value: string, text: string }>;
	public specimenLocationData!: Array<{ value: string, text: string }>;
	public sampleDepthData!: Array<{ value: string, text: string }>;
	public impactTestTypeData!: Array<{ value: string, text: string }>;
	public tensileTestWarmAccordingToData!: Array<{ value: string, text: string }>;
	public hardnessTestAccordingToData!: Array<{ value: string, text: string }>;
	public hardnessTestLocationData!: Array<{ value: string, text: string }>;
	public hardnessTestTypeData!: Array<{ value: string, text: string }>;
	public specimenDimensionData!: Array<{ value: string, text: string }>;
	public extendedSampleSizeData!: Array<{ value: string, text: string }>;
	public meQualityData!: Array<{ value: string, text: string }>;
	public mqQualityData!: Array<{ value: string, text: string }>;
	public classifiedByData!: TestingClassifiedBy[];
	public cmbClassifiedByData!: any;
	public attestationEntityData!: TestingScopeAttestationEntity[];
	public cmbAttestationEntityData!: any;
	public accordingToTensileTestData!: TestingScopeAccordingToTensileTest[];
	public cmbTestingScopeAccordingToTensileTestData!: any;
	public accordingToImpactTestData!: TestingScopeAccordingToImpactTest[];
	public cmbTestingScopeAccordingToImpactTestData!: any;
	public meltingTypeData!: TestingScopeMeltingType[];
	public cmbMeltingTypeData!: any;

	public oldData: any = {
		attestationEntities: [],
		accordingToTensileTests: [],
		accordingToImpactTests: [],
		meltingTypes: [],
		classifiedBies: [],
		sampleDepths: [],
	}

	testingScope?: TestingScope | CalculationTestingScope;
	@Input() set data(dataItem:TestingScope | CalculationTestingScope){
		this.testingScope  = dataItem;
		this.setDocumentation();
	};
	@Input() isAllDisabled: boolean = false;
	@Input() fromCalculation: boolean = false;

	constructor( protected _commonService: CommonService,
				 protected _notification: Notification) {
		this.getEnums()
	}
	setDocumentation(){
		if(!this.fromCalculation){
			if (this.testingScope == undefined) {
				this.testingScope = new TestingScope();
				this.getCustomId()
			} else {
				this.testingScope = new TestingScope().deserialize(this.testingScope);
				// this.previousFormData = JSON.parse(JSON.stringify(this.testingScope));
				this.oldData.meltingTypes = this.testingScope?.meltingTypes?.map((value: any) => value.id) ?? []
				this.oldData.classifiedBies = this.testingScope?.classifiedBies?.map((value: any) => value.id) ?? []
				this.oldData.attestationEntities = this.testingScope?.attestationEntities?.map((value: any) => value.id) ?? []
				this.oldData.accordingToTensileTests = this.testingScope?.accordingToTensileTests?.map((value: any) => value.id) ?? []
				this.oldData.accordingToImpactTests = this.testingScope?.accordingToImpactTests?.map((value: any) => value.id) ?? []
				this.oldData.sampleDepths = this.testingScope?.sampleDepths?.map((value: any) => value.id) ?? [];
			}
		}
	}
	ngOnInit() {
		if(!this.testingScope) this.setDocumentation();
	}


	isValueEmpty(value: any): boolean {
		return !value || typeof value === 'string' && !value.trim();
	}

	onSubmitError() {
		const ts = this.testingScope;

		if (
			this.isValueEmpty(ts?.custom_id) ||
			this.isValueEmpty(ts?.issue_revision) ||
			this.isValueEmpty(ts?.attestation) ||
			this.isValueEmpty(ts?.frequency)
		) {
			return true;
		}

		return false;
	}

	onAdd(event: PointerEvent, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Please select the required fields.`);
			return ;

		}
		grid.isWindowLoaderEnabled = true;
		return this._commonService.post(`TestingScopes`, this.testingScope?.toOdata()).subscribe({
			next: (res: any) => {
				grid.isWindowLoaderEnabled = false;
				grid.closeGridWindow = true;
				grid.gridRefersh.emit();
				 this._notification.showSuccess($localize`Data created successfully`);

			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false
				this._notification.showError(e ?? $localize`Something went wrong`);
			}
	   })
	}

	onUpdate(event: PointerEvent, grid: GridComponent) {
		if (this.onSubmitError()) {
			grid.isWindowLoaderEnabled = false;
			this._notification.showError($localize`Please select the required fields.`);
			return ;
		}
		grid.isWindowLoaderEnabled = true;
		this.deleteRelationData(grid)
		return null;
	}

	getEnums() {
		this.attestationData = AttestationClass.getEnumArray();
		this.frequencyData = FrequencyClass.getEnumArray();
		this.specimenMaterialData = SpecimenMaterialClass.getEnumArray();
		this.bhpDimensionData = BhpDimensionClass.getEnumArray();
		this.specimenLocationData = SpecimenLocationClass.getEnumArray();
		this.impactTestTypeData = ImpactTestTypeClass.getEnumArray();
		this.tensileTestWarmAccordingToData = TensileTestWarmAccordingToClass.getEnumArray();
		this.hardnessTestAccordingToData = HardnessTestAccordingToClass.getEnumArray();
		this.hardnessTestLocationData = HardnessTestLocationClass.getEnumArray();
		this.hardnessTestTypeData = HardnessTestTypeClass.getEnumArray();
		this.specimenDimensionData = SpecimenDimensionClass.getEnumArray();
		this.extendedSampleSizeData = ExtendedSampleSizeClass.getEnumArray();
		this.meQualityData = TestingScopeMeQualityClass.getEnumArray();
		this.mqQualityData = TestingScopeMqQualityClass.getEnumArray();
		this.meltingTypeData = TestingScopeMeltingTypeClass.getEnumArray().map((item: any) => {
			return {
				...item,
				melting_type: item.value,
			}
		})
		this.cmbMeltingTypeData = new ComboFilter(this.meltingTypeData);
		this.classifiedByData = AttestationEntityClass.getEnumArray().map((item: any) => {
			return {
				...item,
				classified_by: item.value,
			}
		})
		
		this.sampleDepthData = TestingScopeSampleDepthClass.getEnumArray().map((item: any) => {
			return {
				...item,
				sample_depth: item.value,
			}
		});
		this.cmbClassifiedByData = new ComboFilter(this.classifiedByData);
		this.attestationEntityData = AttestationEntityClass.getEnumArray().map((item: any) => {
			return {
				...item,
				attestation_entity: item.value,
			}
		});
		this.cmbAttestationEntityData = new ComboFilter(this.attestationEntityData);
		this.accordingToTensileTestData = TestingScopeAccordingToTensileTestClass.getEnumArray().map((item: any) => {
			return {
				...item,
				adjustment: item.value,
			}
		})
		this.cmbTestingScopeAccordingToTensileTestData = new ComboFilter(this.accordingToTensileTestData);

		this.accordingToImpactTestData = TestingScopeAccordingToImpactTestClass.getEnumArray().map((item: any) => {
			return {
				...item,
				test_direction: item.value,
			}
		});
		this.cmbTestingScopeAccordingToImpactTestData = new ComboFilter(this.accordingToImpactTestData);
	}

	deleteRelationData(grid: GridComponent) {
		let requests: ODataBatchCall[] = [];
		let i = 0;
		this.oldData.meltingTypes.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeMeltingTypes(${id})`)
			);
			i++;
		});
		this.oldData.classifiedBies.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeClassifiedBies(${id})`)
			);
			i++;
		})
		this.oldData.attestationEntities.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeAttestationEntities(${id})`)
			);
			i++;
		});
		this.oldData.accordingToTensileTests.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeAccordingToTensileTests(${id})`)
			);
			i++;
		})
		this.oldData.accordingToImpactTests.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeAccordingToImpactTests(${id})`)
			);
			i++;
		});	
		this.oldData.sampleDepths?.forEach((id: number) => {
			requests.push(new ODataBatchCall(
				i,
				"delete",
				`\/odata\/TestingScopeSampleDepths(${id})`)
			);
			i++;
		})

		this._commonService.post(`$batch`, { requests }).subscribe({
			next: (res) => {
                this.updateTestingScope(grid);
			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false
				this._notification.showError(e ?? $localize`Something went wrong`);
			}
		})
	}
    updateTestingScope(grid: GridComponent){
		this._commonService.put(`TestingScopes(${this.testingScope?.id})`, this.testingScope?.toOdata()).subscribe({
			next: (res: any) => {
				grid.isWindowLoaderEnabled = false;
				grid.closeGridWindow = true;
				grid.gridRefersh.emit();
				this._notification.showSuccess($localize`Data updated successfully`);
			},
			error: (e: any) => {
				grid.isWindowLoaderEnabled = false
				this._notification.showError(e ?? $localize`Something went wrong`);
			}
		})
	}
	async getCustomId() {
		this.isLoaderEnabled = true;
		let value = await this._commonService.getEntity('TestingScope')
			.catch(() => false)

		if (value) {
			this.testingScope!.custom_id = value
		}
		// this.previousFormData = JSON.parse(JSON.stringify(this.testingScope));
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
			case "according_to_tensile_test":
				this.accordingToTensileTestData = this.cmbTestingScopeAccordingToTensileTestData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
			case "according_to_impact_test":
				this.accordingToImpactTestData = this.cmbTestingScopeAccordingToImpactTestData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
			case "melting_types":
				this.meltingTypeData = this.cmbMeltingTypeData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
			case "classified_bies":
				this.classifiedByData = this.cmbClassifiedByData.handleLocalDataFilter(
					value,
					"text"
				);
				break;
		}
	}
}
