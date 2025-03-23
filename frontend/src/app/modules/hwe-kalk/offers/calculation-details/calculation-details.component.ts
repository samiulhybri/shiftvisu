import {
	ChangeDetectorRef,
	Component,
	EventEmitter,
	Input,
	inject,
	OnDestroy,
	Output,
	ViewChild,
	ViewContainerRef,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { CommonService } from "src/app/shared/services/common.service";
import { ODataServiceFactory } from "angular-odata";
import { lastValueFrom, Observable, Subscription } from "rxjs";
import { HweKalkService } from "@app/modules/hwe-kalk/hwe-kalk.service";
import { Notification } from "src/app/shared/services/notification.service";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { OfferPos } from "@app/models/offer-pos";
import { Calculation } from "@app/models/calculation";
import { OperationPlanPos } from "@app/models/operation-plan-pos";
import { ODataBatchCall } from "@app/models/odata-batch-call";
import { GridComponent } from "@app/shared/components/kendo/grid/grid.component";
import { OfferPosProductType, OfferPosProductTypeClass } from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import { DeliveryStateClass } from "@app/modules/hwe-kalk/enums/DeliveryState";
import { Material } from "@app/models/material";
import { OfferPosRawDimension } from "@app/models/offer-pos-raw-dimension";
import { RawDimensionType } from "@app/models/raw-dimension-type";
import { CalculationHeatTreatment } from "@app/models/calculation-heat-treatment";
import { OfferPosRejectionTypeClass } from "@app/modules/hwe-kalk/enums/OfferPosRejectionType";
import { CalculationAdditionalHeatTreatment } from "@app/models/calculation-additional-heat-treatment";
import { OfferPosDimensionShaftUpsetPart } from "@app/models/offer-pos-dimension-shaft-upset-part";
import { OfferPosDimensionUpsetPartForgedBeam } from "@app/models/offer-pos-dimension-upset-part-forged-beam";
import { OfferPosMechanicalProcess } from "@app/models/offer-pos-mechanical-process";
import { OfferPosStatusClass } from "@app/modules/hwe-kalk/enums/OfferPosStatus";
import { EnumStructure } from "@app/types/Enum";
import { OldCalculationTemplate } from "@app/types/OldCalculationTemplate";
import { OperationPlanPosHeatTreatmeant } from "@app/models/operation_plan_pos_heat_treatments";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@app/services/auth.service";
import { PermissionEnum } from "@app/enums/permissions-enum";
import { ProdOrderPos } from "@app/models/prod-order-pos";

@Component({
	selector: "app-calculation-details",
	templateUrl: "./calculation-details.component.html",
	styleUrls: ["./calculation-details.component.scss"],
})

export class CalculationDetailsComponent implements OnDestroy {
	public isValidate = true;
	public materials: Material[] = [];
	public cmbMaterials: any;
	public deletableId: any = [];
	public rawdeletableId: any = [];
	public submitted: boolean = false;
	public operationPlanPosID!: number;
	public offers: any = "offers";
	public isWindowLoaderEnabled: boolean = false;
	public salesOpportunities: any;
	public items: any;
	public isClientOreder: boolean = false;
	public exceptAssessment: boolean = false;
	@Output() clientOrederEmitor = new EventEmitter<any>();
	public offerPos!: OfferPos;
	public calculation?: Calculation;
	public opPlanPos?: OperationPlanPos[];
	public calculationHeatTreatments?: CalculationHeatTreatment[];
	public calculationAdditionalHeatTreatments?: CalculationAdditionalHeatTreatment[];
	public hasValidationErrorHeatTreatment: boolean = false;
	public hasValidationErrorAssesment: boolean = false;
	public hasValidationErrorOperatingWeight: boolean = false;
	public hasValidationErrorBasismaterial: boolean = false;
	public hasValidationErrorAdditionalHeatTreatment: boolean = false;
	public quantityExcessError: boolean = false;
	public offerPosProductType!: Array<EnumStructure>;
	public rejects!: Array<EnumStructure>;
	public deliveryState!: Array<EnumStructure>;
	public batchSubscription!: Subscription;
	public previousFormData!: FormGroup;
	public machineGroups: any;
	public matchOfferPosPopUpShow = false;
	public offerPosFetchUrl?: string;
	public offerPosStatus!: Array<EnumStructure>;
	public oldCalculationTemplate: OldCalculationTemplate = {};
	public offerPosIndex?: number;
	public permissionEnum = PermissionEnum;
	public authService = inject(AuthService)
	public hasCopyOfferAssessmentPermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_POS_COPY_OFFER_ASSESSMENT_BUTTON_VIEW);
	public hasCopyOfferPermission: boolean = this.authService.isPermissionValidate(this.permissionEnum.HWEKALK_OFFER_POS_COPY_OFFER_POS_BUTTON_VIEW);
	public prodOrderPosList: ProdOrderPos[] = [];
	public cmbProdOrderPos: any;
	public selectCalProdOrderPos: ProdOrderPos[] = [];
	public copyForm: string = "";
	public calculationPayload: any[] = [];
	public selectedMaterial: any = [];
	public isMaterialChanged: boolean = false;


	@Input() set data(dataItem: any) {
		this.batchSalesOpCustomer();
		this.getEnumValueWithLang();
		if (dataItem != undefined) {
			this.setDataItem(dataItem);
		}
	}

	@Output() onUpdateEmit = new EventEmitter<any>();
	public calculationData!: any;
	public cmpRef!: any;
	@ViewChild("modalBody", { read: ViewContainerRef }) modalBody!: ViewContainerRef;
	protected readonly offerPosProductTypeClass = OfferPosProductTypeClass;

	constructor(protected formBuilder: FormBuilder,
		public _commonService: CommonService,
		public hweKalkService: HweKalkService,
		public factory: ODataServiceFactory,
		protected _notification: Notification,
		private route: ActivatedRoute,
		protected _authService: AuthService,
		private cdr: ChangeDetectorRef,
	) {
		this.rawdeletableId = this.hweKalkService.deleteRawDimensions;
	}

	ngOnInit() {
		let calId = this.route.snapshot.paramMap.get("id");
		if (calId) {
			this.hweKalkService.fromCalDetail = false;
			const url = `Calculations(${calId})?$expand=offerPos(select=id)&select=id,offer_pos_id`;
			this._commonService.get(url).subscribe({
				next: (response: any) => {
					this.setDataItem(response.offerPos);
				}, error: (e) => {
					this.calculationData = false;
				},
			});
		}

	}

	public form: FormGroup = this.initializeForm();

	public operationForm: FormGroup = this.formBuilder.group({
		operations: this.formBuilder.array([]),
	});

	get operations(): FormArray {
		return this.operationForm.controls["operations"] as FormArray;
	}

	getEnumValueWithLang() {
		this.offerPosProductType = OfferPosProductTypeClass.getEnumArray();
		this.deliveryState = DeliveryStateClass.getEnumArray();
		this.rejects = OfferPosRejectionTypeClass.getEnumArray();
		this.offerPosStatus = OfferPosStatusClass.getEnumArray();
	}

	setDataItem(offerPos: any) {
		let opPlanPos;
		let isNullCalculation = false;
		let offerPosData;
		if (offerPos?.hasOwnProperty("index")) {
			this.offerPosIndex = offerPos.index;
			offerPosData = offerPos.offer.id
		} else {
			offerPosData = offerPos.id
			this.isClientOreder = true;
		}
		this.offerPos = new OfferPos().deserialize(offerPos);
		const url = `OfferPos(${offerPosData})?$expand=item($expand=hweClassificationGiesstyp,hweClassificationLieferant,hweClassificationBlockTyp,hweClassificationWerkstoff),copyForm($expand=offer(select=id,custom_id);select=id,pos),item,tool,tool_2,tool_3,mechanicalProcesses,material(expand=materialDatabases),offerPosRawDimensions(expand=rawDimensionTypes,offerPosDimensionShaftUpsetParts,offerPosDimensionUpsetPartForgedBeams),offer,calculation($expand=calculationHardenabilityRange($expand=materials),calculationNonDestructiveTesting($expand=attestationEntities,usNorm,nonDestructiveNorm),hweWorkPlan,hardenabilityRange($expand=materials),materialAnalysis(expand=materials,chemAnalyses),calculationMaterialAnalysis(expand=materials,chemAnalyses),deformation,calculationDeformation,residualMaterial,calculationDocumentation($expand=certificates),nonDestructiveTesting($expand=attestationEntities,usNorm,nonDestructiveNorm),calculationMetallography($expand=cleanlinessDeterminationAccordingTo),calculationResidualMaterial,specification($expand=hweWorkPlan,metallography($expand=cleanlinessDeterminationAccordingTo),documentation,testingScope($expand=sampleDepths,attestationEntities,accordingToTensileTests,accordingToImpactTests,meltingTypes,classifiedBies),hardenabilityRange($expand=materials),materialAnalysis(expand=materials,chemAnalyses),calculationMaterialAnalysis(expand=materials,chemAnalyses),deformation,calculationDeformation,residualMaterial),individualNonDestructiveTesting,individualDeformation,metallography($expand=cleanlinessDeterminationAccordingTo),documentation($expand=certificates),calculationTestingScope($expand=sampleDepths,attestationEntities,accordingToTensileTests,accordingToImpactTests,meltingTypes,classifiedBies),testingScope($expand=sampleDepths,attestationEntities,accordingToTensileTests,accordingToImpactTests,meltingTypes,classifiedBies),nonDestructiveTesting($expand=attestationEntities,usNorm,nonDestructiveNorm),usNorm($expand=adjustments,testDirections,probes),mtNorm($expand=controlUnits),ptNorm,vtNorm($expand=auxiliaryMeans,testTechniques),residualMaterial,heatTreatments,additionalHeatTreatments,operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments,machine($expand=costCenter($expand=costCenterCostToday)))))`

		this._commonService.get(url).subscribe({
			next: (res: any) => {
				this.offerPos = new OfferPos().deserialize(res);
				this.selectedMaterial = this.offerPos.material;
				this.copyForm = this.offerPos?.copyForm ? `${this.offerPos.copyForm.offer.custom_id}, ${this.offerPos?.copyForm?.pos}` : "";
				this.offers = res.offer.custom_id;
				opPlanPos = this.offerPos.calculation?.operationPlan?.operationPlanPos;

				if (this.offerPos.calculation?.calculationDocumentation?.id) {
					this.oldCalculationTemplate.documentaion_id = this.offerPos?.calculation.calculationDocumentation?.id;
					this.oldCalculationTemplate.documentaion_certificates = this.offerPos?.calculation?.calculationDocumentation?.certificates.map((value: any) => value.id) ?? [];
					if (this.offerPos.calculation.calculationDocumentation) {
						const calcDoc = this.offerPos.calculation.calculationDocumentation;
						if (calcDoc.custom_id === undefined) {
							calcDoc.custom_id = this.offerPos.calculation.documentation?.custom_id ?? undefined;
						}
					}
				}

				if (this.offerPos.calculation?.calculationNonDestructiveTesting?.id) {
					this.oldCalculationTemplate.non_destructive_testing_id = this.offerPos.calculation.calculationNonDestructiveTesting.id;
					this.oldCalculationTemplate.non_destructive_testing_attestation = this.offerPos.calculation.calculationNonDestructiveTesting?.attestationEntities?.map((value: any) => value.id) ?? [];
					if (this.offerPos.calculation.calculationNonDestructiveTesting) {
						const calcNonDestructiveTesting = this.offerPos.calculation.calculationNonDestructiveTesting;
						if (calcNonDestructiveTesting.custom_id === undefined) {
							calcNonDestructiveTesting.custom_id = this.offerPos.calculation.calculationNonDestructiveTesting?.custom_id ?? this.offerPos.calculation.nonDestructiveTesting?.custom_id ?? undefined;
						}
					}
				}
				if (this.offerPos.calculation?.calculationMetallography?.id) {
					this.oldCalculationTemplate.metallography_id = this.offerPos.calculation.calculationMetallography.id;
					this.oldCalculationTemplate.cleanliness_determination = this.offerPos.calculation.calculationMetallography?.cleanlinessDeterminationAccordingTo?.map((value: any) => value.id) ?? [];
					if (this.offerPos.calculation.calculationMetallography) {
						const calcMeta = this.offerPos.calculation.calculationMetallography;
						if (calcMeta.custom_id === undefined) {
							calcMeta.custom_id = this.offerPos.calculation.metallography?.custom_id ?? undefined;
						}
					}
				}
				if (this.offerPos.calculation?.calculationResidualMaterial?.id) {
					this.oldCalculationTemplate.residual_material_id = this.offerPos.calculation.calculationResidualMaterial.id;
					if (this.offerPos.calculation.calculationResidualMaterial) {
						const calcResmaterial = this.offerPos.calculation.calculationResidualMaterial;
						if (calcResmaterial.custom_id === undefined) {
							calcResmaterial.custom_id = this.offerPos.calculation.calculationResidualMaterial?.custom_id ?? this.offerPos.calculation.residualMaterial?.custom_id ?? undefined;
						}
					}
				}

				if (this.offerPos.calculation?.calculationHardenabilityRange?.id) {
					this.oldCalculationTemplate.hardenability_range_id = this.offerPos.calculation.calculationHardenabilityRange.id;
					if (this.offerPos.calculation.calculationHardenabilityRange) {
						const calchardenabilityRange = this.offerPos.calculation.calculationHardenabilityRange;
						if (calchardenabilityRange.custom_id === undefined) {
							calchardenabilityRange.custom_id = this.offerPos.calculation.calculationHardenabilityRange?.custom_id ?? this.offerPos.calculation.hardenabilityRange?.custom_id ?? undefined;
						}
					}
				}
				if (this.offerPos.calculation?.calculationMaterialAnalysis?.id) {
					this.oldCalculationTemplate.calculation_material_analysis_id = this.offerPos.calculation.calculationMaterialAnalysis.id;
					if (this.offerPos.calculation.calculationMaterialAnalysis) {
						const cal = this.offerPos.calculation.calculationMaterialAnalysis;
						if (cal.custom_id === undefined) {
							cal.custom_id = this.offerPos.calculation.calculationMaterialAnalysis?.custom_id ?? this.offerPos.calculation.materialAnalysis?.custom_id ?? undefined;
						}
					}
				}
				if (this.offerPos.calculation?.calculationDeformation?.id) {
					this.oldCalculationTemplate.calculation_deformation_id = this.offerPos.calculation.calculationDeformation.id;
					if (this.offerPos.calculation.calculationDeformation) {
						const cal = this.offerPos.calculation.calculationDeformation;
						if (cal.custom_id === undefined) {
							cal.custom_id = this.offerPos.calculation.deformation?.custom_id ?? this.offerPos.calculation.calculationDeformation?.custom_id ?? undefined;
						}
					}
				}

				if (this.offerPos.calculation?.calculationTestingScope?.id) {
					this.oldCalculationTemplate.testing_scope_id = this.offerPos.calculation.calculationTestingScope.id;
					if (this.offerPos.calculation.calculationTestingScope) {
						const calcTscope = this.offerPos.calculation.calculationTestingScope;
						if (calcTscope.custom_id === undefined) {
							calcTscope.custom_id = this.offerPos.calculation.testingScope?.custom_id ?? undefined;
						}
					}
				}

				if (!this.offerPos.calculation) {
					this.offerPos.calculation = this.createMewCalcularions();
					isNullCalculation = true;
				}
				this.calculation = this.offerPos.calculation;

				this.opPlanPos = this.offerPos.calculation?.operationPlan?.operationPlanPos ?? [];
				if (isNullCalculation) this.opPlanPos.pop();
				opPlanPos?.forEach((data: OperationPlanPos, index: number) => {
					const opataion = this.formBuilder.group({
						...data,
						pos: [data.pos, Validators.required],
					});
					this.operations.push(opataion);
				});
				this.form.patchValue({
					...this.offerPos,

					calculation: { ...this.offerPos.calculation },
				});

				this.calculationHeatTreatments = this.offerPos.calculation.heatTreatments ?? [];
				this.calculationAdditionalHeatTreatments = this.offerPos.calculation.additionalHeatTreatments ?? [];
				this.setQuantity();
			},
		})
	}

	setQuantity() {
		this.offerPos.offerPosRawDimensions?.map((rawDimension: OfferPosRawDimension, index: number) => {
			if (!rawDimension.quantity_final_for_raw && !rawDimension.quantity_raw_piece && index === 0) {
				rawDimension.quantity_raw_piece = 1;
				rawDimension.quantity_final_for_raw = this.offerPos.quantity ?? 0;
			} else if (!rawDimension.quantity_final_for_raw && !rawDimension.quantity_raw_piece) {
				rawDimension.quantity_raw_piece = 1;
				rawDimension.quantity_final_for_raw = 0;
			}
		});
	}

	createMewCalcularions(): Calculation {
		let input = {
			id: null,
			custom_id: null,
			operationPlanPos: [{
				pos: null,
				operation_plan_id: null,
				machine: null,
				name: null,
				te: null,
				tr: null,
			}],
		};
		return new Calculation().deserialize({
			...this.form.value.calculation,
			operationPlan: input,
		});
	}

	createNewopPlanPos(workPlan?: any) {
		let newopPlanPos = new OperationPlanPos();
		if (workPlan) {
			newopPlanPos.pos = workPlan.pos;
			newopPlanPos.name = workPlan.name;
			newopPlanPos.unit = workPlan.unit;
			newopPlanPos.machine = workPlan.machine;
			newopPlanPos.te = workPlan.te;
		} else newopPlanPos.pos = this.getPosValue();
		return newopPlanPos;
	}

	getPosValue() {
		if (this.opPlanPos?.length == 0) return "10";
		else {
			let lastPos;
			this.opPlanPos?.forEach((value: any, index: number) => {
				if (index + 1 == this.opPlanPos?.length) lastPos = value.pos;
			});
			let pos = Number(lastPos);
			return pos ? (pos + 10).toString() : "";
		}
	}

	addOpperations(workPlans: any) {
		this.submitted = false;
		if (workPlans) {
			for (let workPlan of workPlans) {
				this.opPlanPos!.push(this.createNewopPlanPos(workPlan));
			}

		} else this.opPlanPos!.push(this.createNewopPlanPos());
	}

	initializeForm(): FormGroup {
		return this.formBuilder.group({
			id: null,
			offer_id: ["", Validators.required],
			pos: ["", Validators.required],
			standard_item_id: null,
			item_name: null,
			quantity: [null, Validators.required],
			product_type: [null, Validators.required],
			material: [null],
			drawing_id: null,
			attachments: null,
			customer_material_number: null,
			delivery_state: [null, Validators.required],
			is_divergent: null,
			min_allowance_outer_diameter: null,
			max_allowance_outer_diameter: null,
			min_allowance_side_a: null,
			max_allowance_side_a: null,
			min_allowance_side_b: null,
			max_allowance_side_b: null,
			min_allowance_inner_diameter: null,
			max_allowance_inner_diameter: null,
			min_allowance_height: null,
			max_allowance_height: null,
			min_allowance_length: null,
			max_allowance_length: null,
			calculation: this.formBuilder.group({
				id: null,
				operation_plan_id: ["", Validators.required],
				metallography: null,
				documentation: null,
				testingScope: null,
				nonDestructiveTesting: null,
				specification: null,
				residualMaterial: null,
				bom_id: null,
				specification_note: null,
				internal_note: null,
				note_linked_operations: null,
				sales_order: null,
				sales_order_pos: null,
				prod_order_pos: null,
				revision: null,
				delivery_weight: null,
				note_machining: null,
				offer_pos_id: ["", Validators.required],
			}),
		});
	}

	async onUpdate(event?: PointerEvent, gridComponent?: GridComponent) {
		this.submitted = true;
		this.isValidate = true;
		this.checkValidation();
		if (!this.offerPos.pos ||
			!this.offerPos.pos.trim() ||
			!this.offerPos.quantity ||
			!this.offerPos.product_type ||
			!this.offerPos.delivery_state ||
			!this.isValidate ||
			this.hasValidationErrorHeatTreatment ||
			this.hasValidationErrorAdditionalHeatTreatment ||
			this.quantityExcessError ||
			this.hasValidationErrorAssesment ||
			this.hasValidationErrorOperatingWeight ||
			this.hasValidationErrorBasismaterial
		) {
			return new Observable(observer => {
				observer.error("error");
			});
		}
		this.isWindowLoaderEnabled = true;

		if (!this.calculation?.id) {
			let value = await this._commonService.getEntity("OperationPlan")
				.catch(() => false);
			this.calculation!.offer_pos_id = this.offerPos.id;
			let operationPlan = {
				custom_id: !value ? null : value,
				calculations: [{ ...this.calculation?.toOdata() }],
			};
			const response: any = await lastValueFrom(this._commonService.post("OperationPlans", operationPlan));
			this.operationPlanPosID = response.id;
			this.calculation!.operation_plan_id = response.id;
			this.calculation!.id = response.calculations[0].id;
		} else if (!this.calculation?.operation_plan_id && this.calculation?.id) {
			const response: any = await lastValueFrom(this._commonService.post("OperationPlans", { custom_id: null }));
			this.operationPlanPosID = response.id;
			this.calculation!.operation_plan_id = response.id;
		}
		let idIncrement = 0;
		let requests: ODataBatchCall[] = [];
		let offerPos = new ODataBatchCall(
			idIncrement,
			"patch",
			`\/odata\/OfferPos(${this.offerPos.id})`,
		);
		idIncrement += 1;
		offerPos.body = this.offerPos.toOdata(true);
		requests.push(offerPos);
		let calculation = new ODataBatchCall(
			idIncrement,
			this.calculation?.id == null ? "post" : "patch",
			this.calculation?.id == null ? `\/odata\/Calculations` : `\/odata\/Calculations(${this.calculation.id})`,
		);
		calculation.body = this.calculation?.toOdata();
		requests.push(calculation);

		idIncrement += 1;
		const chem = this.operations;
		for (let i = 0; i < chem.controls.length; i++) {
			chem.controls[i].markAsTouched();
		}

		// delete data
		this.deletableId.forEach((id: any) => {
			idIncrement += 1;

			let requestData = new ODataBatchCall(
				idIncrement,
				"delete",
				`\/odata\/OperationPlanPos(${id})`,
			);
			requests.push(requestData);
		});
		// Delete Heat Treatment
		this.calculationHeatTreatments?.map((item: CalculationHeatTreatment) => {
			if (item.isDeleted && item.id) {
				idIncrement += 1;
				let requestData = new ODataBatchCall(
					idIncrement,
					"delete",
					`\/odata\/CalculationHeatTreatments(${item.id})`,
				);
				requests.push(requestData);
			}
		});
		// Delete Additional Heat Treatment
		this.calculationAdditionalHeatTreatments?.map((item: CalculationAdditionalHeatTreatment) => {
			if (item.isDeleted && item.id) {
				idIncrement += 1;
				let requestData = new ODataBatchCall(
					idIncrement,
					"delete",
					`\/odata\/CalculationAdditionalHeatTreatments(${item.id})`,
				);
				requests.push(requestData);
			}
		});
		// rawdeletableId  data
		this.rawdeletableId.forEach((id: any) => {
			idIncrement += 1;
			let requestData = new ODataBatchCall(
				idIncrement,
				"delete",
				`\/odata\/OfferPosRawDimensions(${id})`,
			);
			requests.push(requestData);
		});
		if (this.offerPos.product_type == OfferPosProductType.SHAFT || this.offerPos.product_type == OfferPosProductType.UPSET_PART || this.offerPos.product_type == OfferPosProductType.SHAFT_HOLLOW) {
			this.hweKalkService.deleteShaftUpsetParts.map((id: number) => {
				let requestData = new ODataBatchCall(
					idIncrement,
					"delete",
					`\/odata\/OfferPosShaftUpsetParts(${id})`,
				);
				requests.push(requestData);
				idIncrement += 1;
			});

			this.hweKalkService.deleteDimesionShaftUpsetParts.map((id: number) => {
				let requestData = new ODataBatchCall(
					idIncrement,
					"delete",
					`\/odata\/OfferPosDimensionShaftUpsetParts(${id})`,
				);
				requests.push(requestData);
				idIncrement += 1;
			});
			if (this.offerPos.product_type == OfferPosProductType.UPSET_PART) {
				this.hweKalkService.deleteUpsetPartForgedBeams.map((id: number) => {
					let requestData = new ODataBatchCall(
						idIncrement,
						"delete",
						`\/odata\/OfferPosDimensionUpsetPartForgedBeams(${id})`,
					);
					requests.push(requestData);
					idIncrement += 1;
				});
			}
		}

		this.offerPos.offerPosRawDimensions?.forEach((data: OfferPosRawDimension) => {
			let method = data.hasOwnProperty("id") ? "patch" : "post";
			let rawData = new ODataBatchCall(
				idIncrement,
				method,
				data.hasOwnProperty("id") ? `\/odata\/OfferPosRawDimensions(${data.id})` : `\/odata\/OfferPosRawDimensions`,
			);


			if (method === "post") {
				let offerPosDimesion: any = [];
				let offerPosDimesionForgedBeams: any = [];
				data.offerPosDimensionShaftUpsetParts.map((dimensionShaftUpsetPart: OfferPosDimensionShaftUpsetPart, index: number) => {
					let value = {
						...dimensionShaftUpsetPart.toOdata(),
						type: this.offerPos.product_type,
						section: index + 1,
					};
					offerPosDimesion.push(value);
				});
				//ForgedBeams
				data.offerPosDimensionUpsetPartForgedBeams.map((upsetPartForgedBeams: OfferPosDimensionUpsetPartForgedBeam, index: number) => {
					let value = {
						...upsetPartForgedBeams.toOdata(),
						type: this.offerPos.product_type,
						section: index + 1,
					};
					offerPosDimesionForgedBeams.push(value);
				});
				rawData.body = {
					...data.toOdata(),
					offer_pos_id: this.offerPos?.id,
					offerPosDimensionShaftUpsetParts: (this.offerPos.product_type === OfferPosProductType.SHAFT || this.offerPos.product_type === OfferPosProductType.UPSET_PART || this.offerPos.product_type === OfferPosProductType.SHAFT_HOLLOW)
						? offerPosDimesion
						: undefined,
					offerPosDimensionUpsetPartForgedBeams: (this.offerPos.product_type === OfferPosProductType.UPSET_PART)
						? offerPosDimesionForgedBeams
						: undefined,
				};
			} else {
				rawData.body = {
					...data.toOdata(method === "patch"),
					offer_pos_id: this.offerPos?.id,
				};
			}
			requests.push(rawData);
			idIncrement += 1;
			if (method === "patch") {
				data.rawDimensionTypes.forEach((rawDimensionType: RawDimensionType) => {
					idIncrement += 1;
					let rawDimensionTypeType = new ODataBatchCall(
						idIncrement,
						rawDimensionType.id ? "patch" : "POST",
						rawDimensionType.id ? `\/odata\/RawDimensionTypes(${rawDimensionType.id})` : `\/odata\/RawDimensionTypes`,
					);
					rawDimensionTypeType.body = rawDimensionType;
					requests.push(rawDimensionTypeType);
				});
				if (this.offerPos.product_type === OfferPosProductType.SHAFT || this.offerPos.product_type === OfferPosProductType.UPSET_PART || this.offerPos.product_type === OfferPosProductType.SHAFT_HOLLOW) {
					data.offerPosDimensionShaftUpsetParts.forEach((dimensionShaftUpsetPart: OfferPosDimensionShaftUpsetPart, index: number) => {
						idIncrement += 1;
						let isIdProperty = dimensionShaftUpsetPart.hasOwnProperty("id");
						let dimensionShaftUpsetPartReq = new ODataBatchCall(
							idIncrement,
							isIdProperty ? "patch" : "post",
							isIdProperty ? `\/odata\/OfferPosDimensionShaftUpsetParts(${dimensionShaftUpsetPart.id})` : `\/odata\/OfferPosDimensionShaftUpsetParts`,
						);
						dimensionShaftUpsetPartReq.body = {
							...dimensionShaftUpsetPart.toOdata(),
							offer_pos_raw_dimension_id: data.id,
							type: this.offerPos.product_type,
							section: index + 1,
						};
						requests.push(dimensionShaftUpsetPartReq);
					});
					// ForgedBeams
					if (this.offerPos.product_type === OfferPosProductType.UPSET_PART) {
						data.offerPosDimensionUpsetPartForgedBeams.forEach((upsetPartForgedBeams: OfferPosDimensionUpsetPartForgedBeam, index: number) => {
							idIncrement += 1;
							let isIdProperty = upsetPartForgedBeams.hasOwnProperty("id");
							let dimensionUpsetPartReq = new ODataBatchCall(
								idIncrement,
								isIdProperty ? "patch" : "post",
								isIdProperty ? `\/odata\/OfferPosDimensionUpsetPartForgedBeams(${upsetPartForgedBeams.id})` : `\/odata\/OfferPosDimensionUpsetPartForgedBeams`,
							);
							dimensionUpsetPartReq.body = {
								...upsetPartForgedBeams.toOdata(),
								offer_pos_raw_dimension_id: data.id,
								type: this.offerPos.product_type,
								section: index + 1,
							};
							requests.push(dimensionUpsetPartReq);
						});
					}
				}
			}
		});
		this.opPlanPos?.forEach((data: OperationPlanPos, index: number) => {
			let opData = new ODataBatchCall(
				idIncrement,
				data.hasOwnProperty("id") ? "patch" : "post",
				data.hasOwnProperty("id") ? `\/odata\/OperationPlanPos(${data.id})` : `\/odata\/OperationPlanPos`,
			);
			opData.body = {
				...data.toOdata(data.hasOwnProperty("id") ? false : true),
				operation_plan_id: this.calculation?.operation_plan_id,
			};
			requests.push(opData);
			idIncrement += 1;
			if (data.hasOwnProperty("id")) {
				data.operationPlanPosHeatTreatments.map((heatTratement: OperationPlanPosHeatTreatmeant) => {
					if (heatTratement.id) {
						if (heatTratement.isDeleted) {
							let heatReq = new ODataBatchCall(
								idIncrement,
								"delete",
								`\/odata\/OperationPlanPosHeatTreatments(${heatTratement.id})`,
							);

							requests.push(heatReq);
						} else {
							let heatReq = new ODataBatchCall(
								idIncrement,
								"patch",
								`\/odata\/OperationPlanPosHeatTreatments(${heatTratement.id})`,
							);
							heatReq.body = {
								...heatTratement.toOdata(),
								operation_plan_pos_id: data.id,
							};
							requests.push(heatReq);
						}

					} else {
						if (!heatTratement.isDeleted) {
							let heatReq = new ODataBatchCall(
								idIncrement,
								"post",
								`\/odata\/OperationPlanPosHeatTreatments`,
							);
							heatReq.body = {
								...heatTratement.toOdata(),
								operation_plan_pos_id: data.id,
							};
							requests.push(heatReq);
						}
					}
					idIncrement += 1;
				});
			}

		});
		// Heat Treatment
		this.calculationHeatTreatments?.forEach((data: any, index: number) => {
			if (!data.isDeleted) {
				let heatTreatmentData = new ODataBatchCall(
					idIncrement,
					data.hasOwnProperty("id") ? "patch" : "post",
					data.hasOwnProperty("id") ? `\/odata\/CalculationHeatTreatments(${data.id})` : `\/odata\/CalculationHeatTreatments`,
				);
				heatTreatmentData.body = {
					...data.toOdata(),
					calculation_id: this.calculation?.id,
				};
				requests.push(heatTreatmentData);
				idIncrement += 1;
			}
		});

		// Additional Heat Treatment
		this.calculationAdditionalHeatTreatments?.forEach((data: any, index: number) => {
			if (!data.isDeleted) {
				let additionalHeatTreatmentData = new ODataBatchCall(
					idIncrement,
					data.hasOwnProperty("id") ? "patch" : "post",
					data.hasOwnProperty("id") ? `\/odata\/CalculationAdditionalHeatTreatments(${data.id})` : `\/odata\/CalculationAdditionalHeatTreatments`,
				);
				additionalHeatTreatmentData.body = {
					...data.toOdata(),
					calculation_id: this.calculation?.id,
				};
				requests.push(additionalHeatTreatmentData);
				idIncrement += 1;
			}
		});
		this.hweKalkService.deleteMechanicalProcesses.map((id: number) => {
			let requestData = new ODataBatchCall(
				idIncrement,
				"delete",
				`\/odata\/OfferPosMechanicalProcesses(${id})`,
			);
			requests.push(requestData);
			idIncrement += 1;
		});
		this.offerPos?.mechanicalProcesses?.forEach((data: OfferPosMechanicalProcess, index: number) => {
			let opData = new ODataBatchCall(
				idIncrement,
				data.hasOwnProperty("id") ? "patch" : "post",
				data.hasOwnProperty("id") ? `\/odata\/OfferPosMechanicalProcesses(${data.id})` : `\/odata\/OfferPosMechanicalProcesses`,
			);
			opData.body = {
				...data.toOdata(),
				offer_pos_id: this.offerPos.id,
				section: index + 1,
			};
			requests.push(opData);
			idIncrement += 1;
		});
		this.calculationDocumentTemplate();
		this.calculationResidualMaterialTemplate();
		this.calculationNonDestructiveTestingTemplate();
		this.calculationMetallographyTemplate();
		this.calculationTestingScopeTemplate();
		this.calculationHardenabilityRangeTemplate();
		this.calculationDeformationTemplate();
		this.calculationMaterialChemicalTemplate();
		await this.updateProdOrderPos(requests, idIncrement);
		return this._commonService.post(`$batch`, { requests }).subscribe({
			next: (response: any) => {
				this.calculation!.id = response.responses[1]?.body?.id;

				if (this.calculationPayload.length > 0) {
					this.callCalculationApi()
				} else {
					this.hweKalkService.onCalcUpdateSubject.next(true);
					this.isWindowLoaderEnabled = false;
				}

				if (this.isClientOreder) {
					if (gridComponent?.editDataItem) gridComponent.editDataItem = undefined;
					if (gridComponent?.isWindowLoaderEnabled) gridComponent.isWindowLoaderEnabled = false;
				}
				this._notification.showSuccess($localize`Data updated successfully`);
			},
			error: (e) => {
				this.isWindowLoaderEnabled = false;
				this._notification.showError($localize`Something went wrong`);
			},
		});

	}

	callCalculationApi() {
		this._commonService.post(`hwe-kalk/update-related-assessment`, { payloads: this.calculationPayload }, false).subscribe({
			next: (response) => {
				this.hweKalkService.onCalcUpdateSubject?.next(true);
				this.isWindowLoaderEnabled = false;
			},
			error: (error) => {
				console.error('API call failed:', error);
				this.hweKalkService.onCalcUpdateSubject?.next(true);
				this.isWindowLoaderEnabled = false;
			},
		});
	}

	async updateProdOrderPos(requests: ODataBatchCall[], idIncrement: number) {
		let response: any = await lastValueFrom(this._commonService.get(`ProdOrderPos?$select=id,calculation_id&$filter=calculation_id eq ${this.calculation?.id}`));
		const prevData = response.value;
		if (prevData.length > 0) {
			prevData.forEach((elm: any) => {
				let call = new ODataBatchCall(
					requests.length,
					"put",
					`\/odata\/ProdOrderPos(${elm.id})`,
				);
				call.body = {
					"calculation_id": null,
				};
				requests.push(call);
			});
		}
		this.selectCalProdOrderPos.forEach((elm: any) => {
			let call = new ODataBatchCall(
				requests.length,
				"put",
				`\/odata\/ProdOrderPos(${elm.id})`,
			);
			call.body = {
				"calculation_id": this.calculation?.id,
			};
			requests.push(call);
		});
	}

	calculationDocumentTemplate() {
		let calculationDocumentation = this.calculation?.calculationDocumentation;

		if (this.oldCalculationTemplate.documentaion_id && !calculationDocumentation?.documentation_id) {
			//Delete existing documentation in case of previously saved documentation is available but selected documentation is not available

			this.calculationPayload.push({
				section: 'calculationDocumentation',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.documentaion_id },
			});
		}

		if (this.oldCalculationTemplate.documentaion_id && calculationDocumentation?.documentation_id) {
			//Patch existing documentation in case of previously saved documentation is available and selected documentation is available

			this.calculationPayload.push({
				section: 'calculationDocumentation',
				request: 'patch',
				data: { documentationData: calculationDocumentation },
			});
		}

		if (!this.oldCalculationTemplate.documentaion_id && calculationDocumentation?.documentation_id) {
			//Post existing documentation in case of previously saved documentation is not available and selected documentation is available

			this.calculationPayload.push({
				section: 'calculationDocumentation',
				request: 'post',
				data: { documentationData: calculationDocumentation },
			});
		}
	}

	calculationMetallographyTemplate() {
		let calculationMetallography = this.calculation?.calculationMetallography;

		if (this.oldCalculationTemplate.metallography_id && !calculationMetallography?.metallography_id) {
			//Delete existing metallography if previously saved metallography is available but selected metallogrpahy is not available

			this.calculationPayload.push({
				section: 'calculationMetallography',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.metallography_id },
			});
		}

		if (this.oldCalculationTemplate.metallography_id && calculationMetallography?.metallography_id) {
			//Patch request existing metallography if previously saved metallography is available and selected metallogrpahy is available

			this.calculationPayload.push({
				section: 'calculationMetallography',
				request: 'patch',
				data: { metallographyData: calculationMetallography },
			});
		}

		if (!this.oldCalculationTemplate.metallography_id && calculationMetallography?.metallography_id) {
			//Post request if previously saved metallography is not available and selected metallogrpahy is available

			this.calculationPayload.push({
				section: 'calculationMetallography',
				request: 'post',
				data: { metallographyData: calculationMetallography },
			});
		}
	}

	calculationNonDestructiveTestingTemplate() {
		let calculationNonDestructiveTesting = this.calculation?.calculationNonDestructiveTesting;

		if (this.oldCalculationTemplate.non_destructive_testing_id && !calculationNonDestructiveTesting?.non_destructive_testing_id) {
			//Delete exisiting non destructive testing in case of existing material is available but selected non destructive testing is not available

			this.calculationPayload.push({
				section: 'calculationNonDestructiveTesting',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.non_destructive_testing_id },
			});
		}

		if (this.oldCalculationTemplate.non_destructive_testing_id && calculationNonDestructiveTesting?.non_destructive_testing_id) {
			//Patch request for exisiting non destructive testing in case of existing material is available and selected non destructive testing is available

			this.calculationPayload.push({
				section: 'calculationNonDestructiveTesting',
				request: 'patch',
				data: { nonDestructiveTesting: calculationNonDestructiveTesting },
			});
		}

		if (!this.oldCalculationTemplate.non_destructive_testing_id && calculationNonDestructiveTesting?.non_destructive_testing_id) {
			//Post request for exisiting non destructive testing in case of existing material is not available and selected non destructive testing is available

			this.calculationPayload.push({
				section: 'calculationNonDestructiveTesting',
				request: 'post',
				data: { nonDestructiveTesting: calculationNonDestructiveTesting },
			});
		}
	}

	calculationResidualMaterialTemplate() {
		let calculationResidualMaterial = this.calculation?.calculationResidualMaterial;

		if (this.oldCalculationTemplate.residual_material_id && !calculationResidualMaterial?.residual_material_id) {
			//Delete exisiting residual material in case of existing material is available but selected residual material is not available

			this.calculationPayload.push({
				section: 'calculationResidualMaterial',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.residual_material_id },
			});
		}

		if (this.oldCalculationTemplate.residual_material_id && calculationResidualMaterial?.residual_material_id) {
			//Patch request in case of in case of existing material is available and selected residual material is  available

			this.calculationPayload.push({
				section: 'calculationResidualMaterial',
				request: 'patch',
				data: { residualMaterialData: calculationResidualMaterial },
			});
		}

		if (!this.oldCalculationTemplate.residual_material_id && calculationResidualMaterial?.residual_material_id) {
			//Post request in case of in case of existing residual material is not available but selected residual material is available

			this.calculationPayload.push({
				section: 'calculationResidualMaterial',
				request: 'post',
				data: { residualMaterialData: calculationResidualMaterial },
			});
		}

	}

	calculationHardenabilityRangeTemplate() {
		let hardenabilityRange = this.calculation?.calculationHardenabilityRange;

		if (this.oldCalculationTemplate.hardenability_range_id && !hardenabilityRange?.hardenability_range_id) {
			//Deleting existing hardenability range in case of previously saved hardenability range is available but selected hardenability range is not found

			this.calculationPayload.push({
				section: 'calculationHardenAbilityRange',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.hardenability_range_id },
			});
		}

		if (this.oldCalculationTemplate.hardenability_range_id && hardenabilityRange?.hardenability_range_id) {
			//Patch request for existing hardenability range in case of previously saved hardenability range is available and selected hardenability range is available

			this.calculationPayload.push({
				section: 'calculationHardenAbilityRange',
				request: 'patch',
				data: { hardenAbilityRange: hardenabilityRange },
			});
		}

		if (!this.oldCalculationTemplate.hardenability_range_id && hardenabilityRange?.hardenability_range_id) {
			//Post request for existing hardenability range in case of previously saved hardenability range is not available and selected hardenability range is available

			this.calculationPayload.push({
				section: 'calculationHardenAbilityRange',
				request: 'post',
				data: { hardenAbilityRange: hardenabilityRange },
			});
		}
	}

	calculationMaterialChemicalTemplate() {
		let calMatAnalysis = this.calculation?.calculationMaterialAnalysis;

		if (this.oldCalculationTemplate.calculation_material_analysis_id && !calMatAnalysis?.material_analysis_id) {
			//Delete request for material analysis in case of previously saved material analysis is available but selected material analysis is not available

			this.calculationPayload.push({
				section: 'calculationMaterialAnalysis',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.calculation_material_analysis_id },
			});
		}

		if (this.oldCalculationTemplate.calculation_material_analysis_id && calMatAnalysis?.material_analysis_id) {
			//Patch request for material analysis in case of previously saved material analysis is available and selected material analysis is also available

			this.calculationPayload.push({
				section: 'calculationMaterialAnalysis',
				request: 'patch',
				data: { materialAnalysisData: calMatAnalysis },
			});
		}
		if (!this.oldCalculationTemplate.calculation_material_analysis_id && calMatAnalysis?.material_analysis_id) {
			//Post request for material analysis in case of previously saved material is not available but selected material analysis is available

			this.calculationPayload.push({
				section: 'calculationMaterialAnalysis',
				request: 'post',
				data: { materialAnalysisData: calMatAnalysis },
			});
		}
	}

	calculationDeformationTemplate() {
		let calDeformation = this.calculation?.calculationDeformation;

		if (this.oldCalculationTemplate.calculation_deformation_id && !calDeformation?.deformation_id) {
			//Delete request 

			this.calculationPayload.push({
				section: 'calculationDeformation',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.calculation_deformation_id },
			});
		}


		if (this.oldCalculationTemplate.calculation_deformation_id && calDeformation?.deformation_id) {
			//Patch request

			this.calculationPayload.push({
				section: 'calculationDeformation',
				request: 'patch',
				data: { deformationData: calDeformation },
			});
		}

		if (!this.oldCalculationTemplate.calculation_deformation_id && calDeformation?.deformation_id) {
			//Post request

			this.calculationPayload.push({
				section: 'calculationDeformation',
				request: 'post',
				data: { deformationData: calDeformation },
			});
		}
	}

	calculationTestingScopeTemplate() {
		let calculationTestingScope = this.calculation?.calculationTestingScope;

		if (this.oldCalculationTemplate.testing_scope_id && !calculationTestingScope?.testing_scope_id) {
			//Deleting existing testing scope in case of selected calculation testing scope id is not available

			this.calculationPayload.push({
				section: 'calculationTestingScope',
				request: 'delete',
				data: { deleteAbleId: this.oldCalculationTemplate.testing_scope_id },
			});
		}

		if (this.oldCalculationTemplate.testing_scope_id && calculationTestingScope?.testing_scope_id) {
			//Patch request as both testing id is available

			this.calculationPayload.push({
				section: 'calculationTestingScope',
				request: 'patch',
				data: { testingScopeData: calculationTestingScope },
			});
		}

		if (!this.oldCalculationTemplate.testing_scope_id && calculationTestingScope?.testing_scope_id) {
			//Post request as old testing id is not available

			this.calculationPayload.push({
				section: 'calculationTestingScope',
				request: 'post',
				data: { testingScopeData: calculationTestingScope },
			});
		}
	}

	addPostRequest(body: any, idIncrement: number, baseUrl: string): ODataBatchCall {
		const payload = new ODataBatchCall(
			idIncrement,
			"post",
			`${baseUrl}`
		);
		payload.body = body;
		return payload;
	}

	// Function to add a DELETE request for any given OData entity
	addDeleteRequest(scopeId: number | string, idIncrement: number, baseUrl: string): ODataBatchCall {
		const payload = new ODataBatchCall(
			idIncrement,
			"delete",
			`${baseUrl}(${scopeId})`
		);
		return payload;
	}

	checkValidation() {
		let operationsData = this.opPlanPos;
		operationsData?.forEach((data: any, index: number) => {
			if (!data.pos ||
				!data.pos.trim()
			) {
				this.isValidate = false;
				this._notification.showError($localize`Required Fields missing in Work Plan.`);
				return;
			}
		});

		this.hasValidationErrorBasismaterial = false;
		this.hasValidationErrorHeatTreatment = false;
		this.calculationHeatTreatments?.forEach((data: CalculationHeatTreatment) => {
			if (!data.isDeleted && (data.pos === null || !data.type)) {
				this.hasValidationErrorHeatTreatment = true;
				this._notification.showError($localize`Required Fields missing in Heat Treatment.`);
				return;
			}
		});


		this.hasValidationErrorAdditionalHeatTreatment = false;
		this.calculationAdditionalHeatTreatments?.forEach((data: CalculationAdditionalHeatTreatment) => {
			if (!data.isDeleted && (data.pos === null || !data.type)) {
				this.hasValidationErrorAdditionalHeatTreatment = true;
				this._notification.showError($localize`Required Fields missing in Additional Heat Treatment.`);
				return;
			}
		});

		this.quantityExcessError = false;

		this.hasValidationErrorOperatingWeight = false;

		let totalRm = 0;

		this.offerPos.offerPosRawDimensions?.map((rawDimension: OfferPosRawDimension, index: number) => {

			if (!rawDimension.operating_weight && this.offerPos.product_type != 'DISK') {
				this.hasValidationErrorOperatingWeight = true;
				this._notification.showError($localize`Required Fields missing in Dimension/Material Usage.`);
			}
			if (rawDimension.quantity_raw_piece && rawDimension.quantity_final_for_raw) {
				totalRm += rawDimension.quantity_raw_piece * rawDimension.quantity_final_for_raw;
			}
		});
		let quantity = this.offerPos.quantity ?? 0;
		if (totalRm && quantity) {
			if (totalRm > quantity) {
				this.quantityExcessError = true;
				this._notification.showError($localize`The raw part quantities do not match the quantity of the offer item.`);
			}
		}
		this.hasValidationErrorAssesment = false;
		let materailDatabase = this.offerPos?.material?.materialDatabases[0];

		let heat = this.offerPos.calculation?.heatTreatments[0];
		let calculation = this.offerPos.calculation;
		if (heat?.pos == 10 && heat?.type == materailDatabase?.heat_treatment &&
			!calculation?.specification?.id &&
			materailDatabase
		) {
			if (calculation?.strength_span_min &&
				materailDatabase?.min_tensile_strength &&
				calculation?.strength_span_max &&
				materailDatabase?.max_tensile_strength &&
				calculation?.max_hardness &&
				calculation?.min_hardness &&
				materailDatabase.hardness
			) {
				if (calculation.strength_span_min < materailDatabase.min_tensile_strength ||
					calculation.strength_span_max > materailDatabase.max_tensile_strength ||
					calculation.max_hardness > materailDatabase.hardness ||
					calculation.min_hardness > materailDatabase.hardness
				) {
					this._notification.showError($localize`Hardness or strength do not correspond to the material database.`);
					this.hasValidationErrorAssesment = true;
				}
			}
		}
	}

	public close(dialog: string): void {
		this.matchOfferPosPopUpShow = false;
	}

	showMatchOfferPos(exceptAssessment = false) {
		this.offerPosFetchUrl = `OfferPos?$expand=offer(select=id,custom_id,request_date),material(select=id,custom_id),calculation(expand=calculationHardenabilityRange,heatTreatmentPosTen(select=id,type);select=id,text_final_dimensions)&$filter=id ne ${this.offerPos.id}&$top=5000`;
		this.matchOfferPosPopUpShow = true;
		this.exceptAssessment = exceptAssessment;
	}

	copyOfferPosdata(data: OfferPos) {
		let offer = {
			...this.offerPos.offer,
			salesOpportunity: undefined,
			customer: undefined,
			salesArea: undefined,
			salesGroup: undefined,
			sales_area: undefined,
			sales_group: undefined,
			delivery_term: undefined,
			deliveryTerm: undefined,
			country: undefined,
			offerPos: undefined,
			crm_id: undefined,
			offer: undefined,
			user: undefined,
			logs: undefined,
		};
		let payloadData = {
			offer: offer,
			offer_pos: {
				...data,
				material: undefined,
				calculation: undefined,
				offer: undefined,
				offerPosRawDimensions: undefined,
				calculation_heat_treatments_type: undefined,
				mechanicalProcesses: undefined,
				offerPosCosts: undefined,
			},
			offer_pos_id: this.offerPos.id,
			exceptAssessment: this.exceptAssessment,
		};
		payloadData.offer_pos.pos = this.offerPos.pos;

		this.isWindowLoaderEnabled = true;
		this._commonService.post("hwe-kalk/offer-pos/copy", payloadData, false).subscribe({
			next: (response: any) => {
				if (response.success) {
					this.exceptAssessment = false;
					this.setDataItem({id:response.offerPosId});
					this.hweKalkService.copyOfferPos.next({ offerPos: response, index: this.offerPosIndex });
					this.isWindowLoaderEnabled = false;
					this.matchOfferPosPopUpShow = false;
				}
			},
			error: (e) => {
				console.log(e);
				this.isWindowLoaderEnabled = false;
				this._notification.showError($localize`Something went wrong`);
			},
		});
	}
	batchSalesOpCustomer() {
		this.isWindowLoaderEnabled = true;
		let requests: ODataBatchCall[] = [];
		requests.push(new ODataBatchCall(
			0,
			"get",
			`\/odata\/Materials?$expand=materialDatabases&$top=10000000`),
		);

		requests.push(new ODataBatchCall(
			1,
			"get",
			`\/odata\/Tools?&$top=10000000`),
		);

		requests.push(new ODataBatchCall(2, "get", `\/odata\/ProdOrderPos?$select=id,prod_order_id,calculation_id,pos&$expand=prodOrder($select=id,custom_id)&$top=10000000`));

		this.batchSubscription = this._commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.materials = response.responses[0].body.value;
				this.cmbMaterials = new ComboFilter(this.materials);
				this.hweKalkService.tools = response.responses[1].body.value;
				this.isWindowLoaderEnabled = false;

				this.prodOrderPosList = [];
				response.responses[2].body.value.forEach((elm: any) => {
					if (elm.calculation_id == null || elm.calculation_id == this.calculation?.id) {

						this.prodOrderPosList.push({
							...elm,
							"custom": `${elm.prodOrder?.custom_id || ""} - ${elm.pos}`,
						});

						if (elm.calculation_id && elm.calculation_id == this.calculation?.id) {
							this.selectCalProdOrderPos.push({
								...elm,
								"custom": `${elm.prodOrder?.custom_id || ""} - ${elm.pos}`,
							});
						}
					}
				});
				this.cmbProdOrderPos = new ComboFilter(this.prodOrderPosList);
			},
			error: () => this.isWindowLoaderEnabled = false,
		});
	}

	removeOperations(data: any) {
		let isMultipleDeltete = data.mode === "single" ? false : true;
		this._notification.deleteItem(isMultipleDeltete).subscribe((result: any) => {
			if (result.action == "next") {
				if (data.mode === "single") {
					if (data.data.hasOwnProperty("id")) this.deletableId.push(this.opPlanPos?.[data.index]?.id);
					this.operations.removeAt(data.index);
					this.opPlanPos?.splice(data.index, 1);
				} else {
					if (this.opPlanPos) {
						let lent = this.opPlanPos.length;
						for (let i = 0; i == 0; i++) {
							if (this.opPlanPos[i]?.hasOwnProperty("id")) this.deletableId.push(this.opPlanPos[i].id);
							this.opPlanPos?.splice(i, 1);
							if (this.opPlanPos.length) i -= 1
						}
					}

					this.opPlanPos?.map((item, index) => {

					});
					this.operationForm.controls["operations"] = this.formBuilder.array([]);

				}
			}
		});

	}

	handleFilter(value: String, src: String) {
		switch (src) {
			case "material":
				this.materials =
					this.cmbMaterials.handleLocalDataFilter(
						value,
						"custom_id",
					);
				break;
			case "prod_order_pos":
				this.prodOrderPosList =
					this.cmbProdOrderPos.handleLocalDataFilter(
						value,
						"custom",
					);
				break;
			default:
				break;
		}
	}

	ngOnDestroy(): void {
		this.rawdeletableId = [];
		this.hweKalkService.items = [];
		this.hweKalkService.deleteDimesionShaftUpsetParts = [];
		this.hweKalkService.deleteUpsetPartForgedBeams = [];
	}

	isShowDimensionTypes(type: string) {
		return this.hweKalkService.materialDimensionTypes[this.offerPos.product_type ?? ""]?.includes(type);
	}

	onDimensionChange() {
		this.selectedMaterial = this.offerPos.material;
		this.isMaterialChanged = true;
		this.hweKalkService.onCalculationDimensionChangeSubject.next(1);
		setTimeout(() => {
			this.isMaterialChanged = false;
			this.cdr.detectChanges();
		}, 0);
	}


	offerPosPermission(permission: string) {
		return this._authService.isPermissionValidate(permission);
	}
}
