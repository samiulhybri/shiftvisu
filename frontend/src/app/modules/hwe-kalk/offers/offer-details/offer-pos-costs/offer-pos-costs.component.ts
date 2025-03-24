import {Component, inject, Input, OnInit} from "@angular/core";
import {HweHeatTreatmentFactor} from "@app/models/hwe-heat-treatment-factor";
import {HweRingRollingFactor} from "@app/models/hwe-ring-rolling-factor";
import {ODataBatchCall} from "@app/models/odata-batch-call";
import {OfferPos} from "@app/models/offer-pos";
import {OfferPosCost} from "@app/models/offer-pos-cost";
import {OfferPosRawDimension} from "@app/models/offer-pos-raw-dimension";
import {OperationPlanPos} from "@app/models/operation-plan-pos";
import {HweCostFactorType} from "@app/modules/hwe-kalk/enums/HweCostFactorType";
import {OfferPosWorkPlanName, OfferPosWorkPlanNameClass,} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";
import {HweKalkService} from "@app/modules/hwe-kalk/hwe-kalk.service";
import {CommonService} from "@app/shared/services/common.service";
import {Notification} from "@app/shared/services/notification.service";
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import {HweCostCalcType, HweCostCalcTypeClass} from "@app/modules/hwe-kalk/enums/HweCostCalcType";
import {lastValueFrom} from "rxjs";
import {HweAdditionalCost} from "@app/models/hwe-additional-cost";
import * as moment from "moment";
import {
	HWEAdditionalCostTrigger,
	HWEAdditionalCostTriggerClass,
} from "@app/modules/hwe-kalk/enums/HWEAdditionalCostTrigger";
import {DocumentationCertificate} from "@app/modules/hwe-kalk/enums/DocumentationCertificate";
import {Attestation} from "@app/modules/hwe-kalk/enums/Attestation";
import {ResidualMaterialFrequency} from "@app/modules/hwe-kalk/enums/ResidualMaterialFrequency";
import {HweRustProtectionType} from "@app/modules/hwe-kalk/enums/HweRustProtectionType";
import {OfferPosProductType} from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import {HweHeatTreatmentCost} from "@app/models/hwe-heat-treatment-cost";
import {HweOfferPosWorkPlanLeadTime} from "@app/models/hwe-offer-pos-work-plan-lead-time";
import {Frequency} from "@app/modules/hwe-kalk/enums/Frequency";
import {HweOfferPosGroupType} from "@app/modules/hwe-kalk/enums/HweOfferPosGroupType";
import {Offer} from "@app/models/offer";
import {HwePackagingCostUnit} from "@app/modules/hwe-kalk/enums/HwePackagingCostUnit";
import {HweWorkPlanUnitClass, HweWorkPlanUnitEnum} from "@app/modules/hwe-kalk/enums/HweWorkPlanUnit";

type CostGrouping = {
	name: string;
	items: OfferPosCost[];
	costSum: number;
	leadSum: number;
};

@Component({
	selector: "app-offer-pos-costs",
	templateUrl: "./offer-pos-costs.component.html",
	styleUrls: ["./offer-pos-costs.component.scss"],
})
export class OfferPosCostsComponent implements OnInit {
	public isDeletedAll: boolean = false;
	public cmbHeatTreatmentType: any;
	public isWindowLoaderEnabled = false;
	public leadTimes: HweOfferPosWorkPlanLeadTime[] = [];
	public rawMaterialGrossQuantity: number = 0;
	public ringRollingFactors: HweRingRollingFactor[] = [];
	public heatTreatmentFactors: HweHeatTreatmentFactor[] = [];
	public additionalCosts: HweAdditionalCost[] = [];
	public heatTreatmentCosts: HweHeatTreatmentCost[] = [];
	public workPlanUnits!: Array<{ value: string, text: string }>;
	public permissionEnum = PermissionEnum;
	public authService = inject(AuthService);
	@Input() offerPos!: OfferPos;

	constructor(
		public _commonService: CommonService,
		protected _notification: Notification,
		protected hweKalkService: HweKalkService
	) {
		this.workPlanUnits = HweWorkPlanUnitClass.getEnumArray();
	}

	ngOnInit() {
		this.getCostFactorsByGrossQuantity();
	}

	getGroupedCosts(): CostGrouping[] {
		const groupConfig = [
			{
				include: [HweOfferPosGroupType.MATERIAL, HweOfferPosGroupType.OPERATION],
				name: $localize`Subtotal 1`,
			},
			{
				include: [HweOfferPosGroupType.ADDITIONAL],
				name: $localize`Subtotal 2`,
			},
			{
				include: [
					HweOfferPosGroupType.OVERHEAD,
					HweOfferPosGroupType.PACKAGING,
					HweOfferPosGroupType.FREIGHT,
				],
				name: $localize`Subtotal 3`,
			},
			{
				include: [HweOfferPosGroupType.DISCOUNT],
				name: $localize`Subtotal 4`,
			},
			{
				include: [HweOfferPosGroupType.MANUAL],
				name: "",
			},
		];

		const groups: { name: string; items: OfferPosCost[]; costSum: number; leadSum: number }[] =
			[];

		for (const config of groupConfig) {
			const items =
				this.offerPos.offerPosCosts?.filter(cost =>
					config.include.includes(cost.group_type)
				) ?? [];
			if (items.length) {
				const previousCost = groups[groups.length - 1]?.costSum ?? 0;
				const previousLead = groups[groups.length - 1]?.leadSum ?? 0;

				groups.push({
					name: config.name,
					items: items,
					costSum: this.sumCosts(items) + previousCost,
					leadSum: this.sumLeadTimes(items) + previousLead,
				});
			}
		}

		groups[groups.length - 1].name = $localize`Total amount`;

		return groups;
	}

