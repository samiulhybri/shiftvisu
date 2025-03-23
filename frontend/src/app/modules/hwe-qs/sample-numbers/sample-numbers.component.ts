import { Component } from "@angular/core";
import { GridProperty } from "@app/shared/classes/grid-property";
import { GridDataResult } from "@progress/kendo-angular-grid";

import { GridColumn } from "@app/shared/models/grid-column.model";
import { CommonService } from "@app/shared/services/common.service";

import { SampleNumberDetailComponent } from "./sample-number-detail/sample-number-detail.component";
import { HweQuenchingMediumClass } from "@app/modules/hwe-kalk/enums/HweQuenchingMedium";
import { CalculationHeatTreatmentTypeClass } from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import { AttestationClass } from "@app/modules/hwe-kalk/enums/Attestation";
import { AttestationEntity } from "@app/models/attestation-entity";
import { AttestationEntityClass } from "@app/modules/hwe-kalk/enums/AttestationEntity";

@Component({
	selector: "app-probennummern",
	templateUrl: "./sample-numbers.component.html",
	styleUrls: ["./sample-numbers.component.scss"],
})
export class SampleNumbersComponent extends GridProperty {
	public columns = this.getColumns();
	public isLoaderEnabled: boolean = false;

	public editView: {} = {
		actionButton: " ",
		modalTemplate: SampleNumberDetailComponent,
		modalWidth: "30vw",
		hasLinkIcon: true,
		isOnPageFilter: true,
	};

	public toolbarConfig: {} = {
		title: $localize`Sample Numbers`,
		hasAddCommand: true,
		hasSearch: true,
	};

	constructor(_commonService: CommonService) {
		super(_commonService);
		this.state.take = 100000;
		this.url = `HweQsSamples?$expand=samplesProdOrderPos($expand=prodOrderPos($expand=prodOrderPosBomPos(expand=melt),prodOrder,hweQsTensileTest,hweQsImpactTest($expand=hweQsImpactTestPosFirst),calculation($expand=heatTreatmentPosTen,operationPlan($expand=operationPlanPos($expand=operationPlanPosHeatTreatments)),testingScope($expand=attestationEntities),offerPos($expand=offer($expand=customer),material))))&$orderby=id%20desc&$skip=0&$top=10&count=true`;
		this.sendRequest();
	}

	/**
	 * Fetch data form server
	 * overriding main sendRequest function for nested object
	 **/
	public override sendRequest(urlFilter?: string): void {
		this.isLoadedEnabled = true;
		this._commonService.getLodata(this.state, this.url, urlFilter).subscribe({
			next: (response: GridDataResult) => {
				this.gridItems = response;

				const transformedGridItems: any[] = this.gridItems?.data.flatMap((value: any) => {
					if (!value.samplesProdOrderPos || value.samplesProdOrderPos.length === 0) {
						return [
							{
								...value,
								order_number: "",
								samplesProdOrderPos: null,
								isLast: false,
								material_custom_id: "",
								testing_scope_attestation: "",
								customer_name: "",
								heat_treatment_type: "",
							},
						];
					} else {
						return value.samplesProdOrderPos.map((pos: any) => {
							const customId = pos?.prodOrderPos?.prodOrder?.custom_id;
							const position = pos?.prodOrderPos?.pos;
							const melt = pos?.prodOrderPos?.prodOrderPosBomPos?.melt[0]?.value_string ?? null;

							const material_custom_id =
								pos?.prodOrderPos?.calculation?.offerPos?.material?.custom_id ?? "";
							const testing_scope_attestation =
								pos?.prodOrderPos?.calculation?.testingScope?.attestation ?? "";
							const customer_name =
								pos?.prodOrderPos?.calculation?.offerPos?.offer?.customer?.name ??
								"";
							const heat_treatment_type =
								pos?.prodOrderPos?.calculation?.heatTreatmentPosTen?.type ?? "";
							const quenching_medium_type =
								pos?.prodOrderPos?.calculation?.heatTreatmentPosTen
									?.quenching_medium ?? "";
							const attestationEntities =
								pos?.prodOrderPos?.calculation?.testingScope?.attestationEntities ??
								[];
							const attestation_entities: string[] = [];

							attestationEntities.map((item: AttestationEntity) => {
								attestation_entities.push(
									AttestationEntityClass.getStateTranslate(
										item.attestation_entity
									)
								);
							});

							const hweQsTensileTest =
								pos?.prodOrderPos?.hweQsTensileTest ?? undefined;
							const yield_strength = hweQsTensileTest
								? hweQsTensileTest.reh || hweQsTensileTest.rp_0_2
								: "";
							const tensile_test = hweQsTensileTest ? hweQsTensileTest.rm : "";
							const expansion = hweQsTensileTest ? hweQsTensileTest.a5 : "";
							const constriction = hweQsTensileTest ? hweQsTensileTest.z : "";
							const hweQsImpactTestPosFirst =
								pos?.prodOrderPos?.hweQsImpactTest?.hweQsImpactTestPosFirst ??
								undefined;

							let impact_work = "";
							let impact_test_temperature = "";

							if (hweQsImpactTestPosFirst) {
								let { value_1, value_2, value_3, temperature } =
									hweQsImpactTestPosFirst;
								let avg = (value_1 + value_2 + value_3) / 3;
								impact_work = !Number.isNaN(avg) ? avg.toFixed(2) : "";
								impact_test_temperature = temperature;
							}

							const op =
								pos?.prodOrderPos?.calculation?.operationPlan?.operationPlanPos.find(
									(opPos: any) => {
										if (opPos.operationPlanPosHeatTreatments?.length == 0) {
											return false;
										} else if (
											opPos.operationPlanPosHeatTreatments[0].quenching_medium
										) {
											return true;
										} else {
											return false;
										}
									}
								);

							if (op) {
								value.quenching_medium =
									op.operationPlanPosHeatTreatments[0]?.quenching_medium;
							}

							return {
								...value,
								order_number:
									customId && position ? `${customId} - ${position}` : "",
								samplesProdOrderPos: pos,
								isLast: value.samplesProdOrderPos.length <= 1,
								material_custom_id: material_custom_id,
								testing_scope_attestation: testing_scope_attestation
									? AttestationClass.getStateTranslate(testing_scope_attestation)
									: "",
								customer_name: customer_name,
								heat_treatment_type: heat_treatment_type
									? CalculationHeatTreatmentTypeClass.getStateTranslate(
											heat_treatment_type
									  )
									: "",
								quenching_medium_type: quenching_medium_type
									? HweQuenchingMediumClass.getStateTranslate(
											quenching_medium_type
									  )
									: "",
								attestation_entities: attestation_entities.join(", "),
								yield_strength,
								tensile_test,
								expansion,
								constriction,
								impact_work,
								impact_test_temperature,
								melt
							};
						});
					}
				});

				this.gridItems = transformedGridItems;
				this.isLoadedEnabled = false;
			},
			error: e => (this.isLoadedEnabled = false),
		});
	}

