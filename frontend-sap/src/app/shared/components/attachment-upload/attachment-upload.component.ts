import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '@app/shared/services/common.service';
import { ToastService } from '@app/shared/services/toaster.service';
import { lastValueFrom, Subject, Observable } from 'rxjs';
import { WebcamImage } from 'ngx-webcam';

import "@ui5/webcomponents/dist/SuggestionItem.js";
import "@ui5/webcomponents/dist/features/InputSuggestions.js";
import Toast from '@ui5/webcomponents/dist/Toast';
import { Localization } from '@app/shared/utils/common-localize';

@Component({
    selector: 'app-attachment-upload',
    templateUrl: './attachment-upload.component.html',
    styleUrl: './attachment-upload.component.css'
})
export class AttachmentUploadComponent {
    @Input() public model!: string;
    @Input() public modelId!: any;
    @Input() public mediaData!: any[];
    @Input() public uploadedFiles: any;
    @Input() public checkNewFiles!: boolean;
    @Input() public fileFormat: string = ".jpg,.jpeg,.png,.gif,.bmp,.svg,.webp,.doc,.docx,.txt,.pdf,.xls,.xlsx,.ppt,.pptx,.msg,.eml";
    @Input() public fileCount: number = 0;
    @Input() public deletedFiles!: any;
    @Input() public updatedStandardFile!: any;
    @Input() public isShowStandard: boolean = true;
    @Input() public isDownloadVisible: boolean = true;
    @Input() public isSearchVisible: boolean = true;
    @Input() public isCameraVisible: boolean = true;
    @Input() public modalType: string = '';
    @Input() public maxAllowFiles: number = 0;
    @Output() public tempFilesChanged: EventEmitter<any> = new EventEmitter();
    @Output() public deletedFilesChanged: EventEmitter<any> = new EventEmitter();
    @Output() public standardFileSelected: EventEmitter<any> = new EventEmitter();
    @Output() public newFilesCount: EventEmitter<number> = new EventEmitter();
    @ViewChild("attachmentForm") form?: NgForm;
    @ViewChild('fileUploader', { static: false }) fileUploader!: ElementRef;
    @ViewChild('uploadCollection', { static: false }) uploadCollection!: ElementRef;
    @ViewChild('startUploading', { static: false }) startUploading!: ElementRef;
    @ViewChild('unUploadedFiles', { static: false }) unUploadedFiles!: ElementRef;
    @ViewChild('attachModalToast', { static: true }) modalToast!: ElementRef<HTMLElement>;

    public allFileArr: any[] = [];
    public fileArr: any[] = [];
    public isLoading: boolean = false;
    protected fileSelected: any;
    public isFileSelected: boolean = false;
    public allFilesName: string[] = [];
    public suggestionItems: string[] = [];
    public toastMessage: string = '';
    public isClickToCamera: boolean = false;
    public cameraModalTitle: string = $localize`Camera`;
    localization = Localization;

    public triggerObservable: Subject<void> = new Subject<void>();
    public nextWebcam$: Subject<boolean | string> = new Subject<boolean | string>();
    public multipleCamerasAvailable: boolean = false;
    public isOpenFilePreview: boolean = false;
    public filePreviewTitle: string = $localize`Attachment`;
    public selectedFileToOpen: any;
    public filePreviewHeight = 629;

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

    constructor(protected _commonSrv: CommonService,
        public _toasterSrv: ToastService
    ) { }

    ngOnChanges(changes: any) {
        this.model = changes.model ? changes.model.currentValue : this.model;
        this.modelId = changes.modelId ? changes.modelId.currentValue : this.modelId;
        this.mediaData = changes.mediaData ? changes.mediaData.currentValue : [];
        this.uploadedFiles = changes.uploadedFiles ? changes.uploadedFiles.currentValue : this.uploadedFiles;
        this.deletedFiles = changes.deletedFiles ? changes.deletedFiles.currentValue : this.deletedFiles;
        this.checkNewFiles = changes.checkNewFiles ? changes.checkNewFiles.currentValue : this.checkNewFiles;
        this.updatedStandardFile = changes.updatedStandardFile ? changes.updatedStandardFile.currentValue : this.updatedStandardFile;
        this.fileFormat = changes.fileFormat && changes.fileFormat.currentValue !== '' ? changes.fileFormat.currentValue : this.fileFormat;
        this.fileCount = changes.fileCount ? changes.fileCount.currentValue : 0;
    }

    ngOnInit() {
        this.loadFiles();
    }

