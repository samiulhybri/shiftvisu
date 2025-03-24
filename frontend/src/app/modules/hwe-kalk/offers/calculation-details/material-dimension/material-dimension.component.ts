import {Component, inject, Input, OnInit} from '@angular/core';
import { Item } from '@app/models/item';
import { OfferPos } from '@app/models/offer-pos';
import { OfferPosDimensionShaftUpsetPart } from '@app/models/offer-pos-dimension-shaft-upset-part';
import { OfferPosDimensionUpsetPartForgedBeam } from '@app/models/offer-pos-dimension-upset-part-forged-beam';
import { OfferPosRawDimension } from '@app/models/offer-pos-raw-dimension';
import { RawDimensionType } from '@app/models/raw-dimension-type';
import { Tool } from '@app/models/tool';
import { OfferPosDimensionSurfaceClass } from '@app/modules/hwe-kalk/enums/OfferPosDimensionSurface';
import { OfferPosProductType, OfferPosProductTypeClass } from '@app/modules/hwe-kalk/enums/OfferPosProductType';
import { RawSemiFinishedProductTypeClass } from '@app/modules/hwe-kalk/enums/RawSemiFinishedProductType';
import { RollingPinTypeClass } from '@app/modules/hwe-kalk/enums/RollingPin';
import { HweKalkService } from '@app/modules/hwe-kalk/hwe-kalk.service';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { Subscription, map } from 'rxjs';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";
import Attachment from "@shared/models/Attachment";
import { DOCUMENT } from "@angular/common";
import { Machine } from '@app/models/machine';
import { HweShrinkage } from '@app/modules/hwe-kalk/enums/HweShrinkage';
import { OfferPosMechanicalProcessTolerance, OfferPosMechanicalProcessToleranceClass } from '@app/modules/hwe-kalk/enums/OfferPosMechanicalProcessTolerance';
import { isNullOrEmptyString } from '@progress/kendo-angular-grid/utils';
@Component({
    selector: 'app-material-dimension',
    templateUrl: './material-dimension.component.html',
    styleUrls: ['./material-dimension.component.scss']
})
export class MaterialDimensionComponent implements OnInit {
    @Input() offerPos!: OfferPos
    @Input() hasValidationErrorShaftUpsetPart: boolean = false;
    @Input() submitted: boolean = false;
    @Input() isForm!: boolean;
    @Input() machines: Machine[] = [];
    public document = inject(DOCUMENT);
    public offerPosProductType = OfferPosProductType
    public dimensionSurfaceClass = OfferPosDimensionSurfaceClass;
    public items?: Item[] = [];
    public tools?: Tool[] = [];
    public attachmentFiles:any=[];
    attachmentLoader =false
    public cmbItems: any;
    public cmbTools: any;
    public cmbTools2: any;
    public cmbTools3: any;
    public authService  = inject(AuthService)
    public showItemModal: boolean = false
    public isAttachmentDialogOpen: boolean = false
    public rawdeletableId: any = []
    public isWindowLoaderEnabled: boolean = false;
    public ringCalculationDialogOpen: boolean = false;
    public hasCalculationPermission : boolean = this.authService.isPermissionValidate(PermissionEnum.HWEKALK_CALC_BUTTON_VIEW);
    public semiFinishedProducts!: Array<{ value: string, text: string }>;
    public rollingPins!: Array<{ value: string, text: string }>;
    public tolerances!: Array<{ value: string, text: string }>;
    public dimensionSurfaces!: Array<{ value: string, text: string }>;
    public sections: number = 1;
    public rawDimentionIndex?:number;
    public tool: any;
    public basisMaterialTuttonText: string = $localize`Without 0 Stock`;
    public onCalculationDimensionChange$!: Subscription;
    public shrinkageMultiplier : number = 1;
    public ringDimension : any;
    constructor(protected hweKalkService: HweKalkService,
        protected _commonService: CommonService,
        protected _notification: Notification,
    ) {
        this.rawdeletableId = this.hweKalkService.deleteRawDimensions;
        this.getEnumValueWithLang();
        this.tools = this.hweKalkService.tools;
        this.cmbTools = new ComboFilter(this.tools);
        this.cmbTools2 = new ComboFilter(this.tools);
        this.cmbTools3 = new ComboFilter(this.tools);
    }