	trackCostGroup(index: number, item: CostGrouping) {
		return item.name;
	}

	sumCosts(costs: OfferPosCost[]): number {
		return costs.reduce((sum, cost) => sum + (cost.cost ?? 0), 0);
	}

	sumLeadTimes(costs: OfferPosCost[]): number {
		return costs.reduce((sum, cost) => sum + (cost.lead_time_days ?? 0), 0);
	}

	costCalcTypesWithNames(): { value: string; text: string }[] {
		return HweCostCalcTypeClass.getEnumArray();
	}

	getCostFactorsByGrossQuantity() {
		this.isWindowLoaderEnabled = true;
		this.rawMaterialGrossQuantity =
			this.offerPos?.offerPosRawDimensions?.reduce(
				(accumulator, item: OfferPosRawDimension) =>
					accumulator + (item.quantity_final_for_raw ?? 0) * (item.gross_weight ?? 0),
				0
			) ?? 0;

		let requests: ODataBatchCall[] = [];


		//TODO: Remove calls for factors from here, as it will be calculated individually
		let weight = this.rawMaterialGrossQuantity / (this.offerPos.quantity ?? 1)

		requests.push(
			new ODataBatchCall(
				0,
				"get",
				`\/odata\/HweRingRollingFactors?$filter=weight_from le ${Number(weight).toFixed(
					3
				)} and weight_to ge ${Number(weight).toFixed(3)}`
			)
		);

		weight = this.rawMaterialGrossQuantity;

		requests.push(
			new ODataBatchCall(
				1,
				"get",
				`\/odata\/HweHeatTreatmentFactors?$filter=weight_from le ${weight.toFixed(
					3
				)} and weight_to ge ${weight.toFixed(
					3
				)} and material_group_type eq '${this.offerPos?.material?.material_group_type}'`
			)
		);

		//TODO: Remove calls for rolling factors until here, as it will be calculated individually






		requests.push(
			new ODataBatchCall(
				2,
				"get",
				`\/odata\/HweAdditionalCosts?$expand=hweAdditionalCostTriggers&$filter=valid_from le '${moment().format()}' and valid_to ge '${moment().format()}'`
			)
		);
		requests.push(new ODataBatchCall(3, "get", `\/odata\/HweHeatTreatmentCosts`));
		requests.push(
			new ODataBatchCall(
				4,
				"get",
				`\/odata\/HweOfferPosWorkPlanLeadTimes?$top=10000000&$expand=machine`
			)
		);

		this._commonService.post("$batch", { requests }).subscribe({
			next: (response: any) => {
				this.ringRollingFactors = response.responses[0].body.value.map((value: any) =>
					new HweRingRollingFactor().deserialize(value)
				);
				this.heatTreatmentFactors = response.responses[1].body.value.map((value: any) =>
					new HweHeatTreatmentFactor().deserialize(value)
				);
				this.additionalCosts = response.responses[2].body.value.map((value: any) =>
					new HweAdditionalCost().deserialize(value)
				);
				this.heatTreatmentCosts = response.responses[3].body.value.map((value: any) =>
					new HweHeatTreatmentCost().deserialize(value)
				);
				this.leadTimes = response.responses[4].body.value;
				this.isWindowLoaderEnabled = false;
			},
			error: e => (this.isWindowLoaderEnabled = false),
		});
	}

	add() {
		this.offerPos.offerPosCosts?.push(new OfferPosCost(this.offerPos));
	}

	deleteAll() {
		this._notification.deleteItem(true).subscribe((result: any) => {
			if (result.action == "next") {
				this.offerPos.offerPosCosts?.map((offerPosCost: OfferPosCost) => {
					if (offerPosCost?.hasOwnProperty("id"))
						this.hweKalkService.deleteOfferPosCost.push(offerPosCost.id);
				});
				this.offerPos.offerPosCosts = [];
			}
		});
	}

	deleteOne(cost: OfferPosCost) {
		this._notification.deleteItem().subscribe((result: any) => {
			if (result.action == "next") {
				if (cost.hasOwnProperty("id")) {
					this.hweKalkService.deleteOfferPosCost.push(cost.id);
				}

				const index = this.offerPos.offerPosCosts?.indexOf(cost) ?? -1;
				if (index !== -1) {
					this.offerPos.offerPosCosts?.splice(index, 1);
				}
			}
		});
	}

