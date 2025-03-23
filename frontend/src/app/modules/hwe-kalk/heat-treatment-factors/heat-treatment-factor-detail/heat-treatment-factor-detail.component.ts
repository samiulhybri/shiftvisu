import { Component, Input } from '@angular/core';
import { MaterialGroupType, MaterialGroupTypeClass } from '@app/enums/material-group-type';
import { HweHeatTreatmentFactor } from '@app/models/hwe-heat-treatment-factor';
import { ComboFilter } from '@app/shared/classes/combo-filter';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { Observable, catchError, throwError } from 'rxjs';

@Component({
    selector: 'app-heat-treatment-factor-detail',
    templateUrl: './heat-treatment-factor-detail.component.html',
    styleUrls: ['./heat-treatment-factor-detail.component.scss']
})
export class HeatTreatmentFactorDetailComponent {
    @Input("data") heatTreatmentFactor?: HweHeatTreatmentFactor;
    public isLoaderEnabled: boolean = false;
    public materialGroupTypeList: MaterialGroupType[] = [];
    public cmbMaterialGroupType: any;

    constructor(
        public _commonService: CommonService,
        public notification: Notification
    ) {
        if (this.heatTreatmentFactor === undefined) {
            this.heatTreatmentFactor = new HweHeatTreatmentFactor().deserialize({});
        }
    }

    ngOnInit() {
        this.materialGroupTypeList = new MaterialGroupTypeClass().getEnumArray();
        this.cmbMaterialGroupType = new ComboFilter(this.materialGroupTypeList);
    }

    onUpdate(e: any, grid: GridComponent) {
        const data = new HweHeatTreatmentFactor().deserialize(this.heatTreatmentFactor).toOdata();
        return this._commonService.put(`HweHeatTreatmentFactors(${this.heatTreatmentFactor?.id})`, data)
            .pipe(
                catchError(error => {
                    console.error('Update error:', error);
                    return throwError('Something went wrong!');
                })
            );
    }

    onAdd(e: any, grid: GridComponent) {
        const data = this.heatTreatmentFactor!.toOdata();
        return this._commonService.post(`HweHeatTreatmentFactors`, data)
    }

    onValueChange(value: any) {
        this.heatTreatmentFactor!.material_group_type = value ?? null;
    }

    handleFilter(value: String) {
        this.materialGroupTypeList = this.cmbMaterialGroupType.handleLocalDataFilter(
            value,
            "text"
        );
    }
}
