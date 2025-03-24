import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor() { }
  public isNewRequestModal = false;
  public isAcceptOrDeclaineModal?:boolean;
  public absenceManagerPageType = '';
  public isRequestActionButtonsVisible?:boolean;
  public statusAction?:string;
  public isAbsenceManagerStart = false;
}
