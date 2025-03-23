import {Deserializable} from "@app/interfaces/deserializable";
import {ODatable} from "@app/interfaces/odatable";
import {RawDimensionType} from "./raw-dimension-type";
import {OfferPosDimensionShaftUpsetPart} from "./offer-pos-dimension-shaft-upset-part";
import {OfferPos} from "./offer-pos";
import {
    DiskAllowance,
    DiskDiameterDataset,
    DiskDiameterToleranece,
    DiskHeightDataset,
    DiskHeightToleranece
} from "@app/modules/hwe-kalk/allowance-definitions/disk-allowance";
import {RingAllowance} from "@app/modules/hwe-kalk/allowance-definitions/ring-allowance";
import {ShaftAllowance} from "@app/modules/hwe-kalk/allowance-definitions/shaft-allowance";
import {RectangleAllowance} from "@app/modules/hwe-kalk/allowance-definitions/rectangle-allowance";
import {BarAllowance} from "@app/modules/hwe-kalk/allowance-definitions/bar-allowance";
import {OfferPosDimensionUpsetPartForgedBeam} from "./offer-pos-dimension-upset-part-forged-beam";
import {OfferPosProductType} from "@app/modules/hwe-kalk/enums/OfferPosProductType";
import { Machine } from "@app/models/machine";

export class OfferPosRawDimension implements ODatable, Deserializable {
    id?: number;
    offer_pos_id?: number;
    offerPos?: OfferPos;
    outer_diameter?: number;
    side_a?: number;
    inner_diameter?: number;
    height?: number;
    length?: number;
    side_b?: number;
    outer_diameter_disk_punched?: number;
    inner_diameter_pre_1?: number;
    height_pre_1?: number;
    inner_diameter_pre_2?: number;
    height_pre_2?: number;
    gross_weight?: number;
    operating_weight?: number;
    semi_finished_product?: number;
    semi_finished_product_type: string = '';
    deformation?: number;
    rawDimensionTypes: RawDimensionType[] = []
    offerPosDimensionShaftUpsetParts: OfferPosDimensionShaftUpsetPart[] = []
    offerPosDimensionUpsetPartForgedBeams: OfferPosDimensionUpsetPartForgedBeam[] = []
    quantity_raw_piece?: number;
    quantity_final_for_raw?: number;
    d_min?: number;
    d_max?: number;
    a_min?: number;
    a_max?: number;
    w_min?: number;
    w_max?: number;
    d_length_min?: number;
    d_length_max?: number;
    a_length_min?: number;
    a_length_max?: number;
    w_length_min?: number;
    w_length_max?: number;
    section?: number;
    is_rolled: boolean = false;
    forged_beam_section?: number;
    rolling_pin?: number;
    outer_diameter_pre_1?: number;
    outer_diameter_pre_2?: number;
    inner_diameter_hollow?: number;
    stretching_pin_value?: number;
    rolling_pin_value?: number;
    radial_width_pre_1?: number;
    height_to_radial_width_pre_1?: number;
    radial_width?: number;
    radial_width_pre_2?: number;
    slug_dm?: number;
    slug_weight?: number;
    slug_height?: number;
    machine_id?: number;
    machine_id_2?: number;
    machine_id_3?: number;
    machine_id_4?:number;
    round_min_dma?: number;
    round_min_dmb?: number;
    round_max_dma?: number;
    round_max_dmb?: number;
    square_min_dma?: number;
    square_min_dmb?: number;
    square_max_dma?: number;
    square_max_dmb?: number;
    octagon_min_swa?: number;
    octagon_min_swb?: number;
    octagon_max_swa?: number;
    octagon_max_swb?: number;
    material_forging_degree_total?: number;
    rolling_path?: number;
    axial_difference?: number;
    radial_width_per_100_mm?: number;
    height_to_radial_width?: number;
    rolling_path_rollweg?: number;
    shape?: string;
    messages?: string;
    calculation_outer_diameter?: number;
    calculation_inner_diameter?: number;
    calculation_height?: number;
    calculation_inner_diameter_pre_1?: number;
    calculation_height_pre_1?: number;
    calculation_inner_diameter_pre_2?: number;
    calculation_height_pre_2?: number;
    calculation_outer_diameter_pre_1?: number;
    calculation_outer_diameter_pre_2?: number;
    single_length : string = "";
    insert : string = "";
    pre_punching_1 ? : number;
    pre_punching_2 ? : number;
    pre_punching_3 ? : number;
    rolling_pin_1 ? : number;
    rolling_pin_2 ? : number;
    rolling_length ? : number;
    rollback : string = "";
    excess_total_length ? : number;
    stretching_path ? : number;
    rollweg ? : number;
    outer_end : string = "";
    outer_diameter_pre_1_warm ? : number;
    outer_diameter_pre_2_warm ? : number;
    inner_diameter_pre_1_warm ? : number;
    inner_diameter_pre_2_warm ? : number;
    height_pre_1_warm ? : number;
    height_pre_2_warm ? : number;
    forged_beam_value_1?:number;
    forged_beam_value_2?:number;
    forged_beam_value_3?:number;
    forged_beam_value_4?:number;
    forged_beam_value_5?:number;
    forged_beam_value_6?:number;
    forged_beam_value_7?:number;
    forged_beam_value_8?:number;
    forged_beam_text_1?:string ='';
    forged_beam_text_2?:string ='';

