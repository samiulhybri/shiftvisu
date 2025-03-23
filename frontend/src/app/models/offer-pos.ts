import {OfferPosStatus} from "@app/modules/hwe-kalk/enums/OfferPosStatus";
import {Deserializable} from "../interfaces/deserializable";
import {ODatable} from "../interfaces/odatable";
import {Calculation} from "./calculation";
import {Material} from "./material";
import {Offer} from "./offer";
import {OfferPosMechanicalProcess} from "./offer-pos-mechanical-process";
import {OfferPosRawDimension} from "./offer-pos-raw-dimension";
import {HweRustProtectionType} from "@app/modules/hwe-kalk/enums/HweRustProtectionType";
import {Item} from "./item";
import {OfferPosCost} from "./offer-pos-cost";
import {Tool} from "./tool";
import {
    OfferPosMechanicalProcessTolerance,
    OfferPosMechanicalProcessToleranceClass
} from "@app/modules/hwe-kalk/enums/OfferPosMechanicalProcessTolerance";
import {OfferPosProductType} from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import {DeliveryState} from "@app/modules/hwe-kalk/enums/DeliveryState";
import {OperationPlanPos} from "./operation-plan-pos";
import {OfferPosWorkPlanNameClass} from "@app/modules/hwe-kalk/enums/OfferPosWorkPlanName";
import {
    CalculationHeatTreatmentType,
    CalculationHeatTreatmentTypeClass
} from "@app/modules/hwe-kalk/enums/CalculationHeatTreatmentType";
import {ImpactTestTypeClass} from "@app/modules/hwe-qs/enums/ImpactTestType";
import {SpecimenLocationClass} from "@app/modules/hwe-kalk/enums/SpecimenLocation";
import {
    OfferPosDimensionSurface,
    OfferPosDimensionSurfaceClass
} from "@app/modules/hwe-kalk/enums/OfferPosDimensionSurface";
import {Attestation, AttestationClass} from "@app/modules/hwe-kalk/enums/Attestation";
import {JominyBatchClass} from "@app/modules/hwe-kalk/enums/JominyBatch";
import {NeedsAccordingToIcClass} from "@app/modules/hwe-kalk/enums/NeedsAccordingToIc";
import {NonDestructiveTesting} from "@app/modules/hwe-kalk/enums/NonDestructiveTesting";
import {FrequencyClass} from "@app/modules/hwe-kalk/enums/Frequency";
import {
    CalculationAdditionalHeatTreatmentType
} from "@app/modules/hwe-kalk/enums/CalculationAdditionalHeatTreatmentType";
import {OfferPosRejectionTypeClass} from "@app/modules/hwe-kalk/enums/OfferPosRejectionType";