    isShow(type: string) {
        return this.getTypeDimension()?.includes(type);
    }
    public columns: Array<{ field: string, name: string }> = [
        { field: 'custom_id', name: $localize`Material` },
        { field: 'hwe_cast_type', name: $localize`Casting` },
        { field: 'hwe_supplier_name', name: $localize`Supplier` },
        { field: 'hwe_block_type', name: $localize`Block type` },
        { field: 'hwe_block_geometry', name: $localize`Block geometry` },
        { field: 'stock', name: $localize`Stock` },
        { field: 'hwe_warehouse_material', name: $localize`Material` },
        { field: 'hwe_norm_name', name: $localize`Norm` },
        { field: 'hwe_period_month', name: $localize`Month` },
        { field: 'hwe_period_year', name: $localize`Year` },
        { field: 'price', name: $localize`price` },
    ]
    public settings: { title: string, width: string, height: string, showButton:boolean } = {
        title: $localize`Basismaterial Search`,
        width: '65%',
        height: '80vh',
        showButton:true
    }
    isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_DIMENSION_EDIT)
	}
    getEnumValueWithLang() {
        this.tolerances = OfferPosMechanicalProcessToleranceClass.getEnumArray();
        this.semiFinishedProducts = RawSemiFinishedProductTypeClass.getEnumArray();
        this.rollingPins = RollingPinTypeClass.getEnumArray();
        this.dimensionSurfaces = OfferPosDimensionSurfaceClass.getEnumArray();
    }
    /**
     * return product type related fields
     * @returns 
     */
    getTypeDimension(type?: string) {
        type = type ?? this.offerPos.product_type;
        return this.hweKalkService.materialDimensionTypes[type ?? '']
    }

    ngOnInit(): void {
        this.updateShrinkageMultiplier();
        if (!this.offerPos.offerPosRawDimensions?.length) this.addCombine()
        else {
            this.offerPos.offerPosRawDimensions.forEach((item: OfferPosRawDimension) => {
                item.offerPos = this.offerPos;
                item.offer_pos_id = this.offerPos?.id;
            });
        }

        this.onCalculationDimensionChange$ = this.hweKalkService.onCalculationDimensionChangeSubject.subscribe({
            next: () => {
                this.calcDimensions();
            }
        });

        this.showItemSearchModal(undefined, false);
    }

    updateShrinkageMultiplier() : void {
        switch (this.offerPos.material?.shrinkage) {
            case HweShrinkage.ONE_AND_HALF_PERCENT : 
                this.shrinkageMultiplier = 1 + 1.5/ 100
                break;
            case HweShrinkage.TWO_PERCENT : 
                this.shrinkageMultiplier = 1 + 2.0 / 100
                break;
            default: 
                this.shrinkageMultiplier = 1;
                break;
        }
    }

    calculateWarmValue(data: any, type : any) : number | null {
       if(!data || !data.outer_diameter) {
            return null
       }

       switch (type.type) {
            case 'outer_diameter':
                return data.outer_diameter ? data.outer_diameter * this.shrinkageMultiplier : null;
            case 'height':
                return data.height ? data.height * this.shrinkageMultiplier : null;
            case 'length':
                return data.length ? data.length * this.shrinkageMultiplier : null;   // Handle height with check
            default:
                return null;
        }
    }

    calculateAndAssignOperatingWeight (data : any) : number | null {
        if (!data.operating_weight || data.operating_weight == 0) {
            const operatingWeightForDisk = data.gross_weight ? data.gross_weight * 1.03 : 0;
            data.operating_weight = operatingWeightForDisk;
            return operatingWeightForDisk;
        }

        return data.operating_weight;
    }

    calculateRingCylinder(data : any) : number | null {
        if(!data || !data.outer_diameter) {
            return null
       }

       return (data.outer_diameter - data.inner_diameter)/2
    }

    calculateRingCylinderTypeWarm(data : any) : number | null {
        if(!data || !data.outer_diameter) {
            return null
       }

       const outerDiameterWarmType = data.rawDimensionTypes.find((dim:any) => dim.type == 'outer_diameter')
       const innerDiameterWarmType = data.rawDimensionTypes.find((dim:any) => dim.type == 'inner_diameter')

       if (!outerDiameterWarmType || !innerDiameterWarmType) {
            return null
       }

       const outerWarmValue = outerDiameterWarmType?.warm || 0;
       const innerWarmValue= innerDiameterWarmType?.warm || 0;
       
       const ringCylinder = (outerWarmValue - innerWarmValue)/2
       return ringCylinder
    }

    calculateRingCylinderDiameterPre1(data : any) : number | null {

        if(!data?.outer_diameter_pre_1 && !data?.inner_diameter_pre_1) return null
        
        const outerDiameterPre1 = data?.outer_diameter_pre_1 || 0
        const innerDiamaterPre1 = data?.inner_diameter_pre_1 || 0

        return (outerDiameterPre1 - innerDiamaterPre1)/2
    }

    calculateRingCylinderDiameterPre1Warm(data : any) : number | null {

        if(!data?.outer_diameter_pre_1_warm && !data?.inner_diameter_pre_1_warm) return null

        const outerDiameterPre1Warm = data?.outer_diameter_pre_1_warm || 0
        const innerDiamaterPre1Warm = data?.inner_diameter_pre_1_warm || 0

        return (outerDiameterPre1Warm - innerDiamaterPre1Warm)/2
    }

    calculateRingCylinderDiameterPre2(data : any) : number | null {

        if(!data?.outer_diameter_pre_2 && !data?.inner_diameter_pre_2) return null
        
        const outerDiameterPre2 = data?.outer_diameter_pre_2 || 0
        const innerDiamaterPre2 = data?.inner_diameter_pre_2 || 0

        return (outerDiameterPre2 - innerDiamaterPre2)/2
    }

    calculateRingCylinderDiameterPre2Warm(data : any) : number | null {

        if(!data?.outer_diameter_pre_2_warm && !data?.inner_diameter_pre_2_warm) return null

        const outerDiameterPre2Warm = data?.outer_diameter_pre_2_warm || 0
        const innerDiamaterPre2Warm = data?.inner_diameter_pre_2_warm || 0

        return (outerDiameterPre2Warm - innerDiamaterPre2Warm)/2
    }

    calculateHollowShaftTotalLength (data : any) :number | null {

        if(data.length == 0) return null

        const totalLength = data.reduce((sum: number, item: any) => {
            return sum + (item.length || 0); // Add item's length if it exists, otherwise add 0
        }, 0);

        return totalLength
    }

    calculateHollowShaftTotalWarmLength(data : any) :number | null {

        if(data.length == 0) return null

        const totalWarmLength = data.reduce((sum: number, item: any) => {
            return sum + (item.warm_length || 0); // Add item's length if it exists, otherwise add 0
        }, 0);

        return totalWarmLength
    }

    calculateHollowShaftTotalWeight(data : any) :number | null {

        if(data.offerPosDimensionShaftUpsetParts.length == 0) return null

        const materialDensity = data.offerPos.material.density

        const totalWeight = data.offerPosDimensionShaftUpsetParts.reduce((sum: number, part: any) => {
            const { outer_diameter_start, length, oversize, side } = part;
    
            if (outer_diameter_start && length) {
                // Calculate weight for the part
                const weight = side
                    ? (outer_diameter_start * side * (length + (oversize ?? 0))) / 1000000 * materialDensity
                    : ((outer_diameter_start / 2) ** 2 * Math.PI * (length + (oversize ?? 0))) / 1000000 * materialDensity;
                
                return sum + Number(weight.toFixed(4));
            }
    
            return sum; // Skip if calculation is not possible
        }, 0);

        return totalWeight
    }

    calculateHollowShaftTotalBeam (data : any) : number | null {

        if(data.length == 0) return null
       
        const maxOuterDiameterStart = data.reduce((max: number, part: any) => {
            return Math.max(max, part.outer_diameter_start || 0);
        }, 0);

        const totalBeam = data.reduce((sum: number, part: any) => {
         
            const beam = part.outer_diameter_start && part.length && maxOuterDiameterStart ?
                ((part.outer_diameter_start / 2) ** 2 * (part.length + (part.oversize ?? 0))) / ((maxOuterDiameterStart / 2) ** 2) : 0;
    
            return sum + beam;
        }, 0);
    
        return totalBeam ? Number(totalBeam.toFixed(4)) : 0;
    }
    

    calculateMaxLengthForShaft(data : any) : number | null {
        
        if(!data.offerPosDimensionShaftUpsetParts) return null

        const totalLength = data.offerPosDimensionShaftUpsetParts.reduce((sum : number, part : any) => {
            if(!part.is_sample) {
                return sum + (part.length || 0);
            }
            return sum
        },0)
        return totalLength;
    }

    addCombine() {
        let dimensions = new OfferPosRawDimension();
        let fields: any = [];
        OfferPosProductTypeClass.getEnumArray().forEach((productType: any) => {
            this.getTypeDimension(productType.value)?.forEach((field: string) => {
                if (!field.includes('surface') && !field.includes('final') && !fields.includes(field)) {
                    fields.push(field)
                    let type = new RawDimensionType();
                    type.type = field;
                    dimensions.rawDimensionTypes.push(type)
                }
            })
        })

        dimensions.offerPos = this.offerPos;
        dimensions.offer_pos_id = this.offerPos?.id;
        if (!this.offerPos.offerPosRawDimensions?.length) {
            dimensions.quantity_final_for_raw = this.offerPos.quantity ?? 0;
            dimensions.quantity_raw_piece = 1;
        } else {
            dimensions.quantity_final_for_raw = 0;
            dimensions.quantity_raw_piece = 1;
        }

        this.offerPos.offerPosRawDimensions?.push(dimensions);
        this.offerPos?.offerPosRawDimensions?.forEach((data: OfferPosRawDimension, index: number) => {
            let lasVal = this.offerPos?.offerPosRawDimensions!.length - 1
            if (index == lasVal) {
                data.section = 1
                data.forged_beam_section = 1
                let length = this.sections;
                for (let i = 0; i < length; i++) {
                    let dimensionShaftUpsetPart = new OfferPosDimensionShaftUpsetPart()
                    data.offerPosDimensionShaftUpsetParts?.push(dimensionShaftUpsetPart)
                }
                for (let i = 0; i < length; i++) {
                    let dimensionShaftUpsetPart = new OfferPosDimensionUpsetPartForgedBeam()
                    data.offerPosDimensionUpsetPartForgedBeams?.push(dimensionShaftUpsetPart)
                }
            }
        })
        this.calcDimensions();
    }
    removeCombine(index: number, data: any) {
        this._notification.deleteItem().subscribe((result: any) => {
            if (result.action == 'next') {
                if (data.hasOwnProperty('id')) this.rawdeletableId.push(data.id)
                this.offerPos.offerPosRawDimensions?.splice(index, 1)
            }
        });
    }

    handleFilter(value: String, src: String) {
        switch (src) {
            case "item":
                this.items =
                    this.cmbItems.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
            case "tool":
                this.tools =
                    this.cmbTools.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
                case"tool2":
                this.tools =
                    this.cmbTools3.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
                case "tool3":
                this.tools =
                    this.cmbTools3.handleLocalDataFilter(
                        value,
                        "custom_id"
                    );
                break;
        }
    }


    changeSection(data: OfferPosRawDimension) {
        let sectionValue = data.section ?? 1
        if (sectionValue <= 0) {
            sectionValue = 1;
            data.section = 1;
        }
        if (sectionValue > data.offerPosDimensionShaftUpsetParts.length) {
            let sectionLenght = sectionValue - data.offerPosDimensionShaftUpsetParts.length;
            for (let i = 0; i < sectionLenght; i++) {
                let dimensionShaftUpsetPart = new OfferPosDimensionShaftUpsetPart()
                data.offerPosDimensionShaftUpsetParts?.push(dimensionShaftUpsetPart)
            }
        }
        else {
            let length = data.offerPosDimensionShaftUpsetParts.length;
            for (let i = length; i > sectionValue; i--) {
                if (sectionValue <= i) {
                    if (data.offerPosDimensionShaftUpsetParts[i - 1]?.hasOwnProperty('id')) this.hweKalkService.deleteDimesionShaftUpsetParts.push(data?.offerPosDimensionShaftUpsetParts[i - 1].id)
                    data.offerPosDimensionShaftUpsetParts.splice(i - 1, 1);
                }
            }
        }
    }
    changeForgedBeamSection(data: OfferPosRawDimension) {
        let sectionValue = data.forged_beam_section ?? 1
        if (sectionValue <= 0) {
            sectionValue = 1;
            data.section = 1;
        }
        if (sectionValue > data.offerPosDimensionUpsetPartForgedBeams.length) {
            let sectionLenght = sectionValue - data.offerPosDimensionUpsetPartForgedBeams.length;
            for (let i = 0; i < sectionLenght; i++) {
                let dimensionShaftUpsetPart = new OfferPosDimensionUpsetPartForgedBeam()
                data.offerPosDimensionUpsetPartForgedBeams?.push(dimensionShaftUpsetPart)
            }
        }
        else {
            let length = data.offerPosDimensionUpsetPartForgedBeams.length;
            for (let i = length; i > sectionValue; i--) {
                if (sectionValue <= i) {
                    if (data.offerPosDimensionUpsetPartForgedBeams[i - 1]?.hasOwnProperty('id')) this.hweKalkService.deleteUpsetPartForgedBeams.push(data?.offerPosDimensionUpsetPartForgedBeams[i - 1].id)
                    data.offerPosDimensionUpsetPartForgedBeams.splice(i - 1, 1);
                }
            }
        }
    }

    calcDimensions() {
        this?.offerPos?.offerPosRawDimensions?.map((item: OfferPosRawDimension) => {
            item.allowanceCalculation();
            item.toleranceCalculation();
            this.calcRawMeasurement(item);
            this.calcGrossWeight(item);
            this.calcSemiFinishedProductTypes(item);
        });
    }

    calcRawMeasurement(item: OfferPosRawDimension) {
        item.rawMeasurementCalculation();
    }

    calcGrossWeight(item: OfferPosRawDimension) {
        item.grossWeightCalculation();
        this.calcSemiFinishedProductTypes(item);
    }
   

    calcSemiFinishedProductTypes(item: OfferPosRawDimension) {
        item.calculationOfSemiFinishedProductType();
    }

    ngOnDestroy() {
        if (this.onCalculationDimensionChange$) this.onCalculationDimensionChange$.unsubscribe();
    }
    showItemSearchModal(data?: OfferPosRawDimension, isShowLoader: boolean = true, withZero = false) {
        if (isShowLoader) {
            this.isWindowLoaderEnabled = true;
            this.showItemModal = true;
        }
        this.items = [];
        const stockCheck= !withZero ? ' and stock gt 0': '';
        let url = this.offerPos.material?.warehouse_material ?
            `Items?$expand=hweClassificationBlockGeometrie(select=value_string),hweClassificationBlockTyp(select=value_string),hweClassificationGiesstyp(select=value_string),hweClassificationLieferant(select=value_string)&$filter=startswith(custom_id, '1')${stockCheck} and hwe_warehouse_material eq '${this.offerPos.material?.warehouse_material}'&$top=10000000` :
            `Items?$expand=hweClassificationBlockGeometrie(select=value_string),hweClassificationBlockTyp(select=value_string),hweClassificationGiesstyp(select=value_string),hweClassificationLieferant(select=value_string)&$filter=startswith(custom_id, '1')${stockCheck}&$top=10000000`
        this._commonService.get(url)
            .pipe(
                map((response: any) => {
                    return response?.value?.map((data: any) => {
                        return {
                            id: data.id,
                            custom_id: data.custom_id,
                            hwe_cast_type: data.hweClassificationGiesstyp[0]?.value_string ?? null,
                            hwe_supplier_name: data.hweClassificationLieferant[0]?.value_string ?? null,
                            hwe_block_type: data.hweClassificationBlockTyp[0]?.value_string ?? null,
                            hwe_block_geometry: data.hweClassificationBlockGeometrie[0]?.value_string ?? null,
                            stock: data.stock,
                            hwe_warehouse_material: data.hwe_warehouse_material,
                            hwe_norm_name: data.hwe_norm_name,
                            hwe_period_month: data.hwe_period_month,
                            hwe_period_year: data.hwe_period_year,
                            price: data.price,
                            hweClassificationGiesstyp: data.hweClassificationGiesstyp[0] ?? null,
                            hweClassificationLieferant: data.hweClassificationLieferant[0] ?? null,
                            hweClassificationBlockTyp: data.hweClassificationBlockTyp[0] ?? null,
                            hweClassificationBlockGeometrie: data.hweClassificationBlockGeometrie[0] ?? null,
                            combo_view: `${data.custom_id}/${data.hweClassificationLieferant[0]?.value_string ?? ''}/${data.hweClassificationBlockTyp[0]?.value_string ?? ''}`
                        };

                    });
                })
            )
            .subscribe({
                next: (response: any) => {
                    this.items = response;
                    this.isWindowLoaderEnabled = false
                },
                error: (e) => this.isWindowLoaderEnabled = false

            })

    }

    filterWithOrWithoutZero(event:boolean){
        this.showItemSearchModal(undefined, true, event);
    }
    closeComboSearchModal(event: any) {
        this.showItemModal = false;
    }

    selectComboSearchData(event: any) {
        this.offerPos.item = event;
    }

    onOpenAttachmentDialog(tool: Tool){
        this.isAttachmentDialogOpen= true;
        this._commonService
            .getWithoutPrefix(
                `${this.document.location.origin}/base_visu/php/base_visu_data_service.php?service=get_tool_attachment&custom_id='${tool?.custom_id}'`
            )
            .subscribe({
                next: async (response: any) => {
                    this.attachmentFiles = response.map((file: any) =>
                        new Attachment().deserialize(file)
                    );


                    this.attachmentLoader = false;
                },
                error: e => {
                    this.attachmentLoader = false;
                },
            });
    }
    
    closeAttachmentDialog(){
        this.isAttachmentDialogOpen= false;
    }

    onRingCalculation(index:number){
        this.rawDimentionIndex = index;

        setTimeout(() => {
            this.ringCalculationDialogOpen = true;
        }, 100);
    }

    onCloseRingCalculationDialog(){
        this.ringCalculationDialogOpen = false;
    }
}