    constructor() {
    }

    deserialize(input: any) {
        Object.assign(this, input);
        if (input.rawDimensionTypes) {
            this.rawDimensionTypes = [];
            input.rawDimensionTypes.forEach((data: RawDimensionType) => {
                this.rawDimensionTypes.push(new RawDimensionType().deserialize(data))
            });
        }

        if (input.offerPosDimensionShaftUpsetParts) {
            this.offerPosDimensionShaftUpsetParts = [];
            input.offerPosDimensionShaftUpsetParts.forEach((data: OfferPosDimensionShaftUpsetPart) => {
                this.offerPosDimensionShaftUpsetParts.push(new OfferPosDimensionShaftUpsetPart().deserialize(data))
            });
        }
        if (input.offerPosDimensionUpsetPartForgedBeams) {
            this.offerPosDimensionUpsetPartForgedBeams = [];
            input.offerPosDimensionUpsetPartForgedBeams.forEach((data: OfferPosDimensionUpsetPartForgedBeam) => {
                this.offerPosDimensionUpsetPartForgedBeams.push(new OfferPosDimensionUpsetPartForgedBeam().deserialize(data))
            });
        }


        return this;
    }

    toOdata(isUpdate = false): Object {
        return {
            ...this,
            rawDimensionTypes: isUpdate ? undefined : this.rawDimensionTypes,
            offerPosDimensionShaftUpsetParts: isUpdate ? undefined : this.offerPosDimensionShaftUpsetParts,
            offerPosDimensionUpsetPartForgedBeams: isUpdate ? undefined : this.offerPosDimensionUpsetPartForgedBeams,
            offerPos: undefined,
            d_min: undefined,
            d_max: undefined,
            a_min: undefined,
            a_max: undefined,
            w_min: undefined,
            w_max: undefined,
            d_length_min: undefined,
            d_length_max: undefined,
            a_length_min: undefined,
            a_length_max: undefined,
            w_length_min: undefined,
            w_length_max: undefined,
            section: undefined,
            forged_beam_section: undefined,
            calculation_outer_diameter: undefined,
            calculation_inner_diameter: undefined,
            calculation_height: undefined,
            calculation_inner_diameter_pre_1: undefined,
            calculation_height_pre_1: undefined,
            calculation_inner_diameter_pre_2: undefined,
            calculation_height_pre_2: undefined,
            calculation_outer_diameter_pre_1: undefined,
            calculation_outer_diameter_pre_2: undefined,
        };
    }


