import { Component, Inject, Input, LOCALE_ID } from '@angular/core';
import { Calculation } from '@app/models/calculation';
import { OfferPos } from '@app/models/offer-pos';
import { OperationPlanPos } from '@app/models/operation-plan-pos';
import { CommonService } from '@app/shared/services/common.service';
import { Notification } from 'src/app/shared/services/notification.service';
import { readCookie } from '@app/shared/helpers/read-cookie';

@Component({
    selector: 'app-summary',
    templateUrl: './summary.component.html',
    styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
    @Input() calculation!: Calculation;
    @Input() offerPos!: OfferPos;
    @Input() opPlanPos!: OperationPlanPos[];
    @Input() submitted: boolean = false;
    @Input() fromSales: boolean = false;
    @Input() hasValidationErrorShaftUpsetPart: boolean = false;
    public isLoaderEnabled: boolean = false;

    constructor(@Inject(LOCALE_ID) protected locale: string,
        private _commonSrv: CommonService,
        public notifications: Notification) {}

    ngOnInit(): void {
        this.getSummaryPdf();
    }

    getSummaryPdf() {
        let locale = readCookie('sct_language') ?? 'de';
        if(this.offerPos) {
            this.isLoaderEnabled = true;
            this._commonSrv.post(`hwe-kalk/offer-pos-summary/${ this.offerPos.id }/pdf/${ locale }`, [], false).subscribe({
                next: (response: any) => {
                    this.isLoaderEnabled = false;

                    const embedElement = document.createElement('embed');
                    embedElement.src = response.pdfFile;
                    embedElement.width = '100%';
                    if (window.innerWidth < 2000) embedElement.height = '620px';
                    else embedElement.height = '900px';

                    const container = document.getElementById('pdf-container');
                    container!.appendChild(embedElement);

                },
                error: (e: any) => {
                    this.notifications.showError($localize`Something went wrong.`);
                    this.isLoaderEnabled = false;
                }
            });
        }
    }
}
