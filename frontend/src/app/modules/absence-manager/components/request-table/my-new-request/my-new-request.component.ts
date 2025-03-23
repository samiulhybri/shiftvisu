import { Component, Input, ViewChild } from '@angular/core';
import { AbsenceRequest } from '@app/modules/absence-manager/models/new-request';
import { RequestService } from '@app/modules/absence-manager/services/request.service'
import { AbsenceTypes } from '@app/modules/absence-manager/models/absence-types';
import { CommonService } from '@app/shared/services/common.service'
import { AuthService } from '@app/services/auth.service';
import { GridComponent } from '@app/shared/components/kendo/grid/grid.component';
import { AbsenceStatus, AbsenceStatusClass } from '@app/enums/absence-status';
import { Notification } from 'src/app/shared/services/notification.service';
import { IntlService } from '@progress/kendo-angular-intl';
import { readCookie } from '@shared/helpers/read-cookie';
import { AbsenceManagerPageType } from '@app/enums/absence-manager-page-type';
import { AbsenceManagerButtonType } from '@app/enums/absence-manager-button'
import { NgModel } from "@angular/forms";

@Component({
  selector: 'app-my-new-request',
  templateUrl: './my-new-request.component.html',
  styleUrls: ['./my-new-request.component.scss']
})
export class MyNewRequestComponent {

  public newRequest?: AbsenceRequest;
  public absenceType = [];
  public value: Date | undefined;
  public format = "dd.MM.yyyy";
  public absenceTypeUrl = 'AbsenceTypes'
  public absenceTypes?: AbsenceTypes;
  public absenceManagerButtonTypeEnum = AbsenceManagerButtonType
  public absenceManagerPageTypes = AbsenceManagerPageType;
  public totalHourDependentValue: number = 8;
  public userData: any
  public hasSuperiorNote?: boolean = true;
  public emailType: string = ''
  public calenderEventType: string = ''
  public absenceStatusEnum = AbsenceStatus;
  public statusEnumClass = new AbsenceStatusClass();
  @ViewChild('date', { read: NgModel }) dateModel?: NgModel;
  @ViewChild('startTimeN', { read: NgModel }) startTimeNModel?: NgModel;
  @ViewChild('endTimeN', { read: NgModel }) endTimeNModel?: NgModel;
  @ViewChild('start_date', { read: NgModel }) startDateModel?: NgModel;
  @ViewChild('end_date', { read: NgModel }) endDateModel?: NgModel;
  @Input() set data(dataItem: any) {
    this.newRequest = new AbsenceRequest().deserialize(dataItem);
  }
  constructor(public intl: IntlService, private commonService: CommonService, private authService: AuthService, public requestService: RequestService, protected _notification: Notification) {
    this.commonService.get(this.absenceTypeUrl).subscribe({
      next: (res: any) => {
        this.absenceTypes = res.value;
      }
    })
  }

  ngOnInit(): void {
    this.userData = this.authService.user
    if (this.newRequest == undefined) {
      this.newRequest = new AbsenceRequest();
      this.newRequest.user = this.authService.user;

    }

  }
  setTime(e: any) {

    if (this.newRequest!.startTimeN) {

      this.newRequest!.startTimeN.setDate(this.newRequest?.date.getDate())
      this.newRequest!.startTimeN.setMonth(this.newRequest?.date.getMonth())
      this.newRequest!.startTimeN.setFullYear(this.newRequest?.date.getFullYear())
    } else {
      this.newRequest!.startTimeN = new Date(this.newRequest?.date)
    }


    if (this.newRequest!.endTimeN) {
      this.newRequest!.endTimeN.setDate(this.newRequest?.date.getDate())
      this.newRequest!.endTimeN.setMonth(this.newRequest?.date.getMonth())
      this.newRequest!.endTimeN.setFullYear(this.newRequest?.date.getFullYear())
    } else {
      this.newRequest!.endTimeN = new Date(this.newRequest?.date)
    }

  }