    getSampleMaterialWeight() {
        switch (this.offerPos?.product_type) {
            case OfferPosProductType.DISK:
            case OfferPosProductType.DISK_PUNCHED:
            case OfferPosProductType.RING_CYLINDER:
            case OfferPosProductType.RING_ROLLED:
                return ((((this.outer_diameter ?? 0)/2)**2)*Math.PI - (((this.inner_diameter ?? 0)/2)**2)*Math.PI) * (this.rawDimensionTypes?.find(value => value.type === 'height')?.sample_allowance ?? 0) * (this.offerPos.material?.density ?? 0) / 1_000_000;
            case OfferPosProductType.PIPE:
            case OfferPosProductType.BAR_ROUND:
            case OfferPosProductType.SOCKET:
                return ((((this.outer_diameter ?? 0)/2)**2)*Math.PI - (((this.inner_diameter ?? 0)/2)**2)*Math.PI) * (this.rawDimensionTypes?.find(value => value.type === 'length')?.sample_allowance ?? 0) * (this.offerPos.material?.density ?? 0) / 1_000_000;
            case OfferPosProductType.BAR_SQUARE:
                const sideAWithSample = (this.side_a ?? 0) + (this.rawDimensionTypes?.find(value => value.type === 'side_a')?.sample_allowance ?? 0);
                const sideBWithSample = (this.side_b ?? 0) + (this.rawDimensionTypes?.find(value => value.type === 'side_b')?.sample_allowance ?? 0);
                const lengthWithSample = (this.length ?? 0) + (this.rawDimensionTypes?.find(value => value.type === 'length')?.sample_allowance ?? 0);

                return ((sideAWithSample * sideBWithSample * lengthWithSample) - ((this.side_a ?? 0) * (this.side_b ?? 0) * (this.length ?? 0))) * (this.offerPos.material?.density ?? 0) / 1_000_000;
            case OfferPosProductType.SHAFT:
            case OfferPosProductType.SHAFT_HOLLOW:
            case OfferPosProductType.UPSET_PART:
                return this.offerPosDimensionShaftUpsetParts.reduce((accumulator, item: OfferPosDimensionShaftUpsetPart) => {
                        if(!item.is_sample) {
                            return accumulator;
                        }
                        else {
                            if (item.side)
                                return accumulator + ((item.outer_diameter_start ?? 0) * (item.side ?? 0) * (item.length ?? 0));
                            else
                                return accumulator + (((((item.outer_diameter_start ?? 0)/2)**2) * Math.PI - (((this.inner_diameter_hollow ?? 0)/2)**2) * Math.PI)* (item.length ?? 0))
                        }
                    },
                    0
                ) * (this.offerPos.material?.density ?? 0) / 1_000_000;

            case OfferPosProductType.BAR_ROLLED:
                //No sample calculated for Stab gewalzt
                return 0;

        }

        return 0;
    }

