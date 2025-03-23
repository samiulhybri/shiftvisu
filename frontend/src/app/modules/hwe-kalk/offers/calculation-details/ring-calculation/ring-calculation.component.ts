import {Component, EventEmitter, Input, Output} from "@angular/core";
import {OfferPos} from "@app/models/offer-pos";
import {RawDimensionType} from "@app/models/raw-dimension-type";
import {KombiwalzenClass} from "@app/modules/hwe-kalk/enums/Kombiwalzen";
import {HweKalkService} from "@app/modules/hwe-kalk/hwe-kalk.service";
import {CommonService} from "@app/shared/services/common.service";
import {Machine} from "@app/models/machine";
import {DeliveryState} from "@app/modules/hwe-kalk/enums/DeliveryState";

@Component({
	selector: "app-ring-calculation",
	templateUrl: "./ring-calculation.component.html",
	styleUrls: ["./ring-calculation.component.scss"],
})
export class RingCalculationComponent {
	isDialogOpen: boolean = false;
	isQuestionDialogOpen: boolean = false;
	isErrorDialogOpen: boolean = false;
	isWindowLoaderEnabled: boolean = false;
	response: any |undefined;
	payload: any;
	fliesspressen: boolean | undefined = undefined;
	selectedKombiwalzen: any = {};
	kleinerLochen: boolean | undefined;
	rawDimensionTypeStructure = new RawDimensionType().deserialize({});
	kombiwalzens = KombiwalzenClass.getEnumArray();

	@Output() public onCloseRingCalculationDialog = new EventEmitter<object>();
	@Input() offerPos!: OfferPos;
	@Input() machines: Machine[] = [];
	@Input() rawDimentionIndex: number = 0;

	@Input() public set ringCalculationDialogOpened(isOpen: boolean) {
		if (isOpen) {
			this.response = undefined;
			this.payload = {};
			this.fliesspressen = undefined;
			this.kleinerLochen = undefined;
			this.selectedKombiwalzen = {};
			this.isDialogOpen = isOpen;
			this.loadData();
		}
	}

	constructor(public hweKalkService: HweKalkService, private commonService: CommonService) {}

	loadData() {
		const rawPartOutersDiameter = this.offerPos.offerPosRawDimensions?.[
			this.rawDimentionIndex
		]?.rawDimensionTypes?.find(outer => outer.type == "outer_diameter");
		const rawPartInnerDiameter = this.offerPos.offerPosRawDimensions?.[
			this.rawDimentionIndex
		]?.rawDimensionTypes?.find(outer => outer.type == "inner_diameter");
		const rawPartHeight = this.offerPos.offerPosRawDimensions?.[
			this.rawDimentionIndex
		]?.rawDimensionTypes?.find(outer => outer.type == "height");

		this.payload = {
			werkstoffId: this.offerPos.material?.id,
			stueckzahl: this.offerPos?.quantity,
			istRohteil: this.offerPos?.delivery_state == DeliveryState.RM1,
			kombiwalzen:
				parseInt(this.selectedKombiwalzen?.value) >= 0
					? parseInt(this.selectedKombiwalzen?.value)
					: null,
			stueckzahlKombiwalzen:
				this.offerPos.offerPosRawDimensions?.[this.rawDimentionIndex]?.quantity_raw_piece,
			istVordrehmass:
				this.offerPos?.delivery_state == DeliveryState.VM4,
			fertigmaßAussen: this.offerPos.outer_diameter_final || 0,
			fertigmaßInnen: this.offerPos.inner_diameter_final || 0,
			fertigmaßHoehe: this.offerPos.height_final || 0,
			schnittzugabeAussen: this.offerPos.max_allowance_outer_diameter_final || 0,
			schnittzugabeInnen: this.offerPos.max_allowance_inner_diameter_final || 0,
			schnittzugabeHoehe: this.offerPos.max_allowance_height_final || 0,
			vorschruppenAussen: 0,
			vorschruppenInnen: 0,
			vorschruppenHoehe: 0,
			aufmaßAussen: rawPartOutersDiameter?.additional_dimensions || 0,
			aufmaßInnen: rawPartInnerDiameter?.additional_dimensions || 0,
			aufmaßHoehe: rawPartHeight?.additional_dimensions || 0,
			probeAussen: rawPartOutersDiameter?.sample_allowance || 0,
			probeInnen: rawPartInnerDiameter?.sample_allowance || 0,
			probeHoehe: rawPartHeight?.sample_allowance || 0,
			fliesspressen: this.fliesspressen === undefined ? undefined : !!this.fliesspressen,
			kleinerLochen: this.kleinerLochen === undefined ? undefined : !!this.kleinerLochen,
		};

		this.isWindowLoaderEnabled = true;

		this.commonService
			.post("hwe-kalk/ring-calculation", { data: this.payload }, false)
			.subscribe({
				next: (res: any) => {
					this.response = res;
					this.isWindowLoaderEnabled = false;

					if (this.response?.messages && parseInt(this.selectedKombiwalzen?.value) !== 0) {
						this.isQuestionDialogOpen = true;
					} else if (this.response?.istUngueltig || !this.response?.messages) {
						this.isErrorDialogOpen = true;
					}
				},
				error: err => {
					this.isWindowLoaderEnabled = false;
					this.isErrorDialogOpen = true;
				},
			});
	}

