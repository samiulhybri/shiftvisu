import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AuthService } from "@app/services/auth.service";
import { FileRestrictions, UploadEvent, RemoveEvent, SelectEvent } from "@progress/kendo-angular-upload";
import { MPOffer } from "src/app/models/mp-offer";
import { CommonService } from "src/app/shared/services/common.service";
import { Notification } from 'src/app/shared/services/notification.service';
import { LocaleService } from "@app/shared/services/locale.service";

@Component({
    selector: "app-attachments",
    templateUrl: "./attachments.component.html",
    styleUrls: ["./attachments.component.scss"],
})
export class AttachmentsComponent implements OnInit {
    @Input() data?: MPOffer;
    @Output() mediaUpdate: EventEmitter<void> = new EventEmitter();

    public isLoaderEnabled: boolean = false;

    public form!: FormGroup;
    public uploadRemoveUrl = 'removeUrl';

    public filesArr: Array<any> = [];
    public isTabUpSelected: boolean = false;
    public isTabGalleySelected: boolean = false;
    public fileSelected: any = [];
    public isFileClicked: boolean = false;
    public isNewFiles: boolean = false;
    private prevSelectedFile: any = [];
    private prevSavedFile: any = [];

    fileRestrictions: FileRestrictions = {
        allowedExtensions: [".jpeg", ".jpg", ".png"],
        maxFileSize: 4194304,
    };

    constructor(@Inject(LOCALE_ID) protected locale: string,
        public common: CommonService,
        public notifications: Notification,
        private authService: AuthService,
        private localeSrv: LocaleService) {
            this.localeSrv.setLocale(this.locale);    
    }

    ngOnInit(): void {
        this.form = new FormGroup({
            file: new FormControl(""),
            isStandard: new FormControl("")
        });
        if (this.data && this.data?.is_closed) {
            this.form.disable();
        } else if (this.data && !this.data.is_closed) {
            this.form.enable();
        }
        this.isLoaderEnabled = true;
        this.loadFiles();
    }

    public onTabSelect(event: any) {
        this.isFileClicked = false;
        this.isNewFiles = false;
        if (this.data && this.data?.is_closed) {
            this.form.disable();
        } else if (this.data && !this.data.is_closed) {
            this.form.enable();
        }
    }

    public select(e: SelectEvent): void {
        this.isNewFiles = true;
        e.files.forEach((elm: any) => {
            this.filesArr.push(elm);
        })
    }

    saveOfferLog() {
        this.isLoaderEnabled = true;
        let logData = {
            'user_id': this.authService.user ? this.authService.user.id : null,
            'mp_offer_id': this.data!.id,
            'description': 'UPDATED_OFFER',
            'project_order': this.data!.project_nr,
            'log_date': this.localeSrv.format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };

        this.common['post']('MpOfferLogs', logData).subscribe({
            next: async (response: any) => {
                this.isLoaderEnabled = false;
                if(response && response.id) this.notifications.showSuccess($localize`Log is saved successfully.`);
                else this.notifications.showError($localize`Something went wrong while saving logs.`);
            },
            error: (e: any) => {
                this.isLoaderEnabled = false;
                this.notifications.showError($localize`Something went wrong while saving logs.`);
            }
        });
    }

    public upload(e: UploadEvent): void {
        e.preventDefault();
        let isDuplicateImage: boolean = false;
        this.prevSavedFile.forEach((elm: any) => {
            if (elm.name == e.files[0].name) 
                isDuplicateImage = true;
        });

        if (!isDuplicateImage) {
            let formdata = new FormData();
            formdata.append("id", this.data?.id + "");
            formdata.append("model", "MpOffer");
            formdata.append("media", e.files[0].rawFile ?? "");

            this.isLoaderEnabled = true;
            this.common.post("media/upload", formdata, false).subscribe({
                next: (response: any) => {
                    if (this.fileSelected && this.fileSelected.name) {
                        if (response.name == this.fileSelected.name.replace(/\.[^/.]+$/, '')) {
                            this.fileSelected = response;
                            this.updateSelection();
                        } else if (this.prevSelectedFile.uuid != this.fileSelected.uuid) {
                            this.updateSelection();
                        }
                    } else {
                        this.loadFiles();
                        this.saveOfferLog();
                    }
                },
                error: (err) => {   
                    this.notifications.showError($localize`Something went wrong`);
                    this.isLoaderEnabled = false;
                }
            });
        }
    }