    calculationOfSemiFinishedProductType() {
        let numerator, denominator, excludingCubicRootMin, excludingSquareRootMax, productHeight;

        const { product_type } = this.offerPos! || {};
        const { density, material_group_type } = this.offerPos?.material! || {};

        let bucklingFactor = 1;

        switch (material_group_type) {
            case "TYPE_1":
                bucklingFactor = 2.9;
                break;
            case "TYPE_2":
                bucklingFactor = 2.8;
                break;
            case "TYPE_3":
                bucklingFactor = 2.7;
                break;
            case "TYPE_4":
                bucklingFactor = 2.6;
                break;
            case "TYPE_5":
                bucklingFactor = 2.5;
                break;
        }

        switch (product_type) {
            case 'DISK':
            case 'DISK_PUNCHED':
            case 'RING_CYLINDER':
            case 'RING_ROLLED':
                productHeight = this.height;
                break;
            case 'PIPE':
            case 'BAR_ROUND':
            case 'BAR_SQUARE':
            case 'SOCKET':
                productHeight = this.length;
                break;
            default:
                return;
        }

        // Calculation for Semi Finished Product Type: ROUND
        numerator = this.operating_weight! * 4 * (10 ** 6);
        denominator = density * Math.PI * bucklingFactor;
        excludingCubicRootMin = numerator / denominator;

        this.d_min = (!isNaN(excludingCubicRootMin) ? this.getMinRoundValue(Math.cbrt(excludingCubicRootMin)) : undefined) || undefined;
        this.d_length_min = (this.d_min ? Math.round(numerator / (density * Math.PI * (this.d_min ** 2))) : undefined) || undefined;
        this.d_min =  this.d_min === Infinity ? undefined : this.d_min;

        excludingSquareRootMax = numerator / (density * Math.PI * ((productHeight ?? NaN) + 35));

        this.d_max = (!isNaN(excludingSquareRootMax) ? this.getMinRoundValue(Math.sqrt(excludingSquareRootMax)) : undefined) || undefined;
        this.d_length_max = (this.d_max ? Math.round(numerator / (density * Math.PI * (this.d_max ** 2))) : undefined) || undefined;
        this.d_max =  this.d_max === Infinity ? undefined : this.d_max;
        // Calculation for Semi Finished Product Type: SQUARE
        numerator = this.operating_weight! * (10 ** 6);
        denominator = density * bucklingFactor;
        excludingCubicRootMin = numerator / denominator;

        this.a_min = (!isNaN(excludingCubicRootMin) ? this.getMinRoundValue(Math.cbrt(excludingCubicRootMin)) : undefined) || undefined;
        this.a_length_min = (this.a_min ? Math.round(numerator / (density * (this.a_min ** 2))) : undefined) || undefined;
        this.a_min =  this.a_min === Infinity ? undefined : this.a_min;
        excludingSquareRootMax = numerator / (density * ((productHeight ?? NaN) + 35));

        this.a_max = (!isNaN(excludingSquareRootMax) ? this.getMinRoundValue(Math.sqrt(excludingSquareRootMax)) : undefined) || undefined;
        this.a_length_max = (this.a_max ? Math.round(numerator / (density * (this.a_max ** 2))) : undefined) || undefined;
        this.a_max =  this.a_max === Infinity ? undefined : this.a_max;
        // Calculation for Semi Finished Product Type: OCTAGON
        denominator = density * 2 * Math.tan(22.5) * bucklingFactor;
        excludingCubicRootMin = numerator / denominator;

        this.w_min = (!isNaN(excludingCubicRootMin) ? this.getMinRoundValue(Math.cbrt(excludingCubicRootMin)) : undefined) || undefined;
        this.w_length_min = (this.w_min ? Math.round(numerator / (density * 2 * Math.tan(22.5) * (this.w_min ** 2))) : undefined) || undefined;
        this.w_min =  this.w_min === Infinity ? undefined : this.w_min;
        excludingSquareRootMax = numerator / (density * 2 * Math.tan(22.5) * ((productHeight ?? NaN) + 35));

        this.w_max = (!isNaN(excludingSquareRootMax) ? this.getMinRoundValue(Math.sqrt(excludingSquareRootMax)) : undefined) || undefined;
        this.w_length_max = (this.w_max ? Math.round(numerator / (density * 2 * Math.tan(22.5) * (this.w_max ** 2))) : undefined) || undefined;
        this.w_max =  this.w_max === Infinity ? undefined : this.w_max;
    }