	async generateOfferPosCosts() {
		let cost = await this.calculateMaterialCost(false);
		if (cost) {
			this.offerPos.offerPosCosts?.push(cost);
		}
		cost = await this.calculateMaterialCost(true);
		if (cost) {
			this.offerPos.offerPosCosts?.push(cost);
		}
		this.offerPos.offerPosCosts?.push(...this.getOfferPosCostsFromOpPlanPos());

		this.offerPos.offerPosCosts?.push(...this.getOfferPosCostsFromAdditionalCosts());

		this.offerPos.offerPosCosts?.push(this.calculateOverheadSurcharge());
		this.offerPos.offerPosCosts?.push(await this.calculatePackagingCost());

		const freightCost = await this.calculateFreightCost();
		if (freightCost) {
			this.offerPos.offerPosCosts?.push(freightCost);
		}
		this.offerPos.offerPosCosts?.push(await this.calculateDiscount());
		if (this.offerPos?.calculation) {
			this.offerPos.calculation.text_final_dimension =
				this.offerPos.getFinalDimensionText(true);
			this.offerPos.calculation.text_raw_dimension = this.offerPos.getRawDimensionText();
			this.offerPos.calculation.text = this.offerPos.generateText();
			this.offerPos.calculation.text2 = this.offerPos.generateText2();
			this.offerPos.calculation.text3 = this.offerPos.generateText3();
			this.offerPos.calculation.text4 = this.offerPos.generateText4();
		}

		console.log(this.offerPos.offerPosCosts)
	}

	async calculateDiscount(): Promise<OfferPosCost> {
		const currentPrice =
			this.offerPos.offerPosCosts?.reduce(
				(accumulator, offerPosCosts) => accumulator + (offerPosCosts.cost ?? 0),
				0
			) ?? 0;

		const response = await lastValueFrom(
			this._commonService.get(
				`Offers(${this.offerPos.offer_id})?$expand=customer($expand=paymentTerm)`
			)
		);

		const offer = new Offer().deserialize(response);

		const discount = offer?.customer?.paymentTerm?.discount ?? 0;

		const offerPosCost = new OfferPosCost(this.offerPos);
		offerPosCost.factor = discount;
		offerPosCost.quantity = 1;
		offerPosCost.price = currentPrice;
		offerPosCost.name = $localize`Discount`;

		offerPosCost.group_type = HweOfferPosGroupType.DISCOUNT;
		offerPosCost.hwe_cost_calc_type = HweCostCalcType.PIECE;
		offerPosCost.unit = HweWorkPlanUnitEnum.STK;

		return offerPosCost;
	}

	async getMaterialPrice(quantity: number): Promise<number> {
		if (this.offerPos?.item?.hweClassificationGiesstyp?.value_string !== "B") {
			if (quantity <= (this.offerPos.item?.stock ?? 0)) {
				this.offerPos.calculation!.is_material_in_stock = true;
				return (this.offerPos?.item?.price ?? 0) / 1000;
			} else {
				this.offerPos.calculation!.is_material_in_stock = false;

				if(moment().subtract(45, 'd').isAfter(this.offerPos?.item?.price_plan_date))
					return 0;

				return (this.offerPos?.item?.price_plan ?? 0) / 1000;
			}
		} else {

			let response = await lastValueFrom(
				this._commonService.get("hwe-kalk/costs/block-price?WERKSTOFF="+(this.offerPos?.item?.hweClassificationWerkstoff?.value_string ?? ''), false)
			);
			return response as number / 1000;
		}
	}

	async calculateMaterialCost(isSample = false): Promise<OfferPosCost | null> {
		let offerPosCost = new OfferPosCost(this.offerPos);

		const rawMaterialQuantity =
			this.offerPos?.offerPosRawDimensions?.reduce(
				(accumulator, item: OfferPosRawDimension) =>
					accumulator + (item.quantity_final_for_raw ?? 0) * (item.operating_weight ?? 0),
				0
			) ?? 0;

		const sampleMaterialQuantity =
			this.offerPos?.offerPosRawDimensions?.reduce(
				(accumulator, item: OfferPosRawDimension) =>
					accumulator +
					(item.getSampleMaterialWeight() ?? 0) * (item.quantity_final_for_raw ?? 0),
				0
			) ?? 0;

		if (!sampleMaterialQuantity && isSample) {
			return null;
		}

		offerPosCost.price = await this.getMaterialPrice(
			rawMaterialQuantity + sampleMaterialQuantity
		);

		offerPosCost.factor = 1.05;

		if (this.offerPos?.item?.hweClassificationGiesstyp?.value_string === "ESU") {
			offerPosCost.factor = 1.25;
		} else if (this.offerPos?.item?.hweClassificationGiesstyp?.value_string === "B") {
			offerPosCost.factor = 1.25;

			if (
				this.offerPos.calculation?.operationPlan?.operationPlanPos?.reduce(
					(accumulator, current) =>
						accumulator || current.name === OfferPosWorkPlanName.UPSETTING_RB,
					false
				)
			) {
				offerPosCost.factor *= 1.05;
			}
		} else if (
			this.offerPos?.item?.hweClassificationGiesstyp?.value_string === "S" &&
			this.offerPos.calculation?.operationPlan?.operationPlanPos?.reduce(
				(accumulator, current) =>
					accumulator ||
					current.name === OfferPosWorkPlanName.PRE_FORGING_SEMI_FINISHED_PRODUCT,
				false
			)
		) {
			offerPosCost.factor *= 1.05;
		}

		if (isSample) {
			offerPosCost.quantity = this.offerPos?.quantity ? sampleMaterialQuantity : 0;
			offerPosCost.name = $localize`Sample Material Cost`;
			offerPosCost.hwe_cost_calc_type = HweCostCalcType.POSITION;
		} else {
			offerPosCost.quantity = this.offerPos?.quantity
				? (rawMaterialQuantity - sampleMaterialQuantity) / this.offerPos.quantity
				: 0;
			offerPosCost.name = $localize`Material Cost`;
			offerPosCost.hwe_cost_calc_type = HweCostCalcType.PIECE;
		}

		offerPosCost.lead_time_days = 0;

		offerPosCost.group_type = HweOfferPosGroupType.MATERIAL;
		offerPosCost.unit = HweWorkPlanUnitEnum.KG;

		return offerPosCost;
	}

