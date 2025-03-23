import {Component, ComponentRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {GridProperty} from 'src/app/shared/classes/grid-property';
import {CommonService} from 'src/app/shared/services/common.service';
import {OfferDetailsComponent} from './offer-details/offer-details.component';
import {HweKalkService} from '@app/modules/hwe-kalk/hwe-kalk.service'
import {OfferStatusClass} from '@app/modules/hwe-kalk/enums/offer-status';
import {OfferPhaseClass} from '@app/modules/hwe-kalk/enums/offer-phase';
import {ActivatedRoute} from '@angular/router';
import {Offer} from '@app/models/offer';
import {HweKalkLog} from '@app/models/hwe-kalk-log';
import {retry} from 'rxjs';
import {Notification} from 'src/app/shared/services/notification.service';
import { readCookie } from '@app/shared/helpers/read-cookie';

@Component({
    selector: 'app-offers',
    templateUrl: './offers.component.html',
    styleUrls: ['./offers.component.scss']
})
export class OffersComponent extends GridProperty implements OnInit {
    public isWindowLoaderEnabled: boolean = false;
    public logDialogOpened: boolean = false;
    public offerLogs: HweKalkLog[] = [];
    public formData: any;
    public isStatusArchived: boolean = false;
    public cmpRef!: ComponentRef<any>;
    public columns = this.getColumns();
    public addWindowEvent!: Event;
    public editView = {
        actionButton: "edit",
        modalTemplate: OfferDetailsComponent,
        modalWidth: "95vw",
        isCustomizedHandler: true,
        showCloseButton: false,
        actionColumnWidth: 200,
        hasEditCommand: true,
        hasRemoveCommand: this.authService.isPermissionValidate('HWEKALK_OFFER_DELETE'),
        isHiddenActionColumn: !this.isHiddenActionColumn()
    };

    isHiddenActionColumn() {
        return this.authService.isPermissionValidate('HWEKALK_OFFER_DELETE')
            || this.authService.isPermissionValidate('HWEKALK_OFFER_EDIT')
            || this.authService.isPermissionValidate('HWEKALK_OFFER_CRM_UPLOAD')
            || this.authService.isPermissionValidate('HWEKALK_OFFER_LOG_VIEW')
    }

    public deleteAction = {
        actionButton: "edit",
        modalTemplate: OfferDetailsComponent,
        modalWidth: "73vw"
    };

    public toolbarConfig = {
        title: $localize`Offers`,
        hasAddCommand: this.authService.isPermissionValidate('HWEKALK_OFFER_CREATE'),
        hasSearch: this.authService.isPermissionValidate('HWEKALK_OFFER_SEARCH_INPUT_VIEW')
    }

    @ViewChild('modalBody', {read: ViewContainerRef}) modalBody!: ViewContainerRef;

    constructor(_commonService: CommonService,
                protected hweKalkService: HweKalkService,
                protected route: ActivatedRoute,
                protected _notification: Notification
    ) {
        super(_commonService)
    }


    actionByUser(event: string) {
        switch (event) {
            case "update":
                return $localize`Updated By`;
            case "updateCRM":
                return $localize`CRM Updated By`;
            default:
                return $localize`Created By`;
        }
    }

    ngOnInit(): void {
        this.state.take = 30;
        this.route.params.subscribe(params => {
            const phaseParam = params['phase'];
            this.state.filter?.filters.pop()
            if (phaseParam == 'techincal-assessment') this.state.filter?.filters.push({
                field: 'phase',
                operator: 'eq',
                value: 'TECHN_ASSESSMENT'
            })
            else if (phaseParam == 'calc') this.state.filter?.filters.push({
                field: 'phase',
                operator: 'eq',
                value: 'CALC'
            })
            else if (phaseParam == 'calc-mechanic') this.state.filter?.filters.push({
                field: 'phase',
                operator: 'eq',
                value: 'CALC_MECH_ED'
            })
            else if (phaseParam == 'obtain-external-quote') this.state.filter?.filters.push({
                field: 'phase',
                operator: 'eq',
                value: 'OBTAIN_EXTERNAL_QUOTE'
            })
            else if (phaseParam == 'quotation-creation') this.state.filter?.filters.push({
                field: 'phase',
                operator: 'eq',
                value: 'QUOTATION_CREATION'
            })
            this.columns = this.getColumns(phaseParam);
            this.callRequest()
        });
    }

    onAdd(event: PointerEvent) {
        this.isWindowLoaderEnabled = true;
        let formValue = this.cmpRef.instance.form.value
        return this._commonService.post('Offers', formValue)
    }

    public openLog(offer: Offer): void {
        this.isLoadedEnabled = true;
        this._commonService.get(`HweKalkLogs?filter=loggable_id eq ${offer.id} and entity eq 'Offer'&expand=user`).subscribe({
            next:(response:any)=>{
                console.log(response)
                this.offerLogs = response.value
                this.offerLogs?.sort((a: HweKalkLog, b: HweKalkLog) => {
                    return new Date(b.created_at  || "")?.getTime() - new Date(a.created_at || '')?.getTime();
                });
                this.isLoadedEnabled = false;
    
            this.logDialogOpened = true;
            }, error:( e:any) => this.isLoadedEnabled = false
        })
       
           
    }

    public close(): void {
        this.logDialogOpened = false;
        this.offerLogs = [];
    }

    deleteDataItem(dataItem: any) {
        this.onRemoveItem(`Offers(${dataItem.id})`, dataItem.id, 'Offer')
    }

    public cancelHandler(): void {
        this.formData = undefined
        if (this.cmpRef.instance.onCancel) this.cmpRef.instance.onCancel();
    }

    public statusArchived(): void {
        this.isStatusArchived = !this.isStatusArchived;
        this.callRequest();
    }

    callRequest() {
        let query = this.isStatusArchived ? "&$filter=status eq 'ARCHIVED'" : "&$filter=status ne 'ARCHIVED' or status eq null or status eq ''";
        this.url = `Offers?expand=salesArea,user(select=id,name),customer(select=id,name),salesOpportunity&$orderby=id desc${query}`;
        this.sendRequest();
    }

    getColumns(phaseParam = '') {
        return [
            {
                name: "custom_id",
                title: $localize`Offer`,
                filterable: true
            },
            {
                name: "salesArea.name",
                title: $localize`Sales Area`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "customer.name",
                title: $localize`Customer`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "salesOpportunity.custom_id",
                title: $localize`Sales Opportunity`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "contact_person",
                title: $localize`Contact Person`,
                filterable: true,
            },
            {
                name: "request_date",
                title: $localize`Request Date`,
                filterType: "date",
                filterable: true,
            },
            {
                name: "offer_until_date",
                title: $localize`Offer Until Date`,
                filterType: "date",
                filterable: true,
            },
            {
                name: "user.name",
                title: $localize`User`,
                filterable: true,
                filterType: 'multiLayer'
            },
            {
                name: "version",
                title: $localize`Version`,
                filterable: true
            },
            {
                name: "status",
                title: $localize`Status`,
                filterable: true,
                filterType: 'enum',
                dropdownList: OfferStatusClass.getEnumArray(),
                dropdownFilterableList: OfferStatusClass.getEnumArray(),
                isCustomCell: true
            },
            {
                name: "phase",
                title: $localize`Phase`,
                filterable: true,
                filterType: 'enum',
                dropdownList: OfferPhaseClass.getEnumArray(),
                dropdownFilterableList: OfferPhaseClass.getEnumArray(),
                isCustomCell: true,
                hideColumnMenu: phaseParam ? true : false
            }
        ]
    }

    getEnumTranslateGrid(column: string, data: String) {
        var transEnum: String = '';
        if (column == 'status') {
            transEnum = OfferStatusClass.getStateTranslate(data);
        } else if (column == 'phase') {
            transEnum = OfferPhaseClass.getStateTranslate(data);
        }
        return transEnum;
    }

    exportOffer(dataItem: any) {
        this.isLoadedEnabled = true;
        let body = {
            id: dataItem.id
        }
        this._commonService.post('hwe-kalk/export-offer', body, false)
            .pipe(
                retry(1)
            )
            .subscribe({
                next: (response: any) => {
                    if (response.success) {
                        //TODO: Also send update to opportunity

                        this.sendRequest();
                        this._notification.showSuccess($localize`Offer with  offer pos exported succesfully`);
                    } else {
                        this.isLoadedEnabled = false;
                        this._notification.showError($localize`Customer CRM ID is not available for this Offer `);
                    }
                },
                error: (error) => {
                    this.isLoadedEnabled = false;
                    this._notification.showError($localize`Something went wrong`);
                }
            })
    }
    downloadOfferPos(dataItem: Offer) {
        let locale = readCookie('sct_language') ?? 'de';

        this.isLoadedEnabled = true;
        this._commonService.post(`hwe-kalk/offer-pos-summary/${dataItem.id}/pdf/${locale}/true`, [], false,).subscribe({
            next: (response: any) => {
                const fileUrl = response.path; 
                const fileName = `${dataItem.custom_id}.zip`;
                this.isLoadedEnabled = false;
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            },
            error: (e: any) => {
                this.notifications.showError($localize`Something went wrong.`);
                this.isLoadedEnabled = false;
            }
        });

    }
}