	close() {
		if (!this.response?.istUngueltig || this.response?.messages) {
			this.updateOfferPos();
		}

		this.isDialogOpen = false;
		this.onCloseRingCalculationDialog.emit();
	}

	onErrorDialogClose() {
		this.isErrorDialogOpen = false;
	}

	// Helper function to assign values safely
	assignValue = (target: any, key: string, sourceKey: keyof typeof this.response) => {
		if (this.response?.[sourceKey] !== undefined) {
			target[key] = this.response[sourceKey];
		}
	};

	// Helper function to create and push raw dimension types
	updateRawDimensionType = (type: string, properties: { [key: string]: any } = {}) => {
		const offer_pos_raw_dimension_id =
			this.offerPos.offerPosRawDimensions?.[this.rawDimentionIndex]?.id;

		if (
			this.offerPos.offerPosRawDimensions?.[this.rawDimentionIndex].rawDimensionTypes &&
			Object.keys(properties).length > 0
		) {
			this.offerPos.offerPosRawDimensions[this.rawDimentionIndex].rawDimensionTypes =
				this.offerPos.offerPosRawDimensions?.[this.rawDimentionIndex].rawDimensionTypes.map(
					(rawDimensionType: RawDimensionType) => {
						if (
							rawDimensionType.offer_pos_raw_dimensions_id ==
								offer_pos_raw_dimension_id &&
							rawDimensionType.type == type
						) {
							return { ...rawDimensionType, ...properties } as any;
						} else return rawDimensionType;
					}
				);
		}
	};