	calculateOverheadSurcharge() {
		let offerPosCost = new OfferPosCost(this.offerPos);

		offerPosCost.price =
			this.offerPos.offerPosCosts?.reduce(
				(accumulator, offerPosCosts) => accumulator + (offerPosCosts.cost ?? 0),
				0
			) ?? 0;
		offerPosCost.factor = this.offerPos?.offer?.country?.hwe_overhead_surplus ?? 0;
		offerPosCost.quantity = 1;

		offerPosCost.name = $localize`Overhead Surcharge`;
		offerPosCost.hwe_cost_calc_type = HweCostCalcType.PIECE;
		offerPosCost.lead_time_days = 0;

		offerPosCost.group_type = HweOfferPosGroupType.OVERHEAD;
		offerPosCost.unit = HweWorkPlanUnitEnum.STK;

		return offerPosCost;
	}

	async calculateFreightCost(): Promise<OfferPosCost | null> {
		let offerPosCost = new OfferPosCost(this.offerPos);
		let deliveryWeight =
			(this.offerPos.calculation?.delivery_weight ?? 0) * (this.offerPos.quantity ?? 0);

		let country = this.offerPos?.offer?.country;
		let postalCode = this.offerPos.offer?.postal_code;

		if (!country?.id || !postalCode) {
			return null;
		}

		offerPosCost.price = 0;
		offerPosCost.lead_time_days = 0;

		if (this.offerPos.offer.deliveryTerm?.has_delivery_cost) {
			let response: any = await lastValueFrom(
				this._commonService.get(
					`HweFreightCosts?$filter=country_id eq ${country.id} and postal_code_from le ${postalCode} and postal_code_to ge ${postalCode} and delivery_weight_from le ${deliveryWeight} and delivery_weight_to gt ${deliveryWeight}`
				)
			);

			if (response.value.length > 0) {
				offerPosCost.price = response.value[0]?.price;
				offerPosCost.lead_time_days = country.lead_time_days;
			}
		}

		offerPosCost.factor = 1 + (this.offerPos.offer?.country?.hwe_freight_surplus ?? 0);
		offerPosCost.quantity = 1;

		offerPosCost.name = $localize`Freight`;
		offerPosCost.hwe_cost_calc_type = HweCostCalcType.POSITION;

		offerPosCost.group_type = HweOfferPosGroupType.FREIGHT;
		offerPosCost.unit = HweWorkPlanUnitEnum.STK;

		return offerPosCost;
	}

