import { Component, Input } from '@angular/core';
import { HweRingRollingFactor } from '@app/models/hwe-ring-rolling-factor';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from '@app/shared/services/notification.service';
import { Observable, catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-ring-rolling-factor-detail',
  templateUrl: './ring-rolling-factor-detail.component.html',
  styleUrls: ['./ring-rolling-factor-detail.component.scss']
})
export class RingRollingFactorDetailComponent {
  @Input("data") hweRingRollingFactor?: HweRingRollingFactor;
  public isLoaderEnabled: boolean = false;

  constructor(
    public _commonService: CommonService,
    public notification: Notification
  ) {
      if (this.hweRingRollingFactor === undefined) {
        this.hweRingRollingFactor = new HweRingRollingFactor();
      }
   }

  onUpdate(e: any, grid: GridComponent) {
    const data = new HweRingRollingFactor().deserialize(this.hweRingRollingFactor).toOdata();
    return this._commonService.put(`HweRingRollingFactors(${this.hweRingRollingFactor?.id})`, data)
        .pipe(
            catchError(error => {
                console.error('Update error:', error);
                return throwError('Something went wrong!');
            })
        );
  }

  onAdd(e: any, grid: GridComponent) {
    return this._commonService.post(`HweRingRollingFactors`, this.hweRingRollingFactor!.toOdata())
  }
}