	updateOfferPos() {
		if (this.offerPos.offerPosRawDimensions?.[this.rawDimentionIndex]) {
			// Assign standard dimensions
			const dim = this.offerPos.offerPosRawDimensions[this.rawDimentionIndex];

			const dimensionMap = {
				height: "hoeheRoh",
				outer_diameter_pre_1: "aussendurchmesserNachLochen",
				inner_diameter_pre_1: "innendurchmesserNachLochen",
				radial_width_pre_1: "radialeBreiteNachLochen",
				height_to_radial_width_pre_1: "hoeheZuRadialeBreiteNachLochen",
				outer_diameter: "aussenDMNachWalzen",
				inner_diameter: "innenDMNachWalzen",
				radial_width: "radialeBreiteNachWalzen",
				outer_diameter_pre_2: "aussendurchmesserNachRollen",
				inner_diameter_pre_2: "innendurchmesserNachRollen",
				height_pre_2: "stauchHoeheNachRollen",
				height_pre_1: "stauchHoehe",
				radial_width_pre_2: "radialeBreiteNachRollen",
				gross_weight: "gewichtRoh",
				operating_weight: "einsatzGewicht",
				slug_dm: "butzenDM",
				slug_weight: "butzenGewicht",
				slug_height: "butzenHoehe",
				machine_id: "aggregat1",
				machine_id_2: "aggregat2",
				round_min_dma: "rundMinDMA",
				round_min_dmb: "rundMinDMB",
				round_max_dma: "rundMaxDMA",
				round_max_dmb: "rundMaxDMB",
				square_min_dma: "vierkantMinDMA",
				square_min_dmb: "vierkantMinDMB",
				square_max_dma: "vierkantMaxDMA",
				square_max_dmb: "vierkantMaxDMB",
				octagon_min_swa: "achtkantMinSWA",
				octagon_min_swb: "achtkantMinSWB",
				octagon_max_swa: "achtkantMaxSWA",
				octagon_max_swb: "achtkantMaxSWB",
				material_forging_degree_total: "materialEinsatzVerschmiedungsgradGesamt",
				rolling_path: "walzweg",
				axial_difference: "axialDifferenz",
				radial_width_per_100_mm: "radialeBreitePro100MM",
				height_to_radial_width: "hoeheDurchRadialeBreite",
				rolling_path_rollweg: "rollweg",
				rolling_pin: "walzdorn",
				shape: "form",
				is_rolled: "ringWirdgerollt",
			};
			dim.a_min = this.response?.rundMinDMA;
			dim.d_min = this.response?.vierkantMinDMA;
			dim.w_min = this.response?.achtkantMinSWA;
			dim.a_max = this.response?.rundMaxDMA;
			dim.d_max = this.response?.vierkantMaxDMA;
			dim.w_max = this.response?.achtkantMaxSWA;
			dim.a_length_min = this.response?.rundMinDMB;
			dim.a_length_max = this.response?.rundMaxDMB;
			dim.d_length_min = this.response?.vierkantMinDMB;
			dim.d_length_max = this.response?.vierkantMaxDMB;
			dim.w_length_min = this.response?.achtkantMinSWA;
			dim.w_length_max = this.response?.achtkantMaxSWA;
			dim.messages = this.response?.messages.join("\n") || "";
            this.machines.map((machine:Machine)=>{
				if(machine.custom_id?.toLowerCase() == this.response?.aggregat1Bezeichnung?.toLowerCase()) dim.machine_id_3 = machine.id;
				if(machine.custom_id?.toLowerCase() == this.response?.aggregat2Bezeichnung?.toLowerCase()) dim.machine_id_4 = machine.id;
			});
			if(this.response?.aggregat1Bezeichnung == '' &&  dim.machine_id_3!= undefined)  dim.machine_id_3 = undefined;
			if(this.response?.aggregat2Bezeichnung == '' &&  dim.machine_id_3!= undefined)  dim.machine_id_4 = undefined;

			Object.keys(dimensionMap).forEach(key => {
				this.assignValue(dim, key, dimensionMap[key as keyof typeof dimensionMap] as never);
			});
			// Create dimension types with structuredClone
			this.updateRawDimensionType("outer_diameter", {
				encore_info: this.response?.aussendurchmesserAufmass,
			});
			this.updateRawDimensionType("inner_diameter", {
				encore_info: this.response?.innendurchmesserAufmass,
			});
			this.updateRawDimensionType("height", { encore_info: this.response?.hoeheAufmass });

			// Tolerances
			this.updateRawDimensionType("outer_diameter", {
				upper_tolerance: this.response?.aussenDMObereToleranz,
			});
			this.updateRawDimensionType("outer_diameter", {
				lower_tolerance: this.response?.aussenDMUntereToleranz,
			});
			this.updateRawDimensionType("inner_diameter", {
				upper_tolerance: this.response?.innenDMObereToleranz,
			});
			this.updateRawDimensionType("inner_diameter", {
				lower_tolerance: this.response?.innenDMUntereToleranz,
			});
			this.updateRawDimensionType("height", {
				upper_tolerance: this.response?.hoeheObereToleranz,
			});
			this.updateRawDimensionType("height", {
				lower_tolerance: this.response?.hoeheUntereToleranz,
			});

			// Hot measurements
			this.updateRawDimensionType("outer_diameter", {
				warm: this.response?.aussendurchmesserWarmMass,
			});
			this.updateRawDimensionType("inner_diameter", {
				warm: this.response?.innendurchmesserWarmMass,
			});
			this.updateRawDimensionType("radial_width_pre_1", {
				warm: this.response?.radialeBreiteNachLochenWarmMass,
			});
			this.updateRawDimensionType("outer_diameter_pre_1", {
				warm: this.response?.aussendurchmesserNachLochenWarmMass,
			});
			this.updateRawDimensionType("inner_diameter_pre_1", {
				warm: this.response?.innendurchmesserNachLochenWarmMass,
			});
			this.updateRawDimensionType("height", {
				warm: this.response?.hoeheWarmMass,
			});
			this.updateRawDimensionType("height_pre_1", {
				warm: this.response?.stauchHoeheWarmMass,
			});
			this.updateRawDimensionType("radial_width", {
				warm: this.response?.radialeBreiteNachWalzenWarmMass,
			});
			this.updateRawDimensionType("height", {
				warm: this.response?.walzHoeheWarmMass,
			});

			this.assignValue(this.offerPos, "radial_width", "radialeBreite" as never);
		}
	}

	submitQuestion(status: number) {
		switch (status) {
			case 102:
				this.fliesspressen = this.fliesspressen ?? false;
				return;
			case 103:
				this.kleinerLochen = this.kleinerLochen ?? false;
				return;
		}

		this.isQuestionDialogOpen = false;
		this.loadData();
	}

	onQuestionDialogClose() {
		this.fliesspressen = undefined;
		this.kleinerLochen = undefined;
		this.selectedKombiwalzen = {};

		this.isQuestionDialogOpen = false;
	}
}