	async calculatePackagingCost() {
		let offerPosCost = new OfferPosCost(this.offerPos);
		let deliveryWeight = this.offerPos.calculation?.delivery_weight ?? 0;
		let outer_diameter: number;
		let height: number;

		switch (this.offerPos.product_type) {
			case OfferPosProductType.DISK:
			case OfferPosProductType.DISK_PUNCHED:
			case OfferPosProductType.RING_ROLLED:
			case OfferPosProductType.RING_CYLINDER:
				outer_diameter = this.offerPos.outer_diameter_final ?? 0;
				height = this.offerPos.height_final ?? 0;
				break;
			case OfferPosProductType.PIPE:
			case OfferPosProductType.BAR_ROUND:
			case OfferPosProductType.SOCKET:
				outer_diameter = this.offerPos.outer_diameter_final ?? 0;
				height = this.offerPos.length_final ?? 0;
				break;
			case OfferPosProductType.BAR_ROLLED:
			case OfferPosProductType.BAR_SQUARE:
				outer_diameter = Math.max(
					this.offerPos.side_a_final ?? 0,
					this.offerPos.side_b_final ?? 0
				);
				height = this.offerPos.length_final ?? 0;
				break;
			case OfferPosProductType.SHAFT:
			case OfferPosProductType.SHAFT_HOLLOW:
			case OfferPosProductType.UPSET_PART:
				outer_diameter = this.offerPos.max_outer_diameter ?? 0;
				height = this.offerPos.total_length ?? 0;
				break;
			case undefined:
				outer_diameter = 0;
				height = 0;
		}

		let url = `HwePackagingCosts?$filter=quantity_min le ${this.offerPos.quantity} and quantity_max ge ${this.offerPos.quantity} and outer_diameter_min le ${outer_diameter} and outer_diameter_max gt ${outer_diameter} and weight_min le ${deliveryWeight} and weight_max gt ${deliveryWeight} and height_min le ${height} and height_max gt ${height} and hwePackagingCostProductTypes/any(d:d/product_type eq '${this.offerPos.product_type}')`;

		let response: any = await lastValueFrom(this._commonService.get(url));
		offerPosCost.price = 0;
		let quantityMin = 1;
		let weightMax = 1;

		if (response && response.value && response.value.length > 0) {
			offerPosCost.price = (response.value[0]?.cost as number) ?? 0;
			quantityMin = (response.value[0]?.quantity_min as number) ?? 1;
			weightMax = (response.value[0]?.weight_max as number) ?? 1;
		}

		offerPosCost.factor = 1;

		if (response.value[0]?.packaging_cost_unit == HwePackagingCostUnit.PIECE) {
			offerPosCost.quantity = 1;
			offerPosCost.hwe_cost_calc_type = HweCostCalcType.PIECE;
		} else {
			let maxPackingWeight = 2 * weightMax;

			const itemsPerUnit = Math.floor(maxPackingWeight / deliveryWeight);

			offerPosCost.quantity = Math.ceil((this.offerPos.quantity ?? 1) / itemsPerUnit);
			offerPosCost.hwe_cost_calc_type = HweCostCalcType.POSITION;
		}

		offerPosCost.name = $localize`Packaging`;
		offerPosCost.lead_time_days = 0;

		offerPosCost.group_type = HweOfferPosGroupType.PACKAGING;
		offerPosCost.unit = HweWorkPlanUnitEnum.STK;

		return offerPosCost;
	}

	async getPackagingCost(
		deliveryWeight: number,
		quantity: number,
		outer_diameter: number,
		height: number | null
	) {
		if (height) {
			let response: any = await lastValueFrom(
				this._commonService.get(
					`HwePackagingCosts?$filter=quantity_min le ${quantity} and quantity_max gt ${quantity} and outer_diameter_min le ${outer_diameter} and outer_diameter_max gt ${outer_diameter} and weight_min le ${deliveryWeight} and weight_max gt ${deliveryWeight} and height_min le ${height} and height_max gt ${height} and hwePackagingCostProductTypes/any(d:d/product_type eq '${this.offerPos.product_type}')`
				)
			);
			return response.value[0]?.cost as number;
		} else {
			let response: any = await lastValueFrom(
				this._commonService.get(
					`HwePackagingCosts?$filter=quantity_min le ${quantity} and quantity_max gt ${quantity} and outer_diameter_min le ${outer_diameter} and outer_diameter_max gt ${outer_diameter} and weight_min le ${deliveryWeight} and weight_max gt ${deliveryWeight} and hwePackagingCostProductTypes/any(d:d/product_type eq '${this.offerPos.product_type}')`
				)
			);
			return response.value[0]?.cost as number;
		}
	}