export class OfferPos implements ODatable, Deserializable {
    id?: number;
    offer_id?: number;
    offer!: Offer;
    pos: string = '';
    material_id?: number;
    is_commission: boolean = false;
    item_name: string = '';
    material?: Material;
    item?: Item;
    tool?: Tool;
    product_type?: OfferPosProductType;
    quantity?: number;
    drawing_id: string = '';
    attachments: string = '';
    calculation?: Calculation;
    offerPosRawDimensions?: OfferPosRawDimension[] = [];
    mechanicalProcesses?: OfferPosMechanicalProcess[] = [];
    offerPosCosts?: OfferPosCost[] = [];
    outer_diameter_final?: number;
    side_a_final?: number;
    side_b_final?: number;
    inner_diameter_final?: number;
    height_final?: number;
    max_inner_diameter?: number;
    length_final?: number;
    outer_diameter_surface_final?: OfferPosDimensionSurface;
    side_a_surface_final: string = ''
    side_b_surface_final: string = ''
    inner_diameter_surface_final: string = ''
    height_surface_final: string = ''
    length_surface_final: string = ''
    customer_material_number: string = ''
    delivery_state?: DeliveryState;
    min_allowance_outer_diameter_final?: number;
    max_allowance_outer_diameter_final?: number;
    min_allowance_side_a_final?: number;
    max_allowance_side_a_final?: number;
    min_allowance_side_b_final?: number;
    max_allowance_side_b_final?: number;
    min_allowance_inner_diameter_final?: number;
    max_allowance_inner_diameter_final?: number;
    min_allowance_height_final?: number;
    max_allowance_height_final?: number;
    min_allowance_length_final?: number;
    max_allowance_length_final?: number;
    outer_tolerance?: OfferPosMechanicalProcessTolerance;
    inner_tolerance?: OfferPosMechanicalProcessTolerance;
    side_a_tolerance?: OfferPosMechanicalProcessTolerance;
    side_b_tolerance?: OfferPosMechanicalProcessTolerance;
    height_tolerance?: OfferPosMechanicalProcessTolerance;
    length_tolerance?: OfferPosMechanicalProcessTolerance;
    is_rejected: boolean = false;
    show_mechanical_values: boolean = false;
    rejection_type?: string = '';
    calculation_heat_treatments_type?: string = '';
    crm_id?: string;
    total_length?: number;
    max_outer_diameter?: number;
    length_encore_info?: number;
    outer_diameter_encore_info?: number;
    outer_diameter_lower_tolerance?: number;
    outer_diameter_upper_tolerance?: number;
    length_lower_tolerance?: number;
    length_upper_tolerance?: number;
    drilling_diameter?: number;
    has_no_contour: boolean = false;
    has_mechanical_drilling: boolean = false;
    is_specification_needed: boolean = false;
    check_text: boolean = false;
    has_forged_drilling: boolean = false;
    is_extruded: boolean = false;
    is_hollow_punching: boolean = false;
    tool_2?: Tool;
    tool_3?: Tool;
    offer_pos_id_copy_from?: number;
    radial_width?: number = 0;
    status?: OfferPosStatus;
    rust_protection_type?: HweRustProtectionType;
    copyForm!: OfferPos;

    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        this.calculation = input?.calculation ? new Calculation().deserialize(input?.calculation) : new Calculation().deserialize({});
        this.offer = input?.offer ? new Offer().deserialize(input?.offer) : new Offer().deserialize({});
        this.material = input?.material ? new Material().deserialize(input?.material) : new Material().deserialize({});
        this.offerPosRawDimensions = [];
        if (input?.offerPosRawDimensions) {

            input?.offerPosRawDimensions.forEach((offerPosRawDimension: OfferPosRawDimension) => {
                offerPosRawDimension.section = offerPosRawDimension.offerPosDimensionShaftUpsetParts.length
                offerPosRawDimension.forged_beam_section = offerPosRawDimension.offerPosDimensionUpsetPartForgedBeams.length
                const deserialized = new OfferPosRawDimension().deserialize(offerPosRawDimension);
                deserialized.offerPos = this;
                this.offerPosRawDimensions?.push(deserialized);
            });
        }
        this.mechanicalProcesses = [];
        if (input?.mechanicalProcesses) {

            input?.mechanicalProcesses.forEach((mechanicalProcess: OfferPosMechanicalProcess) => {
                mechanicalProcess.section = mechanicalProcess.length
                this.mechanicalProcesses?.push(new OfferPosMechanicalProcess().deserialize(mechanicalProcess))
            });
        }
        this.offerPosCosts = [];
        if (input?.offerPosCosts) {

            input?.offerPosCosts.forEach((offerPosCost: OfferPosCost) => {
                const obj = new OfferPosCost().deserialize(offerPosCost);
                obj.offerPos = this;
                this.offerPosCosts?.push(obj);
            });
        }
        this.item = input?.item ? new Item().deserialize(input?.item) : new Item().deserialize({});
        this.tool = input?.tool ? new Tool().deserialize(input?.tool) : new Tool().deserialize({});
        this.tool_2 = input?.tool_2 ? new Tool().deserialize(input?.tool_2) : new Tool().deserialize({});
        this.tool_3 = input?.tool_3 ? new Tool().deserialize(input?.tool_3) : new Tool().deserialize({});
        return this;
    }

    toOdata(isUpdate: boolean = false): OfferPos {
        return {
            ...this,
            material_id: this.material?.id ?? null,
            material: undefined,
            calculation: undefined,
            offer: undefined,
            item_id: this.item?.id ?? null,
            tool_id_2: this.tool_2?.id ?? null,
            tool_id_3: this.tool_3?.id ?? null,
            item: undefined,
            tool_2: undefined,
            tool_3: undefined,
            tool_id: this.tool?.id ?? null,
            tool: undefined,
            offerPosRawDimensions: undefined,
            calculation_heat_treatments_type: undefined,
            mechanicalProcesses: undefined,
            rust_protection_type: this.rust_protection_type ?? '',
            offerPosCosts: isUpdate ? undefined : this.getCost(),
            crm_id: undefined,
            offer_pos_id_copy_from: undefined,
            copyForm: undefined,
            prod_order_pos: undefined,
            rejection_type : this.rejection_type ??  ''
        };
    }

    getCost(){
        let offerPosCosts:any = [];
        if (this.offerPosCosts) {

            this.offerPosCosts?.forEach((offerPosCost: OfferPosCost) => {
                const obj = new OfferPosCost().deserialize(offerPosCost).toOdata();
                offerPosCosts.push(obj);
            });
        }
        return offerPosCosts.length ? offerPosCosts : undefined;
    }

    getTotalOfferPosCosts() {
        return this?.offerPosCosts?.reduce((accumulator, offerPosCost: OfferPosCost) => accumulator + (offerPosCost.cost ?? 0), 0).toFixed(2) ?? 0.00;
    }

    getTotalOfferPosCostLeadTimeDays() {
        return this?.offerPosCosts?.reduce((accumulator, offerPosCost: OfferPosCost) => accumulator + (offerPosCost.lead_time_days ?? 0), 0) ?? 0;
    }

    getTotalMechanicalProcessesLength() {
        return this?.mechanicalProcesses?.reduce((accumulator, offerPosMechanicalProcess: OfferPosMechanicalProcess) => accumulator + (offerPosMechanicalProcess.length ?? 0), 0).toFixed(2) ?? 0.00;
    }

    getTotalMechanicalProcessesInnerLength() {
        return this?.mechanicalProcesses?.reduce((accumulator, offerPosMechanicalProcess: OfferPosMechanicalProcess) => accumulator + (offerPosMechanicalProcess.inner_length ?? 0), 0).toFixed(2) ?? 0.00;
    }

    getMaxRawMeasurementOperatingWeight() {
        return this?.offerPosRawDimensions?.reduce((currentMax, offerPosRawDimension: OfferPosRawDimension) => Math.max(currentMax, offerPosRawDimension.operating_weight ?? 0), Number.NEGATIVE_INFINITY) ?? 0;
    }

    getMaxRawMeasurementSemiFinishedProduct() {
        return this?.offerPosRawDimensions?.reduce((currentMax, offerPosRawDimension: OfferPosRawDimension) => Math.max(currentMax, offerPosRawDimension.semi_finished_product ?? 0), 0) ?? 0;
    }

    getMaxRawMeasurementSideA() {
        return this?.offerPosRawDimensions?.reduce((currentMax, offerPosRawDimension: OfferPosRawDimension) => Math.max(currentMax, offerPosRawDimension.side_a ?? 0), Number.NEGATIVE_INFINITY) ?? 0;
    }

    getMaxRawMeasurementGrossWeight() {
        return this?.offerPosRawDimensions?.reduce((currentMax, offerPosRawDimension: OfferPosRawDimension) => Math.max(currentMax, offerPosRawDimension.gross_weight ?? 0), Number.NEGATIVE_INFINITY) ?? 0;
    }

    getTotalLeadTime() {
        if (this.offerPosCosts?.length) {
            return this?.offerPosCosts?.reduce((accumulator, offerPosCost: OfferPosCost) => accumulator + (offerPosCost.lead_time_days ?? 0), 0);
        } else return '';
    }

    getAvgRawMeasurementGrossWeight() {
        let totWeight = 0;

        this.offerPosRawDimensions?.forEach(rawDim => {
            totWeight += (rawDim.gross_weight ?? 0) * (rawDim.quantity_final_for_raw ?? 0)
        })

        return totWeight / (this.quantity ?? 1);
    }

    getFinalDimensionText(hideFractionalMeasure = false) {
        const deliveryState =
            this.delivery_state == DeliveryState.RM1
                ? $localize`raw dimensions`
                : this.delivery_state == DeliveryState.VM4
                    ? $localize`machined dimensions`
                    : $localize`finished dimensions`;

        if (this.product_type && [OfferPosProductType.DISK, OfferPosProductType.BAR_ROUND].includes(this.product_type)
            && !this.inner_diameter_final && !this.drawing_id.length) {
            //Variant 1
            return $localize`${this.outer_diameter_final} Ø x ${(this.height_final ?? this.length_final) || 0} mm ${deliveryState}`;
        } else if (this.product_type == OfferPosProductType.DISK && !this.inner_diameter_final && this.drawing_id.length) {
            //Variant 2
            return $localize`o. Ø ${this.outer_diameter_final} tot. lg. ${(this.height_final ?? this.length_final) || 0} mm ${deliveryState}`;
        } else if (this.product_type &&
            ([OfferPosProductType.DISK_PUNCHED, OfferPosProductType.RING_CYLINDER, OfferPosProductType.RING_ROLLED, OfferPosProductType.PIPE, OfferPosProductType.SOCKET].includes(this.product_type) ||
                ([OfferPosProductType.DISK, OfferPosProductType.BAR_ROUND].includes(this.product_type) && this.inner_diameter_final))
            && !this.drawing_id.length) {
            //Variant 3
            return $localize`${this.outer_diameter_final || 0} Ø / ${this.inner_diameter_final || 0} Ø  x  ${(this.height_final ?? this.length_final) || 0} mm ${deliveryState}`;
        } else if (this.product_type &&
            ([OfferPosProductType.DISK_PUNCHED, OfferPosProductType.RING_CYLINDER, OfferPosProductType.RING_ROLLED, OfferPosProductType.PIPE, OfferPosProductType.SOCKET].includes(this.product_type) ||
                (this.product_type == OfferPosProductType.DISK && this.inner_diameter_final))
            && this.drawing_id.length) {
            //Variant 4
            return $localize`o. Ø ${this.outer_diameter_final} i. Ø ${this.inner_diameter_final} tot. hg. ${(this.height_final ?? this.length_final) || 0} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.BAR_ROUND, OfferPosProductType.SHAFT, OfferPosProductType.UPSET_PART].includes(this.product_type)
            && !this.inner_diameter_final && this.drawing_id.length) {
            //Variant 5
            return $localize`o. Ø ${(this.outer_diameter_final ?? this.max_outer_diameter) || 0} tot. lg. ${(this.length_final ?? this.total_length) || 0} mm ${deliveryState}`;
        } else if (this.product_type && (([OfferPosProductType.BAR_ROUND, OfferPosProductType.SHAFT, OfferPosProductType.UPSET_PART].includes(this.product_type)
            && this.inner_diameter_final) || this.product_type == OfferPosProductType.SHAFT_HOLLOW) && this.drawing_id.length) {
            //Variant 6
            return $localize`o. Ø ${(this.outer_diameter_final ?? this.max_outer_diameter) || 0} i. Ø ${this.inner_diameter_final} tot. lg. ${(this.length_final ?? this.total_length) || 0} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.BAR_SQUARE, OfferPosProductType.BAR_ROLLED].includes(this.product_type)
            && !this.has_mechanical_drilling && !this.drawing_id.length) {
            //Variant 7
            return $localize`${this.side_a_final} x ${this.side_b_final} fl. x ${this.length_final} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.BAR_SQUARE, OfferPosProductType.BAR_ROLLED].includes(this.product_type)
            && !this.has_mechanical_drilling && this.drawing_id.length) {
            //Variant 8
            return $localize`o. Q. ${this.side_a_final} x ${this.side_b_final} tot. lg. ${this.length_final} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.BAR_SQUARE, OfferPosProductType.BAR_ROLLED].includes(this.product_type)
            && this.has_mechanical_drilling && !this.drawing_id.length) {
            //Variant 9
            return $localize`${this.side_a_final} x ${this.side_b_final} fl. / i. Ø ${this.drilling_diameter} x ${this.length_final} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.BAR_SQUARE, OfferPosProductType.BAR_ROLLED].includes(this.product_type)
            && this.has_mechanical_drilling && (this.drawing_id.length || hideFractionalMeasure)) {
            //Variant 10
            return $localize`o. Q. ${this.side_a_final} x ${this.side_b_final} i. Ø ${this.drilling_diameter} tot. lg. ${this.length_final} mm ${deliveryState}`;
        } else if (this.product_type && [OfferPosProductType.SHAFT, OfferPosProductType.UPSET_PART].includes(this.product_type)
            && !this.inner_diameter_final && !this.drawing_id.length) {
            //Variant 11
            let dimText = '';
            let lengthText = '';
            this.mechanicalProcesses?.forEach(section => {
                if (section.side) {
                    dimText += `${section.outer_diameter} x ${section.side} / `
                } else {
                    dimText += `${section.outer_diameter} / `
                }

                lengthText += `${section.length} / `
            });

            lengthText = lengthText.slice(0, -3);
            dimText = dimText.slice(0, -3);
            return $localize`${dimText} Ø\n${lengthText} mm total. lg. ${this.total_length}, ${deliveryState}`;
        } else if (this.product_type && (([OfferPosProductType.SHAFT, OfferPosProductType.UPSET_PART].includes(this.product_type)
            && this.inner_diameter_final) || this.product_type == OfferPosProductType.SHAFT_HOLLOW) && !this.drawing_id.length) {
            //Variant 12
            let dimText = '';
            let lengthText = '';
            this.mechanicalProcesses?.forEach(section => {
                if (section.side) {
                    dimText += `${section.outer_diameter} x ${section.side} / `
                } else {
                    dimText += `${section.outer_diameter} / `
                }

                lengthText += `${section.length} / `
            });

            lengthText = lengthText.slice(0, -3);
            dimText = dimText.slice(0, -3);
            return $localize`${dimText} Ø\n${lengthText} mm total. lg. ${this.total_length}\ninner Ø ${this.inner_diameter_final}, ${deliveryState}`;
        } else {
            return '';
        }
    }

    getWorkPlanNames() {
        let workPlans: string[] = [];

        this?.calculation?.operationPlan?.operationPlanPos?.forEach((opPlanPos: OperationPlanPos) => {
            workPlans.push(OfferPosWorkPlanNameClass.getStateTranslate(opPlanPos.name));
        });

        return workPlans.join(', ');
    }

    getDeliveryStateText() {
        let text = $localize`Delivery condition:\n`;
        let cuttingAllowanceText = '';
        let surfaceText1: string | undefined;
        let toleranceText1: string | undefined;
        let surfaceText2: string | undefined;
        let toleranceText2: string | undefined;
        let surfaceText3: string | undefined;
        let toleranceText3: string | undefined;

        let min_cutting_allowance = this.min_allowance_height_final || this.min_allowance_length_final || this.min_allowance_outer_diameter_final || this.min_allowance_inner_diameter_final || this.min_allowance_side_a_final || this.min_allowance_side_b_final;
        let max_cutting_allowance = this.max_allowance_height_final || this.max_allowance_length_final || this.max_allowance_outer_diameter_final || this.max_allowance_inner_diameter_final || this.max_allowance_side_a_final || this.max_allowance_side_b_final;

        if (min_cutting_allowance && min_cutting_allowance == max_cutting_allowance) {
            cuttingAllowanceText = min_cutting_allowance.toString();
        } else {
            cuttingAllowanceText = `${min_cutting_allowance} - ${max_cutting_allowance}`
        }

        if (this.product_type && ![OfferPosProductType.BAR_SQUARE, OfferPosProductType.BAR_ROLLED].includes(this.product_type)) {
            surfaceText1 = OfferPosDimensionSurfaceClass.getStateTranslate(this.outer_diameter_surface_final);
            toleranceText1 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.outer_tolerance);

            if (![OfferPosProductType.DISK, OfferPosProductType.BAR_ROUND, OfferPosProductType.SHAFT, OfferPosProductType.UPSET_PART].includes(this.product_type)) {
                surfaceText2 = OfferPosDimensionSurfaceClass.getStateTranslate(this.inner_diameter_surface_final);
                toleranceText2 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.inner_tolerance);
            }

            if ([OfferPosProductType.DISK, OfferPosProductType.DISK_PUNCHED, OfferPosProductType.RING_ROLLED, OfferPosProductType.RING_CYLINDER].includes(this.product_type)) {
                surfaceText3 = OfferPosDimensionSurfaceClass.getStateTranslate(this.height_surface_final);
                toleranceText3 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.height_tolerance);
            } else {
                surfaceText3 = OfferPosDimensionSurfaceClass.getStateTranslate(this.length_surface_final);
                toleranceText3 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.length_tolerance);
            }
        } else {
            surfaceText1 = OfferPosDimensionSurfaceClass.getStateTranslate(this.side_a_surface_final);
            toleranceText1 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.side_a_tolerance);
            surfaceText2 = OfferPosDimensionSurfaceClass.getStateTranslate(this.side_b_surface_final);
            toleranceText2 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.side_b_tolerance);
            surfaceText3 = OfferPosDimensionSurfaceClass.getStateTranslate(this.length_surface_final);
            toleranceText3 = OfferPosMechanicalProcessToleranceClass.getStateTranslate(this.length_tolerance);
        }
        let toleranceText: string | undefined;
        if ((toleranceText1 != toleranceText2 && toleranceText2) || (toleranceText1 != toleranceText3 && toleranceText3)) {
            toleranceText = $localize`o. Ø ${toleranceText1}, i. Ø ${toleranceText2}, height ${toleranceText3}`
        } else {
            toleranceText = toleranceText1;
        }

        let surfaceText: string | undefined;
        if ((surfaceText1 != surfaceText2 && surfaceText2) || (surfaceText1 != surfaceText3 && surfaceText3)) {
            surfaceText = $localize`o. Ø ${surfaceText1}, i. Ø ${surfaceText2}, height ${surfaceText3}`
        } else {
            surfaceText = surfaceText1;
        }

        if (this.delivery_state === DeliveryState.RM1) {
            text += $localize`forged to the above-mentioned raw dimensions with the usual forging tolerances.\nWe assume no liability for the achievability of the finished dimensions!!!`;
        } else if (this.delivery_state === DeliveryState.FM2 && this.product_type != OfferPosProductType.RING_CYLINDER) {
            text += $localize`neatly rough forged, supplied in the specified approximate raw dimensions with the usual tolerances on all sides`;
        } else if (this.delivery_state === DeliveryState.FM2 && this.product_type === OfferPosProductType.RING_CYLINDER) {
            text += $localize`neatly, seamlessly rolled, supplied in the specified approximate raw dimensions with the usual tolerances on all sides`;
        } else if (this.delivery_state === DeliveryState.FM3 && !this.drawing_id) {
            text += $localize`mechanically pre-machined to the finished dimensions plus approx. ${cuttingAllowanceText} mm cutting allowance, \nsurface finish ${surfaceText}`;
        } else if (this.delivery_state === DeliveryState.FM3 && this.drawing_id && !this.has_no_contour) {
            text += $localize`mechanically pre-machined to the drawing contour plus approx. ${cuttingAllowanceText} mm cutting allowance, \nsurface finish ${surfaceText}`;
        } else if (this.delivery_state === DeliveryState.FM3 && this.drawing_id && this.has_no_contour) {
            text += $localize`mech. pre-machined to the main dimensions of the drawing part without contour plus approx. ${cuttingAllowanceText} cutting allowance, \nsurface finish ${surfaceText1}`;
        } else if (this.delivery_state === DeliveryState.VM4 && !this.drawing_id) {
            //Description 14
            text += $localize`machined to the above machining dimensions\nwith tolerance ${toleranceText}, \nsurface finish ${surfaceText}`;
        } else if (this.delivery_state === DeliveryState.VM4 && this.drawing_id && !this.has_no_contour) {
            //Description 15
            text += $localize`machined to the drawing dimensions\nwith tolerance ${toleranceText}, \nsurface finish ${surfaceText}`;
        } else if (this.delivery_state === DeliveryState.VM4 && this.drawing_id && this.has_no_contour) {
            //Description 21
            text += $localize`machined to the main dimensions of the drawing part\without contour with tolerance ${toleranceText}, \nsurface finish ${surfaceText}`;
        } else if (this.delivery_state === DeliveryState.FM4) {
            text += $localize`machined to drawing dimensions\nwith tolerances and surface finish according to drawing specifications!\n-preserved with Carlofon 25b- `;
        }


        //TODO: Einschränkungen BW
        // text += `,\n`;

        if ((this.delivery_state === DeliveryState.FM3 || this.delivery_state === DeliveryState.VM4) && this.calculation?.heatTreatments.some(item => !item.isDeleted && (item.type === CalculationHeatTreatmentType.STRESS_RELIEVING || item.type === CalculationHeatTreatmentType.DESP_OAK_FURNACE_COOLING))) {
            text += $localize`\nthen stress-relieved.`;
        }

        return text;
    }

    public getRawDimensionText(): string {
        let dimText = '';
        let lengthText = '';

        if (!this.offerPosRawDimensions || this.offerPosRawDimensions.length < 1)
            return '';

        let dim1;
        let dim2;
        let dim3;
        const rawDim0 = this.offerPosRawDimensions[0];

        if (this.product_type === OfferPosProductType.DISK || this.product_type === OfferPosProductType.DISK_PUNCHED || this.product_type === OfferPosProductType.RING_CYLINDER || this.product_type === OfferPosProductType.RING_ROLLED || this.product_type === OfferPosProductType.PIPE || this.product_type === OfferPosProductType.SOCKET || this.product_type === OfferPosProductType.BAR_ROUND) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'outer_diameter';
            })[0].sample_allowance ?? 0;

            dim1 = (rawDim0.outer_diameter ?? 0) - rawDimTypeAllowance;
        } else if (this.product_type === OfferPosProductType.BAR_SQUARE) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'side_a';
            })[0].sample_allowance ?? 0;

            dim1 = (rawDim0.side_a ?? 0) - rawDimTypeAllowance;
        }

        if (this.product_type === OfferPosProductType.DISK_PUNCHED || this.product_type === OfferPosProductType.RING_CYLINDER || this.product_type === OfferPosProductType.RING_ROLLED || this.product_type === OfferPosProductType.PIPE || this.product_type === OfferPosProductType.SOCKET) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'inner_diameter';

            })[0].sample_allowance ?? 0;

            dim2 = (rawDim0.inner_diameter ?? 0) + rawDimTypeAllowance;
        } else if (this.product_type === OfferPosProductType.BAR_SQUARE) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'side_b';
            })[0].sample_allowance ?? 0;

            dim2 = (rawDim0.side_b ?? 0) - rawDimTypeAllowance;
        }

        if (this.product_type === OfferPosProductType.DISK || this.product_type === OfferPosProductType.DISK_PUNCHED || this.product_type === OfferPosProductType.RING_CYLINDER || this.product_type === OfferPosProductType.RING_ROLLED) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'height';
            })[0].sample_allowance ?? 0;

            dim3 = Math.round(((rawDim0.height ?? 0) - rawDimTypeAllowance) / (rawDim0.quantity_raw_piece ?? 1) - ((rawDim0.quantity_raw_piece ?? 1) > 1 ? 2 : 0));

        } else if (this.product_type === OfferPosProductType.BAR_SQUARE || this.product_type === OfferPosProductType.BAR_ROUND || this.product_type === OfferPosProductType.PIPE || this.product_type === OfferPosProductType.SOCKET) {
            const rawDimTypeAllowance = rawDim0.rawDimensionTypes.filter(rawDimensionType => {
                return rawDimensionType.type == 'length';
            })[0].sample_allowance ?? 0;

            dim3 = Math.round(((rawDim0.length ?? 0) - rawDimTypeAllowance) / (rawDim0.quantity_raw_piece ?? 1) - ((rawDim0.quantity_raw_piece ?? 1) > 1 ? 2 : 0));
        }

        if (this.product_type === OfferPosProductType.DISK) {
            return $localize`${dim1} Ø x ${dim3} mm Approx. raw dimensions${this.has_mechanical_drilling ? '\nmechnical drilling ' + this.drilling_diameter + 'mm' : ''}`;
        } else if (this.product_type === OfferPosProductType.DISK_PUNCHED || this.product_type === OfferPosProductType.RING_CYLINDER || this.product_type === OfferPosProductType.RING_ROLLED || this.product_type === OfferPosProductType.PIPE || this.product_type === OfferPosProductType.SOCKET) {
            return $localize`${dim1} Ø / ${dim2} Ø x ${dim3} mm Approx. raw dimensions`;
        } else if (this.product_type === OfferPosProductType.BAR_SQUARE) {
            return $localize`${dim1} x ${dim2} fl. x ${dim3} mm Approx. raw dimensions`;
        } else if (this.product_type === OfferPosProductType.BAR_ROUND) {
            return $localize`${dim1} Ø x ${dim3} mm Approx. raw dimensions${this.has_mechanical_drilling ? '\nmechnical drilling ' + this.drilling_diameter + 'mm' : ''}`;
        } else if (this.product_type === OfferPosProductType.SHAFT || this.product_type === OfferPosProductType.UPSET_PART) {
            if (this.offerPosRawDimensions && this.offerPosRawDimensions.length > 0) {
                this.offerPosRawDimensions[0].offerPosDimensionShaftUpsetParts.forEach(section => {
                    //TODO: IF MULTIPLE PIECE PER RAW
                    if (section.side) {
                        dimText += `${section.outer_diameter_start} x ${section.side} / `
                    } else {
                        dimText += `${section.outer_diameter_start} / `
                    }

                    lengthText += `${section.length} / `
                });
            }
            let totLength = this.offerPosRawDimensions[0].offerPosDimensionShaftUpsetParts.reduce((acc, curr) => acc += (curr.length ?? 0), 0);

            return $localize`${dimText} Ø\n${lengthText} mm total Lg. ${this.total_length || totLength}, Approx. raw dimensions`;
        } else if (this.product_type === OfferPosProductType.SHAFT_HOLLOW) {
            if (this.offerPosRawDimensions && this.offerPosRawDimensions.length > 0) {
                this.offerPosRawDimensions[0].offerPosDimensionShaftUpsetParts.forEach(section => {
                    //TODO: IF MULTIPLE PIECE PER RAW
                    if (section.side) {
                        dimText += `${section.outer_diameter_start} x ${section.side} / `
                    } else {
                        dimText += `${section.outer_diameter_start} / `
                    }

                    lengthText += `${section.length} / `
                });
            }
            let totLength = this.offerPosRawDimensions[0].offerPosDimensionShaftUpsetParts.reduce((acc, curr) => acc += (curr.length ?? 0), 0);

            return $localize`${dimText} Ø\n${lengthText} mm total Lg. ${this.total_length}\nforged drilling = Approx. ${this.offerPosRawDimensions[0].inner_diameter || this.offerPosRawDimensions[0].inner_diameter_hollow} mm Approx. raw dimensions`;
        } else if (this.product_type === OfferPosProductType.BAR_ROLLED) {
            let rm0 = this.offerPosRawDimensions[0];

            return $localize`${rm0.height ?? 0} x ${((rm0.outer_diameter ?? 0) - (rm0.inner_diameter ?? 0)) / 2} fl. x ${rm0.single_length ?? 0} mm Approx. raw dimensions`;

        } else {
            return '';
        }
    }

    public getHeatTreatmentText(): string {
        let text = '';

        if (this.calculation?.additionalHeatTreatments.reduce((acc, curr) => acc || curr.type === CalculationAdditionalHeatTreatmentType.ROUGHING, false)) {
            text += $localize`After rough machining `
        }

        this.calculation?.heatTreatments?.forEach(heatTreatment => {
            if (heatTreatment.type && this.calculation?.heatTreatments?.length && (this.calculation?.heatTreatments?.length == 1 ||
                ![
                    CalculationHeatTreatmentType.GLOWING,
                    CalculationHeatTreatmentType.STRESS_RELIEVING,
                    CalculationHeatTreatmentType.DESP_OAK_FURNACE_COOLING,
                    CalculationHeatTreatmentType.DIFFUSION_ANNEALING,
                    CalculationHeatTreatmentType.UNTREATED
                ].includes(heatTreatment.type))) {
                text += `${CalculationHeatTreatmentTypeClass.getStateTranslateOfferText(heatTreatment.type)}, `;
            }
        });

        if (text.length > 2)
            text = text.substring(0, text.length - 2);

        if (this.show_mechanical_values && this.calculation?.testingScope) {
            text += $localize` on:\n`;
            if (this.calculation?.calculationTestingScope?.bhp_dimension) {
                text += $localize` machanical values on bhs ${this.calculation?.calculationTestingScope?.bhp_dimension}\:\n`;
            }

            if (this.calculation?.calculationTestingScope?.rm_min) text += $localize`Tensile strength/RM: ${this.calculation?.calculationTestingScope?.rm_min}${this.calculation?.calculationTestingScope?.rm ? ' - ' + this.calculation?.calculationTestingScope?.rm : ''} N/mm²\n`;
            //if(this.calculation?.calculationTestingScope?.rp_0_2) text += $localize`Yield strength/RE: min. ${this.calculation?.calculationTestingScope?.rp_0_2} N/mm²\n`;
            if (this.calculation?.calculationTestingScope?.a5_min) text += $localize`Elongation /A5: min. ${this.calculation?.calculationTestingScope?.a5_min} %\n`;
            if (this.calculation?.calculationTestingScope?.z_min) text += $localize`Constriction/Z: min. ${this.calculation?.calculationTestingScope?.z_min} %\n`;
            if (this.calculation?.calculationTestingScope?.impact_test_typ) text += $localize`Impact /Av: on ${ImpactTestTypeClass.getStateTranslate(
                this.calculation?.calculationTestingScope?.impact_test_typ
            )}${
                this.calculation?.calculationTestingScope?.impact_test_temperature ? ' - Specimen at ' + this.calculation?.calculationTestingScope?.impact_test_temperature + ' °C' : ''
            }\n`;
            if (this.calculation?.calculationTestingScope?.toughness) text += $localize`min. ${this.calculation?.calculationTestingScope?.toughness} Joule \n`;
            if (this.calculation?.calculationTestingScope?.min_hbw_on_the_component) text += $localize`Hardness/forging: ${this.calculation?.calculationTestingScope?.min_hbw_on_the_component}${this.calculation?.calculationTestingScope?.max_hbw_on_the_component ? ' - ' + this.calculation?.calculationTestingScope?.max_hbw_on_the_component : ''} HB\n`;
            if (this.calculation?.calculationTestingScope?.specimen_location) text += $localize`Specimen direction: ${SpecimenLocationClass.getStateTranslate(
                this.calculation?.calculationTestingScope?.specimen_location
            )}\n`;
        } else if (!this.show_mechanical_values && this.calculation?.testingScope) {
            text += $localize` to:\n`;
            if (this.calculation?.calculationTestingScope?.rm_min && !this.calculation?.calculationTestingScope?.bhp_dimension) text += $localize`Tensile strength/RM: ${this.calculation?.calculationTestingScope?.rm_min}${this.calculation?.calculationTestingScope?.rm ? ' - ' + this.calculation?.calculationTestingScope?.rm : ''} N/mm²\n`;
            if (this.calculation?.calculationTestingScope?.min_hbw_on_the_component) text += $localize`Hardness/forging: ${this.calculation?.calculationTestingScope?.min_hbw_on_the_component}${this.calculation?.calculationTestingScope?.max_hbw_on_the_component ? ' - ' + this.calculation?.calculationTestingScope?.max_hbw_on_the_component : ''} HB\n`;
            if (!this.calculation?.calculationTestingScope?.rm_min && this.calculation?.calculationTestingScope?.rm && !this.calculation?.calculationTestingScope?.bhp_dimension) text += $localize`Tensile strength/RM: max ${this.calculation?.calculationTestingScope?.rm} N/mm²\n`;
            if (!this.calculation?.calculationTestingScope?.min_hbw_on_the_component && this.calculation?.calculationTestingScope?.max_hbw_on_the_component) text += $localize`Hardness/forging: max ${this.calculation?.calculationTestingScope?.max_hbw_on_the_component} HB\n`;
        } else if (this.calculation?.strength_span_min && !this.calculation?.strength_span_max) {
            text += $localize` to min. ${this.calculation?.strength_span_min} N/mm²\n`;
        } else if (this.calculation?.strength_span_min && this.calculation?.strength_span_max) {
            text += $localize` to ${this.calculation?.strength_span_min} - ${this.calculation?.strength_span_max} N/mm²\n`;
        } else if (!this.calculation?.strength_span_min && this.calculation?.strength_span_max) {
            text += $localize` to max. ${this.calculation?.strength_span_max} N/mm²\n`;
        } else if (this.calculation?.min_hardness && !this.calculation?.max_hardness) {
            text += $localize` to min. ${this.calculation?.min_hardness} HB\n`;
        } else if (this.calculation?.min_hardness && this.calculation?.max_hardness) {
            text += $localize` on ${this.calculation?.min_hardness} - ${this.calculation?.max_hardness} HB\n`;
        } else if (!this.calculation?.min_hardness && this.calculation?.max_hardness) {
            text += $localize` to max. ${this.calculation?.max_hardness} HB\n`;
        }

        return text;
    }

    public getTextForgedOrRolled(): string {
        if (this.delivery_state && [DeliveryState.FM3, DeliveryState.FM4, DeliveryState.VM4].includes(this.delivery_state) && this.product_type == OfferPosProductType.RING_CYLINDER) {
            return $localize`rolled neatly and seamlessly as a ring\n`;
        } else if (this.delivery_state && [DeliveryState.FM3, DeliveryState.FM4, DeliveryState.VM4].includes(this.delivery_state) && this.product_type != OfferPosProductType.RING_CYLINDER) {
            return $localize`neatly forged\n`;
        }
        return '';
    }

    public getTextSteelGrade(): string {
        let text = '';

        if (this.calculation?.materialAnalysis?.custom_id) {
            text += $localize`from steel grade ${this.material?.name}, mat.no. ${this.material?.custom_id} acc. ${this.calculation?.materialAnalysis?.custom_id}`;
        } else {
            text += $localize`from steel grade ${this.material?.name}, mat.no. ${this.material?.custom_id}`;
        }

        if (this.calculation?.calculationHardenabilityRange?.jominy_batch) {
            text += $localize`\nhardenability range ${JominyBatchClass.getStateTranslate(this.calculation?.calculationHardenabilityRange?.jominy_batch)}`;
        }

        if (this.calculation?.individualDeformation?.deformation || this.calculation?.calculationDeformation?.deformation) {
            text += $localize`\nDegree of forging min. ${JominyBatchClass.getStateTranslate(this.calculation?.individualDeformation?.deformation || this.calculation?.calculationDeformation?.deformation)}`;
        }

        return text;
    }

    public getTextCertification(): string {
        let text = ``;
        if (this.calculation?.calculationTestingScope?.attestation) {
            text += $localize`Acceptance test certificate acc. to ${AttestationClass.getStateTranslate(
                this.calculation?.calculationTestingScope?.attestation
            )}`;
            if (this.calculation?.calculationTestingScope?.attestationEntities?.length > 0) {
                text += $localize`\nby `;

                text += this.calculation.calculationTestingScope.attestationEntities.map((entity) => entity.text).join(', ');
            }
        }

        if(this.calculation?.calculationTestingScope?.attestation_following_regulation) {
            text += $localize`\nacc. to above spec.`;
        } else if (!this.calculation?.specification?.id && !(
            this.calculation?.documentation ||
            this.calculation?.metallography ||
            this.calculation?.testingScope ||
            this.calculation?.nonDestructiveTesting ||
            this.calculation?.materialAnalysis ||
            this.calculation?.deformation ||
            this.calculation?.residualMaterial ||
            this.calculation?.hweWorkPlan
        )) {

            if (this.calculation?.charge) {
                text += $localize`Acceptance test certificate acc. to DIN 10204/3.1 via`
                text += $localize`\n- Chemistry`;
                if (this.calculation?.melting_process) {
                    text += $localize` with melting process`;
                }
            } else {
                if (this.calculation?.heatTreatments.some(item => !item.isDeleted && item.type != CalculationHeatTreatmentType.UNTREATED)) {
                    text += $localize`Works certificate acc.to DIN 10204/2.2 via\nChemistry and Brinell hardness test\n`;
                } else {
                    text += $localize`Works certificate acc.to DIN 10204/2.2 via\nChemistry\n`;
                }
            }

            if (this.calculation?.cleanliness_of_the_charge) {
                text += $localize`\n- Purity degree of the melt`;
            }

            if (this.calculation?.grainsize_of_the_charge) {
                text += $localize`\n- Grain size of the melt`;
            }

            if (this.calculation?.deformation) {
                text += $localize`\n- Degree of forging`;
            }

            if (this.calculation?.heattreamtment) {
                text += $localize`\n- Heat treatment data`;
                if (this.calculation?.heattreamtment_with_diagram) {
                    text += $localize` with oven diagram`;
                }
            }

            if (this.calculation?.jominy) {
                text += $localize`\n- Jominy`;
            }

            if (this.calculation?.hardness_testing_hbw) {
                text += $localize`\n- Brinell hardness test`;
                if (this.calculation?.conversion_acc_iso_18265_table_a_1) {
                    text += $localize` Conversion to ISO 18265 Table A.1`;
                }
                if (this.calculation?.conversion_acc_iso_18265_table_b_2) {
                    text += $localize` Conversion to ISO 18265 Table B.2`;
                }
            }

            if (this.calculation?.hardness_testing_hbw_per_piece) {
                text += $localize`\n- Brinell hardness test /piece`;
                if (this.calculation?.conversion_acc_iso_18265_table_a_1) {
                    text += $localize` Conversion to ISO 18265 Table A.1`;
                }
                if (this.calculation?.conversion_acc_iso_18265_table_b_2) {
                    text += $localize` Conversion to ISO 18265 Table B.2`;
                }
            }

            if (this.calculation?.individualNonDestructiveTesting?.usNorm) {
                text += $localize`\n- UT-testing per piece.`;
                if (this.calculation?.individualNonDestructiveTesting?.usNorm?.custom_id) {
                    text += ` ${this.calculation?.individualNonDestructiveTesting?.usNorm?.custom_id}`;
                }

                if (this.calculation?.individualNonDestructiveTesting?.non_destructive_testing == NonDestructiveTesting.THREE_TWO) {
                    text += $localize` (3.2-cert. by "${this.calculation?.individualNonDestructiveTesting.attestationEntities.reduce(
                        (acc, current) => `${acc},  ${current}`,
                        ""
                    )}")`;
                }
            }

            if (this.calculation?.individualNonDestructiveTesting?.mtNorm) {
                text += $localize`\n- crack testing per piece.`;
                if (this.calculation?.individualNonDestructiveTesting?.mtNorm?.custom_id) {
                    text += ` ${this.calculation?.individualNonDestructiveTesting?.mtNorm?.custom_id}`;
                }
            }

            if (this.calculation?.pmi) {
                text += $localize`\n- PMI`;
            }

            if (this.calculation?.visual_inspection) {
                text += $localize`\n- Visual control`;
            }

            if (this.calculation?.dimension_control) {
                text += $localize`\n- Dimensional control`;
            }

            if (this.calculation?.dimension_protocol) {
                text += $localize`\n- Measurement protocol`;
            }

            if (this.calculation?.concentricity_check) {
                text += $localize`\n- Concentricity control`;
            }

            if (this.calculation?.radioactivity_freedom_confirmation) {
                text += $localize`\n- Confirmation of freedom from radioactivity`;
            }

            if (this.calculation?.residual_magnetic_field_strength) {
                text += $localize`\n- Specification magnet. residual field strength`;
            }
        } else {
            //     Data from XLS Abnahmeumfang bei Beurteilung
            if (this.calculation?.calculationDocumentation?.charge) {
                text += $localize`\n- Chemistry`;
                if (this.calculation?.calculationDocumentation?.melting_process) {
                    text += $localize` with melting process`;
                }
            }

            if (this.calculation?.calculationTestingScope?.zug) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.zug} Tensile test at RT`;
            }

            if (this.calculation?.calculationTestingScope?.zug_gt_40) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.zug_gt_40} Warm tensile test at > 40 °C`;
            }

            if (this.calculation?.calculationTestingScope?.zug_300) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.zug_300} Warm tensile test at 300 °C`;
            }

            if (this.calculation?.calculationTestingScope?.kbz) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz} impact specimen at RT`;
            }

            // if(this.calculation?.calculationTestingScope?.kbz_p_20) {
            //     text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz_p_20} impact specimen at 20°C`;
            // }

            if (this.calculation?.calculationTestingScope?.kbz_0) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz_0} impact specimen at 0°C`;
            }

            if (this.calculation?.calculationTestingScope?.kbz_m_20) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz_m_20} impact specimen at -20°C`;
            }

            if (this.calculation?.calculationTestingScope?.kbz_m_50) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz_m_50} impact specimen at -50°C`;
            }

            if (this.calculation?.calculationTestingScope?.kbz_m_60) {
                text += $localize`\n- ${this.calculation?.calculationTestingScope?.kbz_m_60} impact specimen at -60°C`;
            }

            if (this.calculation.calculationTestingScope?.attestation == Attestation.EN_10204_3_2) {
                text += $localize`\nAcceptance test certificate acc. to DIN 10204/3.1 via`;
            }

            if (this.calculation?.calculationDocumentation?.cleanliness_of_the_charge) {
                text += $localize`\n- Purity degree of the melt`;
            }

            if (this.calculation?.calculationDocumentation?.cleanliness_of_the_component) {
                text += $localize`\n- Determining the purity degree of the piece`;
            }

            if (this.calculation?.calculationDocumentation?.grainsize_of_the_charge) {
                text += $localize`\n- Grain size of the melt`;
            }

            if (this.calculation?.calculationDocumentation?.grainsize_of_the_component) {
                text += $localize`\n- Grain size determination from the piece`;
            }

            if (this.calculation?.calculationDocumentation?.product_analysis) {
                text += $localize`\n- Piece analysis`;
            }

            if (this.calculation?.calculationDocumentation?.deformation) {
                text += $localize`\n- Degree of forging`;
            }

            if (this.calculation?.calculationDocumentation?.heattreamtment) {
                text += $localize`\n- Heat treatment data`;
                if (this.calculation?.calculationDocumentation?.heattreamtment_with_diagram) {
                    text += $localize` with oven diagram`;
                }
            }

            if (this.calculation?.calculationDocumentation?.jominy) {
                text += $localize`\n- Jominy`;
            }

            if (this.calculation?.calculationMetallography?.needs_microsection_structure ||
                this.calculation?.calculationMetallography?.needs_microsection_grain_size ||
                this.calculation?.calculationMetallography?.needs_microsection_carburized ||
                this.calculation?.calculationMetallography?.needs_microsection_cleanliness ||
                this.calculation?.calculationMetallography?.microstructure_quota) {
                text += $localize`\n- Structural assessment`;
            }

            if (this.calculation?.calculationMetallography?.needs_ic_according_to) {
                text += $localize`\n- Corrosion test acc. to ${NeedsAccordingToIcClass.getStateTranslate(
                    this.calculation?.calculationMetallography?.needs_ic_according_to
                )}`;
            }

            if (this.calculation?.calculationDocumentation?.hardness_testing_hbw) {
                text += $localize`\n- Brinell hardness test`;
                if (this.calculation?.calculationDocumentation?.conversion_acc_iso_18265_table_a_1) {
                    text += $localize` Conversion to ISO 18265 Table A.1`;
                }
                if (this.calculation?.calculationDocumentation?.conversion_acc_iso_18265_table_b_2) {
                    text += $localize` Conversion to ISO 18265 Table B.2`;
                }
            }

            if (this.calculation?.calculationDocumentation?.hardness_testing_hbw_per_piece) {
                text += $localize`\n- Brinell hardness test /piece`;
                if (this.calculation?.calculationDocumentation?.conversion_acc_iso_18265_table_a_1) {
                    text += $localize` Conversion to ISO 18265 Table A.1`;
                }
                if (this.calculation?.calculationDocumentation?.conversion_acc_iso_18265_table_b_2) {
                    text += $localize` Conversion to. ISO 18265 Table B.2`;
                }
            }

            if (this.calculation?.calculationNonDestructiveTesting?.usNorm) {
                text += $localize`\n- UT-testing per piece`;
                if (this.calculation?.calculationNonDestructiveTesting?.usNorm?.custom_id) {
                    text += ` ${this.calculation?.calculationNonDestructiveTesting?.usNorm?.custom_id}`;
                }

                if (this.calculation?.calculationNonDestructiveTesting.non_destructive_testing == NonDestructiveTesting.THREE_TWO) {
                    text += $localize` (3.2-cert. by "${this.calculation?.calculationNonDestructiveTesting.attestationEntities.reduce(
                        (acc, current) => `${acc},  ${current}`,
                        ""
                    )}")`;
                }
            }

            if (this.calculation?.calculationNonDestructiveTesting?.mtNorm) {
                text += $localize`\n- Crack testing per piece`;
                if (this.calculation?.calculationNonDestructiveTesting?.mtNorm?.custom_id) {
                    text += ` ${this.calculation?.calculationNonDestructiveTesting?.mtNorm?.custom_id}`;
                }
            }

            if (this.calculation?.calculationDocumentation?.pmi) {
                text += $localize`\n- PMI`;
            }

            if (this.calculation?.calculationDocumentation?.visual_inspection) {
                text += $localize`\n- Visual control`;
            }

            if (this.calculation?.calculationDocumentation?.dimension_control) {
                text += $localize`\n- Dimensional control`;
            }

            if (this.calculation?.calculationDocumentation?.dimension_protocol) {
                text += $localize`\n- Measurement protocol`;
            }

            if (this.calculation?.calculationDocumentation?.concentricity_check) {
                text += $localize`\n- Concentricity control`;
            }

            if (this.calculation?.calculationDocumentation?.radioactivity_freedom_confirmation) {
                text += $localize`\n- Confirmation of freedom from radioactivity`;
            }

            if (this.calculation?.calculationDocumentation?.residual_magnetic_field_strength) {
                text += $localize`\n- Specification magnet. residual field strength`;
            }

            if (this.calculation?.calculationDocumentation?.confirmation_of_the_absence_of_flakes) {
                text += $localize`\n- Confirmation of freedom from flakes`;
            }

            if (this.calculation?.calculationDocumentation?.initial_inspection) {
                text += $localize`\n- Initial sample inspection`;
            }

            if (this.calculation?.calculationTestingScope?.test_blue_structure) {
                text += $localize`\n- Blue brittleness specimen`;
            }

            if (this.calculation?.calculationTestingScope?.test_baumann_imprint) {
                text += $localize`\n- Baumann test`;
            }

            if (this.calculation?.calculationTestingScope?.specimen_rest_material) {
                text += $localize`\n- Residual sample material is supplied`;
            }

            if (this.calculation?.calculationResidualMaterial) {
                text += $localize`\n- Sample material is supplied`;
                if (this.calculation?.calculationResidualMaterial?.specification) {
                    text += $localize` to ${this.calculation?.calculationResidualMaterial?.specification}`;
                }
                if (this.calculation?.calculationResidualMaterial?.frequency) {
                    text += `\n ${FrequencyClass.getStateTranslate(this.calculation?.calculationResidualMaterial?.frequency)}`;
                }
                if (this.calculation?.calculationResidualMaterial?.quantity_sample_geometries) {
                    text += ` ${this.calculation?.calculationResidualMaterial?.quantity_sample_geometries}`;
                }
                if (this.calculation?.calculationResidualMaterial?.free_text) {
                    text += ` ${this.calculation?.calculationResidualMaterial?.free_text}`;
                }
            }
        }

        return text;
    }

    getTextSummarySpecification() {
        let text = ``;

        if (this.calculation?.specification?.id) {
            text += $localize`Production according to spec. ${this.calculation?.specification?.name}\n\n`;
        }
        if (this.calculation?.calculationDocumentation?.offer_note) {
            text += `${this.calculation?.calculationDocumentation?.offer_note}\n\n`
        }
        if (this.calculation?.calculationMetallography?.offer_note) {
            text += `${this.calculation?.calculationMetallography?.offer_note}\n\n`
        }
        if (this.calculation?.calculationTestingScope?.offer_note) {
            text += `${this.calculation?.calculationTestingScope?.offer_note}\n\n`
        }
        if (this.calculation?.calculationNonDestructiveTesting?.offer_note) {
            text += `${this.calculation?.calculationNonDestructiveTesting?.offer_note}\n\n`
        }
        if (this.calculation?.calculationResidualMaterial?.offer_note) {
            text += `${this.calculation?.calculationResidualMaterial?.offer_note}\n\n`
        }

        return text;
    }


    generateText() {
        let text = '';

        //Line 1
        if (this.item_name) text += `${this.item_name} `;
        if (this.drawing_id && this.drawing_id.length) {
            text += $localize`acc. drawing ${this.drawing_id}\n`;
        } else {
            text += `\n`;
        }

        //Line 2
        text += this.getFinalDimensionText() + `\n\n`;

        //Line 3
        if (this.delivery_state == DeliveryState.FM2) text += this.getRawDimensionText() + `\n`;

        return text;
    }

    generateText2() {
        let text = this.calculation?.specification_note;

        text += OfferPosRejectionTypeClass.getTypeLongText(this.rejection_type);

        return text;
    }

    generateText3() {
        if (this.rejection_type)
            return '';

        let text = '';

        //Line 4
        text += this.getTextSteelGrade() + `\n`;

        //Line 5
        text += this.getTextForgedOrRolled();

        //Line 6
        text += this.getHeatTreatmentText() + `\n`;

        //Line 7
        text += this.getDeliveryStateText() + `\n`;


        if (this.calculation?.note_machining) {
            //Paragraph
            text += `\n`;

            //Section 2 - Line 1
            text += this.calculation?.note_machining + `\n`;
        }

        return text;
    }

    generateText4() {
        if (this.rejection_type)
            return '';

        let text = '';

        //Section 3 - Line 1
        text += this.getTextSummarySpecification();

        //Paragraph
        text += `\n`;

        //Section 3 - Line 3/4
        text += this.getTextCertification();

        return text;
    }
}
