import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, FormControl } from "@angular/forms";
import { MPOffer } from "@app/models/mp-offer";
import { User } from "@app/models/user";
import { ComboFilter } from "@app/shared/classes/combo-filter";
import { CommonService } from "@app/shared/services/common.service";
import { MPV9Service } from "@shared/services/mp_v9.service";

import { Notification } from '@shared/services/notification.service';
import { AuthService } from "@app/services/auth.service";
import { LocaleService } from "@app/shared/services/locale.service";

@Component({
    selector: "app-project-window",
    templateUrl: "./project-window.component.html",
    styleUrls: ["./project-window.component.scss"],
})
export class ProjectWindowComponent implements OnInit {
    @Input() offer?: MPOffer;
    @Input() users?: User[];

    @Output() sendNotification = new EventEmitter<string>();

    private _v9srv: any;
    private _commonService: any;
    public form!: FormGroup;
    public project_nr: number = 0;
    public offerdProjectNr!: number;
    private cmbFltrUser: any;

    public errorMsg: string = "";

    public isLoaderEnabled: boolean = false;
    public offerImgaeData: any = [];
    public logDataType: string = '';

    constructor(_v9srv: MPV9Service,
        @Inject(LOCALE_ID) protected locale: string,
        protected formBuilder: FormBuilder,
        _commonService: CommonService,
        public notification: Notification,
        private authService: AuthService,
        private localeSrv: LocaleService) {
        this._v9srv = _v9srv;
        this._commonService = _commonService;
        this.localeSrv.setLocale(this.locale);
    }

    ngOnInit(): void {
        this.isLoaderEnabled = true;
        var currYear = new Date().getFullYear();
        if (!this.offer?.project_nr) {
            this._v9srv.getProjectID(currYear).subscribe({
                next: async (response: any) => {
                    this.project_nr = parseInt(response[0].max_order);
                    this.offerdProjectNr = parseInt(response[0].max_order);
                    this.isLoaderEnabled = false;
                },
                error: (e: any) => {
                    this.isLoaderEnabled = false;
                    this.notification.showError($localize`Something went wrong`);
                }
            });
        } else {
            this.project_nr = parseInt(this.offer?.project_nr);
            this._v9srv.getProjectID(currYear).subscribe({
                next: async (response: any) => {
                    this.offerdProjectNr = parseInt(response[0].max_order);
                    this.isLoaderEnabled = false;
                },
                error: (e: any) => {
                    this.isLoaderEnabled = false;
                    this.notification.showError($localize`Something went wrong`);
                }
            });
        }

        this.cmbFltrUser = new ComboFilter(this.users);

        this.getFormsStructure();
    }

    getFormsStructure() {
        this.form = this.formBuilder.group({
            custom_id: new FormControl(),
            name: new FormControl(),
            user: new FormControl()
        });
    }

    setLogType(event: string) {
        switch (event) {
            case 'close':
                this.logDataType = 'CLOSED_OFFER';
                break;
            case 'connect_project':
                this.logDataType = 'CONNECT_TO_PROJECT';
                break;
            case 'reopen':
                this.logDataType = 'REOPENED_OFFER';
                break;
            case 'disconnect_project':
                this.logDataType = 'DISCONNECTED_PROJECT';
                break;
            default:
                this.logDataType = '';
                break;
        }
    }

    saveOfferLog() {
        this.isLoaderEnabled = true;
        let logData = {
            'user_id': this.authService.user ? this.authService.user.id : null,
            'mp_offer_id': this.offer!.id,
            'description': this.logDataType,
            'project_order': this.project_nr,
            'log_date': this.localeSrv.format(new Date(), 'yyyy-MM-dd HH:mm:ss')

        };

        this._commonService['post']('MpOfferLogs', logData).subscribe({
            next: async (response: any) => {
                this.isLoaderEnabled = false;
                if (response && response.id) this.notification.showSuccess($localize`Log is saved successfully.`);
                else this.notification.showError($localize`Something went wrong while saving logs.`);
            },
            error: (e: any) => {
                this.isLoaderEnabled = false;
                this.notification.showError($localize`Something went wrong while saving logs.`);
            }
        });
    }