  getUTCDateTime(dateTime: Date) {
    return new Date(
      dateTime.getUTCFullYear(),
      dateTime.getUTCMonth(),
      dateTime.getUTCDate(),
      dateTime.getUTCHours(),
      dateTime.getUTCMinutes(),
      dateTime.getUTCSeconds(),
      dateTime.getUTCMilliseconds()
    )
  }

  sendMail(absenceRequest: AbsenceRequest, mailType: string) {
    let lang = readCookie('sct_language') ?? 'en';
    let url = `absence-manager/email/${mailType}/${lang}/${absenceRequest.id}`
    this.commonService.post(url, {}, false).subscribe();
  }

  onUpdate(e: any, req: GridComponent) {
    req.isWindowLoaderEnabled = true;
    req.closeGridWindow = false

    this.commonService.get(`AbsenceRequests?filter=id eq ${this.newRequest?.id}`).subscribe({
      next: (res: any) => {
        if (!res.value.length) {
          req.isWindowLoaderEnabled = false;
          return this._notification.showError($localize`Request is Already Deleted`);
        }
        let status = res.value[0].status;
        if (this.newRequest!.status === AbsenceStatus.PENDING) {
          if (status === AbsenceStatus.APPROVED || status === AbsenceStatus.NOT_APPROVED) {
            req.isWindowLoaderEnabled = false;
            return this._notification.showError($localize`Request is Already ${new AbsenceStatusClass().getStateTranslate(status)}`)
          }
        } else if (this.newRequest!.status === AbsenceStatus.REVOKE) {
          if (status === AbsenceStatus.APPROVED || status === AbsenceStatus.REVOKED) {
            req.isWindowLoaderEnabled = false;
            return this._notification.showError($localize`Request is Already ${new AbsenceStatusClass().getStateTranslate(status)}`)
          }
        }

        if (this.requestService.statusAction === this.absenceManagerButtonTypeEnum.APPROVE) {
          if (this.newRequest!.status === AbsenceStatus.PENDING) {
            this.newRequest!.status = AbsenceStatus.APPROVED
            this.emailType = "leave-request-approval"
            let lang = readCookie('sct_language') ?? 'en';
            this.calenderEventType = `create-calendar-event/${lang}`
          } else if (this.newRequest!.status === AbsenceStatus.REVOKE) {
            this.newRequest!.status = AbsenceStatus.REVOKED
            this.emailType = "revoke-request-approval"
            this.calenderEventType = 'delete-calendar-event'
          }
          this.newRequest!.approval_time = new Date();
          this.newRequest!.approvedBy = this.authService.user
        } else if (this.requestService.statusAction === this.absenceManagerButtonTypeEnum.DECLINE) {

          if (!this.newRequest?.supervisor_note) {
            this.hasSuperiorNote = false;
            req.isWindowLoaderEnabled = false;
            return;
          } else {
            if (this.newRequest!.status === AbsenceStatus.PENDING) {
              this.newRequest!.status = AbsenceStatus.NOT_APPROVED
              this.emailType = "leave-request-declination"
            } else if (this.newRequest!.status === AbsenceStatus.REVOKE) {
              this.newRequest!.status = AbsenceStatus.APPROVED
              this.emailType = "revoke-request-declination"
            }
            this.newRequest!.approval_time = new Date();
            this.newRequest!.approvedBy = this.authService.user
          }
        }
        let data: any = { ...this.newRequest?.toOdata(), is_read: true };
        data.start = undefined
        data.end = undefined
        this.commonService.put(`AbsenceRequests(${this.newRequest?.id})`, data)
          .subscribe({
            next: (response: any) => {
              req.gridRefersh.emit();
              req.isWindowLoaderEnabled = false;
              req.closeGridWindow = true;
              req.enumFilterChange
              this.sendMail(response, this.emailType)
              if (response.status === AbsenceStatus.APPROVED || response.status === AbsenceStatus.REVOKED) {
                if (response.status === AbsenceStatus.APPROVED && this.requestService.statusAction === this.absenceManagerButtonTypeEnum.APPROVE) {
                  this.sendCalenderEvent(this.calenderEventType, response.id)
                } else if (response.status === AbsenceStatus.REVOKED) {
                  this.sendCalenderEvent(this.calenderEventType, response.graph_id)
                }
              }

              this._notification.showSuccess($localize`Data updated successfully`);
            },
            error: (e: any) => {
              req.isWindowLoaderEnabled = false
              this._notification.showError(e ?? $localize`Something went wrong`);
            }

          })
      }
    })

  }

