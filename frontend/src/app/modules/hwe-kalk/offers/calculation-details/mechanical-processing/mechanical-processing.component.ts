import {Component, inject, Input, OnInit} from '@angular/core';
import { OfferPos } from '@app/models/offer-pos';
import {OfferPosMechanicalProcess } from '@app/models/offer-pos-mechanical-process';
import { OfferPosRawDimension } from '@app/models/offer-pos-raw-dimension';
import { HweRustProtectionTypeClass } from '@app/modules/hwe-kalk/enums/HweRustProtectionType';
import {
	OfferPosDimensionSurface,
	OfferPosDimensionSurfaceClass
} from '@app/modules/hwe-kalk/enums/OfferPosDimensionSurface';
import { OfferPosMechanicalProcessTolerance, OfferPosMechanicalProcessToleranceClass } from '@app/modules/hwe-kalk/enums/OfferPosMechanicalProcessTolerance';import { OfferPosProductType } from '@app/modules/hwe-kalk/enums/OfferPosProductType';
;
import { HweKalkService } from '@app/modules/hwe-kalk/hwe-kalk.service';
import { Subscription } from 'rxjs';
import {PermissionEnum} from "@app/enums/permissions-enum";
import {AuthService} from "@app/services/auth.service";

@Component({
	selector: 'app-mechanical-processing',
	templateUrl: './mechanical-processing.component.html',
	styleUrls: ['./mechanical-processing.component.scss']
})
export class MechanicalProcessingComponent {
	@Input() offerPos!: OfferPos
	@Input() submitted: boolean = false;
	@Input() isForm!: boolean;
	public authService  = inject(AuthService)
	public cmbItems: any;
	public showItemModal: boolean = false
	public selectedOfferPosRawDimension!: OfferPosRawDimension;
	public dimensionSurfaceClass = OfferPosDimensionSurfaceClass;
	public rawdeletableId: any = []
	public dimensionSurfaces!: Array<{ value: string, text: string }>;
	public tolerances!: Array<{ value: string, text: string }>;
	public sections: number = 1;
	public rustProtectionTypes!: Array<{ value: string, text: string }>;
	public onCalculationDimensionChange$!: Subscription;
	public offerPosProductType = OfferPosProductType
	constructor(protected hweKalkService: HweKalkService,
	) {
		this.rawdeletableId = this.hweKalkService.deleteRawDimensions;
		this.getEnumValueWithLang();
	}

	isShow(type: string) {
		return this.getTypeDimension()?.includes(type);
	}
	getEnumValueWithLang() {
		this.dimensionSurfaces = OfferPosDimensionSurfaceClass.getEnumArray();
		this.tolerances = OfferPosMechanicalProcessToleranceClass.getEnumArray();
		this.rustProtectionTypes = HweRustProtectionTypeClass.getEnumArray();
	}
	isPermissionValidate():boolean{
		return this.authService.isPermissionValidate(PermissionEnum.HWEKALK_CUSTOMER_REQUEST_EDIT)
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
		if (!this.offerPos.mechanicalProcesses?.length){
			let mechanicalProcess = new OfferPosMechanicalProcess();
			this.offerPos.mechanicalProcesses?.push(mechanicalProcess);
		} else {
			this.sections = this.offerPos.mechanicalProcesses?.length ?? 0;
		}
		
		this.onCalculationDimensionChange$ = this.hweKalkService.onCalculationDimensionChangeSubject.subscribe({
            next: () => {
                this.calcDimensions();
            }
        });
	}
	
	surfaceFinal(surfaceValue: OfferPosDimensionSurface, field: string = '') {
		this.offerPos.inner_diameter_surface_final =  this.offerPos.inner_diameter_surface_final || surfaceValue;
		this.offerPos.outer_diameter_surface_final =  this.offerPos.outer_diameter_surface_final || surfaceValue;
		this.offerPos.side_a_surface_final =  this.offerPos.side_a_surface_final || surfaceValue;
		this.offerPos.side_b_surface_final = this.offerPos.side_b_surface_final || surfaceValue;
		this.offerPos.height_surface_final =  this.offerPos.height_surface_final || surfaceValue;
		this.offerPos.length_surface_final =  this.offerPos.length_surface_final || surfaceValue;
	}

	setToleranceFinal(tolerance: OfferPosMechanicalProcessTolerance) {
		this.offerPos.outer_tolerance = this.offerPos.outer_tolerance || tolerance;
		this.offerPos.inner_tolerance = this.offerPos.inner_tolerance || tolerance;
		this.offerPos.side_a_tolerance = this.offerPos.side_a_tolerance || tolerance;
		this.offerPos.side_b_tolerance = this.offerPos.side_b_tolerance || tolerance;
		this.offerPos.height_tolerance = this.offerPos.height_tolerance || tolerance;
		this.offerPos.length_tolerance = this.offerPos.length_tolerance || tolerance;
	}
	
    changeSection() {
        let sectionValue = this.sections ?? 1
        if (sectionValue <= 0) {
            sectionValue = 1;
        }
	
		if(this.offerPos?.mechanicalProcesses?.length){
			
			if (sectionValue > this.offerPos?.mechanicalProcesses?.length) {
				let sectionLenght = sectionValue - this.offerPos.mechanicalProcesses?.length;
				for (let i = 0; i < sectionLenght; i++) {
					let dimensionShaftUpsetPart = new OfferPosMechanicalProcess()
					this.offerPos.mechanicalProcesses?.push(dimensionShaftUpsetPart)
				}
			}
			else {
				let length = this.offerPos.mechanicalProcesses.length;
				for (let i = length; i > sectionValue; i--) {
					if (sectionValue <= i) {
						if (this.offerPos.mechanicalProcesses[i - 1]?.hasOwnProperty('id')) this.hweKalkService.deleteMechanicalProcesses.push(this.offerPos?.mechanicalProcesses[i - 1].id)
						this.offerPos.mechanicalProcesses.splice(i - 1, 1);
					}
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
}
