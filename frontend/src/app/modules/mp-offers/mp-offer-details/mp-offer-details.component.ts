import { Component, ViewEncapsulation, OnInit, Inject, LOCALE_ID, OnDestroy } from "@angular/core";
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from "@angular/forms";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { CommonService } from "src/app/shared/services/common.service";
import { PanelBarData } from "./panel-bar-data";

import { MPOffer } from "src/app/models/mp-offer";
import { MPOfferPos } from "src/app/models/mp-offer-pos";
import { Customer } from "src/app/models/customer";
import { MPMaterial } from "src/app/models/mp-materials";
import { MPCostSubGroup } from "src/app/enums/mp-cost-sub-group";
import { MPCostGroup } from "src/app/enums/mp-cost-group";
import { ODataBatchCall } from "src/app/models/odata-batch-call";
import { MpOfferTypeClass } from "src/app/enums/mp-offer-type";
import { Supplier } from "src/app/models/supplier";
import { CldrIntlService, IntlService } from "@progress/kendo-angular-intl";
import { ComboFilter } from "src/app/shared/classes/combo-filter";
import { Notification } from 'src/app/shared/services/notification.service';

import { MPV9Service } from "@shared/services/mp_v9.service";
import { AuthService } from "@app/services/auth.service";

import { Subscription } from "rxjs";
import { MpOfferService } from "../services/mp-offer.service";
import { LocaleService } from "@app/shared/services/locale.service";

@Component({
    selector: "app-details",
    templateUrl: "./mp-offer-details.component.html",
    styleUrls: ["./mp-offer-details.component.scss"],
    encapsulation: ViewEncapsulation.None,
})
export class DetailsComponent implements OnInit, OnDestroy {
    public mpOffer?: MPOffer;
    customers?: Customer[];
    mpMaterials?: MPMaterial[];
    suppliers?: Supplier[];

    //Necessary for UI
    costGroup = MPCostGroup;
    costSubGroup = MPCostSubGroup;

    public panelBarDetails: any;
    public form!: FormGroup;

    public isLoaderEnabled: boolean = false;
    public offerDetailsID: any;
    public isGetRootItem: boolean = false;

    public materialCostData1: any = [{}];

    public offerTypeDataSrc!: Array<{ value: string; text: string }>;

    public isPosDataLoaded = false;
    public cmbFltr: any;

    private pageLeaveSubscription!: Subscription;
    private formSubscription!: Subscription;
    private isFormUpdated: boolean = false;

    private offerClosedState: boolean = false;
    public showCloneWarning: boolean = false;
    public logDataType: string = '';

    constructor(
        @Inject(LOCALE_ID) protected locale: string,
        protected formBuilder: FormBuilder,
        protected activatedRoute: ActivatedRoute,
        protected router: Router,
        protected commonService: CommonService,
        public intl: IntlService,
        private _v9srv: MPV9Service,
        protected authService: AuthService,
        public notifications: Notification,
        private mpOfferSrv: MpOfferService,
        private localeSrv: LocaleService
    ) {
        this.pageLeaveSubscription = this.mpOfferSrv.isLeave$.subscribe((isLeave: boolean) => {
            if (isLeave) this.closeOfferDetails();
        });
        this.localeSrv.setLocale(this.locale);
    }

    ngOnInit(): void {
        (<CldrIntlService>this.intl).localeId = "it-IT";

        this.mpOfferSrv.isHome = false;
        this.mpOfferSrv.ctrlKeyPressed = false;
        this.mpOfferSrv.updateValue(false);
        this.commonService.currentModule = 'mp-offers';
        this.offerTypeDataSrc = new MpOfferTypeClass().getEnumArray();
        this.cmbFltr = new ComboFilter(this.offerTypeDataSrc);
        this.loadData();
        this.panelBarDetails = PanelBarData.data;
        this.getFormsStructure();

        this.formSubscription = this.mpOfferSrv.isDirty$.subscribe();

        if (this.mpOfferSrv.isCloneWarningMsg) this.showCloneWarning = true;
    }