    saveProject() {
        if (this.project_nr) {
            var customer_id = null;
            var final_customer_id = null;
            this.errorMsg = "";
            this.isLoaderEnabled = true;

            if (this.offer?.customer?.custom_id) customer_id = this.offer?.customer?.custom_id;
            if (this.offer?.finalCustomer?.custom_id) final_customer_id = this.offer?.finalCustomer?.custom_id;
            if (this.offer?.user == null) this.errorMsg += $localize`Please Select An User<br>`;
            if (this.project_nr > this.offerdProjectNr) this.errorMsg += $localize`Unvalid Project Number Max: ` + this.offerdProjectNr + `<br>`;

            if (this.errorMsg == "") {
                this._commonService.get(`MpOffers?$filter=project_nr eq '${this.project_nr}'`).subscribe({
                    next: (response: any) => {
                        var existingOffers = response.value;
                        if (existingOffers.length == 0) {
                            this.offer!.project_nr = this.project_nr.toString();
                            this.saveData();
                        } else {
                            if (this.offer?.id == existingOffers[0].id) {
                                this.offer!.project_nr = this.project_nr.toString();
                                this.saveData();
                            } else {
                                this.errorMsg = $localize`Project is already connected`;
                                this.isLoaderEnabled = false;
                            }
                        }
                    },
                    error: (e: any) => { }
                });
            } else this.isLoaderEnabled = false;
        } else {
            if (this.offer?.project_nr) {
                var titleMsg = $localize`Disconnect Project`;
                var contentMsg = $localize`This action will disconnect the offer from the project. Do you want to continue?`;
                this.notification.confirmCustomAction(titleMsg, contentMsg).subscribe((result: any) => {
                    if (result.action == 'next') {
                        this.isLoaderEnabled = true;
                        var temp = {
                            'project_nr': null,
                            'user_id': this.authService.user.id
                        }
                        this._commonService['put'](`MpOffers(${this.offer?.id})`, temp).subscribe({
                            next: (res: any) => {
                                this.setLogType('disconnect_project');
                                this.notification.showSuccess($localize`Project is successfully disconnected to the offer.`);
                                this.sendNotification.emit("CLOSE");
                                this.saveOfferLog();
                            },
                            error: (e: any) => {
                                this.isLoaderEnabled = false;
                                this.notification.showError($localize`Something went wrong.See the backend logs.`);
                            }
                        });
                    } else if (result.action == 'canceled') this.sendNotification.emit("CLOSE");
                });
            } else this.notification.showError($localize`Project field is null.`);
        }
    }
    
    async getOfferImage(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._commonService.get("media/MpOffer/" + this.offer?.id, false).subscribe({
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
                            this.offerImgaeData.push(tempImg);
                        });
                    }
                    resolve(true); 
                },
                error: (e: any) => {
                    reject(e); 
                }
            });
        });
    }

    async saveData(): Promise<any> {
        this.isLoaderEnabled = true;
        this.setLogType('connect_project');
    
        try {
            await this.getOfferImage();
    
            const offer_note = this.offer?.note ?? '';
            var post_data = {
                "isMpOffer": 1,
                "ordernr": this.offer?.project_nr,
                "ordername": this.offer?.name,
                "projectlead": this.offer?.user?.custom_id ?? null,
                "customerid": this.offer?.customer?.custom_id ?? null,
                "endcustomerid": this.offer?.finalCustomer?.custom_id ?? null,
                "orderdesc": offer_note,
                "offerImage": this.offerImgaeData
            };
    
            this._v9srv.saveProject(post_data).subscribe({
                next: (response: any) => {
                    this.notification.showSuccess($localize`Project is updated successfully.`);
                    this.saveOfferDetails();
                },
                error: (e: any) => {
                    if (e == 'OK') {
                        this.notification.showSuccess($localize`Project is updated successfully.`);
                        this.saveOfferDetails();
                    } else this.notification.showError($localize`Something went wrong while connecting to Projectvisu.`);
                }
            });
        } catch (error) {
            this.notification.showError($localize`Something went wrong while getting images.`);
        } finally {
            this.isLoaderEnabled = false;
        }
    }

    saveOfferDetails() {
        this.offer!.is_closed = true;
        var a = new MPOffer().deserialize(this.offer);
        this._commonService['put'](`MpOffers(${this.offer?.id})`, a.toOdata()).subscribe({
            next: async (response: any) => {
                this.setLogType('close');
                this.notification.showSuccess($localize`Offer is updated successfully.`);
                this.sendNotification.emit("CLOSE");
                this.isLoaderEnabled = false;
                this.saveOfferLog();
            },
            error: (e: any) => {
                this.isLoaderEnabled = false;
                this.notification.showError($localize`Something went wrong.See the backend logs.`);
            }
        });
    }

    handleFilter(value: String) {
        this.users = this.cmbFltrUser.handleLocalDataFilter(
            value,
            "name"
        );
    }
}
