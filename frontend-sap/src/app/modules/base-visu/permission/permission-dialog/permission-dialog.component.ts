import { DataService } from "@app/shared/services/data.service";
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Permission } from '@app/shared/models/permission.model';
import { CommonService } from '@app/shared/services/common.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { Localization } from "@app/shared/utils/common-localize";


@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permission-dialog.component.html',
  styleUrl: './permission-dialog.component.css'
})
export class PermissionDialogComponent implements OnInit, OnDestroy {
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  @ViewChild('modalRef') modalRef: any;
  @Input('permissionModel') permissionModel: Permission;
  public isIndicator: boolean = false;
  private permissionList: Permission[] = [];
  localization = Localization;

  constructor(
    private commonService: CommonService,
    private dataService: DataService
  ) {
    this.permissionModel = new Permission().deserialize({name: ''});
  }

  ngOnInit(): void {
    this.dataService.permissions$
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (res)=>{
        this.permissionList = res;
      },
      error: (err)=>{

      },
      complete: ()=>{

      }
    })
  }

  submitForm() {
    this.isIndicator = true;
    const postData = this.permissionModel.toJSON();
    if(this.permissionModel.id) {
      this.update(this.permissionModel.id, postData);
    }else {
      this.commonService.post('permissions', postData, false)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (res: any) => {
          this.dataService.permissionList = [...this.permissionList, res]
        },
        error: (err)=> {
          this.isIndicator = false;
        },
        complete: ()=> {
          this.permissionModel = new Permission().deserialize({name: ''});
          this.isIndicator = false;
          this.modalRef.elementRef.nativeElement.close();
        }
      })
    }
  }

  update(id: number, data: Permission) {
    this.commonService.patch(`permissions/${id}`, data, false)
    .pipe(takeUntil(this.destroyed$))
    .subscribe({
      next: (res: any) => {
        const updatedData = this.permissionList.map(el=>{
          if(el.id === res.id) {
            el = res
          }
          return el;
        });
        this.dataService.permissionList = [...updatedData]
      },
      error: () => {

      },
      complete: ()=>{
        this.permissionModel = new Permission().deserialize({name: ''});
        this.isIndicator = false;
        this.modalRef.elementRef.nativeElement.close();
      }
    })
  }
  
  onCloseModal() {
    this.modalRef.elementRef.nativeElement.close();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