    ngAfterViewInit() {
        (this.fileUploader as any).elementRef.nativeElement.addEventListener("change", (e: any) => {
            e.preventDefault();
            const files = e.detail.files;
            this.uploadNewFiles(files);
        });

        (this.uploadCollection as any).elementRef.nativeElement.addEventListener(
            "ui5-item-delete",
            (e: any) => {
                const fileNameToDelete = e.detail.item.getAttribute("file-name");
                this.uploadedFiles = this.uploadedFiles.filter(
                    (file: any) =>
                        file.name.toUpperCase().indexOf(fileNameToDelete.toUpperCase()) !== 0
                );
            }
        );

        (this.uploadCollection as any).elementRef.nativeElement.addEventListener("dragover", (e: any) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            this.uploadNewFiles(files);
        });

        (this.uploadCollection as any).elementRef.nativeElement.addEventListener(
            "drop",
            (e: any) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                this.uploadNewFiles(files);
            }
        );
    }

    validateFileType(file: File): boolean {
        const validTypes = this.fileFormat.split(",");
        return validTypes.some(type => file.name.endsWith(type));
    }

    uploadNewFiles(files: any) {
        if (this.maxAllowFiles > 0 && (this.uploadedFiles.length >= this.maxAllowFiles || this.uploadedFiles.length + files.length > this.maxAllowFiles)) {
            this.showModalToast($localize`Maximum ${this.maxAllowFiles} files are allowed.`, 'error');
            return;
        }
        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            if (this.validateFileType(files[i])) validFiles.push(files[i]);
            else invalidFiles.push(files[i].name);
        }

        if (validFiles.length > 0) this.processFiles(validFiles);
        if (invalidFiles.length > 0)
            this.showModalToast($localize`The following files are not supported: ${invalidFiles.join(", ")}`, 'error');
    }

    private processFiles(files: any[]) {
        const fileNameRegex = /\.[^/.]+$/;

        for (let i = 0; i < files.length; i++) {
            const fileName = (files[i].name).replace(fileNameRegex, '');
            const fileAlreadyExists = this.fileArr.some((f: any) => f.name === fileName) || this.uploadedFiles.some((f: any) => (f.name).replace(fileNameRegex, '') === fileName);

            files[i].updated_at = new Date();
            if (!fileAlreadyExists) this.uploadedFiles.push(files[i]);
            else this.showModalToast($localize`Same file is already uploaded.`, 'error');

            this.tempFilesChanged.emit(this.uploadedFiles);
        }

        (this.fileUploader as any).value = '';
    }

    showModalToast(message: string, type: string) {
        this.toastMessage = message;
        const toast = document.getElementById("attachModalToast") as Toast;
        toast.className = this._toasterSrv.setToasterType(type);
        toast.open = true;
    }

    private async loadFiles(): Promise<any> {
        let filteredFiles: any[] = [];

        if (this.modelId) {
            this.isLoading = true;
            this._commonSrv.get(`media/${this.model}/` + this.modelId, false).subscribe({
                next: async (response: any) => {
                    var file_arr = response.media;
                    for (const e of file_arr) {
                        if (!this.deletedFiles.some((deletedFile: any) => deletedFile.name === e.name)) {
                            e.type = this.checkFileType(e);
                            this.allFilesName.push(e.file_name);
                            filteredFiles.push(e);
                        }
                    }

                    this.allFileArr = filteredFiles;
                    this.fileArr = filteredFiles;
                    this.fileCount = filteredFiles.length;
                    this.isLoading = false;
                    this.newFilesCount.emit(this.fileCount);

                    this.fileArr.forEach(async (elm: any) => {
                        elm.blob = await this.getFilesBlobData(elm);
                    });
                },
                error: (e) => {
                    this.showModalToast(this.localization.someThingWentWrong, 'error');
                    this.isLoading = false;
                },
            });
        }
    }

    async getFileFullPath(fileId: number): Promise<any> {
        try {
            const response: any = await lastValueFrom(this._commonSrv.get(`media/${fileId}/get-full-path`, false));
            return response.path;
        } catch (e) {
            console.log("error while getting path: ", e);
            return null;
        }
    }

    /** Fetch Blob data */
    async getFilesBlobData(file: any): Promise<any> {
        try {
            const blobResponse = await fetch(file.path);
            if (!blobResponse.ok) {
                console.log("error while creating blob for file: ", file.name);
                return {};
            }
            return await blobResponse.blob();
        } catch (e) {
            console.log("error while fetching blob data: ", e);
            return {};
        }
    }

    public downloadFiles() {
        this.isLoading = true;
        let isFileDownloaded = false;
        try {
            this.fileArr.forEach((file: any) => {
                if (file.blob) {
                    const url = window.URL.createObjectURL(file.blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', file.name);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    isFileDownloaded = true; 
                }
            });
            if (isFileDownloaded) this.showModalToast($localize`Files downloaded successfully!`, 'success');
        } catch (error) {
            console.error('Error downloading files:', error);
            this.showModalToast($localize`Failed to download files!`, 'error');
        } finally {
            this.isLoading = false;
        }
    }

    public onChangeFileSelect(selected: any) {
        this.standardFileSelected.emit(selected);
        this.allFileArr.forEach((elm: any) => {
            if (selected.file_name != elm.file_name) elm.is_selected = false;
        })
    }

    deleteFile(selectedFile: any, type: string) {
        const fileNameToDelete = selectedFile.name;
        if (type == 'saved') {
            const fileToDelete = selectedFile.id;
            this.fileArr = this.fileArr.filter((file: any) => file.id != fileToDelete && file.name.trim().toUpperCase() !== fileNameToDelete.trim().toUpperCase());
            this.fileCount = this.fileArr.length;
            this.newFilesCount.emit(this.fileCount);
            this.deletedFiles.push(selectedFile);
            this.deletedFilesChanged.emit(this.deletedFiles);
        } else if (type == 'unsaved') {
            this.uploadedFiles = this.uploadedFiles.filter((file: any) => file.name.trim().toUpperCase() !== fileNameToDelete.trim().toUpperCase());
            this.tempFilesChanged.emit(this.uploadedFiles);
        }
    }

    onSelectSearchFiles(event: any) {
        let searchedFileName: string = event.target.value;
        if (searchedFileName != '') {
            this.fileArr = this.allFileArr.filter((file: any) => {
                const item = file.file_name.toUpperCase();
                const searchedItem = searchedFileName.toUpperCase();
                return (item.indexOf(searchedItem) === 0 || item.indexOf(searchedItem) !== -1);
            })
        } else this.fileArr = this.allFileArr;
    }

    onInputSearchFiles(event: any) {
        const input: any = document.getElementById("searchFiles");
        while (input.firstChild) {
            input.removeChild(input.firstChild);
        }

        let typedValue = event.target.value;
        if (typedValue !== '') {
            this.suggestionItems = this.allFilesName.filter((item) => {
                const upperItem = item.toUpperCase();
                const upperTypedValue = typedValue.toUpperCase();
                return (upperItem.indexOf(upperTypedValue) === 0 || upperItem.indexOf(upperTypedValue) !== -1);
            });

            this.suggestionItems.forEach((item) => {
                const suggestionItem = document.createElement("ui5-suggestion-item");
                suggestionItem.textContent = item;
                input.appendChild(suggestionItem);
            });
        } else this.fileArr = this.allFileArr;
    }

    checkFileType(file: any): string | null {
        if (this.fileTypes.image.includes(file.mime_type)) return 'image';
        else if (this.fileTypes.document.includes(file.mime_type)) return 'document';
        else if (this.fileTypes.pdf.includes(file.mime_type)) return 'pdf';
        else if (this.fileTypes.excel.includes(file.mime_type)) return 'excel';
        else if (this.fileTypes.powerpoint.includes(file.mime_type)) return 'powerpoint';
        else if (this.fileTypes.txt.includes(file.mime_type)) return 'text';
        else return null;
    }

    onClickCamera() {
        this.isClickToCamera = true;
    }

    public triggerSnapshot(): void {
        this.triggerObservable.next();
    }

    public switchCamera(): void {
        this.nextWebcam$.next(true);
    }

    public handleImage(webcamImage: WebcamImage): void {
        const blob = this.dataURItoBlob(webcamImage.imageAsDataUrl);
        const timestamp = new Date().toISOString().replace(/[:.-]/g, '');
        const file = new File([blob], `captured-image-${ timestamp  }.png`, { type: "image/png" });
        this.uploadNewFiles([file]);
        this.closeCameraModal();
    }

    private dataURItoBlob(dataURI: string): Blob {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    public cameraWasSwitched(deviceId: string): void {
        console.log('Switch camera:', deviceId);
    }


    public handleCameraError(error: any): void {
        if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
            console.warn("Camera access was not allowed by user!");
        }
    }

    closeCameraModal() {
        this.isClickToCamera = false;
    }

    openPreview(file: any) {
        this.isOpenFilePreview = true;
        this.selectedFileToOpen = file;
    }

    closeAttachmentDialog() {
        this.isOpenFilePreview = false;
    }
}