    ngOnDestroy(): void {
        if (this.pageLeaveSubscription) this.pageLeaveSubscription.unsubscribe();
        if (this.formSubscription) this.formSubscription.unsubscribe();
        this.commonService.currentModule = '';
    }

    closeCloneWarningModal() {
        this.showCloneWarning = false;
        this.mpOfferSrv.isCloneWarningMsg = false;
    }

    onFormChange(event: any) {
        if (event) this.isFormUpdated = true;
        else this.isFormUpdated = false;
    }

    loadData() {
        this.activatedRoute.paramMap.subscribe((params: ParamMap) => {
            this.isLoaderEnabled = true;
            this.offerDetailsID = params.get("id");
            let posReqArr: any = [];
            let reqBody = {
                id: 0,
                method: "get",
                headers: {
                    "content-type": "application/json",
                },
                url: `\/odata\/MpOffers(${this.offerDetailsID})?$expand=mpOfferPos($expand=mpMaterial,supplier,machine,mpCost($expand=mpCostMachines($expand=machine))),customer,finalCustomer,user,parentOffer`,
            };
            posReqArr.push(reqBody);
            let reqBody2 = {
                id: 1,
                method: "get",
                headers: {
                    "content-type": "application/json",
                },
                url: `\/odata\/Customers?$select=id,name&$top=10000000`,
            };
            posReqArr.push(reqBody2);
            let reqBody3 = {
                id: 2,
                method: "get",
                headers: {
                    "content-type": "application/json",
                },
                url: `\/odata\/MpMaterials?$select=id,custom_id,name,density,price&$top=10000000`,
            };
            posReqArr.push(reqBody3);

            let reqBody4 = {
                id: 3,
                method: "get",
                headers: {
                    "content-type": "application/json",
                },
                url: `\/odata\/Suppliers?$select=id,custom_id,name&$top=10000000`,
            };
            posReqArr.push(reqBody4);

            const requests = {
                requests: posReqArr,
            };

            this.commonService["post"]("$batch", requests).subscribe({
                next: (response: any) => {
                    if (response.responses[0].status == 200) {
                        this.mpOffer = new MPOffer().deserialize(
                            response.responses[0].body
                        );

                        if (this.mpOffer != undefined) {
                            if (this.mpOffer.is_closed) {
                                this.form.disable();
                            } else {
                                this.form.enable();
                            }
                            this.offerClosedState = this.mpOffer.is_closed ? true : false;

                            this.mpOffer.surplus_material = this.mpOffer.surplus_material ? (this.mpOffer.surplus_material * 100) : 0;
                            this.mpOffer.surplus_external = this.mpOffer.surplus_external ? (this.mpOffer.surplus_external * 100) : 0;
                            this.mpOffer.surplus_internal = this.mpOffer.surplus_internal ? (this.mpOffer.surplus_internal * 100) : 0;
                            this.mpOffer.surplus_total = this.mpOffer.surplus_total ? (this.mpOffer.surplus_total * 100) : 0;
                            this.mpOffer.surplus_internal_personnel = this.mpOffer.surplus_internal_personnel ? (this.mpOffer.surplus_internal_personnel * 100) : 0;
                            this.mpOffer.surplus_internal_machine = this.mpOffer.surplus_internal_machine ? (this.mpOffer.surplus_internal_machine * 100) : 0;
                        }
                    }
                    if (response.responses[1].status == 200) {
                        var customer_arr = response.responses[1].body;
                        this.customers = [];
                        customer_arr.value?.forEach((customer_arr: any) =>
                            this.customers?.push(
                                new Customer().deserialize(customer_arr)
                            )
                        );
                    }
                    if (response.responses[2].status == 200) {
                        var materials_arr = response.responses[2].body;
                        this.mpMaterials = [];
                        materials_arr.value?.forEach((materials_arr: any) =>
                            this.mpMaterials?.push(
                                new MPMaterial().deserialize(materials_arr)
                            )
                        );
                    }

                    if (response.responses[3].status == 200) {
                        var supplier_arr = response.responses[3].body;
                        this.suppliers = [];
                        supplier_arr.value?.forEach((supplier_arr: any) =>
                            this.suppliers?.push(
                                new Supplier().deserialize(supplier_arr)
                            )
                        );
                    }

                    this.isLoaderEnabled = false;
                    this.isPosDataLoaded = true;
                },
                error: (e) => {
                    this.isLoaderEnabled = false;
                    this.notifications.showError($localize`Something went wrong while getting data.`);
                },
            });
        });

        if (this.mpOffer?.is_saved) this.mpOfferSrv.updateValue(true);
    }