	public deleteDataItem(dataItem: any): void {
		if (!dataItem.samplesProdOrderPos || dataItem.isLast) {
			// If HweQsSamplesProdOrderPos is unique to samples, delete HweQsSample
			this.onRemoveItem(`HweQsSamples(${dataItem.id})`);
		} else {
			this.onRemoveItem(`HweQsSamplesProdOrderPos(${dataItem.samplesProdOrderPos.id})`);
		}
	}

	private getColumns(): GridColumn[] {
		return [
			{
				name: "custom_id",
				title: $localize`Samples Nr.`,
				width: 100,
				filterable: true,
			},
			{
				name: "order_number",
				title: $localize`Order Number`,
				width: 150,
				filterable: false,
			},
			{
				name: "date",
				title: $localize`Date`,
				width: 95,
				filterable: true,
				filterType: "date",
			},
			{
				name: "customer_name",
				title: $localize`Client`,
				width: 100,
				filterable: false,
			},
			{
				name: "testing_scope_attestation",
				title: $localize`Acceptance`,
				width: 120,
				filterable: false,
			},
			{
				name: "attestation_entities",
				title: $localize`Attestation Entity`,
				width: 130,
				filterable: false,
			},
			{
				name: "material_custom_id",
				title: $localize`Material`,
				width: 100,
				filterable: false,
			},
			{
				name: "melt",
				title: $localize`Melt`,
				width: 100,
				filterable: false,
			},
			{
				name: "heat_treatment_type",
				title: $localize`Heat Treatment`,
				width: 120,
				filterable: false,
			},
			{
				name: "quenching_medium",
				title: $localize`Quenching Medium`,
				width: 120,
				filterable: false,
			},
			{
				name: "yield_strength",
				title: $localize`Yield Strength`,
				width: 120,
				filterable: false,
			},
			{
				name: "tensile_test",
				title: $localize`Tensile Strength [MPa]`,
				width: 150,
				filterable: false,
			},
			{
				name: "expansion",
				title: $localize`Expansion`,
				width: 100,
				filterable: false,
			},
			{
				name: "constriction",
				title: $localize`Constriction [%]`,
				width: 100,
				filterable: false,
			},
			{
				name: "impact_work",
				title: $localize`Impact Work [J]`,
				width: 110,
				filterable: false,
			},
			{
				name: "impact_test_temperature",
				title: $localize`Impact Test Temperature [°C]`,
				width: 150,
				filterable: false,
			},
		];
	}
}