  sendCalenderEvent(eventType: string, id: any) {
    let url = `absence-manager/${eventType}/${id}`
    this.commonService.post(url, {}, false).subscribe();
  }

  extractValueBeforeSpace(input: string): string | null {
    const spaceIndex = input.indexOf(' ');

    if (spaceIndex !== -1) {
      return input.substring(0, spaceIndex);
    }

    return null;
  }
  checkSwitchValue(e: any) {
    if (e) {

      if (this.newRequest?.startTimeN) {
        this.newRequest!.start = this.newRequest?.date
      }

      if (this.newRequest?.end && this.newRequest?.start) {


        if (this.newRequest?.end < this.newRequest?.start) {
          this.newRequest.end = undefined;
          this.newRequest.total_hour = 0;
        } else {
          this.newRequest?.getTimeDifference();
        }

      } else {
        this.newRequest!.total_hour = 0;
      }


    } else {
      if (this.newRequest?.start) {
        this.newRequest!.date = this.newRequest?.start
        if(!this.newRequest!.startTimeN){
          this.newRequest!.startTimeN = this.newRequest!.date
        }else{
          this.newRequest!.startTimeN?.setDate(this.newRequest?.date.getDate())
          this.newRequest!.startTimeN?.setMonth(this.newRequest?.date.getMonth())
          this.newRequest!.startTimeN?.setFullYear(this.newRequest?.date.getFullYear())
        }
        if(!this.newRequest!.endTimeN){
          this.newRequest!.endTimeN = this.newRequest!.date
        }else{
          this.newRequest!.endTimeN?.setDate(this.newRequest?.date.getDate())
          this.newRequest!.endTimeN?.setMonth(this.newRequest?.date.getMonth())
          this.newRequest!.endTimeN?.setFullYear(this.newRequest?.date.getFullYear())
        }
      
      }
      this.newRequest!.getTimeDifference()
      if (!this.newRequest!.startTimeN || !this.newRequest!.endTimeN) {
        this.newRequest!.total_hour = 0;
      }

    }
    
  }
  getTitle(isDetailsModal: any) {
    if (isDetailsModal) {
      return $localize`Absence Details`
    } else {
      return $localize`Request Details`
    }
  }

  disabledStartDates = (date: Date): boolean => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const last7DaysDate = new Date();
    last7DaysDate.setDate(currentDateOnly.getDate() - 7);

    if (this.newRequest?.end) {
      const endDateOnly = new Date(this.newRequest?.end.getFullYear(), this.newRequest?.end.getMonth(), this.newRequest?.end.getDate());
      if (dateOnly > endDateOnly || dateOnly < last7DaysDate) {
        return true;
      }
    } else {

      if (dateOnly < last7DaysDate) {
        return true;
      }

    }