    allowanceCalculation() {
        const {
            product_type,
            height_final,
            length_final,
            outer_diameter_final,
            side_a_final,
            side_b_final,
            total_length,
            max_outer_diameter
        } = this.offerPos! || {};

        switch (product_type) {
            case 'DISK':
            case 'DISK_PUNCHED':
                if (outer_diameter_final && height_final) {
                    let diskDiameterAllowance = new DiskAllowance(DiskDiameterDataset);
                    let diskHeightAllowance = new DiskAllowance(DiskHeightDataset);

                    const outerDiameterAllowance = diskDiameterAllowance.findValue(outer_diameter_final, height_final);
                    const heightAllowance = diskHeightAllowance.findValue(outer_diameter_final, height_final);

                    this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                        switch (rawDimensionType.type) {
                            case 'outer_diameter':
                                rawDimensionType.encore_info = outerDiameterAllowance ? outerDiameterAllowance : undefined;
                                break;
                            case 'inner_diameter':
                                rawDimensionType.encore_info = outerDiameterAllowance ? outerDiameterAllowance * 1.5 : undefined;
                                break;
                            case 'height':
                                rawDimensionType.encore_info = heightAllowance ? heightAllowance : undefined;
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            case 'SHAFT':
            case 'UPSET_PART':
                if (max_outer_diameter && total_length) {
                    let shaftBarAllowance = new ShaftAllowance().findValue(total_length, max_outer_diameter);

                    if (shaftBarAllowance) {
                        this.offerPos!.outer_diameter_encore_info = shaftBarAllowance?.diameter || undefined;
                        this.offerPos!.length_encore_info = shaftBarAllowance?.length || undefined;
                    }
                }
                break;
            case 'BAR_ROUND':
                if (outer_diameter_final && length_final) {
                    let barAllowance = new BarAllowance().findValue(length_final, outer_diameter_final);

                    if (barAllowance) {
                        this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                            switch (rawDimensionType.type) {
                                case 'outer_diameter':
                                    rawDimensionType.encore_info = barAllowance?.roundAllowance;
                                    break;
                                case 'length':
                                    rawDimensionType.encore_info = barAllowance?.length;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                break;
            case 'BAR_SQUARE':
                if (side_a_final && side_b_final && length_final) {
                    let maxSideValue = Math.max(side_a_final, side_b_final);
                    let rectangleAllowance = new RectangleAllowance().findValue(length_final, maxSideValue);

                    if (rectangleAllowance) {
                        this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                            switch (rawDimensionType.type) {
                                case 'side_a':
                                    rawDimensionType.encore_info = rectangleAllowance?.crossSection ? rectangleAllowance?.crossSection : undefined;
                                    break;
                                case 'side_b':
                                    rawDimensionType.encore_info = rectangleAllowance?.crossSection ? rectangleAllowance?.crossSection : undefined;
                                    break;
                                case 'length':
                                    rawDimensionType.encore_info = rectangleAllowance?.length ? rectangleAllowance?.length : undefined;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                break;
            case 'RING_CYLINDER':
                if (outer_diameter_final) {
                    let ringAllowance = new RingAllowance().findValue(outer_diameter_final);
                    this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                        switch (rawDimensionType.type) {
                            case 'outer_diameter':
                                rawDimensionType.encore_info = ringAllowance?.da ?? undefined;
                                break;
                            case 'inner_diameter':
                                rawDimensionType.encore_info = ringAllowance?.di ?? undefined;
                                break;
                            case 'height':
                                rawDimensionType.encore_info = ringAllowance?.h ?? undefined;
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            case 'RING_ROLLED':
                if (outer_diameter_final && height_final) {
                    let diskDiameterAllowance = new DiskAllowance(DiskDiameterDataset);
                    let diskHeightAllowance = new DiskAllowance(DiskHeightDataset);

                    const outerDiameterAllowance = diskDiameterAllowance.findValue(outer_diameter_final, height_final);
                    const heightAllowance = diskHeightAllowance.findValue(outer_diameter_final, height_final);

                    this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                        switch (rawDimensionType.type) {
                            case 'outer_diameter':
                                rawDimensionType.encore_info = outerDiameterAllowance ? outerDiameterAllowance : undefined;
                                break;
                            case 'inner_diameter':
                                rawDimensionType.encore_info = outerDiameterAllowance ? outerDiameterAllowance : undefined;
                                break;
                            case 'height':
                                rawDimensionType.encore_info = heightAllowance ? heightAllowance : undefined;
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            default:
                break;
        }
    }

    toleranceCalculation() {
        const {
            product_type,
            height_final,
            length_final,
            outer_diameter_final,
            side_a_final,
            side_b_final,
            max_outer_diameter,
            total_length
        } = this.offerPos! || {};

        switch (product_type) {
            case 'DISK':
            case 'DISK_PUNCHED':
            case 'RING_ROLLED':
                if (outer_diameter_final && height_final) {
                    let diskDiameterTolerance = new DiskAllowance(DiskDiameterToleranece);
                    let diskHeightTolerance = new DiskAllowance(DiskHeightToleranece);

                    const outerDiameterTolerance = diskDiameterTolerance.findValue(outer_diameter_final, height_final);
                    const heightTolerance = diskHeightTolerance.findValue(outer_diameter_final, height_final);

                    this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                        switch (rawDimensionType.type) {
                            case 'outer_diameter':
                                rawDimensionType.lower_tolerance = outerDiameterTolerance ? outerDiameterTolerance * -1 : undefined;
                                rawDimensionType.upper_tolerance = outerDiameterTolerance ? outerDiameterTolerance : undefined;
                                break;
                            case 'inner_diameter':
                                rawDimensionType.lower_tolerance = outerDiameterTolerance ? outerDiameterTolerance * -1 : undefined;
                                rawDimensionType.upper_tolerance = outerDiameterTolerance ? outerDiameterTolerance : undefined;
                                break;
                            case 'height':
                                rawDimensionType.lower_tolerance = heightTolerance ? heightTolerance * -1 : undefined;
                                rawDimensionType.upper_tolerance = heightTolerance ? heightTolerance : undefined;
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            case 'BAR_ROUND':
                if (outer_diameter_final && length_final) {
                    let barAllowance = new BarAllowance().findValue(length_final, outer_diameter_final);

                    if (barAllowance) {
                        this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                            switch (rawDimensionType.type) {
                                case 'outer_diameter':
                                    rawDimensionType.lower_tolerance = barAllowance?.roundTolerance ? barAllowance?.roundTolerance * -1 : undefined;
                                    rawDimensionType.upper_tolerance = barAllowance?.roundTolerance;
                                    break;
                                case 'length':
                                    rawDimensionType.lower_tolerance = barAllowance?.lengthTolerance ? barAllowance?.lengthTolerance * -1 : undefined;
                                    rawDimensionType.upper_tolerance = barAllowance?.lengthTolerance;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                break;
            case 'BAR_SQUARE':
                if (side_a_final && side_b_final && length_final) {
                    let maxSideValue = Math.max(side_a_final, side_b_final);
                    let barAllowance = new BarAllowance().findValue(length_final, maxSideValue);

                    if (barAllowance) {
                        this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                            switch (rawDimensionType.type) {
                                case 'side_a':
                                    rawDimensionType.lower_tolerance = barAllowance?.roundTolerance ? barAllowance?.roundTolerance * -1 : undefined;
                                    rawDimensionType.upper_tolerance = barAllowance?.roundTolerance;
                                    break;
                                case 'side_b':
                                    rawDimensionType.lower_tolerance = barAllowance?.roundTolerance ? barAllowance?.roundTolerance * -1 : undefined;
                                    rawDimensionType.upper_tolerance = barAllowance?.roundTolerance;
                                    break;
                                case 'length':
                                    rawDimensionType.lower_tolerance = barAllowance?.lengthTolerance ? barAllowance?.lengthTolerance * -1 : undefined;
                                    rawDimensionType.upper_tolerance = barAllowance?.lengthTolerance;
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                break;
            case 'RING_CYLINDER':
                if (outer_diameter_final) {
                    let ringAllowance = new RingAllowance().findValue(outer_diameter_final);
                    this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                        switch (rawDimensionType.type) {
                            case 'outer_diameter':
                                rawDimensionType.lower_tolerance = ringAllowance?.da ? Math.round(ringAllowance?.da * 0.3) * -1 : undefined;
                                rawDimensionType.upper_tolerance = ringAllowance?.da ? Math.round(ringAllowance?.da * 0.4) : undefined;
                                break;
                            case 'inner_diameter':
                                rawDimensionType.lower_tolerance = ringAllowance?.di ? Math.round(ringAllowance?.di * 0.3) * -1 : undefined;
                                rawDimensionType.upper_tolerance = ringAllowance?.di ? Math.round(ringAllowance?.di * 0.4) : undefined;
                                break;
                            case 'height':
                                rawDimensionType.lower_tolerance = ringAllowance?.h ? Math.round(ringAllowance?.h * 0.3) * -1 : undefined;
                                rawDimensionType.upper_tolerance = ringAllowance?.h ? Math.round(ringAllowance?.h * 0.4) : undefined;
                                break;
                            default:
                                break;
                        }
                    });
                }
                break;
            case 'SHAFT':
            case 'UPSET_PART':
                if (max_outer_diameter && total_length) {
                    let shaftBarAllowance = new ShaftAllowance().findValue(total_length, max_outer_diameter);

                    if (shaftBarAllowance) {
                        this.offerPos!.outer_diameter_lower_tolerance =  -1 * shaftBarAllowance?.diameterTolerance || undefined;
                        this.offerPos!.outer_diameter_upper_tolerance = shaftBarAllowance?.diameterTolerance || undefined;
                        this.offerPos!.length_lower_tolerance = -1 * (shaftBarAllowance?.lengthTolerance) || undefined;
                        this.offerPos!.length_upper_tolerance = shaftBarAllowance?.lengthTolerance || undefined;
                    }
                }
                break;
            default:
                break;
        }
    }

    grossWeightCalculation() {
        const { product_type } = this.offerPos! || {};
        const { density } = this.offerPos?.material! || {};

        switch (product_type) {
            case 'DISK':
                this.gross_weight = this.outer_diameter && this.height && density
                    ? Math.PI * this.height * ((this.outer_diameter / 2) ** 2) * density
                    : undefined;
                break;
            case 'BAR_ROUND':
                this.gross_weight = this.outer_diameter && this.length && density
                    ? Math.PI * this.length * ((this.outer_diameter / 2) ** 2) * density
                    : undefined;
                break;
            case 'DISK_PUNCHED':
            case 'RING_CYLINDER':
            case 'RING_ROLLED':
                this.gross_weight = this.outer_diameter && this.inner_diameter && this.height && density
                    ? Math.PI * this.height * (((this.outer_diameter / 2) ** 2) - ((this.inner_diameter / 2) ** 2)) * density
                    : undefined;
                break;
            case 'SOCKET':
            case 'PIPE':
                this.gross_weight = this.outer_diameter && this.inner_diameter && this.length && density
                    ? Math.PI * this.length * (((this.outer_diameter / 2) ** 2) - ((this.inner_diameter / 2) ** 2)) * density
                    : undefined;
                break;
            case 'BAR_SQUARE':
                this.gross_weight = this.side_a && this.side_b && this.length && density
                    ? this.side_a * this.side_b * this.length * density
                    : undefined;
                break;
            case 'SHAFT':
                let totalShaftGrossWeight = 0;
                this.offerPosDimensionShaftUpsetParts.map((item: OfferPosDimensionShaftUpsetPart) => {
                    if (item.outer_diameter_start && item.length) {
                        totalShaftGrossWeight += ((item.outer_diameter_start/2) ** 2 + (item.outer_diameter_start/2) ) * item.length * Math.PI / 3
                    }
                });
                this.gross_weight = (totalShaftGrossWeight && density) ? totalShaftGrossWeight * density : undefined;
                break;
            case 'UPSET_PART':
                let totalUusetPartGrossWeight = 0;
                this.offerPosDimensionShaftUpsetParts.map((item: OfferPosDimensionShaftUpsetPart) => {
                    if (item.outer_diameter_start && item.length && item.outer_diameter_end) {
                        totalUusetPartGrossWeight += ((item.outer_diameter_start/2) ** 2 + ((item.outer_diameter_start/2) * (item.outer_diameter_end/2)) + (item.outer_diameter_end/2) ** 2) * item.length * Math.PI / 3
                    }
                });
                this.gross_weight = (totalUusetPartGrossWeight && density) ? totalUusetPartGrossWeight * density : undefined;
                break;
            default:
                break;
        }
        this.gross_weight = this.gross_weight ? this.gross_weight / 10**6 : undefined
    }

    rawMeasurementCalculation() {
        const {
            product_type,
            outer_diameter_final,
            inner_diameter_final,
            height_final,
            length_final,
            side_a_final,
            side_b_final,
            min_allowance_outer_diameter_final,
            max_allowance_outer_diameter_final,
            min_allowance_side_a_final,
            max_allowance_side_a_final,
            min_allowance_side_b_final,
            max_allowance_side_b_final,
            min_allowance_inner_diameter_final,
            max_allowance_inner_diameter_final,
            min_allowance_height_final,
            max_allowance_height_final,
            min_allowance_length_final,
            max_allowance_length_final,
        } = this.offerPos! || {};

        this.outer_diameter = outer_diameter_final;
        this.inner_diameter = inner_diameter_final;
        this.height = height_final;
        this.length = length_final;
        this.side_a = side_a_final;
        this.side_b = side_b_final;

        switch (product_type) {
            case 'DISK':
            case 'DISK_PUNCHED':
            case 'RING_CYLINDER':
            case 'RING_ROLLED':
            case 'SOCKET':
            case 'PIPE':
                this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                    let sumOfEachRMType = (rawDimensionType.encore_info ?? 0) + (rawDimensionType.additional_dimensions ?? 0) + (rawDimensionType.sample_allowance ?? 0);
                    switch (rawDimensionType.type) {
                        case 'outer_diameter':
                            sumOfEachRMType += (min_allowance_outer_diameter_final ?? 0) + (max_allowance_outer_diameter_final ?? 0);
                            if (this.outer_diameter) this.outer_diameter += sumOfEachRMType;
                            break;
                        case 'inner_diameter':
                            sumOfEachRMType += (min_allowance_inner_diameter_final ?? 0) + (max_allowance_inner_diameter_final ?? 0);
                            if (this.inner_diameter) this.inner_diameter -= sumOfEachRMType;
                            break;
                        case 'height':
                            sumOfEachRMType += (min_allowance_height_final ?? 0) + (max_allowance_height_final ?? 0);
                            if (this.height) this.height += sumOfEachRMType;
                            break;
                        case 'length':
                            sumOfEachRMType += (min_allowance_length_final ?? 0) + (max_allowance_length_final ?? 0);
                            if (this.length) this.length += sumOfEachRMType;
                            break;
                        default:
                            break;
                    }
                });
                this.grossWeightCalculation();
                break;
            case 'BAR_ROUND':
                this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                    let sumOfEachRMType = (rawDimensionType.encore_info ?? 0) + (rawDimensionType.additional_dimensions ?? 0) + (rawDimensionType.sample_allowance ?? 0);
                    switch (rawDimensionType.type) {
                        case 'outer_diameter':
                            sumOfEachRMType += (min_allowance_outer_diameter_final ?? 0) + (max_allowance_outer_diameter_final ?? 0);
                            if (this.outer_diameter) this.outer_diameter += sumOfEachRMType;
                            break;
                        case 'length':
                            sumOfEachRMType += (min_allowance_length_final ?? 0) + (max_allowance_length_final ?? 0);
                            if (this.length) this.length += sumOfEachRMType;
                            break;
                        default:
                            break;
                    }
                });
                if (this.outer_diameter && this.length) this.grossWeightCalculation();
                break;
            case 'BAR_SQUARE':
                this.rawDimensionTypes.map((rawDimensionType: RawDimensionType) => {
                    let sumOfEachRMType = (rawDimensionType.encore_info ?? 0) + (rawDimensionType.additional_dimensions ?? 0) + (rawDimensionType.sample_allowance ?? 0);
                    switch (rawDimensionType.type) {
                        case 'side_a':
                            sumOfEachRMType += (min_allowance_side_a_final ?? 0) + (max_allowance_side_a_final ?? 0);
                            if (this.side_a) this.side_a += sumOfEachRMType;
                            break;
                        case 'side_b':
                            sumOfEachRMType += (min_allowance_side_b_final ?? 0) + (max_allowance_side_b_final ?? 0);
                            if (this.side_b) this.side_b += sumOfEachRMType;
                            break;
                        case 'length':
                            sumOfEachRMType += (min_allowance_length_final ?? 0) + (max_allowance_length_final ?? 0);
                            if (this.length) this.length += sumOfEachRMType;
                            break;
                        default:
                            break;
                    }
                });
                if (this.side_a && this.side_b && this.length) this.grossWeightCalculation();
                break;
            default:
                break;
        }
    }

    getMinRoundValue(inputNumber:number){
        inputNumber = Math.ceil(inputNumber);
        const remainder = inputNumber%10;
        return remainder? inputNumber + 10 - remainder : inputNumber;
    }
}