    getMpOfferPosForSubGroup(costSubGroup: MPCostSubGroup): MPOfferPos[] {
        if (this.mpOffer && this.mpOffer.mpOfferPos)
            return this.mpOffer.mpOfferPos.filter(
                (mpOfferPos) => mpOfferPos.cost_sub_group == costSubGroup
            );
        else return [];
    }

    getFormsStructure() {
        this.form = this.formBuilder.group({
            id: 0,
            custom_id: [null, Validators.required],
            date_offer: [null, Validators.required],
            name: [null, Validators.required],
            mp_offer_type: [null, Validators.required],
            version: new FormControl(),
        });
    }

    panelEvt(item: any, evt_typ: any) {
        switch (evt_typ) {
            case "x":
                item.isSelected = true;
                item.isExpanded = true;
                break;
            case "c":
                item.isSelected = false;
                item.isExpanded = false;
                break;
        }
    }

    printOfferDetails() {
        this.isLoaderEnabled = true;
        var locale = '';
        if (this.locale == 'en-EN' || this.locale == 'en') locale = 'en';
        else if (this.locale == 'de-DE' || this.locale == 'de') locale = 'de';
        else if (this.locale == 'it-IT' || this.locale == 'it') locale = 'it';

        this.commonService[`postFile`](`mp-offer-details/${this.offerDetailsID}/print/${locale}`, [], false).subscribe({
            next: async (response: any) => {
                const blob = new Blob([response], { type: "application/pdf" });
                let printWindow = window.open(window.URL.createObjectURL(blob));
                printWindow?.document.close();
                printWindow?.focus();
                this.isLoaderEnabled = false;
            },
            error: (e: any) => {
                this.isLoaderEnabled = false;
                if (e == 'Unauthenticated.') this.mpOfferSrv.navigateToExternalUrl(this.mpOfferSrv.pathLink);
                else this.notifications.showError($localize`Something went wrong.`);
            },
        });
    }

    deleteOffer() {
        this.commonService.delete(`MpOffers(${this.offerDetailsID})`)
            .subscribe({
                next: (response: any) => {
                    this.isLoaderEnabled = false;
                    this.routerChange();
                },
                error: (e) => {
                    this.isLoaderEnabled = false;
                    this.notifications.showError($localize`Something went wrong`);
                }
            })
    }

    closeOfferDetails(isCancelButton: boolean = false) {
        if (isCancelButton) this.mpOfferSrv.isHome = false;

        let formEditNotSaved: boolean = false;
        this.mpOfferSrv.isDirty$.subscribe((value: boolean) => {
            formEditNotSaved = value;
        });

        let offerNotSaved: boolean = this.mpOffer && (this.mpOffer?.is_cloned && !this.mpOffer.is_saved) || (this.mpOffer?.name == null || this.mpOffer.name == '') || ((this.mpOffer?.name != null || this.mpOffer.name != '') && !this.mpOffer?.is_saved);

        var titleMsg = $localize`Warning`;
        var contentMsg = $localize`You have unsaved data. Do you want to leave the  page?`;

        if (this.mpOfferSrv.isHome && this.mpOfferSrv.ctrlKeyPressed) this.mpOfferSrv.openNewTab(this.mpOfferSrv.pathLink);
        else {
            if (offerNotSaved) {
                this.notifications.confirmCustomAction(titleMsg, contentMsg).subscribe((result: any) => {
                    if (result.action == 'next') {
                        this.isLoaderEnabled = true;
                        this.deleteOffer();
                    } else if (result.action == 'canceled') { }
                });
            } else if (formEditNotSaved || this.isFormUpdated) {
                this.notifications.confirmCustomAction(titleMsg, contentMsg).subscribe((result: any) => {
                    if (result.action == 'next') {
                        this.isLoaderEnabled = false;
                        this.routerChange();
                    } else if (result.action == 'canceled') { }
                });
            } else this.routerChange();
        }
    }

