import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges } from "@angular/core";
import { CommonService } from "@app/shared/services/common.service";
import { Setting } from "@app/shared/models/setting.model";

@Component({
	selector: "app-item-image",
	templateUrl: "./item-image.component.html",
	styleUrl: "./item-image.component.css",
})
export class ItemImageComponent {
    @Input() headerTitle?: string;
    @Input() itemId?: number;
    @Input() itemCustomId?: string;
    @Input() isCard?: boolean;
    @Input() isSingleImage?: boolean;
	@Input() height: string = "";

    @Output() triggerItemEvent = new EventEmitter<any>();
    
    public settings?: Setting;
    
	public displayedImage: any;
	public isLoading: boolean = false;
    public cardHeight: any;
    public cardHeaderText = $localize`Item Image`;

    private readonly fileTypes = {
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'],
        document: [
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ],
        pdf: ['application/pdf'],
        excel: [
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ],
        powerpoint: [
            'application/vnd.ms-powerpoint', // .ppt
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
        ],
        txt: ['text/plain'],
    };
    
    externalImageUrl: string = "";

    constructor(public _commonSrv: CommonService) { }

    async ngOnChanges(changes: any) {
        this.headerTitle = changes.headerTitle ? changes.headerTitle.currentValue : this.headerTitle;
        this.itemId = changes.itemId ? changes.itemId.currentValue : undefined;
        this.itemCustomId = changes.itemCustomId ? changes.itemCustomId.currentValue : undefined;
        this.cardHeight = (parseInt(this.height, 10) - 45) + 'px';

        this.cardHeaderText = this.itemCustomId ? $localize`Item Image` +' '+ `(${this.itemCustomId})` : $localize`Item Image`;

        if(this.settings) {
            this.getMediaInit();
        }
    }

    ngOnInit() {
        this.getSettings();
    }

    getSettings() {
        this._commonSrv.get('Settings').subscribe({
            next: (response: any) => {
                this.settings = new Setting().deserialize(response.value[0]);
                
                this.getMediaInit();
            }
        });
    }

    getMediaInit() {
        if (this.settings?.is_external_dms_enabled) {
            if(this.itemCustomId) {
                this.externalImageUrl = this._commonSrv.getImageUrlForExternalImage(this.itemCustomId);
            }
        }
        else {
            this.getMedia();
        }
    }

    private async getMedia() {
        this.displayedImage = undefined;
        if (this.itemId) {
            this.isLoading = true;
            this._commonSrv.get("media/Item/" + this.itemId, false).subscribe({
                next: async (response: any) => {
                    var file_arr: any = [];
                    var count: number = 0;

                    this.triggerItemEvent.emit(response);
                    
                    if(response.media.length) {
                        response.media.forEach(async (elm: any) => {
                            var type = await this.checkFileType(elm);
                            if(type == 'image') file_arr.push(elm);
                            count++;

                            if(count == response.media.length && file_arr) {
                                if (this.isSingleImage) {
                                    file_arr.forEach((e: any) => {
                                        e.name = e.file_name;
                                        if (e.is_selected) this.displayedImage = e;
                                    });

                                    if (!this.displayedImage) this.displayedImage = file_arr[0];
                                } else {
                                    this.displayedImage = file_arr;
                                }
                            }
                            this.isLoading = false;
                        });
                    } else {
                        this.displayedImage = undefined;
                        this.isLoading = false;
                    }
                },
                error: (e) => {
                    this.isLoading = false;
                }
            })
        } else {
            this.displayedImage = undefined;
        }
    }

    async checkFileType(file: any): Promise<string | null> {
        if (this.fileTypes.image.includes(file.mime_type)) return 'image';
        else if (this.fileTypes.document.includes(file.mime_type)) return 'document';
        else if (this.fileTypes.pdf.includes(file.mime_type)) return 'pdf';
        else if (this.fileTypes.excel.includes(file.mime_type)) return 'excel';
        else if (this.fileTypes.powerpoint.includes(file.mime_type)) return 'powerpoint';
        else if (this.fileTypes.txt.includes(file.mime_type)) return 'text';
        else return null;
    }

    resetExternalImageUrl() {
        this.externalImageUrl = "";
    }

    alert() {
        alert("adadasda");
    }
}