	getOfferPosCostsFromAdditionalCosts() {
		// Initialize an array to store all offer position costs
		let allOfferPosCosts: OfferPosCost[] = [];

		// Define an array of the different trigger checks to be performed
		const triggers = [
			{
				value:
					this.offerPos.calculation?.calculationTestingScope?.attestation ==
					Attestation.EN_10204_2_2,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ATTESTATION_2_2,
			},
			{
				value:
					this.offerPos.calculation?.calculationTestingScope?.attestation ==
					Attestation.EN_10204_3_1,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ATTESTATION_3_1,
			},
			{
				value:
					this.offerPos.calculation?.calculationTestingScope?.attestation ==
					Attestation.EN_10204_3_2,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ATTESTATION_3_2,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.certificates.reduce(
					(isContained, docCertificate) =>
						isContained || docCertificate.certificate == DocumentationCertificate.DE,
					false
				),
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CERTIFICATE_DE,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.certificates.reduce(
					(isContained, docCertificate) =>
						isContained || docCertificate.certificate == DocumentationCertificate.ENG,
					false
				),
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CERTIFICATE_EN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.certificates.reduce(
					(isContained, docCertificate) =>
						isContained || docCertificate.certificate == DocumentationCertificate.FR,
					false
				),
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CERTIFICATE_FR,
			},
			{
				value:
					(this.offerPos.calculation?.calculationTestingScope?.zug ?? 0) > 0 &&
					(this.offerPos.calculation?.calculationTestingScope?.frequency !=
						Frequency.BATCH ||
						(this.offerPos.calculation?.calculationTestingScope?.specimen_allowance
							?.length ?? 0) > 0),
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ZUG,
				quantity: this.offerPos.calculation?.calculationTestingScope?.zug,
			},
			{
				value:
					(this.offerPos.calculation?.calculationTestingScope?.zug ?? 0) > 0 &&
					this.offerPos.calculation?.calculationTestingScope?.frequency ==
						Frequency.BATCH &&
					(this.offerPos.calculation?.calculationTestingScope?.specimen_allowance
						?.length ?? 0) == 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ZUG_BATCH,
				quantity: this.offerPos.calculation?.calculationTestingScope?.zug,
			},
			{
				value:
					(this.offerPos.calculation?.calculationTestingScope?.kbz ?? 0) > 0 &&
					(this.offerPos.calculation?.calculationTestingScope?.frequency !=
						Frequency.BATCH ||
						(this.offerPos.calculation?.calculationTestingScope?.specimen_allowance
							?.length ?? 0) > 0),
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz,
			},
			{
				value:
					(this.offerPos.calculation?.calculationTestingScope?.kbz ?? 0) > 0 &&
					this.offerPos.calculation?.calculationTestingScope?.frequency ==
						Frequency.BATCH &&
					(this.offerPos.calculation?.calculationTestingScope?.specimen_allowance
						?.length ?? 0) == 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_BATCH,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz,
			},
			// {
			// 	value: (this.offerPos.calculation?.calculationTestingScope?.kbz_p_20 ?? 0) > 0,
			// 	type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_P_20,
			// 	quantity: this.offerPos.calculation?.calculationTestingScope?.kbz_p_20,
			// },
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.kbz_0 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_0,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz_0,
			},
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.kbz_m_20 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_M_20,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz_m_20,
			},
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.kbz_m_50 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_M_50,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz_m_50,
			},
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.kbz_m_60 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_KBZ_M_60,
				quantity: this.offerPos.calculation?.calculationTestingScope?.kbz_m_60,
			},
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.zug_gt_40 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ZUG_GT_40,
				quantity: this.offerPos.calculation?.calculationTestingScope?.zug_gt_40,
			},
			{
				value: (this.offerPos.calculation?.calculationTestingScope?.zug_300 ?? 0) > 0,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_ZUG_300,
				quantity: this.offerPos.calculation?.calculationTestingScope?.zug_300,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.test_fold_and_bending,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TEST_FOLD_AND_BENDING,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.test_blue_structure,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TEST_BLUE_STRUCTURE,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.test_baumann_imprint,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TEST_BAUMANN_IMPRINT,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.test_pin,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TEST_PIN,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.test_us_calibration,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TEST_US_CALIBRATION,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.jominy_test,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_JOMINY_TEST,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_microsection_structure,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_MICROSECTION_STRUCTURE,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_microsection_grain_size,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_MICROSECTION_GRAIN_SIZE,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_microsection_carburized,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_MICROSECTION_CARBURIZED,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_microsection_cleanliness,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_MICROSECTION_CLEANLINESS,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_ic_simulation_annealing,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_IC_SIMULATION_ANNEALING,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography?.image,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_IMAGE,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.check_ik,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CHECK_IK,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.cleanliness_of_the_charge,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CLEANLINESS_OF_THE_CHARGE,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.cleanliness_of_the_component,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CLEANLINESS_OF_THE_COMPONENT,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.grainsize_of_the_charge,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_GRAINSIZE_OF_THE_CHARGE,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.grainsize_of_the_component,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_GRAINSIZE_OF_THE_COMPONENT,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.product_analysis,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_PRODUCT_ANALYSIS,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.jominy,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_JOMINY,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.heattreamtment,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_HEAT_TREATMENT,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.heattreamtment_with_diagram,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_HEAT_TREATMENT_WITH_DIAGRAM,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_furnace_position_plan,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_FURNACE_POSITION_PLAN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.deformation,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_DEFORMATION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.visual_inspection,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_VISUAL_INSPECTION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.indication_of_the_surface_condition,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_INDICATION_OF_THE_SURFACE_CONDITION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.dimension_control,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_DIMENSION_CONTROL,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.dimension_protocol,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_DIMENSION_PROTOCOL,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.concentricity_check,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CONCENTRICITY_CHECK,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.residual_magnetic_field_strength,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_RESIDUAL_MAGNETIC_FIELD_STRENGTH,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.radioactivity_freedom_confirmation,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_RADIOACTIVITY_FREEDOM_CONFIRMATION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.confirmation_of_the_absence_of_flakes,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CONFIRMATION_OF_THE_ABSENCE_OF_FLAKES,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.initial_inspection,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_INITIAL_INSPECTION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.check_machine_feasibility,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CHECK_MACHINE_FEASIBILITY,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_manufacturing_plan,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_MANUFACTURING_PLAN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.create_forging_schedule,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_FORGING_SCHEDULE,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.test_sequence_plan,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_TEST_SEQUENCE_PLAN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_heat_treatment_plan,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_HEAT_TREATMENT_PLAN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation?.create_specimen_plan,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_SPECIMEN_PLAN,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_us_test_instruction,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_US_TEST_INSTRUCTION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_mpe_test_instruction,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_MPE_TEST_INSTRUCTION,
			},
			{
				value: this.offerPos.calculation?.calculationDocumentation
					?.create_fe_test_instruction,
				type: HWEAdditionalCostTrigger.DOCUMENTATION_CREATE_FE_TEST_INSTRUCTION,
			},
			{
				value: this.offerPos.calculation?.calculationMetallography
					?.needs_ic_external_testing,
				type: HWEAdditionalCostTrigger.METALLOGRAPHY_NEEDS_IC_EXTERNAL_TESTING,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope
					?.tensile_test_external_testing,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TENSILE_TEST_EXTERNAL_TESTING,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope
					?.impact_test_external_testing,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_IMPACT_TEST_EXTERNAL_TESTING,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope
					?.tensile_test_warm_external_testing,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_TENSILE_TEST_WARM_EXTERNAL_TESTING,
			},
			{
				value: this.offerPos.calculation?.calculationTestingScope?.specimen_rest_material,
				type: HWEAdditionalCostTrigger.TESTING_SCOPE_SPECIMEN_REST_MATERIAL,
			},
			{
				value:
					this.offerPos.calculation?.calculationResidualMaterial?.frequency ==
					ResidualMaterialFrequency.PER_PART,
				type: HWEAdditionalCostTrigger.RESIDUAL_MATERIAL_FREQUENCY_PER_PART,
			},
			{
				value:
					this.offerPos.calculation?.calculationResidualMaterial?.frequency ==
					ResidualMaterialFrequency.PER_POSITION,
				type: HWEAdditionalCostTrigger.RESIDUAL_MATERIAL_FREQUENCY_PER_POSITION,
			},
			{
				value: this.offerPos.calculation?.cleanliness_of_the_charge,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_CLEANLINESS_OF_THE_CHARGE,
			},
			{
				value: this.offerPos.calculation?.grainsize_of_the_charge,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_GRAINSIZE_OF_THE_CHARGE,
			},
			{
				value: this.offerPos.calculation?.jominy,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_JOMINY,
			},
			{
				value: this.offerPos.calculation?.heattreamtment,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_HEAT_TREATMENT,
			},
			{
				value: this.offerPos.calculation?.heattreamtment_with_diagram,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_HEAT_TREATMENT_WITH_DIAGRAM,
			},
			{
				value: this.offerPos.calculation?.visual_inspection,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_VISUAL_INSPECTION,
			},
			{
				value: this.offerPos.calculation?.dimension_control,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_DIMENSION_CONTROL,
			},
			{
				value: this.offerPos.calculation?.dimension_protocol,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_DIMENSION_PROTOCOL,
			},
			{
				value: this.offerPos.calculation?.concentricity_check,
				type: HWEAdditionalCostTrigger.INDIVIDUAL_ASSESSMENT_CONCENTRICITY_CHECK,
			},
			{
				value: this.offerPos.rust_protection_type == HweRustProtectionType.COMPONENT,
				type: HWEAdditionalCostTrigger.OFFER_POS_RUST_PROTECTION_TYPE_COMPONENT,
			},
			{
				value: this.offerPos.rust_protection_type == HweRustProtectionType.STAMP_FACE,
				type: HWEAdditionalCostTrigger.OFFER_POS_RUST_PROTECTION_TYPE_STAMP_FACE,
			},
			{
				value: this.offerPos.rust_protection_type == HweRustProtectionType.HOLE,
				type: HWEAdditionalCostTrigger.OFFER_POS_RUST_PROTECTION_TYPE_HOLE,
			},
		];

		// Iterate over each trigger, perform the check, and push the result if valid
		triggers.forEach(trigger => {
			const cost = this.checkTrigger(
				trigger.value ?? false,
				trigger.type,
				trigger.quantity ?? 1
			);
			allOfferPosCosts.push(...cost);
		});

		// Return the array of all offer position costs
		return allOfferPosCosts;
	}

	private checkTrigger(trigger: boolean, costTrigger: HWEAdditionalCostTrigger, quantity = 1) {
		const costs = [];

		if (trigger) {
			let additionalCosts = this.additionalCosts.filter(additionalCost =>
				additionalCost.hweAdditionalCostTriggers.some(
					trigger => trigger.trigger == costTrigger
				)
			);

			for (const additionalCost of additionalCosts) {
				let offerPosCost = new OfferPosCost(this.offerPos);
				offerPosCost.name =
					additionalCost.hwe_cost_type ??
					HWEAdditionalCostTriggerClass.getStateTranslate(costTrigger);
				offerPosCost.quantity = quantity;

				offerPosCost.price = additionalCost.price;
				offerPosCost.hwe_cost_calc_type =
					additionalCost.cost_calc_type ?? HweCostCalcType.PIECE;

				if (offerPosCost.hwe_cost_calc_type == HweCostCalcType.SAMPLE_PIECE) {
					offerPosCost.factor =
						this.offerPos.calculation?.calculationTestingScope
							?.quantity_testing_pieces ?? 1;
					offerPosCost.hwe_cost_calc_type = HweCostCalcType.POSITION;
				}

				offerPosCost.lead_time_days = additionalCost.lead_time_days ?? 0;
				offerPosCost.group_type = HweOfferPosGroupType.ADDITIONAL;
				offerPosCost.unit = HweWorkPlanUnitEnum.STK;

				costs.push(offerPosCost);
			}
		}
		return costs;
	}

	getOfferPosCostsFromOpPlanPos() {
		let allOfferPosCosts: OfferPosCost[] = [];

		this.offerPos?.calculation?.operationPlan?.operationPlanPos?.sort(
			(a, b) => Number(a.pos) - Number(b.pos)
		);

		this.offerPos?.calculation?.operationPlan?.operationPlanPos?.forEach(
			(opPlanPos: OperationPlanPos) => {
				if (
					opPlanPos.name == OfferPosWorkPlanName.PACKAGING ||
					opPlanPos.name == OfferPosWorkPlanName.SHIPPING ||
					opPlanPos.name == OfferPosWorkPlanName.PRESAW_SAMPLE ||
					opPlanPos.name == OfferPosWorkPlanName.PRODUCE_SAMPLE ||
					opPlanPos.name == OfferPosWorkPlanName.QS_CERTIFICATE
				) {
					// packaging and shipping are calculated separately
					return;
				}

				let offerPosCost = new OfferPosCost(this.offerPos);

				offerPosCost.name = `${OfferPosWorkPlanNameClass.getStateTranslate(
					opPlanPos.name
				)} - ${opPlanPos?.machine?.custom_id || ""}`;
				offerPosCost.quantity = opPlanPos?.te || 0;

				if(opPlanPos?.machine?.hwe_cost_factor_type === HweCostFactorType.RING_ROLLING)
				{
					//Use Stückgewicht for Walzfaktoren
					offerPosCost.factor = this.getRollingFactor(offerPosCost.quantity);
				}
				else {
					//Use Positionsgewicht for HeatTreatmentFactors
					offerPosCost.factor = this.getHeatTreatmentFactor(offerPosCost.quantity * (this.offerPos.quantity ?? 1));
				}

				let heatTreatmentCost = this.heatTreatmentCosts.find(
					heatTreatmentCost => heatTreatmentCost.type == opPlanPos.name
				);

				if (heatTreatmentCost) {
					offerPosCost.price = heatTreatmentCost.cost / 100;
					offerPosCost.minCost =
						heatTreatmentCost.min_cost / (offerPosCost.offerPos?.quantity ?? 1);
				} else {
					offerPosCost.price =
						opPlanPos?.machine?.costCenter?.costCenterCostToday?.cost ?? 0;

					if (opPlanPos?.machine?.costCenter?.costCenterCostToday?.cost_type == "TIME") {
						offerPosCost.price /= 60;
					}
				}

				if (opPlanPos.name == OfferPosWorkPlanName.SAMPLING) {
					offerPosCost.factor =
						this.offerPos.calculation?.calculationTestingScope?.frequency ==
						Frequency.PIECE
							? this.offerPos.quantity ?? 1
							: this.offerPos.calculation?.calculationTestingScope
									?.quantity_testing_pieces ?? 1;

					offerPosCost.hwe_cost_calc_type = HweCostCalcType.POSITION;
				}
				const machineId = opPlanPos.machine?.id;
				const opname = opPlanPos.name;
				const lt = this.leadTimes.find(
					lt => lt.machine?.id == machineId && lt.name == opname
				);

				offerPosCost.lead_time_days = lt?.lead_time_days ?? (opPlanPos.machine?.lead_time_days ?? 0);

				offerPosCost.group_type = HweOfferPosGroupType.OPERATION;
				offerPosCost.unit = opPlanPos.unit;

				allOfferPosCosts.push(offerPosCost);
			}
		);

		return allOfferPosCosts;
	}

	getHeatTreatmentFactor(weight: number) {
		let factor = 1;

		//TODO: Adapt with dynamic call

		return factor;
	}

	getRollingFactor(weight: number) {
		let factor = 1;

		//TODO: Adapt with dynamic call

		return factor;
	}

	getCostFactor(factorType?: HweCostFactorType) {
		let factor = 1;

		switch (factorType) {
			case HweCostFactorType.RING_ROLLING:
				if (this.ringRollingFactors.length) {
					factor = this.ringRollingFactors[0].factor || 1;
				}
				break;
			case HweCostFactorType.HEAT_TREATMENT:
				if (this.heatTreatmentFactors.length) {
					factor = this.heatTreatmentFactors[0].factor || 1;
				}
				break;
			default:
				break;
		}

		return factor;
	}

	ngOndestroy() {
		this.hweKalkService.deleteOfferPosCost = [];
	}

	isPermissionValidate(permission: string): boolean {
		return this.authService.isPermissionValidate(permission);
	}
}