    routerChange(): void {
        if (this.mpOfferSrv.isHome && !this.mpOfferSrv.ctrlKeyPressed) this.mpOfferSrv.navigateToExternalUrl(this.mpOfferSrv.pathLink);
        else this.router.navigate(["mp-offers/", "overview"]);

        this.mpOfferSrv.markAsClean();
        this.pageLeaveSubscription.unsubscribe();
    }

    replaceUndefinedWithEmptyString(obj: any): any {
        let result: any = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key] !== undefined ? obj[key] : null;
            }
        }
        return result;
    }

    setLogType(event: string) {
        switch (event) {
            case 'create':
                this.logDataType = 'CREATED_OFFER';
                break;
            case 'edit':
                this.logDataType = 'UPDATED_OFFER';
                break;
            case 'close':
                this.logDataType = 'CLOSED_OFFER';
                break;
            case 'reopen':
                this.logDataType = 'REOPENED_OFFER';
                break;
            case 'update_project':
                this.logDataType = 'UPDATED_PROJECT_ORDER';
                break;
            default:
                this.logDataType = '';
                break;
        }
    }

    saveOfferLog() {
        this.isLoaderEnabled = true;
        var logData = {
            'user_id': this.authService.user ? this.authService.user.id : null,
            'mp_offer_id': this.mpOffer!.id,
            'description': this.logDataType,
            'project_order': this.mpOffer!.project_nr,
            'log_date': this.localeSrv.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };

        this.commonService['post']('MpOfferLogs', logData).subscribe({
            next: async (response: any) => {
                this.isLoaderEnabled = false;
                if (response && response.id) this.notifications.showSuccess($localize`Log is saved successfully.`);
                else this.notifications.showError($localize`Something went wrong while saving logs.`);
            },
            error: (e: any) => {
                this.isLoaderEnabled = false;
                this.notifications.showError($localize`Something went wrong while saving logs.`);
            }
        });
    }

    generateCustomId() {
        this.commonService.getGeneratedId('MpOffer').subscribe({
            next: (res: any) => {
                this.mpOffer!.custom_id = res;
                this.saveOfferDetails();
            },
            error: (err: any) => {
                this.notifications.showError($localize`Something went wrong.See the backend logs.`);
                this.deleteOffer();
                this.isLoaderEnabled = false;
            }
        });
    }

    checkOfferValidity() {
        this.isLoaderEnabled = true;
        this.isFormUpdated = false;
        if (this.mpOffer) {
            let checkvalidity = this.mpOffer.name && this.mpOffer.mp_offer_type && this.mpOffer.customer && this.mpOffer.tool_type && this.mpOffer.construction_type;
            if (checkvalidity && (this.mpOffer.is_closed != null || this.mpOffer.is_closed != undefined)) {
                let checkRatios = (this.mpOffer.surplus_material != undefined && (this.mpOffer.surplus_material == 0 || (this.mpOffer.surplus_material > 0 && this.mpOffer.surplus_material <= 999))) &&
                    (this.mpOffer.surplus_external != undefined && (this.mpOffer.surplus_external == 0 || (this.mpOffer.surplus_external > 0 && this.mpOffer.surplus_external <= 999))) &&
                    (this.mpOffer.surplus_internal != undefined && (this.mpOffer.surplus_internal == 0 || (this.mpOffer.surplus_internal > 0 && this.mpOffer.surplus_internal <= 999))) &&
                    (this.mpOffer.surplus_total != undefined && (this.mpOffer.surplus_total == 0 || (this.mpOffer.surplus_total > 0 && this.mpOffer.surplus_total <= 999))) &&
                    (this.mpOffer.surplus_internal_personnel != undefined && (this.mpOffer.surplus_internal_personnel == 0 || (this.mpOffer.surplus_internal_personnel > 0 && this.mpOffer.surplus_internal_personnel <= 999))) &&
                    (this.mpOffer.surplus_internal_machine != undefined && (this.mpOffer.surplus_internal_machine == 0 || (this.mpOffer.surplus_internal_machine > 0 && this.mpOffer.surplus_internal_machine <= 999)));

                if (checkRatios) {
                    if (this.mpOffer.custom_id == null) {
                        if (this.mpOffer.is_cloned && this.mpOfferSrv.clonetype == 'duplicate') {
                            this.mpOffer.custom_id = this.mpOffer.parentOffer?.custom_id;
                            this.saveOfferDetails();
                        } else this.generateCustomId();
                    } else this.saveOfferDetails();
                } else {
                    this.notifications.showError($localize`The ratio should be between 0 to 999%.`);
                    this.isLoaderEnabled = false;
                }
            } else {
                this.notifications.showError($localize`Fill the required fields.`);
                this.isLoaderEnabled = false;
            }
        }
    }

    async saveOfferDetails() {
        let requests: ODataBatchCall[] = [];
        if (this.mpOffer) {
            if (!this.mpOffer.is_saved) {
                this.mpOffer.is_saved = true;
                this.setLogType('create');
            } else this.setLogType('edit');

            if (this.mpOffer.project_nr) {
                this.setLogType('update_project');
                this.mpOffer.is_closed = true;
            } else {
                if (this.offerClosedState != this.mpOffer.is_closed) {
                    if (this.mpOffer.is_closed) this.setLogType('close');
                    else this.setLogType('reopen');
                }
            }

            let call = new ODataBatchCall(
                requests.length,
                "put",
                `\/odata\/MpOffers(${this.mpOffer.id})`
            );

            let tempOffer: any = this.mpOffer.toOdata();
            tempOffer.surplus_material = tempOffer.surplus_material ? (tempOffer.surplus_material / 100) : 0;
            tempOffer.surplus_external = tempOffer.surplus_external ? (tempOffer.surplus_external / 100) : 0;
            tempOffer.surplus_internal = tempOffer.surplus_internal ? (tempOffer.surplus_internal / 100) : 0;
            tempOffer.surplus_total = tempOffer.surplus_total ? (tempOffer.surplus_total / 100) : 0;
            tempOffer.surplus_internal_personnel = tempOffer.surplus_internal_personnel ? (tempOffer.surplus_internal_personnel / 100) : 0;
            tempOffer.surplus_internal_machine = tempOffer.surplus_internal_machine ? (tempOffer.surplus_internal_machine / 100) : 0;

            const outputObject = this.replaceUndefinedWithEmptyString(tempOffer);
            call.body = outputObject;
            requests.push(call);

            this.mpOffer.mpOfferPos?.forEach((mpOfferPos) => {
                call = new ODataBatchCall(
                    requests.length,
                    "put",
                    `\/odata\/MpOfferPos(${mpOfferPos.id})`
                );
                let tempPos = mpOfferPos.toOdata();

                const outputObject = this.replaceUndefinedWithEmptyString(tempPos);
                call.body = outputObject;
                requests.push(call);
            });

            this.commonService["post"]("$batch", {
                requests: requests,
            }).subscribe({
                next: async (res: any) => {
                    if (res && res.responses && (res.responses[0].status == 200 || res.responses[0].status == 201)) {
                        this.notifications.showSuccess($localize`Data is updated successfully.`);
                        this.mpOfferSrv.markAsClean();
                        this.saveOfferLog();

                        /// send data to project-visu  if any project is connected to this offer.
                        if (this.mpOffer?.project_nr) await this.saveDataToProjectvisu();
                        else this.isLoaderEnabled = false;
                    } else {
                        this.isLoaderEnabled = false;
                        this.notifications.showError($localize`Something went wrong.See the backend logs.`);
                    }
                },
                error: (e) => {
                    this.isLoaderEnabled = false;
                    this.notifications.showError($localize`Something went wrong.See the backend logs.`);
                },
            });
        }
    }

    async saveDataToProjectvisu(): Promise<any> {
        this.commonService.get(`MpOffers(${this.mpOffer?.id})?$expand=customer,finalCustomer,user`).subscribe({
            next: (res: any) => {
                var offer = res;
                var offerImgaeData: any[] = [];
                var isConnectedProject: boolean = false;

                this.commonService.get("media/MpOffer/" + this.mpOffer?.id, false).subscribe({
                    next: (response: any) => {
                        var file_arr = response.media;
                        if (file_arr && Object.keys(file_arr).length > 0) {
                            file_arr.forEach((elm: any) => {
                                let tempImg = {
                                    'file_name': elm.file_name,
                                    'original_path': elm.original_url,
                                    'mime_type': elm.mime_type,
                                    'is_standard': elm.is_selected
                                };
                                offerImgaeData.push(tempImg);
                            });
                        }

                        var post_data = {
                            "isMpOffer": 1,
                            "ordernr": offer?.project_nr,
                            "ordername": offer?.name,
                            "projectlead": offer?.user?.custom_id,
                            "customerid": offer?.customer?.custom_id ?? null,
                            "endcustomerid": offer?.finalCustomer?.custom_id ?? null,
                            "orderdesc": offer?.note ?? '',
                            "offerImage": offerImgaeData
                        }
                        this._v9srv.saveProject(post_data).subscribe({
                            next: () => {
                                isConnectedProject = true;
                                this.notifications.showSuccess($localize`Project is updated successfully.`);
                            },
                            error: (e: any) => {
                                isConnectedProject = false;
                                if(e == 'OK') this.notifications.showSuccess($localize`Project is updated successfully.`);                 
                                else this.notifications.showError($localize`Something went wrong while connecting to Projectvisu.`);
                            }
                        });

                        var temp = {
                            'is_closed': true
                        };
                        this.commonService['put'](`MpOffers(${this.mpOffer?.id})`, temp).subscribe({
                            next: () => {
                                this.notifications.showSuccess($localize`Offer is closed.`);
                                this.isLoaderEnabled = false;
                            },
                            error: (e: any) => {
                                this.isLoaderEnabled = false;
                                this.notifications.showError($localize`Something went wrong while closing the offer.`);
                            }
                        });
                    },
                    error: (e: any) => {
                        this.notifications.showError($localize`Something went wrong while getting imgaes.`);
                    },
                });
            }
        });
    }

    onBack(): void {
        this.isLoaderEnabled = false;
        this.router.navigate(["mp-offers/", "overview"]);
    }

    handleFilter(value: String) {
        this.offerTypeDataSrc = this.cmbFltr.handleLocalDataFilter(
            value,
            "text"
        );
    }

    //THIS METHOD IS ADDED TO PREVENT ON ENTER PRESS PRINT
    onKeypressEvent(event: KeyboardEvent) {
        event.preventDefault();
        let even = new KeyboardEvent('keypress', { bubbles: true, keyCode: 9, key: "Tab", code: "Tab" });

    }

    onChangeMedia() {
        if (this.mpOffer?.project_nr) {
            this.isLoaderEnabled = true;
            this.saveDataToProjectvisu();
        }
    }
}