    return false;
  };
  disabledEndDates = (date: Date): boolean => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const last7DaysDate = new Date();
    last7DaysDate.setDate(currentDateOnly.getDate() - 7);

    if (this.newRequest?.start) {
      const startDateOnly = new Date(this.newRequest?.start.getFullYear(), this.newRequest?.start.getMonth(), this.newRequest?.start.getDate());
      if (dateOnly < startDateOnly || dateOnly < last7DaysDate) {
        return true;
      }
    } else {

      if (dateOnly < last7DaysDate) {
        return true;
      }

    }

    return false;
  };
  disabledDates = (date: Date): boolean => {

    const currentDate = new Date();
    const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const last7DaysDate = new Date();
    last7DaysDate.setDate(currentDateOnly.getDate() - 7);

    if (dateOnly < last7DaysDate) {
      return true;
    }

    return false;
  };

  onAdd(e: any, grid: GridComponent) {
    grid.isWindowLoaderEnabled = true;
    if (!this.newRequest?.is_full_day) {

      if (!this.newRequest?.startTimeN || !this.newRequest?.startTimeN || !this.newRequest?.date || !this.newRequest.absenceType) {
        this._notification.showError($localize`Please fill all required fields`);
        grid.isWindowLoaderEnabled = false
        return;
      }

     
    } else {
      if (!this.newRequest.start || !this.newRequest.end || !this.newRequest.absenceType) {

        this._notification.showError($localize`Please fill all required fields`);
        grid.isWindowLoaderEnabled = false
        return;
      }
    }

    if (this.newRequest.total_hour < 0 || this.newRequest.total_hour == 0 || this.startDateModel?.control.errors || this.endDateModel?.control.errors || this.startTimeNModel?.control.errors || this.endTimeNModel?.control.errors || this.dateModel?.control.errors) {
      this._notification.showError($localize`Please Select  Valid date`);
      grid.isWindowLoaderEnabled = false
      return;
    }

    let start = this.newRequest.is_full_day ? this.intl.formatDate(this.getUTCDateTime(this.newRequest!.start!), "yyyy-MM-dd HH:mm:ss") : this.intl.formatDate(this.getUTCDateTime(this.newRequest!.startTimeN!), "yyyy-MM-dd HH:mm:ss");
    let end = this.newRequest.is_full_day ? this.intl.formatDate(this.getUTCDateTime(this.newRequest!.end!), "yyyy-MM-dd HH:mm:ss") : this.intl.formatDate(this.getUTCDateTime(this.newRequest!.endTimeN!), "yyyy-MM-dd HH:mm:ss");

    this.commonService.get(`AbsenceRequests?$count=true&$filter=((start gt '${start}' and start lt '${end}') or (end gt '${start}' and end lt '${end}') or ('${start}' ge start and '${end}' le end)) and user_id eq ${this.userData.id} and status in ('${AbsenceStatus.PENDING}','${AbsenceStatus.APPROVED}','${AbsenceStatus.REVOKE}')`).subscribe({
      next: (res: any) => {
        if (res['@count']) {
          grid.isWindowLoaderEnabled = false;
          return this._notification.showError($localize`Selected time range already has request`);
        }

        this.commonService.post(`AbsenceRequests`, this.newRequest?.toOdata()).subscribe({
          next: (response: any) => {
            grid.isWindowLoaderEnabled = false;
            grid.closeGridWindow = true;
            this.sendMail(response, "new-leave-request");
            grid.gridRefersh.emit();
            this._notification.showSuccess($localize`Data created successfully`);
          },
          error: (e: any) => {
            grid.isWindowLoaderEnabled = false
            this._notification.showError(e ?? $localize`Something went wrong`);
          }
        })

      }
    })

  }
  getApprovalInfo(newRequest: any) {
    const statusText = newRequest?.approval_time
      ? newRequest.status === this.absenceStatusEnum.REVOKE
        ? this.statusEnumClass.getStateTranslate(this.absenceStatusEnum.APPROVED)
        : this.statusEnumClass.getStateTranslate(newRequest.status)
      : '';

    return statusText + ' ' + (statusText ? $localize`on` : '');
  }
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace' || event.keyCode === 8) {
      event.preventDefault(); // Prevent the default behavior
    }
  }
}