    public remove(e: RemoveEvent): void {
        let item: any = e.files[0];
        e.preventDefault();
        this.isLoaderEnabled = true;
        this.common.delete(`Media(${item.id})`).subscribe({
            next: (response: any) => {
                this.loadFiles();
            },
            error: (err) => {   
                this.notifications.showError($localize`Something went wrong`);
                this.isLoaderEnabled = false;
            }
        });
    }

    public removeSelected(item: any): void {
        this.filesArr = this.filesArr.filter((file: any) => file !== item);
    }

    public clear(): void {
        this.isNewFiles = false;
        this.isLoaderEnabled = true;
        this.isFileClicked = false;
        this.loadFiles();
    }

    public deleteFile(file: any): void {
        this.isLoaderEnabled = true;
        if (file.hasOwnProperty('id')) {
            if (file.is_selected) {
                this.notifications.showError($localize`This image is standard, can not be deleted.`);
                this.isLoaderEnabled = false;
            } else {
                this.common.delete(`Media(${file.id})`).subscribe({
                    next: (response: any) => {
                        this.notifications.showSuccess($localize`Media is deleted successfully.`);
                        this.loadFiles();
                        this.saveOfferLog();
                    },
                    error: (err) => {   
                        this.notifications.showError($localize`Something went wrong`);
                        this.isLoaderEnabled = false;
                    }
                });
            }
        } else {
            this.isLoaderEnabled = false;
            this.removeSelected(file);
        }
    }

    private loadFiles() {
        if (this.data != undefined) {
            this.common.get("media/MpOffer/" + this.data.id, false).subscribe({
                next: (response: any) => {
                    var file_arr = response.media;

                    if (file_arr.length > 0) {
                        this.isTabGalleySelected = true;
                        this.isTabUpSelected = false;
                    } else {
                        this.isTabGalleySelected = false;
                        this.isTabUpSelected = true;
                    }

                    file_arr.forEach((e: any) => {
                        e.name = e.file_name;
                    });

                    this.filesArr = file_arr;
                    this.filesArr.forEach(async (elem: any) => {
                        if (elem.is_selected) {
                            this.prevSelectedFile = elem;
                            this.fileSelected = [];
                        }
                        this.prevSavedFile.push(elem);
                    });

                    this.isLoaderEnabled = false;
                },
                error: (e) => {
                    this.isLoaderEnabled = false;
                    this.notifications.showError($localize`Something went wrong while getting imgaes.`);
                },
            });
        }
    }

    isFileValid(file: any): boolean {
        const isExtensionValid = this.fileRestrictions.allowedExtensions!.includes(file.extension.toLowerCase());
        const isSizeValid = file.size <= this.fileRestrictions.maxFileSize!;
        return isExtensionValid && isSizeValid;
    }

    public onfileSelect(selected: any) {
        this.fileSelected = selected;
        this.isFileClicked = true;
    }

    public updateSelection() {
        this.isLoaderEnabled = true;
        this.common[`post`](`media/update/${this.fileSelected.id}`, this.fileSelected, false).subscribe({
            next: async (response: any) => {
                this.saveOfferLog();
                this.notifications.showSuccess($localize`Media is updated successfully.`);
                this.mediaUpdate.emit();
                this.loadFiles();
            },
            error: (e: any) => {
                this.notifications.showError($localize`Media update went wrong.`);
                this.isLoaderEnabled = false;
            }
        });
        this.isFileClicked = false;
    }
}