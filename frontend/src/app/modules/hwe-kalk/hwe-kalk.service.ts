import { Injectable } from '@angular/core';
import { Item } from '@app/models/item';
import { Tool } from '@app/models/tool';
import { BehaviorSubject, Subject } from 'rxjs';
import { OfferPosProductType } from './enums/OfferPosProductType';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class HweKalkService {
	public onCalcUpdateSubject = new BehaviorSubject(false);
	public copyOfferPos = new BehaviorSubject({});
	public onCalculationDimensionChangeSubject = new Subject();
	public deleteRawDimensions:any = [];
	public deleteShaftUpsetParts:any = [];
	public deleteDimesionShaftUpsetParts:any = [];
	public deleteOfferPosCost:any = [];
	public deleteMechanicalProcesses:any = [];
	public deleteUpsetPartForgedBeams:any = [];
	public materialDimensionTypes:any = this.materialDimensions();
	public items?: Item[];
	public tools?: Tool[];
    public fromCalDetail = true;
    public disableTabs = false;

	constructor(private http: HttpClient) { }

	materialDimensions(): object {
        return {
            [OfferPosProductType.DISK]: ['outer_diameter_final', 'inner_diameter_final', 'outer_diameter_surface_final', 'height_final', 'height_surface_final', 'outer_diameter', 'height', 'has_mechanical_drilling'],
            [OfferPosProductType.DISK_PUNCHED]: ['outer_diameter_final', 'outer_diameter_surface_final', 'inner_diameter_final', 'inner_diameter_surface_final', 'height_final', 'height_surface_final', 'outer_diameter', 'inner_diameter', 'height'],
            [OfferPosProductType.RING_CYLINDER]: ['outer_diameter_final', 'outer_diameter_surface_final', 'inner_diameter_final', 'inner_diameter_surface_final', 'height_final', 'height_surface_final', 'outer_diameter', 'inner_diameter', 'height', 'inner_diameter_pre_1', 'height_pre_1', 'outer_diameter_pre_1','inner_diameter_pre_2', 'height_pre_2', 'outer_diameter_pre_2', 'radial_width', 'radial_width_pre_1', 'radial_width_pre_2'],
            [OfferPosProductType.RING_ROLLED]: ['outer_diameter_final', 'outer_diameter_surface_final', 'inner_diameter_final', 'inner_diameter_surface_final', 'height_final', 'height_surface_final', 'outer_diameter', 'inner_diameter', 'height', 'inner_diameter_pre_1', 'height_pre_1', 'outer_diameter_pre_1'],
            [OfferPosProductType.PIPE]: ['outer_diameter_final', 'outer_diameter_surface_final', 'inner_diameter_final', 'inner_diameter_surface_final', 'length_final', 'length_surface_final', 'outer_diameter', 'inner_diameter', 'length',  'inner_diameter_pre_1', 'height_pre_1', 'inner_diameter_pre_2', 'height_pre_2', 'outer_diameter_pre_1', 'outer_diameter_pre_2'],
            [OfferPosProductType.BAR_SQUARE]: ['side_a_final', 'side_a_surface_final', 'side_b_final', 'side_b_surface_final', 'length_final', 'side_a', 'side_b', 'length', 'length_surface_final', 'has_mechanical_drilling'],
            [OfferPosProductType.BAR_ROUND]: ['outer_diameter_final','inner_diameter_final', 'outer_diameter_surface_final', 'length_final', 'length_surface_final', 'outer_diameter', 'length', 'has_mechanical_drilling'],
            [OfferPosProductType.SOCKET]: ['outer_diameter_final', 'outer_diameter_surface_final', 'inner_diameter_final', 'inner_diameter_surface_final', 'length_final', 'length_surface_final', 'outer_diameter', 'inner_diameter', 'length'],
            [OfferPosProductType.SHAFT]: ['shaft', 'has_mechanical_drilling'],
            [OfferPosProductType.UPSET_PART]: ['upset_part', 'has_mechanical_drilling', 'has_forged_drilling', 'is_extruded','is_hollow_punching' ],
            [OfferPosProductType.SHAFT_HOLLOW]: ['shaft', 'inner_diameter_pre_1', 'height_pre_1', 'inner_diameter_pre_2', 'height_pre_2', 'outer_diameter_pre_1', 'outer_diameter_pre_2'],
           [OfferPosProductType.BAR_ROLLED]: ['side_a_final', 'side_a_surface_final', 'side_b_final', 'side_b_surface_final', 'length_final','length_surface_final','has_mechanical_drilling', 'outer_diameter', 'inner_diameter', 'height', 'inner_diameter_pre_1', 'height_pre_1', 'inner_diameter_pre_2', 'height_pre_2', 'outer_diameter_pre_1', 'outer_diameter_pre_2']
        }
    }
}
