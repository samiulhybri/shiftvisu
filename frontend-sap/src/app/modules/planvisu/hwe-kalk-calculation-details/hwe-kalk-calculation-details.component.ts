import { Component, EventEmitter, inject, Input, Output, ViewChild } from "@angular/core";

import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { readCookie } from "@app/shared/helpers/read-cookie";
import { Localization } from "@app/shared/utils/common-localize";
@Component({
  selector: 'app-hwe-kalk-calculation-details',
  templateUrl: './hwe-kalk-calculation-details.component.html',
  styleUrl: './hwe-kalk-calculation-details.component.css'
})
export class HweKalkCalculationDetailsComponent {
  calculationUrl?:SafeResourceUrl;
  localization = Localization;
  document = inject(DOCUMENT)
  sanitizer = inject(DomSanitizer)
  @Input() openDialog:boolean = false
  @Input() set calculationId(calculationId:number){
    this.calculationUrl = ''
    let lan = readCookie('sct_language');
    const url = `${this.document.location.origin}/v11/${lan}/hwe-kalk/calculation/details/${calculationId}`;
    this.calculationUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    console.log(this.calculationUrl)
  }
  @Output()  closeHweDialog = new EventEmitter<boolean>();
  dialogClose() {
    this.openDialog = false;
    this.closeHweDialog.emit(false)
  }
}
